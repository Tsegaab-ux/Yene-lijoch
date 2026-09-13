import React from "react";
import { Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { Screen, TopBar, Card, MenuRow } from "../../../components/admin/ui";
import { ADMIN } from "../../../data/adminMock";
import { AdminColors as C } from "../../../constants/adminTheme";

export default function MoreScreen() {
  return (
    <Screen>
      <TopBar title="More" subtitle="Events, lessons, and account" />

      <Card style={styles.hero}>
        <Text style={styles.name}>{ADMIN.name}</Text>
        <Text style={styles.meta}>{ADMIN.role}</Text>
        <Text style={styles.meta}>{ADMIN.email}</Text>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <MenuRow
          icon="calendar-outline"
          title="Events"
          subtitle="Create events and notify parents"
          onPress={() => router.push("/admin/more/events")}
        />
        <MenuRow
          icon="book-outline"
          title="Lesson Progress"
          subtitle="Publish lessons and track progress"
          onPress={() => router.push("/admin/more/lessons")}
        />
        <MenuRow
          icon="settings-outline"
          title="Settings"
          subtitle="Admin account settings"
          onPress={() => router.push("/admin/more/settings")}
        />
        <MenuRow
          icon="log-out-outline"
          title="Logout"
          subtitle="Return to login"
          danger
          onPress={() =>
            Alert.alert("Logout", "Are you sure you want to log out?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Logout",
                style: "destructive",
                onPress: () => router.replace("/(auth)/login"),
              },
            ])
          }
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { paddingVertical: 20 },
  name: { fontSize: 20, fontWeight: "800", color: C.text },
  meta: { marginTop: 4, color: C.muted },
});
