import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  View,
} from "react-native";
import { router } from "expo-router";
import { Screen, TopBar, Pill } from "../../../../components/admin/ui";
import { useAdminData } from "../../../../contexts/AdminDataContext";
import { AdminColors as C } from "../../../../constants/adminTheme";

const AUDIENCES = ["parents", "teachers", "all"] as const;

export default function AddEventScreen() {
  const { addEvent } = useAdminData();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]>("parents");
  const [notifyParents, setNotifyParents] = useState(true);

  const handleSave = () => {
    if (!title || !date || !time || !location) {
      Alert.alert("Missing fields", "Title, date, time, and location are required.");
      return;
    }
    addEvent({
      title,
      date,
      time,
      location,
      description,
      audience,
      notifyParents,
    });
    Alert.alert(
      "Event created",
      notifyParents
        ? "Parents will be notified about this event."
        : "Event was saved without parent notification.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <Screen>
      <TopBar title="Add Event" onBack={() => router.back()} />

      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Date</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="Aug 30, 2026" />

      <Text style={styles.label}>Time</Text>
      <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="4:00 PM" />

      <Text style={styles.label}>Location</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.area]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Audience</Text>
      <View style={styles.row}>
        {AUDIENCES.map((item) => (
          <Pill
            key={item}
            label={item}
            active={audience === item}
            onPress={() => setAudience(item)}
          />
        ))}
      </View>

      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchTitle}>Notify parents</Text>
          <Text style={styles.switchSub}>Send event alert to parent accounts</Text>
        </View>
        <Switch
          value={notifyParents}
          onValueChange={setNotifyParents}
          trackColor={{ true: C.primary }}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Create event</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: "700", color: C.text, marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: C.card,
    color: C.text,
  },
  area: { minHeight: 90, textAlignVertical: "top" },
  row: { flexDirection: "row", flexWrap: "wrap" },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16 },
  switchTitle: { fontWeight: "800", color: C.text },
  switchSub: { marginTop: 4, color: C.muted, fontSize: 13 },
  button: {
    marginTop: 24,
    height: 54,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
