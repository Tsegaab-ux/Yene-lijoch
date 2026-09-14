import { Stack } from "expo-router";
import { SharedContentProvider } from "../contexts/SharedContentContext";
import { ChatProvider } from "../contexts/ChatContext";

export default function RootLayout() {
  return (
    <SharedContentProvider>
      <ChatProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ChatProvider>
    </SharedContentProvider>
  );
}
