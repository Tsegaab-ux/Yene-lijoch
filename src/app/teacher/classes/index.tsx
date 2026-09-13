import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  SoftCard,
  PrimaryButton,
} from "../../../components/teacher/ui";
import {
  getAttendanceSummary,
  SundayStudent,
} from "../../../data/teacherMock";
import { TeacherColors as C } from "../../../constants/teacherTheme";
import { useTeacherStudents } from "../../../contexts/TeacherStudentsContext";

export default function StudentsScreen() {
  const { students } = useTeacherStudents();
  const [query, setQuery] = useState("");
  const summary = useMemo(() => getAttendanceSummary(students), [students]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.group.toLowerCase().includes(q)
    );
  }, [query, students]);

  return (
    <Screen>
      <Text style={styles.title}>My Students</Text>
      <Text style={styles.subtitle}>{students.length} Students</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={C.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor={C.muted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <SoftCard style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Today's Attendance</Text>
        <View style={styles.summaryRow}>
          <SummaryItem value={`${summary.present}`} label="Present" tone="success" />
          <SummaryItem value={`${summary.absent}`} label="Absent" tone="danger" />
          <SummaryItem value={`${summary.unmarked}`} label="Not Marked" tone="muted" />
        </View>
        <PrimaryButton
          label="Take Attendance"
          icon="checkmark-done-outline"
          onPress={() => router.push("/teacher/classes/attendance")}
        />
      </SoftCard>

      <SoftCard style={styles.listCard}>
        {filtered.map((student, index) => (
          <StudentRow
            key={student.id}
            student={student}
            last={index === filtered.length - 1}
          />
        ))}
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No students found.</Text>
        ) : null}
      </SoftCard>
    </Screen>
  );
}

function SummaryItem({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: "success" | "danger" | "muted";
}) {
  const color =
    tone === "success" ? C.success : tone === "danger" ? C.danger : C.muted;

  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function StudentRow({
  student,
  last,
}: {
  student: SundayStudent;
  last: boolean;
}) {
  const status = statusMeta(student.attendance);

  return (
    <SoftCard
      style={[styles.row, !last && styles.rowBorder]}
      onPress={() => router.push(`/teacher/classes/student/${student.id}`)}
    >
      <Text style={styles.name}>{student.name}</Text>
      <Text style={styles.group}>{student.group}</Text>
      <View style={styles.statusRow}>
        <Ionicons name={status.icon} size={16} color={status.color} />
        <Text style={[styles.statusText, { color: status.color }]}>
          {status.label}
        </Text>
      </View>
    </SoftCard>
  );
}

function statusMeta(attendance: SundayStudent["attendance"]) {
  if (attendance === "present") {
    return {
      label: "Present today",
      color: C.success,
      icon: "checkmark-circle" as const,
    };
  }
  if (attendance === "absent") {
    return {
      label: "Absent today",
      color: C.danger,
      icon: "close-circle" as const,
    };
  }
  return {
    label: "Not marked",
    color: C.muted,
    icon: "ellipse-outline" as const,
  };
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 14,
    color: C.muted,
    fontSize: 15,
    fontWeight: "500",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.text,
  },
  summaryCard: {
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: C.bgSoft,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
  },
  listCard: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  row: {
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
    fontWeight: "700",
    color: C.text,
  },
  group: {
    marginTop: 4,
    fontSize: 13,
    color: C.muted,
    fontWeight: "500",
  },
  statusRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    color: C.muted,
    paddingVertical: 20,
  },
});
