import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  fetchConversations,
  fetchMessages,
  openConversationSocket,
  postMarkRead,
  createConversation as apiCreateConversation,
  postMessage,
} from "../services/chatApi";
import { ChatMessage, ChatRole, Conversation } from "../types/chatTypes";
import { useAuthContext } from "./AuthContext";

// ======================================================================
// Value shape
// ======================================================================

type ChatContextValue = {
  conversations: Conversation[];
  conversationsLoading: boolean;
  refreshConversations: () => Promise<void>;

  getMessages: (conversationId: string) => ChatMessage[];
  messagesLoading: (conversationId: string) => boolean;
  loadMessages: (conversationId: string) => Promise<void>;
  subscribeToConversation: (conversationId: string) => () => void;

  getConversation: (id: string) => Conversation | undefined;
  sendMessage: (
    conversationId: string,
    sender: ChatRole,
    text: string
  ) => Promise<void>;
  markRead: (conversationId: string, reader: ChatRole) => Promise<void>;
  createConversation: (studentId: number | string) => Promise<Conversation>;
  teacherMessages: ChatMessage[];
};

const ChatContext = createContext<ChatContextValue | null>(null);

// ======================================================================
// Helpers
// ======================================================================

/**
 * Merge two arrays of messages, de-duplicating by `id` and sorting by
 * `createdAt`. The second argument wins on ID collisions (server rows
 * override optimistic placeholders).
 */
function mergeMessages(
  existing: ChatMessage[],
  incoming: ChatMessage[]
): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();

  for (const m of existing) byId.set(String(m.id), m);
  for (const m of incoming) byId.set(String(m.id), m);

  return Array.from(byId.values()).sort((a, b) =>
    (a.createdAt ?? "").localeCompare(b.createdAt ?? "")
  );
}

/**
 * Generate a client-only ID for optimistic messages. Time + randomness
 * ensures two rapid sends never share a key.
 */
