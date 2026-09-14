import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, SoftCard, SectionLabel } from "../../../components/parent/ui";
import { ParentColors as C } from "../../../constants/parentTheme";
import { useSharedContent } from "../../../contexts/SharedContentContext";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function ParentEventsScreen() {
  const { publishedEvents } = useSharedContent();
  const { t } = useLanguage();
  const upcoming = publishedEvents.filter((e) => e.status !== "past");
  const past = publishedEvents.filter((e) => e.status === "past");

  return (
    <Screen>
      <Text style={styles.title}>{t("parent.eventsTitle")}</Text>
      <Text style={styles.subtitle}>{t("parent.eventsSub")}</Text>

      <SectionLabel title={t("parent.upcoming")} />
      {upcoming.map((event) => (
        <SoftCard
          key={event.id}
          style={styles.card}
          onPress={() => router.push(`/parent/events/${event.id}` as any)}
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

      {past.length > 0 ? (
        <>
          <SectionLabel title={t("parent.past")} />
          {past.map((event) => (
            <SoftCard
              key={event.id}
              style={styles.card}
              onPress={() => router.push(`/parent/events/${event.id}` as any)}
            >
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.meta}>
                {event.date} · {event.time}
              </Text>
            </SoftCard>
          ))}
        </>
      ) : null}
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
  subtitle: { marginTop: 6, color: C.muted, fontSize: 14, fontWeight: "500" },
  card: { marginBottom: 12 },
  eventTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
  },
  meta: { fontSize: 14, color: C.muted, marginBottom: 3, fontWeight: "500" },
  locationRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  location: { fontSize: 14, color: C.text, fontWeight: "600" },
});
