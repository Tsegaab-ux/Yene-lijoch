import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  SoftCard,
  BackHeader,
  PrimaryButton,
} from "../../../components/parent/ui";
import { ParentColors as C } from "../../../constants/parentTheme";
import { useSharedContent } from "../../../contexts/SharedContentContext";

export default function ParentEventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { publishedEvents } = useSharedContent();
  const event =
    publishedEvents.find((e) => e.id === (Array.isArray(id) ? id[0] : id)) ??
    publishedEvents[0];

  if (!event) {
    return (
      <Screen>
        <BackHeader title="Event" subtitle="Not found" />
      </Screen>
    );
  }

  return (
    <Screen>
      <BackHeader title={event.title} subtitle={event.audience} />
      <SoftCard style={styles.card}>
        <Row icon="calendar-outline" label={event.date} />
        <Row icon="time-outline" label={event.time} />
        <Row icon="location-outline" label={event.location} />
        <Text style={styles.label}>About</Text>
        <Text style={styles.body}>{event.description}</Text>
      </SoftCard>
      <PrimaryButton
        label="Ask Teacher about this event"
        icon="chatbubble-outline"
        onPress={() => router.push("/parent/messages")}
      />
    </Screen>
  );
}

function Row({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color={C.primary} />
      <Text style={styles.rowText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  rowText: { fontSize: 15, fontWeight: "600", color: C.text },
  label: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  body: { marginTop: 6, fontSize: 14, color: C.muted, lineHeight: 21 },
});
