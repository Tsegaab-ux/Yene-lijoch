import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, SectionLabel } from "../../components/teacher/ui";
import {
  ImageSectionCard,
  ImageChip,
} from "../../components/teacher/ImageSectionCard";
import { TeacherColors as C } from "../../constants/teacherTheme";
import { useChat } from "../../contexts/ChatContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTeacher } from "../../contexts/TeacherContext";
import { useTeacherCurriculumContext } from "../../contexts/TeacherCurriculumContext";
import { useAttendance } from "../../hooks/useAttendance";
import { useEventsContext } from "@/contexts/EventsContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { IconButton } from "@/components/parent/ui";

const IMAGES = {
  welcome: require("../../../assets/images/teacher-home/teacher-home-welcome.png"),
  lesson: require("../../../assets/images/teacher-home/teacher-home-lesson.png"),
  students: require("../../../assets/images/teacher-home/teacher-home-students.png"),
  upcoming: require("../../../assets/images/teacher-home/teacher-home-upcoming.png"),
  events: require("../../../assets/images/teacher-home/teacher-home-events.png"),
};

export default function TeacherHome() {
  const { t } = useLanguage();
  const { events } = useEventsContext();
  const { conversations } = useChat();
  const { unreadCount } = useNotifications();

  const { teacher, primaryClass, isLoading: teacherLoading } = useTeacher();
  const { todayLesson, nextLesson, isLoading: curriculumLoading } =
    useTeacherCurriculumContext();

  const { summary: attendanceSummary, isLoading: attendanceLoading } =
    useAttendance(primaryClass?.id, todayLesson?.id);

  const upcomingEvent = events[0];
  const unread = conversations.reduce((sum, c) => sum + c.unreadForTeacher, 0);

  const attendance = {
    total: attendanceSummary?.total ?? primaryClass?.student_count ?? 0,
    present: attendanceSummary?.present ?? 0,
    absent: attendanceSummary?.absent ?? 0,
  };

  return (
    <Screen>
      {/* ---------- Welcome ---------- */}
      <ImageSectionCard image={IMAGES.welcome} height={168}>
        <View style={styles.welcomeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>{t("teacher.portal")}</Text>
            <Text style={styles.hello}>
              {t("teacher.goodMorning")}
              {teacher ? `, ${teacher.first_name}` : ""}
            </Text>
            <Text style={styles.group}>
              {teacher?.program ?? "Sunday School"} · {teacher?.group ?? ""}
            </Text>
          </View>
          <IconButton
            name="notifications-outline"
            onPress={() => router.push("/teacher/notifications")}
            badgeCount={unreadCount}
            accessibilityLabel={t("parent.notifications")}
          />
          <IconButton
            name="chatbubble-ellipses-outline"
            onPress={() => router.push("/teacher/messages")}
            badgeCount={unread}
            accessibilityLabel={t("parent.notifications")}
          />
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/teacher/profile")}
          >
            <Ionicons name="person-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageSectionCard>

      {/* ---------- Today's lesson ---------- */}
      <SectionLabel title={t("teacher.todaysLesson")} />
      {todayLesson ? (
        <ImageSectionCard image={IMAGES.lesson} height={300}>
          <ImageChip
            label={`Week ${todayLesson.week} · ${todayLesson.date}`}
            tone="accent"
          />
          <Text style={styles.title}>{todayLesson.title}</Text>
          <Text style={styles.meta}>{todayLesson.scripture}</Text>

          <View style={styles.divider} />

          <Text style={styles.label}>{t("teacher.memoryVerse")}</Text>
          <Text style={styles.verse}>"{todayLesson.memoryVerse}"</Text>

          <TouchableOpacity
            style={styles.cta}
            activeOpacity={0.88}
            onPress={() =>
              router.push(`/teacher/curriculum/${todayLesson.id}`)
            }
          >
            <Text style={styles.ctaText}>{t("teacher.openCurriculum")}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </ImageSectionCard>
      ) : (
        <ImageSectionCard image={IMAGES.lesson} height={200}>
          <Text style={styles.title}>
            {curriculumLoading ? "Loading…" : t("teacher.noLessonYet")}
          </Text>
          <Text style={styles.meta}>
            {t("teacher.noLessonYetSub")}
          </Text>
        </ImageSectionCard>
      )}

      {/* ---------- Today's students ---------- */}
      <SectionLabel title={t("teacher.todaysStudents")} />
      <ImageSectionCard image={IMAGES.students} height={250}>
        <ImageChip
          label={`${new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}`}
        />
        <Text style={styles.title}>
          {attendance.total} {t("teacher.studentsSub")}
        </Text>
        <View style={styles.attRow}>
          <Text style={styles.stat}>
            <Text style={styles.statStrong}>{attendance.present}</Text>{" "}
            {t("parent.present")}
          </Text>
          <Text style={styles.statDot}>·</Text>
          <Text style={styles.stat}>
            <Text style={styles.statStrong}>{attendance.absent}</Text>{" "}
            {t("parent.absent")}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.88}
          disabled={!todayLesson}
          onPress={() =>
            router.push(
              `/teacher/classes/attendance?lessonId=${todayLesson?.id ?? ""}`
            )
          }
        >
          <Text style={styles.ctaText}>{t("teacher.takeAttendance")}</Text>
          <Ionicons name="checkmark-done-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </ImageSectionCard>

      {/* ---------- Upcoming lesson ---------- */}
      <SectionLabel title={t("teacher.upcoming")} />
      {nextLesson ? (
        <ImageSectionCard
          image={IMAGES.upcoming}
          height={170}
          onPress={() => router.push("/teacher/curriculum")}
        >
          <ImageChip label="Next" />
          <Text style={styles.title}>{nextLesson.title}</Text>
          <Text style={styles.meta}>{nextLesson.date}</Text>
        </ImageSectionCard>
      ) : null}

      {/* ---------- Upcoming event ---------- */}
      <SectionLabel title={t("teacher.upcomingEvents")} />
      {upcomingEvent ? (
        <ImageSectionCard
          image={IMAGES.events}
          height={200}
          onPress={() => router.push(`/teacher/schedule/${upcomingEvent.id}`)}
        >
          <ImageChip label="Event" tone="accent" />
          <Text style={styles.title}>{upcomingEvent.title}</Text>
          <Text style={styles.meta}>
            {upcomingEvent.date} · {upcomingEvent.time}
          </Text>
          <TouchableOpacity
            style={styles.ctaGhost}
            activeOpacity={0.88}
            onPress={() => router.push("/teacher/schedule")}
          >
            <Text style={styles.ctaGhostText}>{t("teacher.viewEvents")}</Text>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </ImageSectionCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcomeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  kicker: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  hello: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  group: {
    marginTop: 6,
    fontSize: 14,
    color: "rgba(255,255,255,0.88)",
    fontWeight: "500",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  dot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.primary,
    borderWidth: 1,
    borderColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  meta: {
    marginTop: 6,
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.22)",
    marginVertical: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.72)",
    marginBottom: 6,
  },
  verse: {
    fontSize: 16,
    lineHeight: 24,
    color: "#FFFFFF",
    fontStyle: "italic",
    fontWeight: "500",
  },
  attRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  stat: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    fontWeight: "500",
  },
  statStrong: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  statDot: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
  },
  cta: {
    marginTop: 16,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  ctaGhost: {
    marginTop: 14,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ctaGhostText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
