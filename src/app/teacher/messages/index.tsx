import React, { useMemo, useState } from "react";
import { ActivityIndicator, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ChatListShell, ConversationRow } from "../../../components/chat/ChatUI";
import { useChat } from "../../../contexts/ChatContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { TeacherColors as C } from "../../../constants/teacherTheme";

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

export default function TeacherMessagesList() {
  const { conversations, conversationsLoading } = useChat();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.parentName.toLowerCase().includes(q) ||
        c.childName.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  return (
    <ChatListShell
      title={t("teacher.messagesTitle")}
      subtitle={t("teacher.messagesSub")}
      theme={theme}
      search={search}
      onSearch={setSearch}
    >
      {conversationsLoading && conversations.length === 0 ? (
        <ActivityIndicator style={styles.spinner} color={C.primary} />
      ) : null}

      {filtered.map((item) => (
        <ConversationRow
          key={item.id}
          title={item.parentName}
          subtitle={`Parent of ${item.childName}`}
          preview={item.lastMessage}
          time={item.lastTime}
          unread={item.unreadForTeacher}
          initials={item.parentInitials}
          color={item.parentColor}
          theme={theme}
          onPress={() => router.push(`/teacher/messages/${item.id}`)}
        />
      ))}

      {!conversationsLoading && filtered.length === 0 ? (
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
  spinner: {
    paddingVertical: 28,
  },
});