import React, { useMemo } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Screen, SoftCard, BackHeader } from "../../../components/parent/ui";
import { VideoEmbed } from "../../../components/parent/VideoEmbed";
import { ParentColors as C } from "../../../constants/parentTheme";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useSelectedChild } from "../../../contexts/SelectedChildContext";
import { useMediaContext } from "@/contexts/MediaContext";
import { useClassroomLessons } from "@/hooks/useClassroomLessons";
import { useTodayLessonForClass } from "@/hooks/useTodayLessonForClass";
import { MEDIA_KIND_KEYS } from "@/utils/mediaLabels";
import { MediaKind } from "@/types/mediaTypes";

export default function CourseDetailScreen() {
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const rawId = Array.isArray(id) ? id[0] : id;

  const { selectedChild } = useSelectedChild();
  const { media, isLoading: mediaLoading } = useMediaContext();
  const { lessons, isLoading: lessonsLoading } = useClassroomLessons(
    selectedChild?.classroomId ?? undefined
  );
  const { lesson: todayCourse } = useTodayLessonForClass(
    selectedChild?.classroomId ?? undefined
  );

  // ---------------- Media branch ----------------
  const isMediaRoute = rawId?.startsWith("media-");

  const mediaItem = useMemo(() => {
    if (!isMediaRoute) return null;
    const mediaId = rawId?.replace("media-", "");
    return media.find((m) => String(m.id) === String(mediaId)) ?? null;
  }, [isMediaRoute, media, rawId]);

  // ---------------- Course branch ---------------
  const course = useMemo(() => {
    if (isMediaRoute) return null;
    return lessons.find((c) => String(c.id) === String(rawId)) ?? todayCourse;
  }, [isMediaRoute, lessons, rawId, todayCourse]);

  // ---------------- Loading ----------------
  if ((mediaLoading || lessonsLoading) && !mediaItem && !course) {
    return (
      <Screen>
        <BackHeader title={t("common.loading")} />
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} />
        </View>
      </Screen>
    );
  }

  // ---------------- Media render ----------------
  if (isMediaRoute) {
    if (!mediaItem) {
      return (
        <Screen>
          <BackHeader title={t("parent.mediaTitle")} subtitle={t("common.notFound")} />
        </Screen>
      );
    }

    const kindLabel = t(MEDIA_KIND_KEYS[mediaItem.kind]);

    return (
      <Screen>
        <BackHeader title={mediaItem.title} subtitle={kindLabel} />
        <SoftCard>
          <VideoEmbed
            youtubeId={mediaItem.youtubeId}
            fileUri={mediaItem.fileUri ?? undefined}
            coverUri={mediaItem.coverUri ?? undefined}
            title={mediaItem.title}
            kind={mediaItem.kind}
            height={220}
          />
          <Text style={styles.meta}>
            {mediaItem.duration} · {mediaItem.ageGroup}
          </Text>
          <Text style={styles.body}>{mediaItem.description}</Text>
        </SoftCard>
      </Screen>
    );
  }

  // ---------------- Course render ----------------
  if (!course) {
    return (
      <Screen>
        <BackHeader title={t("parent.courseTitle")} subtitle={t("common.notFound")} />
      </Screen>
    );
  }

  // Attachment kind → MediaKind, for the embedded player
  const attachmentKind: MediaKind =
    course.attachment_type === "audio"
      ? "song"
      : course.attachment_type === "image"
        ? "picture"
        : "course";

  return (
    <Screen>
      <BackHeader
        title={course.title}
        subtitle={`Week ${course.week}${
          course.category ? ` · ${course.category}` : ""
        }`}
      />
      <SoftCard style={styles.card}>
        {course.coverUri ? (
          <Image source={{ uri: course.coverUri }} style={styles.cover} />
        ) : null}

        <Text style={styles.label}>{t("parent.courseDate")}</Text>
        <Text style={styles.value}>{course.date}</Text>

        <Text style={[styles.label, { marginTop: 16 }]}>
          {t("parent.courseScripture")}
        </Text>
        <Text style={styles.value}>{course.scripture}</Text>

        <Text style={[styles.label, { marginTop: 16 }]}>
          {t("parent.memoryVerse")}
        </Text>
        <Text style={styles.verse}>"{course.memoryVerse}"</Text>

        {course.description ? (
          <>
            <Text style={[styles.label, { marginTop: 16 }]}>
              {t("parent.courseAbout")}
            </Text>
            <Text style={styles.body}>{course.description}</Text>
          </>
        ) : null}
      </SoftCard>

      {course.attachmentUri ? (
        <SoftCard style={styles.card}>
          <Text style={styles.label}>{t("parent.lessonMedia")}</Text>
          <View style={{ height: 10 }} />
          <VideoEmbed
            fileUri={course.attachmentUri}
            coverUri={course.coverUri ?? undefined}
            title={course.attachment_name || course.title}
            kind={attachmentKind}
            height={220}
          />
        </SoftCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  cover: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  value: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
  },
  verse: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600",
    fontStyle: "italic",
    color: C.text,
    lineHeight: 24,
  },
  body: { marginTop: 6, fontSize: 14, color: C.muted, lineHeight: 21 },
  meta: { marginTop: 12, fontSize: 13, color: C.muted, fontWeight: "600" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
});