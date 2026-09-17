import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

const IS_NATIVE = Platform.OS === "ios" || Platform.OS === "android";

type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
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
  const [appState, setAppState] = useState(AppState.currentState);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastHandledNotificationId = useRef<string | null>(null);
  const rollbackRef = useRef<{
    notifications: AppNotification[];
    unread: number;
  } | null>(null);

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
          if (!n.read) wasUnread = true;
          return { ...n, read: true };
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

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
    if (!IS_NATIVE || !Notifications) return;

    let tokenSub: { remove: () => void } | null = null;

    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (!token) return;

      try {
        await registerPushToken(token, Platform.OS as "ios" | "android");
      } catch (err) {
        console.warn("Failed to register push token with backend:", err);
      }
    })();

    tokenSub = Notifications.addPushTokenListener((newToken: any) => {
      registerPushToken(
        newToken.data,
        Platform.OS as "ios" | "android"
      ).catch((err) =>
        console.warn("Failed to re-register push token:", err)
      );
    });

    return () => {
      tokenSub?.remove();
    };
  }, []);

  // ------------------------------------------------------------------
  // App state listener — works on all platforms
  // ------------------------------------------------------------------
  useEffect(() => {
    const sub = AppState.addEventListener("change", setAppState);
    return () => sub.remove();
  }, []);

  // ------------------------------------------------------------------
  // Polling — works on all platforms
  // ------------------------------------------------------------------
  useEffect(() => {
    if (appState !== "active") return;

    refresh();
    pollRef.current = setInterval(refresh, 60_000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [appState, refresh]);

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
  const handleDeepLink = useCallback(
    (data: Record<string, unknown> | undefined) => {
      if (!data) return;
      if (data.screen === "chat" && data.conversation_id) {
        const role = typeof data.role === "string" ? data.role : "parent";
        router.push(`/${role}/messages/${data.conversation_id}` as any);
      }
    },
    []
  );

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
        // Silently ignore — some platforms throw if no response exists.
        console.warn("getLastNotificationResponseAsync failed:", err);
      });

    return unsubscribe;
  }, [handleDeepLink]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        refresh,
        markRead,
        markAllRead,
      }}
    >
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