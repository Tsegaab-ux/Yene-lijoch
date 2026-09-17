import React, { useState } from "react";
import { View, Text, StyleSheet, Platform, Alert } from "react-native";
import {
  Screen,
  SoftCard,
  TopBar,
  PrimaryButton,
  Field,
  SectionLabel,
} from "../../../components/admin/ui";
import { AdminColors as C } from "../../../constants/adminTheme";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useEventsContext } from "@/contexts/EventsContext";
import { notify } from "@/utils/notify";
import { AUDIENCE_LABELS } from "@/data/teacherMock";

// Cross-platform confirm dialog.
function confirm(title: string, message: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      { text: "Delete", style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}

export default function AdminEventsScreen() {
  const { t } = useLanguage();
  const { events, isLoading, createEvent, deleteEvent } = useEventsContext();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("October 12, 2026");
  const [time, setTime] = useState("11:00 AM");
  const [location, setLocation] = useState("Fellowship Hall");
  const [audience, setAudience] = useState("Kids & Parents");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ------------------------------------------------------------------
  // Create
  // ------------------------------------------------------------------
  const handleAdd = async () => {
    if (!title.trim() || !date.trim()) {
      notify(t("common.error"), t("admin.eventMissingInfo"));
      return;
    }

    setIsSaving(true);
    try {
      await createEvent({
        title: title.trim(),
        date: date.trim(),
        time: time.trim() || "10:00 AM",
        location: location.trim() || "Church",
        audience: audience.trim() || "Kids & Parents",
        status: "upcoming",
        description:
          description.trim() || t("admin.eventDefaultDescription"),
        published: true,
      });

      setTitle("");
      setDescription("");
      setShowForm(false);
      notify(t("common.success"), t("admin.eventPublished"));
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ?? err?.message ?? t("common.error");
      notify(t("common.error"), String(message));
    } finally {
      setIsSaving(false);
    }
  };

  // ------------------------------------------------------------------
  // Delete
  // ------------------------------------------------------------------
  const handleRemove = async (id: number | string, title: string) => {
    const ok = await confirm(t("admin.eventDeleteConfirm"), title);
    if (!ok) return;
    try {
      await deleteEvent(id);
      notify(t("common.success"), title);
    } catch (err: any) {
      notify(t("common.error"), String(err));
    }
  };

  return (
    <Screen>
      <TopBar
        title={t("admin.eventsTitle")}
        subtitle={t("admin.eventsPageSub")}
        actionLabel={showForm ? t("common.close") : `+ ${t("common.add")}`}
        onAction={() => setShowForm((v) => !v)}
      />

      {showForm ? (
        <SoftCard style={{ marginBottom: 14 }}>
          <Field
            label={t("admin.eventFieldTitle")}
            value={title}
            onChangeText={setTitle}
          />
          <Field
            label={t("admin.eventFieldDate")}
            value={date}
            onChangeText={setDate}
          />
          <Field
            label={t("admin.eventFieldTime")}
            value={time}
            onChangeText={setTime}
          />
          <Field
            label={t("admin.eventFieldLocation")}
            value={location}
            onChangeText={setLocation}
          />
          <Field
            label={t("admin.eventFieldAudience")}
            value={audience}
            onChangeText={setAudience}
          />
          <Field
            label={t("admin.eventFieldDescription")}
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <PrimaryButton
            label={
              isSaving ? t("admin.publishing") : t("admin.publishEvent")
            }
            icon="calendar-outline"
            onPress={handleAdd}
            disabled={isSaving}
          />
        </SoftCard>
      ) : null}

      <SectionLabel title={t("admin.publishedEvents")} />

      {isLoading && events.length === 0 ? (
        <SoftCard style={styles.card}>
          <Text style={styles.meta}>{t("common.loading")}</Text>
        </SoftCard>
      ) : null}

      {!isLoading && events.length === 0 ? (
        <SoftCard style={styles.card}>
          <Text style={styles.meta}>{t("admin.noEvents")}</Text>
        </SoftCard>
      ) : null}

      {events.map((event) => (
        <SoftCard key={event.id} style={styles.card}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.meta}>
            {event.date} · {event.time}
          </Text>
          {event.location ? (
            <Text style={styles.meta}>{event.location}</Text>
          ) : null}
          {event.audience ? (
            <Text style={styles.meta}>
              {AUDIENCE_LABELS[event.audience as keyof typeof AUDIENCE_LABELS] ??
                event.audience}
            </Text>
          ) : null}
          <SoftCard
            style={styles.remove}
            onPress={() => handleRemove(event.id, event.title)}
          >
            <Text style={styles.removeText}>{t("common.delete")}</Text>
          </SoftCard>
        </SoftCard>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  title: { fontSize: 16, fontWeight: "800", color: C.text },
  meta: { marginTop: 4, color: C.muted, fontSize: 13 },
  remove: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  removeText: { color: C.danger, fontWeight: "700", fontSize: 12 },
});