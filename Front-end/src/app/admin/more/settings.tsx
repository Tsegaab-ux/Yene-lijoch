import React from "react";
import { Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Screen, TopBar, Card } from "../../../components/admin/ui";
import { ADMIN } from "../../../data/adminMock";
import { AdminColors as C } from "../../../constants/adminTheme";

export default function AdminSettingsScreen() {
  return (
    <Screen>
      <TopBar title="Settings" onBack={() => router.back()} />
      <Card>
        <Text style={styles.label}>Administrator</Text>
        <Text style={styles.value}>{ADMIN.name}</Text>
        <Text style={styles.value}>{ADMIN.email}</Text>
        <Text style={styles.value}>{ADMIN.school}</Text>
      </Card>
      <Text style={styles.note}>
        Backend account settings will be connected in the next phase.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: "800", color: C.text, marginBottom: 8 },
  value: { color: C.muted, marginBottom: 4 },
  note: { marginTop: 16, color: C.muted, lineHeight: 20 },
});
