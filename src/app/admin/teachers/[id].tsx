import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Screen, TopBar, Card, Badge } from "../../../components/admin/ui";
import { useAdminData } from "../../../contexts/AdminDataContext";
import { AdminColors as C } from "../../../constants/adminTheme";

export default function TeacherDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { teachers, classes, toggleTeacherStatus } = useAdminData();
  const teacher = teachers.find((t) => t.id === id) ?? teachers[0];
  const assigned = classes.filter((c) => c.teacherId === teacher.id);

  return (
    <Screen>
      <TopBar title="Teacher Details" onBack={() => router.back()} />

      <Card>
        <View style={styles.top}>
          <Text style={styles.name}>{teacher.name}</Text>
          <Badge
            label={teacher.status}
            tone={teacher.status === "active" ? "success" : "danger"}
          />
        </View>
        <Text style={styles.meta}>{teacher.email}</Text>
        <Text style={styles.meta}>{teacher.phone}</Text>
        <Text style={styles.meta}>{teacher.subject}</Text>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Text style={styles.section}>Assigned classes</Text>
        {assigned.length === 0 ? (
          <Text style={styles.meta}>No class assigned yet.</Text>
        ) : (
          assigned.map((c) => (
            <Text key={c.id} style={styles.classItem}>
              • {c.name} ({c.room})
            </Text>
          ))
        )}
      </Card>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          toggleTeacherStatus(teacher.id);
          Alert.alert(
            "Updated",
            `${teacher.name} is now ${teacher.status === "active" ? "inactive" : "active"}.`
          );
        }}
      >
        <Text style={styles.buttonText}>
          {teacher.status === "active" ? "Deactivate teacher" : "Activate teacher"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.ghost}
        onPress={() => router.push("/admin/classes")}
      >
        <Text style={styles.ghostText}>Assign to a class</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 20, fontWeight: "800", color: C.text, flex: 1 },
  meta: { marginTop: 6, color: C.muted },
  section: { fontWeight: "800", color: C.text, marginBottom: 8 },
  classItem: { color: C.text, marginBottom: 4, fontWeight: "600" },
  button: {
    marginTop: 20,
    height: 54,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  ghost: { marginTop: 14, alignItems: "center" },
  ghostText: { color: C.primary, fontWeight: "700" },
});
