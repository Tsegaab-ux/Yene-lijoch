import React from "react";
import { Text, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  Screen,
  SoftCard,
  AvatarBubble,
  BackHeader,
  PrimaryButton,
} from "../../../../components/teacher/ui";
import { STUDENTS } from "../../../../data/teacherMock";
import { TeacherColors as C } from "../../../../constants/teacherTheme";
import { useChat } from "../../../../contexts/ChatContext";
import { useTeacherStudents } from "../../../../contexts/TeacherStudentsContext";

export default function StudentDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students } = useTeacherStudents();
  const student =
    students.find((s) => s.id === id) ??
    STUDENTS.find((s) => s.id === id) ??
    students[0] ??
    STUDENTS[0];
  const { conversations } = useChat();

  const openChat = () => {
    const match =
      conversations.find(
        (c) =>
          c.childName === student.name ||
          c.parentName === student.parent
      ) ?? conversations[0];
    router.push(`/teacher/messages/${match.id}`);
  };

  return (
    <Screen>
      <BackHeader title="Student" subtitle={student.name} />

      <SoftCard style={styles.hero}>
        <AvatarBubble initials={student.initials} color={student.color} size={72} />
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.meta}>{student.group}</Text>
        <Text style={styles.meta}>Parent: {student.parent}</Text>
        <Text style={[styles.badge, { color: statusColor(student.attendance) }]}>
          Today: {student.attendance}
        </Text>
      </SoftCard>

      <SoftCard style={{ marginTop: 14 }}>
        <Text style={styles.section}>Teacher notes</Text>
        <Text style={styles.body}>{student.notes}</Text>
      </SoftCard>

      <PrimaryButton
        label="Message parent"
        icon="chatbubble-outline"
        onPress={openChat}
      />
    </Screen>
  );
}

function statusColor(status: string) {
  if (status === "present") return C.success;
  if (status === "absent") return C.danger;
  return C.muted;
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", paddingVertical: 24 },
  name: { marginTop: 12, fontSize: 20, fontWeight: "700", color: C.text },
  meta: { marginTop: 4, color: C.muted },
  badge: { marginTop: 10, fontWeight: "700", textTransform: "capitalize" },
  section: { fontWeight: "700", color: C.text, marginBottom: 8, fontSize: 16 },
  body: { color: C.muted, lineHeight: 22 },
});
