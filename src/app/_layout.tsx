import { Stack } from "expo-router";
import { SharedContentProvider } from "../contexts/SharedContentContext";
import { ChatProvider } from "../contexts/ChatContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { EventsProvider } from "@/contexts/EventsContext";
import { MediaProvider } from "@/contexts/MediaContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <SharedContentProvider>
            <MediaProvider>
              <EventsProvider>  
                <ChatProvider>
                  <Stack screenOptions={{ headerShown: false }} />
                </ChatProvider>
              </EventsProvider>
            </MediaProvider>
          </SharedContentProvider>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
