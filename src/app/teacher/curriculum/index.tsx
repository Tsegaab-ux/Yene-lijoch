import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, SoftCard } from "../../../components/teacher/ui";
import {
  CURRICULUM_TITLE,
  CURRICULUM_MONTHS,
  CurriculumLesson,
  CurriculumStatus,
} from "../../../data/teacherMock";
import { TeacherColors as C } from "../../../constants/teacherTheme";

export default function CurriculumScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Curriculum</Text>
      <Text style={styles.subtitle}>{CURRICULUM_TITLE}</Text>

      {CURRICULUM_MONTHS.map((block) => (
        <SoftCard key={block.month} style={styles.monthCard}>
          <Text style={styles.monthTitle}>{block.month}</Text>

          {block.lessons.map((lesson, index) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              last={index === block.lessons.length - 1}
            />
          ))}
        </SoftCard>
      ))}
    </Screen>
  );
}

function LessonRow({
  lesson,
  last,
}: {
  lesson: CurriculumLesson;
  last: boolean;
}) {
  const meta = statusMeta(lesson.status);

  return (
    <SoftCard
      style={[styles.rowCard, !last && styles.rowBorder]}
      onPress={() => router.push(`/teacher/curriculum/${lesson.id}`)}
    >
      <View style={styles.rowTop}>
        <Text style={styles.weekLabel}>Week {lesson.week}</Text>
        <Ionicons name="chevron-forward" size={16} color={C.muted} />
      </View>
      <Text style={styles.lessonTitle}>{lesson.title}</Text>
      <View style={styles.statusRow}>
        <Ionicons name={meta.icon} size={16} color={meta.color} />
        <Text style={[styles.statusText, { color: meta.color }]}>
          {meta.label}
        </Text>
      </View>
    </SoftCard>
  );
}

function statusMeta(status: CurriculumStatus): {
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
} {
  if (status === "completed") {
    return {
      label: "Completed",
      color: C.success,
      icon: "checkmark-circle",
    };
  }
  if (status === "this_week") {
    return {
      label: "This Week",
      color: C.primary,
      icon: "ellipse",
    };
  }
  return {
    label: "Upcoming",
    color: C.muted,
    icon: "ellipse-outline",
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
    marginBottom: 16,
    color: C.muted,
    fontSize: 15,
    fontWeight: "500",
  },
  monthCard: {
    marginBottom: 14,
    paddingBottom: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
  },
  rowCard: {
    paddingVertical: 14,
    paddingHorizontal: 0,
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
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weekLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: C.muted,
  },
  lessonTitle: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
  },
  statusRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
