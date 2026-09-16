import { Stack } from "expo-router";
import { SharedContentProvider } from "../contexts/SharedContentContext";
import { ChatProvider } from "../contexts/ChatContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { EventsProvider } from "@/contexts/EventsContext";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SharedContentProvider>
          <EventsProvider>  
            <ChatProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </ChatProvider>
          </EventsProvider>
        </SharedContentProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
