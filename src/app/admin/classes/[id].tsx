import React, { useState } from "react";
import { Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Screen, TopBar, Card, Pill } from "../../../components/admin/ui";
import { useAdminData } from "../../../contexts/AdminDataContext";
import { AdminColors as C } from "../../../constants/adminTheme";

export default function ClassAssignScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { classes, teachers, children, assignTeacherToClass } = useAdminData();
  const classItem = classes.find((c) => c.id === id) ?? classes[0];
  const [selectedTeacher, setSelectedTeacher] = useState(classItem.teacherId ?? "");
  const classChildren = children.filter((c) => c.classId === classItem.id);
  const activeTeachers = teachers.filter((t) => t.status === "active");

  const handleAssign = () => {
    assignTeacherToClass(classItem.id, selectedTeacher || null);
    const teacher = teachers.find((t) => t.id === selectedTeacher);
    Alert.alert(
      "Assigned",
      teacher
        ? `${teacher.name} is now assigned to ${classItem.name}.`
        : `Teacher was removed from ${classItem.name}.`
    );
  };

  return (
    <Screen>
      <TopBar title="Assign Teacher" onBack={() => router.back()} />

      <Card>
        <Text style={styles.name}>{classItem.name}</Text>
        <Text style={styles.meta}>
          {classItem.grade} · {classItem.subject} · {classItem.room}
        </Text>
        <Text style={styles.meta}>{classItem.studentCount} students enrolled</Text>
      </Card>

      <Text style={styles.label}>Select teacher</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <Pill
          label="No teacher"
          active={!selectedTeacher}
          onPress={() => setSelectedTeacher("")}
        />
        {activeTeachers.map((teacher) => (
          <Pill
            key={teacher.id}
            label={teacher.name}
            active={selectedTeacher === teacher.id}
            onPress={() => setSelectedTeacher(teacher.id)}
          />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleAssign}>
        <Text style={styles.buttonText}>Save assignment</Text>
      </TouchableOpacity>

      <Card style={{ marginTop: 20 }}>
        <Text style={styles.section}>Students in this class</Text>
        {classChildren.length === 0 ? (
          <Text style={styles.meta}>No students yet.</Text>
        ) : (
          classChildren.map((child) => (
            <Text key={child.id} style={styles.student}>
              • {child.name} ({child.progress}% progress)
            </Text>
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 18, fontWeight: "800", color: C.text },
  meta: { marginTop: 6, color: C.muted },
  label: { fontWeight: "800", color: C.text, marginTop: 16, marginBottom: 10 },
  button: {
    height: 54,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  section: { fontWeight: "800", color: C.text, marginBottom: 8 },
  student: { color: C.text, marginBottom: 4, fontWeight: "600" },
});
