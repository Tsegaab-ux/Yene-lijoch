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
import { useSharedContent } from "./SharedContentContext";
import { useAuthContext } from "./AuthContext";

type ChatContextValue = {
  conversations: Conversation[];
  conversationsLoading: boolean;
  refreshConversations: () => Promise<void>;

  getMessages: (conversationId: string) => ChatMessage[];
  messagesLoading: (conversationId: string) => boolean;
  loadMessages: (conversationId: string) => Promise<void>;
  subscribeToConversation: (conversationId: string) => () => void;

  getConversation: (id: string) => Conversation | undefined;
  sendMessage: (conversationId: string, sender: ChatRole, text: string) => Promise<void>;
  markRead: (conversationId: string, reader: ChatRole) => Promise<void>;
  createConversation: (studentId: number | string) => Promise<Conversation>;
  teacherMessages: ChatMessage[];
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthContext();
  const { pushAdminNotice, pushParentNotice } = useSharedContent();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  // Guards against loading the same conversation's messages twice in
  // parallel (e.g. two components mounting at once).
  const inFlight = useRef<Set<string>>(new Set());

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
    refreshConversations();
  }, [refreshConversations]);

  const createConversation = useCallback(
    async (studentId: number | string) => {
      if (!accessToken) throw new Error("Not authenticated");
      const created = await apiCreateConversation(accessToken, studentId);

      // Merge into local state so subsequent getConversation(id) works
      // immediately, without waiting for refreshConversations.
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === created.id);
        return exists ? prev : [created, ...prev];
      });

      return created;
    },
    [accessToken]
  );

  const loadMessages = useCallback(
    async (conversationId: string) => {
      if (!accessToken || inFlight.current.has(conversationId)) return;
      inFlight.current.add(conversationId);
      setLoadingIds((prev) => new Set(prev).add(conversationId));
      try {
        const msgs = await fetchMessages(accessToken, conversationId);
        setMessagesByConversation((prev) => ({ ...prev, [conversationId]: msgs }));
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

  const appendIncomingMessage = useCallback((message: ChatMessage) => {
    setMessagesByConversation((prev) => {
      const existing = prev[message.conversationId] ?? [];
      if (existing.some((m) => m.id === message.id)) return prev; // de-dupe own echo
      return { ...prev, [message.conversationId]: [...existing, message] };
    });

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== message.conversationId) return c;
        return {
          ...c,
          lastMessage: message.text,
          lastTime: message.createdAt,
          unreadForTeacher:
            message.sender === "parent" ? c.unreadForTeacher + 1 : c.unreadForTeacher,
          unreadForParent:
            message.sender === "teacher" ? c.unreadForParent + 1 : c.unreadForParent,
        };
      })
    );
  }, []);

  const subscribeToConversation = useCallback(
    (conversationId: string) => {
      if (!accessToken) return () => {};
      return openConversationSocket(accessToken, conversationId, appendIncomingMessage);
    },
    [accessToken, appendIncomingMessage]
  );

  const sendMessage = useCallback(
    async (conversationId: string, sender: ChatRole, text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !accessToken) return;

      const conversation = conversations.find((c) => c.id === conversationId);

      // Optimistic UI: show the message immediately, reconcile with the
      // server response (the WebSocket echo of this same message is
      // de-duped in appendIncomingMessage once it comes back by id).
      const optimistic: ChatMessage = {
        id: `pending-${Date.now()}`,
        conversationId,
        sender,
        text: trimmed,
        createdAt: new Date().toISOString(),
        timeLabel: "Just now",
      };
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), optimistic],
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: trimmed,
                lastTime: optimistic.createdAt,
                unreadForTeacher: sender === "parent" ? c.unreadForTeacher + 1 : 0,
                unreadForParent: sender === "teacher" ? c.unreadForParent + 1 : 0,
              }
            : c
        )
      );

      try {
        const saved = await postMessage(accessToken, conversationId, trimmed);
        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] ?? []).map((m) =>
            m.id === optimistic.id ? saved : m
          ),
        }));
      } catch (err) {
        // Roll back the optimistic message on failure.
        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] ?? []).filter((m) => m.id !== optimistic.id),
        }));
        throw err;
      }

      // Cross-portal notices (admin dashboard, parent push) still fire
      // client-side here to match prior behavior. If admin/parent run as
      // separate apps in production, move this into the backend's
      // `notifications` app instead so it fires for every client, not
      // just the sender's.
      if (sender === "teacher" && conversation) {
        pushAdminNotice({
          category: "chat",
          title: `Teacher message · ${conversation.teacherName}`,
          body: `${conversation.childName}: ${trimmed}`,
        });
        pushParentNotice({
          category: "chat",
          title: `Message from ${conversation.teacherName}`,
          body: trimmed,
        });
      }
    },
    [accessToken, conversations, pushAdminNotice, pushParentNotice]
  );

  const markRead = useCallback(
    async (conversationId: string, reader: ChatRole) => {
      if (!accessToken) return;
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          return reader === "teacher"
            ? { ...c, unreadForTeacher: 0 }
            : { ...c, unreadForParent: 0 };
        })
      );
      await postMarkRead(accessToken, conversationId, reader);
    },
    [accessToken]
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      conversations,
      conversationsLoading,
      refreshConversations,

      getMessages: (conversationId) => messagesByConversation[conversationId] ?? [],
      messagesLoading: (conversationId) => loadingIds.has(conversationId),
      loadMessages,
      subscribeToConversation,
      createConversation,

      getConversation: (id) => conversations.find((c) => c.id === id),
      sendMessage,
      markRead,

      teacherMessages: Object.values(messagesByConversation)
        .flat()
        .filter((m) => m.sender === "teacher")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }),
    [
      conversations,
      conversationsLoading,
      refreshConversations,
      messagesByConversation,
      loadingIds,
      loadMessages,
      createConversation,
      subscribeToConversation,
      sendMessage,
      markRead,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
