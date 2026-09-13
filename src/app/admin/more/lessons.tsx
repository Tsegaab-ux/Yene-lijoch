import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Screen, TopBar, Card, Badge, ProgressBar } from "../../../components/admin/ui";
import { useAdminData } from "../../../contexts/AdminDataContext";
import { AdminColors as C } from "../../../constants/adminTheme";

export default function LessonsScreen() {
  const { lessons, classes, updateLessonProgress, publishLesson } = useAdminData();

  return (
    <Screen>
      <TopBar
        title="Lesson Progress"
        subtitle="Publish lessons and update progress"
        onBack={() => router.back()}
      />

      {lessons.map((lesson) => {
        const classItem = classes.find((c) => c.id === lesson.classId);
        return (
          <Card key={lesson.id} style={styles.card}>
            <View style={styles.top}>
              <Text style={styles.title}>{lesson.title}</Text>
              <Badge
                label={lesson.status}
                tone={lesson.status === "published" ? "success" : lesson.status === "draft" ? "warning" : "default"}
              />
            </View>
            <Text style={styles.meta}>
              {lesson.subject} · {classItem?.name ?? "Class"}
            </Text>
            <View style={{ marginTop: 10 }}>
              <ProgressBar value={lesson.progress} />
            </View>
            <Text style={styles.meta}>{lesson.progress}% class progress</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.smallBtn}
                onPress={() => updateLessonProgress(lesson.id, lesson.progress + 10)}
              >
                <Text style={styles.smallText}>+10%</Text>
              </TouchableOpacity>
              {lesson.status === "draft" ? (
                <TouchableOpacity
                  style={[styles.smallBtn, styles.publish]}
                  onPress={() => {
                    publishLesson(lesson.id);
                    Alert.alert("Published", `${lesson.title} is now visible to parents.`);
                  }}
                >
                  <Text style={[styles.smallText, { color: "#fff" }]}>Publish</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  top: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  title: { fontSize: 16, fontWeight: "800", color: C.text, flex: 1 },
  meta: { marginTop: 4, color: C.muted, fontSize: 13 },
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
  smallBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: C.primarySoft,
  },
  publish: { backgroundColor: C.primary },
  smallText: { fontWeight: "800", color: C.primary, fontSize: 12 },
});
