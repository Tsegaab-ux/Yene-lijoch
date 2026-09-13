import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  SoftCard,
  SectionLabel,
  PrimaryButton,
} from "../../../components/teacher/ui";
import { useTeacherEvents } from "../../../contexts/TeacherEventsContext";
import { TeacherColors as C } from "../../../constants/teacherTheme";

export default function EventsScreen() {
  const { events } = useTeacherEvents();

  return (
    <Screen>
      <Text style={styles.title}>Events</Text>
      <Text style={styles.subtitle}>Children's activities and gatherings</Text>

      <SectionLabel title="Upcoming" />

      {events.map((event) => (
        <SoftCard
          key={event.id}
          style={styles.card}
          onPress={() => router.push(`/teacher/schedule/${event.id}`)}
        >
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.meta}>{event.date}</Text>
          <Text style={styles.meta}>{event.time}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={15} color={C.muted} />
            <Text style={styles.location}>{event.location}</Text>
          </View>
        </SoftCard>
      ))}

      <PrimaryButton
        label="+ Add Event"
        icon="add"
        onPress={() => router.push("/teacher/schedule/add")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 6,
    color: C.muted,
    fontSize: 14,
    fontWeight: "500",
  },
  card: {
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: C.muted,
    marginBottom: 3,
    fontWeight: "500",
  },
  locationRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  location: {
    fontSize: 14,
    color: C.text,
    fontWeight: "600",
  },
});
