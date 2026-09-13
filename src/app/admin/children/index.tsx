import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Screen, TopBar, Card, ProgressBar } from "../../../components/admin/ui";
import { useAdminData } from "../../../contexts/AdminDataContext";
import { AdminColors as C } from "../../../constants/adminTheme";

export default function ChildrenScreen() {
  const { children, classes } = useAdminData();

  return (
    <Screen>
      <TopBar
        title="Children"
        subtitle="Add and manage students"
        actionLabel="+ Add"
        onAction={() => router.push("/admin/children/add")}
      />

      {children.map((child) => {
        const classItem = classes.find((c) => c.id === child.classId);
        return (
          <Card
            key={child.id}
            style={styles.card}
            onPress={() => router.push(`/admin/children/${child.id}`)}
          >
            <Text style={styles.name}>{child.name}</Text>
            <Text style={styles.meta}>
              {child.grade} · {classItem?.name ?? "Unassigned"}
            </Text>
            <Text style={styles.meta}>Parent: {child.parentName}</Text>
            <View style={{ marginTop: 10 }}>
              <ProgressBar value={child.progress} />
            </View>
            <Text style={styles.progress}>
              Progress {child.progress}% · Attendance {child.attendance}%
            </Text>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  name: { fontSize: 16, fontWeight: "800", color: C.text },
  meta: { marginTop: 4, color: C.muted, fontSize: 13 },
  progress: { marginTop: 6, color: C.muted, fontSize: 12, fontWeight: "600" },
});
