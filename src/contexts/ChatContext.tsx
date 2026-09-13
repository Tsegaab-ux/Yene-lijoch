import React, { createContext, useContext, useMemo, useState } from "react";
import {
  ChatMessage,
  ChatRole,
  Conversation,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
} from "../data/chatMock";

type ChatContextValue = {
  conversations: Conversation[];
  getMessages: (conversationId: string) => ChatMessage[];
  getConversation: (id: string) => Conversation;
  sendMessage: (conversationId: string, sender: ChatRole, text: string) => void;
  markRead: (conversationId: string, reader: ChatRole) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

function nowLabel() {
  const d = new Date();
  let hours = d.getHours();
  const minutes = `${d.getMinutes()}`.padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  const value = useMemo<ChatContextValue>(
    () => ({
      conversations,
      getMessages: (conversationId) =>
        messages
          .filter((m) => m.conversationId === conversationId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      getConversation: (id) =>
        conversations.find((c) => c.id === id) ?? conversations[0],
      sendMessage: (conversationId, sender, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const message: ChatMessage = {
          id: `msg-${Date.now()}`,
          conversationId,
          sender,
          text: trimmed,
          createdAt: new Date().toISOString(),
          timeLabel: nowLabel(),
        };

        setMessages((prev) => [...prev, message]);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== conversationId) return c;
            return {
              ...c,
              lastMessage: trimmed,
              lastTime: "Just now",
              unreadForTeacher:
                sender === "parent" ? c.unreadForTeacher + 1 : 0,
              unreadForParent:
                sender === "teacher" ? c.unreadForParent + 1 : 0,
            };
          })
        );
      },
      markRead: (conversationId, reader) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== conversationId) return c;
            if (reader === "teacher") return { ...c, unreadForTeacher: 0 };
            return { ...c, unreadForParent: 0 };
          })
        );
      },
    }),
    [conversations, messages]
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