function optimisticId(): string {
  return `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ======================================================================
// Provider
// ======================================================================

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthContext();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  // Guards against loading the same conversation twice in parallel.
  const inFlight = useRef<Set<string>>(new Set());

  // Keep a live ref to the conversation list so callbacks don't capture
  // stale values when they need the latest data.
  const conversationsRef = useRef<Conversation[]>(conversations);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // ------------------------------------------------------------------
  // Refresh the conversation list
  // ------------------------------------------------------------------
  const refreshConversations = useCallback(async () => {
    if (!accessToken) return;
    setConversationsLoading(true);
    try {
      const data = await fetchConversations(accessToken);
      setConversations(data);
    } finally {
      setConversationsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      // Logout — clear everything.
      setConversations([]);
      setMessagesByConversation({});
      setLoadingIds(new Set());
      return;
    }
    refreshConversations();
  }, [accessToken, refreshConversations]);

  // ------------------------------------------------------------------
  // Create or fetch a conversation with a student's parent/teacher
  // ------------------------------------------------------------------
  const createConversation = useCallback(
    async (studentId: number | string): Promise<Conversation> => {
      if (!accessToken) throw new Error("Not authenticated");

      const created = await apiCreateConversation(accessToken, studentId);

      setConversations((prev) => {
        const exists = prev.some((c) => String(c.id) === String(created.id));
        return exists ? prev : [created, ...prev];
      });

      return created;
    },
    [accessToken]
  );

  // ------------------------------------------------------------------
  // Load message history for a conversation
  // ------------------------------------------------------------------
  const loadMessages = useCallback(
    async (conversationId: string) => {
      if (!accessToken || inFlight.current.has(conversationId)) return;

      inFlight.current.add(conversationId);
      setLoadingIds((prev) => new Set(prev).add(conversationId));

      try {
        const fetched = await fetchMessages(accessToken, conversationId);

        // Merge with whatever's already cached, so optimistic and
        // WebSocket-delivered messages aren't wiped by a refetch.
        setMessagesByConversation((prev) => {
          const current = prev[conversationId] ?? [];
          return {
            ...prev,
            [conversationId]: mergeMessages(current, fetched),
          };
        });
      } finally {
        inFlight.current.delete(conversationId);
        setLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(conversationId);
          return next;
        });
      }
    },
    [accessToken]
  );

  // ------------------------------------------------------------------
  // WebSocket callback — append an incoming message
  // ------------------------------------------------------------------
  const appendIncomingMessage = useCallback((message: ChatMessage) => {
    setMessagesByConversation((prev) => {
      const current = prev[message.conversationId] ?? [];
      const merged = mergeMessages(current, [message]);

      // Nothing changed → skip the state update to avoid re-renders.
      const unchanged =
        merged.length === current.length &&
        merged.every((m, i) => m.id === current[i].id);

      return unchanged ? prev : { ...prev, [message.conversationId]: merged };
    });

    // Update the conversation preview + unread counters.
    setConversations((prev) =>
      prev.map((c) => {
        if (String(c.id) !== String(message.conversationId)) return c;
        return {
          ...c,
          lastMessage: message.text,
          lastTime: message.createdAt,
          unreadForTeacher:
            message.sender === "parent"
              ? c.unreadForTeacher + 1
              : c.unreadForTeacher,
          unreadForParent:
            message.sender === "teacher"
              ? c.unreadForParent + 1
              : c.unreadForParent,
        };
      })
    );
  }, []);

  // ------------------------------------------------------------------
  // Subscribe to a conversation's WebSocket
  // ------------------------------------------------------------------
  const subscribeToConversation = useCallback(
    (conversationId: string) => {
      if (!accessToken) return () => {};
      return openConversationSocket(
        accessToken,
        conversationId,
        appendIncomingMessage
      );
    },
    [accessToken, appendIncomingMessage]
  );

  // ------------------------------------------------------------------
  // Send a message
  // ------------------------------------------------------------------
  const sendMessage = useCallback(
    async (conversationId: string, sender: ChatRole, text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !accessToken) return;

      const optimistic: ChatMessage = {
        id: optimisticId(),
        conversationId,
        sender,
        text: trimmed,
        createdAt: new Date().toISOString(),
        timeLabel: "Just now",
      };

      // 1. Show the message immediately.
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: mergeMessages(prev[conversationId] ?? [], [
          optimistic,
        ]),
      }));

      // 2. Update the conversation preview + unread counters.
      setConversations((prev) =>
        prev.map((c) =>
          String(c.id) === String(conversationId)
            ? {
                ...c,
                lastMessage: trimmed,
                lastTime: optimistic.createdAt,
                unreadForTeacher:
                  sender === "parent" ? c.unreadForTeacher + 1 : 0,
                unreadForParent:
                  sender === "teacher" ? c.unreadForParent + 1 : 0,
              }
            : c
        )
      );

      try {
        const saved = await postMessage(accessToken, conversationId, trimmed);

        // 3. Replace the placeholder with the server row. The merge
        //    handles the case where the WebSocket echo already added
        //    the same message.
        setMessagesByConversation((prev) => {
          const current = prev[conversationId] ?? [];
          const withoutPlaceholder = current.filter(
            (m) => m.id !== optimistic.id
          );
          return {
            ...prev,
            [conversationId]: mergeMessages(withoutPlaceholder, [saved]),
          };
        });
      } catch (err) {
        // 4. Roll back the optimistic message on failure.
        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] ?? []).filter(
            (m) => m.id !== optimistic.id
          ),
        }));
        throw err;
      }
    },
    [accessToken]
  );

  // ------------------------------------------------------------------
  // Mark a conversation as read
  // ------------------------------------------------------------------
  const markRead = useCallback(
    async (conversationId: string, reader: ChatRole) => {
      if (!accessToken) return;

      // Optimistic update.
      setConversations((prev) =>
        prev.map((c) => {
          if (String(c.id) !== String(conversationId)) return c;
          return reader === "teacher"
            ? { ...c, unreadForTeacher: 0 }
            : { ...c, unreadForParent: 0 };
        })
      );

      try {
        await postMarkRead(accessToken, conversationId, reader);
      } catch (err) {
        // Best-effort — a failed mark-read isn't fatal; the next refresh
        // will resync.
        console.warn("[chat] markRead failed:", err);
      }
    },
    [accessToken]
  );

  // ------------------------------------------------------------------
  // Derived: teacher messages across all cached conversations
  // ------------------------------------------------------------------
  const teacherMessages = useMemo(
    () =>
      Object.values(messagesByConversation)
        .flat()
        .filter((m) => m.sender === "teacher")
        .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")),
    [messagesByConversation]
  );

  // ------------------------------------------------------------------
  // Context value
  // ------------------------------------------------------------------
  const value = useMemo<ChatContextValue>(
    () => ({
      conversations,
      conversationsLoading,
      refreshConversations,

      getMessages: (conversationId) =>
        messagesByConversation[conversationId] ?? [],
      messagesLoading: (conversationId) => loadingIds.has(conversationId),
      loadMessages,
      subscribeToConversation,

      getConversation: (id) =>
        conversations.find((c) => String(c.id) === String(id)),
      sendMessage,
      markRead,
      createConversation,

      teacherMessages,
    }),
    [
      conversations,
      conversationsLoading,
      refreshConversations,
      messagesByConversation,
      loadingIds,
      loadMessages,
      subscribeToConversation,
      sendMessage,
      markRead,
      createConversation,
      teacherMessages,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// ======================================================================
// Hook
// ======================================================================

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}