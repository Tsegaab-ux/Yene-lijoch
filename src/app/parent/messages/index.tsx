import React, { useMemo, useState } from "react";
import { Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import {
  ChatListShell,
  ConversationRow,
} from "../../../components/chat/ChatUI";
import { useChat } from "../../../contexts/ChatContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { ParentColors as C } from "../../../constants/parentTheme";
import { colorFor, deriveInitials } from "@/utils/avatarColors";

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
  const { conversations, conversationsLoading, refreshConversations } = useChat();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;

    return conversations.filter((c) => {
      const teacher = (c.teacherName ?? "").toLowerCase();
      const child = (c.childName ?? "").toLowerCase();
      const preview = (c.lastMessage ?? "").toLowerCase();
      return (
        teacher.includes(q) || child.includes(q) || preview.includes(q)
      );
    });
  }, [conversations, search]);

  // ---- Loading state (only when there are no cached conversations yet)
  const showLoading = conversationsLoading && conversations.length === 0;

  return (
    <ChatListShell
      title={t("parent.messagesTitle")}
      subtitle={t("parent.messagesSub")}
      theme={theme}
      search={search}
      onSearch={setSearch}
    >
      {showLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} />
        </View>
      ) : null}

      {!showLoading &&
        filtered.map((item) => {
          const teacherName = item.teacherName || t("parent.teacherFallback");
          return (
            <ConversationRow
              key={item.id}
              title={teacherName}
              subtitle={`${t("parent.roleTeacher")}${
                item.childName ? ` · ${item.childName}` : ""
              }`}
              preview={item.lastMessage ?? ""}
              time={item.lastTime ?? ""}
              unread={item.unreadForParent ?? 0}
              initials={deriveInitials(teacherName)}
              color={colorFor(teacherName)}
              theme={theme}
              onPress={() => router.push(`/parent/messages/${item.id}`)}
            />
          );
        })}

      {!showLoading && filtered.length === 0 ? (
        <Text style={styles.empty}>
          {search.trim()
            ? t("parent.noConversationsSearch")
            : t("parent.noConversations")}
        </Text>
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
  center: {
    paddingVertical: 40,
    alignItems: "center",
  },
});