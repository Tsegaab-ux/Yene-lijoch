import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, SoftCard, SectionLabel } from "../../../components/parent/ui";
import { MEDIA_KIND_LABELS, MediaKind } from "../../../data/sharedContent";
import { ParentColors as C } from "../../../constants/parentTheme";
import { useSharedContent } from "../../../contexts/SharedContentContext";
import { useLanguage } from "../../../contexts/LanguageContext";

const FILTERS: Array<"All" | MediaKind | "lessons"> = [
  "All",
  "course",
  "video",
  "song",
  "bible_story",
  "picture",
  "lessons",
];

export default function CoursesScreen() {
  const { publishedMedia, publishedCurriculum } = useSharedContent();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const media = useMemo(() => {
    if (filter === "All" || filter === "lessons") return publishedMedia;
    return publishedMedia.filter((item) => item.kind === filter);
  }, [filter, publishedMedia]);

  return (
    <Screen>
      <Text style={styles.title}>{t("parent.coursesTitle")}</Text>
      <Text style={styles.subtitle}>{t("parent.coursesSub")}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 12, marginBottom: 8 }}
      >
        {FILTERS.map((item) => {
          const active = filter === item;
          const label =
            item === "All"
              ? t("parent.all")
              : item === "lessons"
                ? t("parent.lessons")
                : MEDIA_KIND_LABELS[item];
          return (
            <SoftCard
              key={item}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {label}
              </Text>
            </SoftCard>
          );
        })}
      </ScrollView>

      {(filter === "All" || filter === "lessons") && (
        <>
          <SectionLabel title={t("parent.sundayCurriculum")} />
          {publishedCurriculum.map((course) => (
            <SoftCard
              key={course.id}
              style={styles.card}
              onPress={() =>
                router.push(`/parent/courses/${course.id}` as any)
              }
            >
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.badge}>
                    Week {course.week} · {course.category}
                  </Text>
                  <Text style={styles.cardTitle}>{course.title}</Text>
                  <Text style={styles.meta}>
                    {course.date} · {course.scripture}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.muted} />
              </View>
            </SoftCard>
          ))}
        </>
      )}

      {filter !== "lessons" && (
        <>
          <SectionLabel title={t("parent.watchLearn")} />
          {media.map((item) => (
            <SoftCard
              key={item.id}
              style={styles.card}
              onPress={() =>
                router.push(`/parent/courses/media-${item.id}` as any)
              }
            >
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                  <Ionicons
                    name={
                      item.kind === "song"
                        ? "musical-notes"
                        : item.kind === "bible_story"
                          ? "book"
                          : item.kind === "picture"
                            ? "image"
                            : "play"
                    }
                    size={18}
                    color="#fff"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.badge}>
                    {MEDIA_KIND_LABELS[item.kind]}
                  </Text>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.meta}>
                    {item.duration} · {item.ageGroup}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.muted} />
              </View>
            </SoftCard>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.4,
  },
  subtitle: { marginTop: 6, color: C.muted, fontSize: 14, fontWeight: "500" },
  pill: {
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontWeight: "700", fontSize: 12, color: C.muted },
  pillTextActive: { color: "#fff" },
  card: { marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    color: C.primary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: C.text },
  meta: { marginTop: 4, fontSize: 13, color: C.muted },
});
