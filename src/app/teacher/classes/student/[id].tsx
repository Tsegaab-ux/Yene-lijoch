import React, { useMemo, useState } from "react";
import { Text, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  Screen,
  SoftCard,
  AvatarBubble,
  BackHeader,
  PrimaryButton,
} from "../../../../components/teacher/ui";
import { TeacherColors as C } from "../../../../constants/teacherTheme";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { useChat } from "../../../../contexts/ChatContext";
import { useTeacher } from "@/contexts/TeacherContext";
import { useTeacherCurriculumContext } from "@/contexts/TeacherCurriculumContext";
import { useAttendance } from "@/hooks/useAttendance";
import { notify } from "@/utils/notify";

const AVATAR_COLORS = [
  "#E57373", "#F06292", "#BA68C8", "#9575CD",
  "#7986CB", "#64B5F6", "#4FC3F7", "#4DB6AC",
  "#81C784", "#AED581", "#FFB74D", "#FF8A65",
];

function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initialsFor(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

export default function StudentDetails() {
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { primaryClass } = useTeacher();
  const { todayLesson } = useTeacherCurriculumContext();
  const { conversations, createConversation } = useChat();

  const { students, existing, isLoading, error } = useAttendance(
    primaryClass?.id,
    todayLesson?.id
  );

  const [openingChat, setOpeningChat] = useState(false);

  const student = useMemo(
    () => students.find((s) => String(s.id) === String(id)) ?? null,
    [students, id]
  );

  const conversation = useMemo(() => {
    if (!student) return null;
    return conversations.find((c) => c.childName === student.name) ?? null;
  }, [conversations, student]);

  const status = student ? existing[String(student.id)] ?? "present" : "present";
  const statusColor =
    status === "present" ? C.success
    : status === "absent" ? C.danger
    : C.muted;

  if (isLoading && students.length === 0) {
    return (
      <Screen>
        <BackHeader title={t("teacher.student.title")} />
        <SoftCard>
          <Text style={styles.meta}>{t("common.loading")}</Text>
        </SoftCard>
      </Screen>
    );
  }

  if (error || !student) {
    return (
      <Screen>
        <BackHeader title={t("teacher.student.title")} />
        <SoftCard>
          <Text style={[styles.meta, { color: C.danger }]}>
            {error ?? t("teacher.student.notFound")}
          </Text>
        </SoftCard>
      </Screen>
    );
  }

  // ------------------------------------------------------------------
  // Create-or-open: if a conversation exists, open it. Otherwise ask
  // the backend to create one, then open it.
  // ------------------------------------------------------------------
  const handleMessageParent = async () => {
    if (openingChat) return;
    setOpeningChat(true);
    try {
      const conv =
        conversation ?? (await createConversation(student.id));
      router.push(`/teacher/messages/${conv.id}`);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        t("common.error");
      notify(t("common.error"), String(message));
    } finally {
      setOpeningChat(false);
    }
  };

  return (
    <Screen>
      <BackHeader
        title={t("teacher.student.title")}
        subtitle={student.name}
      />

      <SoftCard style={styles.hero}>
        <AvatarBubble
          initials={initialsFor(student.name)}
          color={colorFor(student.name)}
          size={72}
        />
        <Text style={styles.name}>{student.name}</Text>
        {student.group_name ? (
          <Text style={styles.meta}>{student.group_name}</Text>
        ) : null}
        {student.parentName ? (
          <Text style={styles.meta}>
            {t("teacher.student.parent")}: {student.parentName}
          </Text>
        ) : null}
        <Text style={[styles.badge, { color: statusColor }]}>
          {t("teacher.student.today")}: {t(`common.${status}` as any)}
        </Text>
      </SoftCard>

      {student.grade || student.age ? (
        <SoftCard style={{ marginTop: 14 }}>
          <Text style={styles.section}>{t("teacher.student.enrollment")}</Text>
          {student.grade ? (
            <Text style={styles.body}>
              {t("teacher.student.grade")}: {student.grade}
            </Text>
          ) : null}
          {student.age ? (
            <Text style={styles.body}>
              {t("teacher.student.age")}: {student.age}
            </Text>
          ) : null}
        </SoftCard>
      ) : null}

      {student.parentEmail ? (
        <SoftCard style={{ marginTop: 14 }}>
          <Text style={styles.section}>{t("teacher.student.parentContact")}</Text>
          <Text style={styles.body}>{student.parentEmail}</Text>
        </SoftCard>
      ) : null}

      <PrimaryButton
        label={
          openingChat
            ? t("teacher.student.openingChat")
            : t("teacher.student.messageParent")
        }
        icon="chatbubble-outline"
        onPress={handleMessageParent}
        disabled={openingChat}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", paddingVertical: 24 },
  name: { marginTop: 12, fontSize: 20, fontWeight: "700", color: C.text },
  meta: { marginTop: 4, color: C.muted },
  badge: { marginTop: 10, fontWeight: "700" },
  section: { fontWeight: "700", color: C.text, marginBottom: 8, fontSize: 16 },
  body: { color: C.muted, lineHeight: 22, marginTop: 2 },
});