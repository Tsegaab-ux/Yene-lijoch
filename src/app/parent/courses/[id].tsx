import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Screen, SoftCard, BackHeader } from "../../../components/parent/ui";
import { VideoEmbed } from "../../../components/parent/VideoEmbed";
import { MEDIA_KIND_LABELS } from "../../../data/sharedContent";
import { ParentColors as C } from "../../../constants/parentTheme";
import { useSharedContent } from "../../../contexts/SharedContentContext";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const rawId = Array.isArray(id) ? id[0] : id;
  const { publishedMedia, publishedCurriculum, todayCourse } =
    useSharedContent();

  if (rawId?.startsWith("media-")) {
    const media =
      publishedMedia.find((m) => m.id === rawId.replace("media-", "")) ??
      publishedMedia[0];
    if (!media) {
      return (
        <Screen>
          <BackHeader title="Media" subtitle="Not found" />
        </Screen>
      );
    }
    return (
      <Screen>
        <BackHeader
          title={media.title}
          subtitle={MEDIA_KIND_LABELS[media.kind]}
        />
        <SoftCard>
          <VideoEmbed
            youtubeId={media.youtubeId}
            localUri={media.localUri}
            coverUri={media.coverUri}
            title={media.title}
            kind={media.kind}
            height={220}
          />
          <Text style={styles.meta}>
            {media.duration} · {media.ageGroup}
          </Text>
          <Text style={styles.body}>{media.description}</Text>
        </SoftCard>
      </Screen>
    );
  }

  const course =
    publishedCurriculum.find((c) => c.id === rawId) ?? todayCourse;

  if (!course) {
    return (
      <Screen>
        <BackHeader title="Course" subtitle="Not found" />
      </Screen>
    );
  }

  return (
    <Screen>
      <BackHeader
        title={course.title}
        subtitle={`Week ${course.week} · ${course.category}`}
      />
      <SoftCard style={styles.card}>
        {course.coverUri ? (
          <Image source={{ uri: course.coverUri }} style={styles.cover} />
        ) : null}
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{course.date}</Text>
        <Text style={[styles.label, { marginTop: 16 }]}>Scripture</Text>
        <Text style={styles.value}>{course.scripture}</Text>
        <Text style={[styles.label, { marginTop: 16 }]}>Memory Verse</Text>
        <Text style={styles.verse}>"{course.memoryVerse}"</Text>
        <Text style={[styles.label, { marginTop: 16 }]}>About</Text>
        <Text style={styles.body}>{course.description}</Text>
      </SoftCard>

      {course.attachmentUri ? (
        <SoftCard style={styles.card}>
          <Text style={styles.label}>Lesson media from admin</Text>
          <View style={{ height: 10 }} />
          <VideoEmbed
            localUri={course.attachmentUri}
            coverUri={course.coverUri}
            title={course.attachmentName || course.title}
            kind={
              course.attachmentType === "audio"
                ? "song"
                : course.attachmentType === "image"
                  ? "picture"
                  : "course"
            }
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
});
