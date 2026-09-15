import { Stack } from "expo-router";
import { SharedContentProvider } from "../contexts/SharedContentContext";
import { ChatProvider } from "../contexts/ChatContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SharedContentProvider>
          <ChatProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </ChatProvider>
        </SharedContentProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
