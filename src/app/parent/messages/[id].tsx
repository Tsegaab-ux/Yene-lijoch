import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ChatThread } from "../../../components/chat/ChatUI";
import { SoftCard, BackHeader } from "../../../components/parent/ui";
import { useChat } from "../../../contexts/ChatContext";
import { useLanguage } from "../../../contexts/LanguageContext";
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

export default function ParentChatThread() {
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

  // Load message history + clear the unread badge on open.
  useEffect(() => {
    if (!conversationId) return;
    loadMessages(conversationId);
    markRead(conversationId, "parent");
  }, [conversationId, loadMessages, markRead]);

  // Subscribe to live updates while the thread is open.
  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToConversation(conversationId);
    return () => unsubscribe();
  }, [conversationId, subscribeToConversation]);

  const messages = useMemo(
    () => (conversationId ? getMessages(conversationId) : []),
    [conversationId, getMessages]
  );

  // ---- Loading / not-found ------------------------------------------
  if (!conversation) {
    return (
      <View style={styles.center}>
        <BackHeader title={t("parent.messagesTitle")} />
        {conversationsLoading ? (
          <>
            <ActivityIndicator color={C.primary} />
            <Text style={styles.muted}>{t("common.loading")}</Text>
          </>
        ) : (
          <SoftCard>
            <Text style={styles.muted}>
              {t("parent.conversationNotFound")}
            </Text>
          </SoftCard>
        )}
      </View>
    );
  }

  return (
    <ChatThread
      role="parent"
      conversation={conversation}
      messages={messages}
      theme={theme}
      onOpen={() => markRead(conversation.id, "parent")}
      onSend={(text) => sendMessage(conversation.id, "parent", text)}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 20,
  },
  muted: {
    color: C.muted,
    textAlign: "center",
    marginTop: 12,
  },
});