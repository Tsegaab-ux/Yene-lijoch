import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, Platform } from "react-native";
import { router } from "expo-router";

// Import expo-notifications lazily on native only, so Metro doesn't
// even try to bundle its web stubs when this file is loaded on web.
let Notifications: typeof import("expo-notifications") | null = null;
if (Platform.OS !== "web") {
  Notifications = require("expo-notifications");
}

import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from "../hooks/pushNotifications";
import {
  AppNotification,
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  registerPushToken,
} from "../services/notificationsApi";
import { useAuthContext } from "./AuthContext";

const IS_NATIVE = Platform.OS === "ios" || Platform.OS === "android";

// Base URL for the WebSocket. Override via EXPO_PUBLIC_WS_URL in .env.
// Falls back to the same host as the API on web, and to localhost on native.
const WS_BASE =
  process.env.EXPO_PUBLIC_WS_URL?.replace(/\/+$/, "") ??
  (Platform.OS === "web" ? "ws://127.0.0.1:8000" : "ws://127.0.0.1:8000");

// Reconnect backoff bounds (ms).
const RECONNECT_MIN_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;

type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  /** true once the notification WebSocket has completed its handshake. */
  wsConnected: boolean;
  refresh: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  const [appState, setAppState] = useState(AppState.currentState);
  const { isAuthenticated, isLoading, accessToken } = useAuthContext();

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastHandledNotificationId = useRef<string | null>(null);
  const rollbackRef = useRef<{
    notifications: AppNotification[];
    unread: number;
  } | null>(null);

  // WebSocket bookkeeping — kept in refs so we don't re-render on every
  // connection attempt and don't retrigger the effect on state changes.
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const intentionallyClosedRef = useRef(false);

  // ------------------------------------------------------------------
  // Refresh — works on all platforms
  // ------------------------------------------------------------------
  const refresh = useCallback(async () => {
    try {
      const [page, count] = await Promise.all([
        fetchNotifications(1),
        fetchUnreadCount(),
      ]);
      setNotifications(page.results);
      setUnreadCount(count);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load notifications";
      console.warn("Failed to refresh notifications:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------------------------------------------------------
  // Mutations — work on all platforms
  // ------------------------------------------------------------------
  const markRead = useCallback(
    async (id: number) => {
      let wasUnread = false;

      setNotifications((prev) =>
        prev.map((n) => {
          if (n.id !== id) return n;
          if (!n.is_read) wasUnread = true;
          return { ...n, is_read: true };
        })
      );

      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        await markNotificationRead(id);
      } catch (err) {
        console.warn("Failed to mark notification read:", err);
        await refresh();
      }
    },
    [refresh]
  );

  const markAllRead = useCallback(async () => {
    rollbackRef.current = { notifications, unread: unreadCount };

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.warn("Failed to mark all notifications read:", err);
      if (rollbackRef.current) {
        setNotifications(rollbackRef.current.notifications);
        setUnreadCount(rollbackRef.current.unread);
      }
      throw err;
    } finally {
      rollbackRef.current = null;
    }
  }, [notifications, unreadCount]);

  // ------------------------------------------------------------------
  // Push token registration — native only
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const registerPushNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (!token) return;
        await registerPushToken(
          token,
          Platform.OS === "ios" ? "ios" : "android"
        );
      } catch (error) {
        console.error("Push notification registration failed:", error);
      }
    };

    registerPushNotifications();
  }, [isLoading, isAuthenticated]);

  // ------------------------------------------------------------------
  // App state listener — works on all platforms
  // ------------------------------------------------------------------
  useEffect(() => {
    const sub = AppState.addEventListener("change", setAppState);
    return () => sub.remove();
  }, []);

  // ------------------------------------------------------------------
  // Polling — safety net while the WS is down. When the WS is connected
  // we back off to a slow poll (5 min) just to reconcile missed events.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (appState !== "active" || !isAuthenticated) return;

    // Immediate refresh on becoming active.
    refresh();

    const intervalMs = wsConnected ? 5 * 60_000 : 60_000;
    pollRef.current = setInterval(refresh, intervalMs);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [appState, refresh, wsConnected, isAuthenticated]);

  // ------------------------------------------------------------------
  // WebSocket — real-time notification delivery.
  // Only active when authenticated and we have a token.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isLoading || !isAuthenticated || !accessToken) return;
    if (Platform.OS === "web" && typeof WebSocket === "undefined") return;

    intentionallyClosedRef.current = false;

    const buildUrl = () =>
      `${WS_BASE}/ws/notifications/?token=${encodeURIComponent(accessToken)}`;

    const scheduleReconnect = () => {
      if (intentionallyClosedRef.current) return;
      const attempt = reconnectAttemptsRef.current++;
      const delay = Math.min(
        RECONNECT_MIN_MS * 2 ** attempt,
        RECONNECT_MAX_MS
      );
      // Small jitter so many clients don't reconnect in lockstep.
      const jitter = Math.random() * 500;
      reconnectTimerRef.current = setTimeout(connect, delay + jitter);
    };

    const connect = () => {
      if (intentionallyClosedRef.current) return;

      let ws: WebSocket;
      try {
        ws = new WebSocket(buildUrl());
      } catch (err) {
        console.warn("[notif ws] construction failed", err);
        scheduleReconnect();
        return;
      }

      wsRef.current = ws;

      ws.onopen = () => {
        // Wait for the server's `connection_established` frame before
        // declaring ourselves connected — the handshake alone isn't enough,
        // the consumer may still reject us (auth, rate limit, etc.).
        console.log("[notif ws] handshake open");
      };

      ws.onmessage = (e) => {
        let msg: any;
        try {
          msg = JSON.parse(typeof e.data === "string" ? e.data : "");
        } catch {
          return;
        }

        if (msg?.type === "connection_established") {
          console.log("[notif ws] ready for user", msg.user_id);
          reconnectAttemptsRef.current = 0;
          setWsConnected(true);
          return;
        }

        if (msg?.type === "notification") {
          const payload = (msg.data ?? {}) as Record<string, unknown>;
          console.log("[notif ws] notification", payload);

          // Optimistic insert so the UI updates instantly. The next
          // `refresh()` (from the slow poll or a manual pull) will
          // reconcile with the canonical server list.
          const incoming: AppNotification | null =
            payload && typeof payload === "object"
              ? ({
                  id: Number((payload as any).id) || Date.now(),
                  notification_type:
                    String(
                      (payload as any).notification_type ??
                        (payload as any).type ??
                        "new_chat_message"
                    ),
                  title: String((payload as any).title ?? "New message"),
                  body: String(
                    (payload as any).body ?? (payload as any).message ?? ""
                  ),
                  data: (payload as any).data ?? {},
                  is_read: false,
                  created_at: new Date().toISOString(),
                  category: String((payload as any).category ?? "chat"),
                  actor_id:
                    (payload as any).actor_id != null
                      ? Number((payload as any).actor_id)
                      : null,
                } satisfies AppNotification)
              : null;

          if (incoming) {
            setNotifications((prev) => {
              if (prev.some((n) => n.id === incoming.id)) return prev;
              return [incoming, ...prev];
            });
            if (!incoming.is_read) {
              setUnreadCount((prev) => prev + 1);
            }
          } else {
            // Payload wasn't shaped like a notification — fall back to a
            // REST refresh so we don't miss anything.
            refresh();
          }
        }
      };

      ws.onerror = (err) => {
        console.warn("[notif ws] error", err);
      };

      ws.onclose = (ev) => {
        console.log("[notif ws] closed", ev.code, ev.reason);
        wsRef.current = null;
        setWsConnected(false);
        if (!intentionallyClosedRef.current) {
          scheduleReconnect();
        }
      };
    };

    connect();

    return () => {
      intentionallyClosedRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        try {
          wsRef.current.close(1000, "provider unmount");
        } catch {
          /* ignore */
        }
        wsRef.current = null;
      }
      setWsConnected(false);
    };
  }, [isAuthenticated, isLoading, accessToken, refresh]);

  // ------------------------------------------------------------------
  // Foreground push → refresh — native only
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!IS_NATIVE) return;

    const unsubscribe = addNotificationReceivedListener(() => {
      refresh();
    });
    return unsubscribe;
  }, [refresh]);

  // ------------------------------------------------------------------
  // Tap → deep link — native only
  // ------------------------------------------------------------------
  const ALLOWED_ROLES = ["parent", "teacher", "admin"] as const;
  type AppRole = (typeof ALLOWED_ROLES)[number];

  const pickRole = (raw: unknown): AppRole =>
    typeof raw === "string" && (ALLOWED_ROLES as readonly string[]).includes(raw)
      ? (raw as AppRole)
      : "parent";

  const handleDeepLink = useCallback((data: Record<string, unknown> | undefined) => {
    if (!data) return;

    if (data.screen === "chat" && data.conversation_id) {
      router.push(`/${pickRole(data.role)}/messages/${data.conversation_id}` as any);
      return;
    }
    if (data.screen === "media" && data.media_id) {
      router.push(`/${pickRole(data.role)}/media/${data.media_id}` as any);
      return;
    }
    if (data.screen === "lesson" && data.lesson_id) {
      router.push(`/${pickRole(data.role)}/courses/${data.lesson_id}` as any);
      return;
    }
    if (data.screen === "event" && data.event_id) {
      router.push(`/${pickRole(data.role)}/events/${data.event_id}` as any);
      return;
    }
  }, []);

  useEffect(() => {
    if (!IS_NATIVE || !Notifications) return;

    const unsubscribe = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data as
        | Record<string, unknown>
        | undefined;
      handleDeepLink(data);
    });

    // Cold start: app launched by tapping a notification.
    Notifications.getLastNotificationResponseAsync()
      .then((response: any) => {
        const notificationId = response?.notification?.request?.identifier;
        if (!notificationId) return;
        if (notificationId === lastHandledNotificationId.current) return;
        lastHandledNotificationId.current = notificationId;

        const data = response?.notification?.request?.content?.data as
          | Record<string, unknown>
          | undefined;
        handleDeepLink(data);
      })
      .catch((err: unknown) => {
        console.warn("getLastNotificationResponseAsync failed:", err);
      });

    return unsubscribe;
  }, [handleDeepLink]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      wsConnected,
      refresh,
      markRead,
      markAllRead,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      wsConnected,
      refresh,
      markRead,
      markAllRead,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return ctx;
}