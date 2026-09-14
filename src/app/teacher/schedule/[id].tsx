import React from "react";
import { Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Screen,
  SoftCard,
  BackHeader,
  SectionLabel,
} from "../../../components/teacher/ui";
import {
  useTeacherEvents,
  AUDIENCE_LABELS,
} from "../../../contexts/TeacherEventsContext";
import { TeacherColors as C } from "../../../constants/teacherTheme";

export default function EventDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEvent } = useTeacherEvents();
  const event = getEvent(id);

  return (
    <Screen>
      <BackHeader title="Event" subtitle="Upcoming activity" />

      <SoftCard>
        <Text style={styles.kicker}>Upcoming</Text>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.meta}>{event.date}</Text>
        <Text style={styles.meta}>{event.time}</Text>
        <Text style={styles.location}>{event.location}</Text>
      </SoftCard>

      <SectionLabel title="Audience" />
      <SoftCard>
        <Text style={styles.body}>{AUDIENCE_LABELS[event.audience]}</Text>
      </SoftCard>

      <SectionLabel title="Description" />
      <SoftCard>
        <Text style={styles.body}>{event.description}</Text>
      </SoftCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: C.primary,
    fontWeight: "700",
    marginBottom: 8,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: { fontSize: 22, fontWeight: "700", color: C.text },
  meta: { marginTop: 6, color: C.muted, fontSize: 15 },
  location: {
    marginTop: 10,
    color: C.text,
    fontWeight: "600",
    fontSize: 15,
  },
  body: { color: C.text, lineHeight: 22, fontSize: 15 },
});
