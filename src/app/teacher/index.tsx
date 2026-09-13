import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, SectionLabel } from "../../components/teacher/ui";
import {
  ImageSectionCard,
  ImageChip,
} from "../../components/teacher/ImageSectionCard";
import {
  TEACHER,
  TODAY_CURRICULUM,
  CURRICULUM,
  getAttendanceSummary,
} from "../../data/teacherMock";
import { TeacherColors as C } from "../../constants/teacherTheme";
import { useTeacherEvents } from "../../contexts/TeacherEventsContext";
import { useChat } from "../../contexts/ChatContext";
import { useTeacherStudents } from "../../contexts/TeacherStudentsContext";

const IMAGES = {
  welcome: require("../../../assets/images/teacher-home/teacher-home-welcome.png"),
  lesson: require("../../../assets/images/teacher-home/teacher-home-lesson.png"),
  students: require("../../../assets/images/teacher-home/teacher-home-students.png"),
  upcoming: require("../../../assets/images/teacher-home/teacher-home-upcoming.png"),
  events: require("../../../assets/images/teacher-home/teacher-home-events.png"),
};

export default function TeacherHome() {
  const { events } = useTeacherEvents();
  const { conversations } = useChat();
  const { students } = useTeacherStudents();
  const attendance = getAttendanceSummary(students);
  const nextLesson =
    CURRICULUM.find((l) => l.status === "upcoming") ?? CURRICULUM[1];
  const upcomingEvent = events[0];
  const unread = conversations.reduce((sum, c) => sum + c.unreadForTeacher, 0);

  return (
    <Screen>
      <ImageSectionCard image={IMAGES.welcome} height={168}>
        <View style={styles.welcomeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>Sunday School</Text>
            <Text style={styles.hello}>Good morning, Teacher</Text>
            <Text style={styles.group}>
              {TEACHER.program} · {TEACHER.group}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/teacher/messages")}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
            {unread > 0 ? <View style={styles.dot} /> : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/teacher/profile")}
          >
            <Ionicons name="person-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageSectionCard>

      <SectionLabel title="Today's Lesson" />
      <ImageSectionCard image={IMAGES.lesson} height={300}>
        <ImageChip
          label={`Week ${TODAY_CURRICULUM.week} · ${TODAY_CURRICULUM.date}`}
          tone="accent"
        />
        <Text style={styles.title}>{TODAY_CURRICULUM.title}</Text>
        <Text style={styles.meta}>{TODAY_CURRICULUM.scripture}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Memory Verse</Text>
        <Text style={styles.verse}>"{TODAY_CURRICULUM.memoryVerse}"</Text>

        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.88}
          onPress={() =>
            router.push(`/teacher/curriculum/${TODAY_CURRICULUM.id}`)
          }
        >
          <Text style={styles.ctaText}>Open Curriculum</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </ImageSectionCard>

      <SectionLabel title="Today's Students" />
      <ImageSectionCard image={IMAGES.students} height={230}>
        <Text style={styles.title}>{attendance.total} Students</Text>
        <View style={styles.attRow}>
          <Text style={styles.stat}>
            <Text style={styles.statStrong}>{attendance.present}</Text> Present
          </Text>
          <Text style={styles.statDot}>·</Text>
          <Text style={styles.stat}>
            <Text style={styles.statStrong}>{attendance.absent}</Text> Absent
          </Text>
        </View>
        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.88}
          onPress={() => router.push("/teacher/classes/attendance")}
        >
          <Text style={styles.ctaText}>Take Attendance</Text>
          <Ionicons name="checkmark-done-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </ImageSectionCard>

      <SectionLabel title="Upcoming" />
      <ImageSectionCard
        image={IMAGES.upcoming}
        height={170}
        onPress={() => router.push("/teacher/curriculum")}
      >
        <ImageChip label="Next Sunday" />
        <Text style={styles.title}>{nextLesson.title}</Text>
        <Text style={styles.meta}>{nextLesson.date}</Text>
      </ImageSectionCard>

      <SectionLabel title="Upcoming Events" />
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
            <Text style={styles.ctaGhostText}>View Events</Text>
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
