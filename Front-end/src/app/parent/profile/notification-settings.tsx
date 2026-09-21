import React, { useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { router } from "expo-router";
import { Screen, TopBar, Card } from "../../../components/parent/ui";
import { ParentColors as C } from "../../../constants/parentTheme";

export default function NotificationSettingsScreen() {
  const [attendance, setAttendance] = useState(true);
  const [events, setEvents] = useState(true);
  const [courses, setCourses] = useState(true);
  const [chat, setChat] = useState(true);
  const [system, setSystem] = useState(false);

  return (
    <Screen>
      <TopBar
        title="Notifications Settings"
        showBell={false}
        onBack={() => router.back()}
      />
      <Card>
        <Toggle label="Attendance" value={attendance} onChange={setAttendance} />
        <Toggle label="Events" value={events} onChange={setEvents} />
        <Toggle label="Courses" value={courses} onChange={setCourses} />
        <Toggle label="Chat" value={chat} onChange={setChat} />
        <Toggle label="System" value={system} onChange={setSystem} last />
      </Card>
    </Screen>
  );
}

function Toggle({
  label,
  value,
  onChange,
  last,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.border]}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: C.primary }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  border: { borderBottomWidth: 1, borderBottomColor: C.border },
  label: { fontWeight: "700", color: C.text, fontSize: 15 },
});
