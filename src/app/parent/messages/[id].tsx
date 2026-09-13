import React, { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { ChatThread } from "../../../components/chat/ChatUI";
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

export default function ParentChatThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getConversation, getMessages, sendMessage, markRead } = useChat();
  const conversation = getConversation(id);
  const messages = useMemo(
    () => getMessages(conversation.id),
    [getMessages, conversation.id]
  );

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
