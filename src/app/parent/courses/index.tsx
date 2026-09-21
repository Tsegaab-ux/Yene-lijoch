import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, SoftCard, SectionLabel } from "../../../components/parent/ui";
import { ParentColors as C } from "../../../constants/parentTheme";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useSelectedChild } from "../../../contexts/SelectedChildContext";
import { useMediaContext } from "@/contexts/MediaContext";
import { useClassroomLessons } from "@/hooks/useClassroomLessons";
import { MediaKind } from "@/types/mediaTypes";
import { MEDIA_KIND_KEYS } from "@/utils/mediaLabels";
import { colorForKind } from "@/utils/mediaColors";

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
  const { t } = useLanguage();
  const { selectedChild } = useSelectedChild();
  const { media } = useMediaContext();
  const { lessons } = useClassroomLessons(selectedChild?.classroomId ?? undefined);

  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  // Filter media by kind when the user has picked a specific kind.
  const filteredMedia = useMemo(() => {
    const published = (media ?? []).filter((m) => m.published);
    if (filter === "All" || filter === "lessons") return published;
    return published.filter((item) => item.kind === filter);
  }, [filter, media]);

  // The lessons list is only shown when the filter allows it.
  const showCurriculum = filter === "All" || filter === "lessons";
  const showMedia = filter !== "lessons";

  const kindLabel = (kind: MediaKind) => t(MEDIA_KIND_KEYS[kind]);

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
                : kindLabel(item);
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

      {/* ---------- Curriculum ---------- */}
      {showCurriculum && (
        <>
          <SectionLabel title={t("parent.sundayCurriculum")} />
          {lessons.length === 0 ? (
            <SoftCard style={styles.card}>
              <Text style={styles.meta}>{t("parent.noLessons")}</Text>
            </SoftCard>
          ) : (
            lessons.map((course) => (
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
                      Week {course.week} · {course.category ?? ""}
                    </Text>
                    <Text style={styles.cardTitle}>{course.title}</Text>
                    <Text style={styles.meta}>
                      {course.date} · {course.scripture}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.muted} />
                </View>
              </SoftCard>
            ))
          )}
        </>
      )}

      {/* ---------- Media ---------- */}
      {showMedia && (
        <>
          <SectionLabel title={t("parent.watchLearn")} />
          {filteredMedia.length === 0 ? (
            <SoftCard style={styles.card}>
              <Text style={styles.meta}>{t("parent.noMedia")}</Text>
            </SoftCard>
          ) : (
            filteredMedia.map((item) => (
              <SoftCard
                key={item.id}
                style={styles.card}
                onPress={() =>
                  router.push(`/parent/courses/media-${item.id}` as any)
                }
              >
                <View style={styles.row}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: colorForKind(item.kind) },
                    ]}
                  >
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
                    <Text style={styles.badge}>{kindLabel(item.kind)}</Text>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.meta}>
                      {item.duration} · {item.ageGroup}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.muted} />
                </View>
              </SoftCard>
            ))
          )}
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