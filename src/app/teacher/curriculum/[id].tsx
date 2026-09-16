import React, { useEffect } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { Platform } from "react-native";
import {
  Screen,
  SoftCard,
  BackHeader,
  PrimaryButton,
  SectionLabel,
} from "../../../components/teacher/ui";
import {
  CurriculumMaterial,
} from "../../../data/teacherMock";
import { TeacherColors as C } from "../../../constants/teacherTheme";
import { useTeacherCurriculum } from "@/hooks/useTeacherCurriculum";
import { LessonMaterial } from "@/types/lessonTypes";

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lesson, isLoading, error, refetch, fetchLesson } = useTeacherCurriculum();

  useEffect(()=> {
    if (id){
      fetchLesson(id);
    }
  },[id]);

  // --------------------------------------------------------------
  // 1. Loading guard
  // --------------------------------------------------------------
  if (isLoading && !lesson) {
    return (
      <Screen>
        <BackHeader title="Lesson" subtitle="" />
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} />
          <Text style={styles.muted}>Loading lesson…</Text>
        </View>
      </Screen>
    );
  }

   // 2. Error / not-found guard
  // --------------------------------------------------------------
  if (error || !lesson) {
    return (
      <Screen>
        <BackHeader title="Lesson" subtitle="" />
        <SoftCard>
          <Text style={styles.muted}>{error ?? "Lesson not found."}</Text>
          <TouchableOpacity onPress={refetch}>
            <Text style={styles.retry}>Tap to retry</Text>
          </TouchableOpacity>
        </SoftCard>
      </Screen>
    );
  }


  return (
    <Screen>
      <BackHeader title="Lesson" subtitle={`Week ${lesson.week}`} />

      <Text style={styles.heroTitle}>{lesson.title.toUpperCase()}</Text>
      <Text style={styles.heroMeta}>
        Week {lesson.week}
        {"\n"}
        {lesson.date}
      </Text>

      <SectionLabel title="Bible Reading" />
      <SoftCard>
        <View style={styles.inline}>
          <View style={styles.iconBox}>
            <Ionicons name="book-outline" size={18} color={C.primary} />
          </View>
          <Text style={styles.value}>{lesson.scripture}</Text>
        </View>
      </SoftCard>

      <SectionLabel title="Memory Verse" />
      <SoftCard>
        <Text style={styles.verseRef}>{lesson.memoryVerseRef}</Text>
        <Text style={styles.verse}>"{lesson.memoryVerse}"</Text>
      </SoftCard>

      <SectionLabel title="Lesson Objective" />
      <SoftCard>
        <Text style={styles.body}>{lesson.objective}</Text>
      </SoftCard>

      <SectionLabel title="Lesson Material" />
      <SoftCard>
        {lesson?.materials?.map((item, index) => (
          <MaterialRow
            key={item.id}
            item={item}
            last={index === (lesson.materials?.length ?? 0) - 1}
          />
        ))}
      </SoftCard>

      <SectionLabel title="Activity" />
      <SoftCard>
        <View style={styles.inline}>
          <View style={[styles.iconBox, { backgroundColor: C.secondarySoft }]}>
            <Ionicons name="sparkles-outline" size={18} color={C.secondary} />
          </View>
          <Text style={styles.value}>{lesson.activity}</Text>
        </View>
      </SoftCard>

      <PrimaryButton
        label="Open Lesson"
        icon="play-outline"
        onPress={async () => {
          const url = lesson.attachmentUri;
          if (!url) {
            Alert.alert("No material", "This lesson has no attached material yet.");
            return;
          }
          const supported = await Linking.canOpenURL(url);
          if (supported) {
            await Linking.openURL(url);
          } else {
            Alert.alert("Cannot open", "Your device can't open this file type.");
          }
        }}
      />
    </Screen>
  );
}

function MaterialRow({
  item,
  last,
}: {
  item: LessonMaterial;
  last: boolean;
}) {
  return (
    <View style={[styles.materialRow, !last && styles.materialBorder]}>
      <Ionicons name="document-text-outline" size={20} color={C.primary} />
      <Text style={styles.materialTitle}>{item.title}</Text>
      <Ionicons name="download-outline" size={18} color={C.muted} />
    </View>
  );
}

const styles = StyleSheet.create({
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: C.text,
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  heroMeta: {
    fontSize: 15,
    color: C.muted,
    lineHeight: 22,
    marginBottom: 8,
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: C.text,
  },
  verseRef: {
    fontSize: 13,
    fontWeight: "700",
    color: C.primary,
    marginBottom: 8,
  },
  verse: {
    fontSize: 16,
    lineHeight: 24,
    color: C.text,
    fontStyle: "italic",
    fontWeight: "500",
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: C.text,
  },
  materialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  materialBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  materialTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
  },
  center: { paddingVertical: 40, alignItems: "center", gap: 8 },
  muted: { color: C.muted, textAlign: "center", fontSize: 14, lineHeight: 20 },
  retry: { marginTop: 8, textAlign: "center", color: C.primary, fontWeight: "700" },
});
