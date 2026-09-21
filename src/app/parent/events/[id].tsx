import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  SoftCard,
  BackHeader,
  PrimaryButton,
} from "../../../components/parent/ui";
import { ParentColors as C } from "../../../constants/parentTheme";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useEventsContext } from "@/contexts/EventsContext";
import { AUDIENCE_LABELS } from "@/data/teacherMock";

export default function ParentEventDetail() {
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const rawId = Array.isArray(id) ? id[0] : id;

  const { events, isLoading, error } = useEventsContext();

  // ---- Resolve the event by ID (no fallback to the wrong one) ----
  const event = useMemo(
    () => events.find((e) => String(e.id) === String(rawId)) ?? null,
    [events, rawId]
  );

  // ---- Loading guard ---------------------------------------------
  if (isLoading && !event) {
    return (
      <Screen>
        <BackHeader title={t("parent.eventTitle")} />
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} />
          <Text style={styles.rowText}>{t("common.loading")}</Text>
        </View>
      </Screen>
    );
  }

  // ---- Error / not found -----------------------------------------
  if (error && !event) {
    return (
      <Screen>
        <BackHeader title={t("parent.eventTitle")} />
        <SoftCard style={styles.card}>
          <Text style={[styles.body, { color: C.danger }]}>{error}</Text>
        </SoftCard>
      </Screen>
    );
  }

  if (!event) {
    return (
      <Screen>
        <BackHeader
          title={t("parent.eventTitle")}
          subtitle={t("common.notFound")}
        />
      </Screen>
    );
  }

  // ---- Loaded ----------------------------------------------------
  return (
    <Screen>
      <BackHeader
        title={event.title}
        subtitle={
          AUDIENCE_LABELS[event.audience as keyof typeof AUDIENCE_LABELS] || ""
        }
      />

      <SoftCard style={styles.card}>
        <Row icon="calendar-outline" label={event.date} />
        {event.time ? (
          <Row icon="time-outline" label={event.time} />
        ) : null}
        {event.location ? (
          <Row icon="location-outline" label={event.location} />
        ) : null}

        {event.description ? (
          <>
            <Text style={styles.label}>{t("parent.eventAbout")}</Text>
            <Text style={styles.body}>{event.description}</Text>
          </>
        ) : null}
      </SoftCard>

      <PrimaryButton
        label={t("parent.askTeacherAboutEvent")}
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
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 10,
  },
});