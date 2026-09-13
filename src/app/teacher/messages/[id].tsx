import React, { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { ChatThread } from "../../../components/chat/ChatUI";
import { useChat } from "../../../contexts/ChatContext";
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getConversation, getMessages, sendMessage, markRead } = useChat();
  const conversation = getConversation(id);
  const messages = useMemo(
    () => getMessages(conversation.id),
    [getMessages, conversation.id]
  );

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
