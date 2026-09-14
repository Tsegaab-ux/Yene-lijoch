import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Screen,
  SoftCard,
  TopBar,
  PrimaryButton,
  Field,
  SectionLabel,
} from "../../../components/admin/ui";
import { AdminColors as C } from "../../../constants/adminTheme";
import { useSharedContent } from "../../../contexts/SharedContentContext";
import {
  confirmAction,
  notify,
} from "../../../utils/mediaPicker";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function AdminEventsScreen() {
  const { events, addEvent, removeEvent } = useSharedContent();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("October 12, 2026");
  const [time, setTime] = useState("11:00 AM");
  const [location, setLocation] = useState("Fellowship Hall");
  const [audience, setAudience] = useState("Kids & Parents");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (!title.trim() || !date.trim()) {
      notify("Missing info", "Add an event title and date.");
      return;
    }
    addEvent({
      title: title.trim(),
      date: date.trim(),
      time: time.trim() || "10:00 AM",
      location: location.trim() || "Church",
      audience: audience.trim() || "Kids & Parents",
      status: "upcoming",
      description:
        description.trim() || "Event published for parents by admin.",
      published: true,
    });
    setTitle("");
    setDescription("");
    setShowForm(false);
    notify("Published", "Parents will see this event.");
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
          <Field label="Title" value={title} onChangeText={setTitle} />
          <Field label="Date" value={date} onChangeText={setDate} />
          <Field label="Time" value={time} onChangeText={setTime} />
          <Field
            label="Location"
            value={location}
            onChangeText={setLocation}
          />
          <Field
            label="Audience"
            value={audience}
            onChangeText={setAudience}
          />
          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <PrimaryButton
            label="Publish Event"
            icon="calendar-outline"
            onPress={handleAdd}
          />
        </SoftCard>
      ) : null}

      <SectionLabel title="Published events" />
      {events.map((event) => (
        <SoftCard key={event.id} style={styles.card}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.meta}>
            {event.date} · {event.time}
          </Text>
          <Text style={styles.meta}>{event.location}</Text>
          <Text style={styles.meta}>{event.audience}</Text>
          <SoftCard
            style={styles.remove}
            onPress={() =>
              confirmAction("Delete event?", event.title, () => {
                removeEvent(event.id);
                notify("Deleted", event.title);
              })
            }
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
