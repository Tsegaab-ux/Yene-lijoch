import { Stack } from "expo-router";
import { SharedContentProvider } from "../contexts/SharedContentContext";
import { ChatProvider } from "../contexts/ChatContext";
import { LanguageProvider } from "../contexts/LanguageContext";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <SharedContentProvider>
        <ChatProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ChatProvider>
      </SharedContentProvider>
    </LanguageProvider>
  );
}
