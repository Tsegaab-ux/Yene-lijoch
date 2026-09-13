import React from "react";
import { Text, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Screen, TopBar, Card, ProgressBar } from "../../../components/admin/ui";
import { useAdminData } from "../../../contexts/AdminDataContext";
import { AdminColors as C } from "../../../constants/adminTheme";

export default function ChildDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { children, classes } = useAdminData();
  const child = children.find((c) => c.id === id) ?? children[0];
  const classItem = classes.find((c) => c.id === child.classId);

  return (
    <Screen>
      <TopBar title="Child Details" onBack={() => router.back()} />

      <Card>
        <Text style={styles.name}>{child.name}</Text>
        <Text style={styles.meta}>{child.grade}</Text>
        <Text style={styles.meta}>Class: {classItem?.name ?? "Unassigned"}</Text>
        <Text style={styles.meta}>Parent: {child.parentName}</Text>
        <Text style={styles.meta}>{child.parentEmail}</Text>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Text style={styles.section}>Learning progress</Text>
        <ProgressBar value={child.progress} />
        <Text style={styles.meta}>{child.progress}% complete</Text>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Text style={styles.section}>Attendance</Text>
        <Text style={styles.big}>{child.attendance}%</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 20, fontWeight: "800", color: C.text },
  meta: { marginTop: 6, color: C.muted },
  section: { fontWeight: "800", color: C.text, marginBottom: 10 },
  big: { fontSize: 28, fontWeight: "800", color: C.text },
});
