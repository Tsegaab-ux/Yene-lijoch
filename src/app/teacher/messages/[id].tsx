import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ChatThread } from "../../../components/chat/ChatUI";
import { SoftCard, BackHeader } from "../../../components/teacher/ui";
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

export default function TeacherChatThread() {
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getConversation,
    getMessages,
    loadMessages,
    subscribeToConversation,
    sendMessage,
    markRead,
    conversationsLoading,
  } = useChat();

  const conversation = id ? getConversation(id) : undefined;
  const conversationId = conversation?.id;

  useEffect(() => {
    if (!conversationId) return;
    loadMessages(conversationId);
    markRead(conversationId, "teacher");
  }, [conversationId, loadMessages, markRead]);

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToConversation(conversationId);
    return () => unsubscribe();
  }, [conversationId, subscribeToConversation]);

  const messages = useMemo(
    () => (conversationId ? getMessages(conversationId) : []),
    [conversationId, getMessages]
  );

  if (!conversation) {
    return (
      <View style={styles.center}>
        <BackHeader title={t("teacher.messages.title")} />
        {conversationsLoading ? (
          <>
            <ActivityIndicator color={C.primary} />
            <Text style={styles.muted}>{t("common.loading")}</Text>
          </>
        ) : (
          <SoftCard>
            <Text style={styles.muted}>{t("teacher.messages.notFound")}</Text>
          </SoftCard>
        )}
      </View>
    );
  }

  return (
    <ChatThread
      role="teacher"
      conversation={conversation}
      messages={messages}
      theme={theme}
      onOpen={() => markRead(conversation.id, "teacher")}
      onSend={(text) => sendMessage(conversation.id, "teacher", text)}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: C.bg, padding: 20 },
  muted: { color: C.muted, textAlign: "center", marginTop: 12 },
});