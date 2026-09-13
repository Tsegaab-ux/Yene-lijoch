import React, { useMemo, useState } from "react";
import { Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ChatListShell, ConversationRow } from "../../../components/chat/ChatUI";
import { useChat } from "../../../contexts/ChatContext";
import { ParentColors as C } from "../../../constants/parentTheme";

const theme = {
  bg: C.bg,
  card: C.card,
  text: C.text,
  muted: C.muted,
  primary: C.primary,
  primarySoft: C.primarySoft,
  border: C.border,
  bubbleMine: C.primary,
  bubbleOther: "#FFFFFF",
};

export default function ParentMessagesList() {
  const { conversations } = useChat();
  const [search, setSearch] = useState("");

  // Parent demo account sees chats with teachers (all threads for demo)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.teacherName.toLowerCase().includes(q) ||
        c.childName.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  return (
    <ChatListShell
      title="Messages"
      subtitle="Chat with teachers"
      theme={theme}
      search={search}
      onSearch={setSearch}
    >
      {filtered.map((item) => (
        <ConversationRow
          key={item.id}
          title={item.teacherName}
          subtitle={`Teacher · ${item.childName}`}
          preview={item.lastMessage}
          time={item.lastTime}
          unread={item.unreadForParent}
          initials={item.teacherInitials}
          color={item.teacherColor}
          theme={theme}
          onPress={() => router.push(`/parent/messages/${item.id}`)}
        />
      ))}
      {filtered.length === 0 ? (
        <Text style={styles.empty}>No conversations found.</Text>
      ) : null}
    </ChatListShell>
  );
}

const styles = StyleSheet.create({
  empty: {
    textAlign: "center",
    color: C.muted,
    paddingVertical: 28,
  },
});
