import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  SoftCard,
  BackHeader,
  PrimaryButton,
} from "../../../components/teacher/ui";
import { ATTENDANCE_DATE, SundayStudent } from "../../../data/teacherMock";
import { TeacherColors as C } from "../../../constants/teacherTheme";
import { useTeacherStudents } from "../../../contexts/TeacherStudentsContext";

type Mark = "present" | "absent";

export default function AttendanceScreen() {
  const { students, addStudent, updateAttendance } = useTeacherStudents();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const [marks, setMarks] = useState<Record<string, Mark>>({});

  useEffect(() => {
    setMarks((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        if (!next[s.id]) {
          next[s.id] = s.attendance === "absent" ? "absent" : "present";
        }
      });
      return next;
    });
  }, [students]);

  const list = useMemo(
    () =>
      students.map((s) => ({
        ...s,
        attendance: marks[s.id] ?? "present",
      })),
    [students, marks]
  );

  const summary = useMemo(() => {
    const present = list.filter((s) => s.attendance === "present").length;
    const absent = list.filter((s) => s.attendance === "absent").length;
    return { present, absent, total: list.length };
  }, [list]);

  const toggle = (id: string) => {
    setMarks((prev) => ({
      ...prev,
      [id]: prev[id] === "present" ? "absent" : "present",
    }));
  };

  const handleAddStudent = () => {
    if (!name.trim()) {
      Alert.alert("Missing name", "Please enter the student’s name.");
      return;
    }

    const created = addStudent({
      name,
      parent: parent || "Parent",
    });

    setMarks((prev) => ({ ...prev, [created.id]: "present" }));
    setName("");
    setParent("");
    setShowAdd(false);
    Alert.alert("Student added", `${created.name} was added to attendance.`);
  };

  return (
    <Screen>
      <BackHeader title="Attendance" subtitle={ATTENDANCE_DATE} />

      <View style={styles.topRow}>
        <Text style={styles.count}>{summary.total} Students</Text>
        <TouchableOpacity
          style={styles.addChip}
          onPress={() => setShowAdd(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="person-add-outline" size={16} color={C.primary} />
          <Text style={styles.addChipText}>Add Student</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Ionicons name="checkmark" size={16} color={C.success} />
          <Text style={[styles.legendText, { color: C.success }]}>Present</Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="close" size={16} color={C.danger} />
          <Text style={[styles.legendText, { color: C.danger }]}>Absent</Text>
        </View>
      </View>

      <SoftCard style={styles.listCard}>
        {list.map((student, index) => (
          <AttendanceRow
            key={student.id}
            student={student}
            last={index === list.length - 1}
            onPress={() => toggle(student.id)}
          />
        ))}
      </SoftCard>

      <PrimaryButton
        label="Save Attendance"
        icon="checkmark-done-outline"
        onPress={() => {
          updateAttendance(marks);
          Alert.alert(
            "Attendance saved",
            `${summary.present} present · ${summary.absent} absent`,
            [{ text: "Done", onPress: () => router.back() }]
          );
        }}
      />

      <Modal
        visible={showAdd}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAdd(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowAdd(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add Student</Text>
            <Text style={styles.modalSub}>
              Add a child to your group attendance list.
            </Text>

            <Text style={styles.label}>Student name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ruth Bekele"
              placeholderTextColor={C.muted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Parent name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Hanna Bekele"
              placeholderTextColor={C.muted}
              value={parent}
              onChangeText={setParent}
            />

            <PrimaryButton label="Add to Attendance" onPress={handleAddStudent} />
            <TouchableOpacity
              style={styles.cancel}
              onPress={() => setShowAdd(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

function AttendanceRow({
  student,
  last,
  onPress,
}: {
  student: SundayStudent;
  last: boolean;
  onPress: () => void;
}) {
  const present = student.attendance === "present";

  return (
    <SoftCard
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
    >
      <Text style={styles.name}>{student.name}</Text>
      <View
        style={[
          styles.mark,
          { backgroundColor: present ? C.successSoft : "#FDECEC" },
        ]}
      >
        <Ionicons
          name={present ? "checkmark" : "close"}
          size={18}
          color={present ? C.success : C.danger}
        />
      </View>
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  count: {
    fontSize: 16,
    fontWeight: "600",
    color: C.muted,
  },
  addChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addChipText: {
    color: C.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  legend: {
    flexDirection: "row",
    gap: 18,
    marginBottom: 14,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendText: {
    fontSize: 14,
    fontWeight: "700",
  },
  listCard: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: "transparent",
    borderRadius: 0,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: C.text,
    flex: 1,
  },
  mark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
  },
  modalSub: {
    marginTop: 6,
    marginBottom: 14,
    color: C.muted,
    lineHeight: 20,
  },
  label: {
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: C.bg,
    color: C.text,
    marginBottom: 8,
  },
  cancel: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelText: {
    color: C.muted,
    fontWeight: "600",
  },
});
