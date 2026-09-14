import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  SoftCard,
  BackHeader,
  PrimaryButton,
} from "../../../components/teacher/ui";
import {
  useTeacherEvents,
  AUDIENCE_LABELS,
  EventAudience,
} from "../../../contexts/TeacherEventsContext";
import { TeacherColors as C } from "../../../constants/teacherTheme";

const AUDIENCES: EventAudience[] = [
  "my_group",
  "children_ministry",
  "all_parents",
];

export default function AddEventScreen() {
  const { addEvent } = useTeacherEvents();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState<EventAudience>("my_group");

  const handlePublish = () => {
    if (!title.trim() || !date.trim() || !time.trim() || !location.trim()) {
      Alert.alert(
        "Missing fields",
        "Please fill in event name, date, time, and location."
      );
      return;
    }

    const created = addEvent({
      title: title.trim(),
      date: date.trim(),
      time: time.trim(),
      location: location.trim(),
      description: description.trim() || "No description added.",
      audience,
    });

    Alert.alert("Event published", `${created.title} is now in Upcoming Events.`, [
      { text: "View Events", onPress: () => router.replace("/teacher/schedule") },
    ]);
  };

  return (
    <Screen>
      <BackHeader title="Create Event" subtitle="Publish a children's activity" />

      <SoftCard>
        <Field label="Event name">
          <TextInput
            style={styles.input}
            placeholder="Children's Program"
            placeholderTextColor={C.muted}
            value={title}
            onChangeText={setTitle}
          />
        </Field>

        <Field label="Date">
          <TextInput
            style={styles.input}
            placeholder="September 27"
            placeholderTextColor={C.muted}
            value={date}
            onChangeText={setDate}
          />
        </Field>

        <Field label="Time">
          <TextInput
            style={styles.input}
            placeholder="10:00 AM"
            placeholderTextColor={C.muted}
            value={time}
            onChangeText={setTime}
          />
        </Field>

        <Field label="Location">
          <TextInput
            style={styles.input}
            placeholder="Main Church"
            placeholderTextColor={C.muted}
            value={location}
            onChangeText={setLocation}
          />
        </Field>

        <Field label="Description">
          <TextInput
            style={[styles.input, styles.area]}
            placeholder="Write a short description..."
            placeholderTextColor={C.muted}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </Field>

        <Text style={styles.label}>Audience</Text>
        {AUDIENCES.map((item) => {
          const active = audience === item;
          return (
            <TouchableOpacity
              key={item}
              style={styles.audienceRow}
              onPress={() => setAudience(item)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={active ? "ellipse" : "ellipse-outline"}
                size={18}
                color={active ? C.primary : C.muted}
              />
              <Text style={[styles.audienceText, active && styles.audienceActive]}>
                {AUDIENCE_LABELS[item]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </SoftCard>

      <PrimaryButton
        label="Publish Event"
        icon="megaphone-outline"
        onPress={handlePublish}
      />
    </Screen>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: C.bg,
    color: C.text,
    fontSize: 15,
  },
  area: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  audienceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  audienceText: {
    fontSize: 15,
    color: C.muted,
    fontWeight: "500",
  },
  audienceActive: {
    color: C.text,
    fontWeight: "700",
  },
});
