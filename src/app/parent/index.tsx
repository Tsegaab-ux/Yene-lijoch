import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  SectionLabel,
  SoftCard,
  ChildChip,
  AvatarBubble,
  IconButton,
} from "../../components/parent/ui";
import {
  ImageSectionCard,
  ImageChip,
} from "../../components/teacher/ImageSectionCard";
import { VideoEmbed } from "../../components/parent/VideoEmbed";
import { ParentColors as C } from "../../constants/parentTheme";
import { useSelectedChild } from "../../contexts/SelectedChildContext";
import { useEventsContext } from "../../contexts/EventsContext";
import { useChat } from "../../contexts/ChatContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useMediaContext } from "@/contexts/MediaContext";
import { useTodayLessonForClass } from "@/hooks/useTodayLessonForClass";
import { useChildAttendance } from "@/hooks/useChildAttendance";
import { MediaKind } from "@/types/mediaTypes";
import { colorForKind } from "@/utils/mediaColors";
import { useNotifications } from "@/contexts/NotificationContext";

const IMAGES = {
  welcome: require("../../../assets/images/teacher-home/teacher-home-welcome.png"),
  lesson: require("../../../assets/images/teacher-home/teacher-home-lesson.png"),
  students: require("../../../assets/images/teacher-home/teacher-home-students.png"),
  events: require("../../../assets/images/teacher-home/teacher-home-events.png"),
};

const HOME_MEDIA_ORDER: MediaKind[] = [
  "video",
  "song",
  "bible_story",
  "course",
  "picture",
];

const MEDIA_KIND_KEYS: Record<MediaKind, string> = {
  video: "parent.kidsVideos",
  song: "parent.kidsSongs",
  bible_story: "parent.bibleStories",
  course: "parent.curriculumVideos",
  picture: "parent.pictures",
};

export default function ParentHome() {
  const { t } = useLanguage();

  const {
    childrenList,
    selectedChild,
    selectedId,
    setSelectedId,
    groupName,
    isLoading: childrenLoading,
  } = useSelectedChild();
  const { unreadCount } = useNotifications();
  const { events } = useEventsContext();
  const { media } = useMediaContext();
  const { conversations } = useChat();

  const { lesson: course } = useTodayLessonForClass(
    selectedChild?.classroomId ?? undefined
  );

  const { summary: attendance } = useChildAttendance(selectedChild?.id);

  const publishedMedia = useMemo(
    () => (media ?? []).filter((m) => m.published),
    [media]
  );
  const publishedEvents = useMemo(
    () => (events ?? []).filter((e) => e.published),
    [events]
  );

  const mediaKindLabel = useCallback(
    (kind: MediaKind) => t(MEDIA_KIND_KEYS[kind]),
    [t]
  );

  const unreadChat = conversations.reduce(
    (sum, c) => sum + (c.unreadForParent ?? 0),
    0
  );

  const upcomingEvent =
    publishedEvents.find((e) => e.status !== "completed") ?? publishedEvents[0];

  const presentCount = attendance?.present ?? 0;
  const absentCount = attendance?.absent ?? 0;
  const totalRecorded = presentCount + absentCount;
  const attendancePercent =
    totalRecorded > 0
      ? Math.round((presentCount / totalRecorded) * 100)
      : 0;
      

  // ---- Loading guard ---------------------------------------------
  if (childrenLoading && !selectedChild) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={C.secondary} />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      </Screen>
    );
  }

  // ---- No children linked ----------------------------------------
  if (!selectedChild) {
    return (
      <Screen>
        <SoftCard>
          <Text style={styles.emptyText}>{t("parent.noChildren")}</Text>
        </SoftCard>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* ---------- Welcome banner ---------- */}
      <ImageSectionCard image={IMAGES.welcome} height={168}>
        <View style={styles.welcomeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>{t("parent.portal")}</Text>
            <Text style={styles.hello}>{t("parent.hiParent")}</Text>
            <Text style={styles.group}>
              {selectedChild.name}
              {groupName ? ` · ${groupName}` : ""}
            </Text>
          </View>
          <IconButton
            name="notifications-outline"
            onPress={() => router.push("/parent/notifications")}
            badgeCount={unreadCount}
            accessibilityLabel={t("parent.notifications")}
          />
          <IconButton
            name="chatbubble-ellipses-outline"
            onPress={() => router.push("/parent/messages")}
            badgeCount={unreadChat}
            accessibilityLabel={t("parent.messages")}
          />
          <IconButton
            name="person-outline"
            onPress={() => router.push("/parent/profile")}
            accessibilityLabel={t("parent.profile")}
          />
        </View>
      </ImageSectionCard>

      {/* ---------- Child switcher ---------- */}
      {childrenList.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.childScroll}
        >
          {childrenList.map((child) => (
            <ChildChip
              key={child.id}
              child={child}
              active={child.id === selectedId}
              onPress={() => setSelectedId(child.id)}
            />
          ))}
        </ScrollView>
      ) : null}

      {/* ---------- This week's course ---------- */}
      {course ? (
        <>
          <SectionLabel title={t("parent.thisWeekCourse")} />
          <ImageSectionCard image={IMAGES.lesson} height={280}>
            <ImageChip
              label={`Week ${course.week} · ${course.category ?? ""}`}
              tone="accent"
            />
            <Text style={styles.title}>{course.title}</Text>
            <Text style={styles.meta}>{course.scripture}</Text>
            <View style={styles.divider} />
            <Text style={styles.label}>{t("parent.memoryVerse")}</Text>
            <Text style={styles.verse}>"{course.memoryVerse}"</Text>
            <TouchableOpacity
              style={styles.cta}
              activeOpacity={0.88}
              onPress={() =>
                router.push(`/parent/courses/${course.id}` as any)
              }
            >
              <Text style={styles.ctaText}>{t("parent.openCourse")}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </ImageSectionCard>
        </>
      ) : null}

      {/* ---------- Media sections ---------- */}
      {HOME_MEDIA_ORDER.map((kind) => {
        const featured = publishedMedia.find((m) => m.kind === kind);
        if (!featured) return null;
        const kindLabel = mediaKindLabel(kind);
        return (
          <View key={kind}>
            <SectionLabel title={kindLabel} />
            <SoftCard style={styles.mediaCard}>
              <View style={styles.mediaHeader}>
                <View
                  style={[
                    styles.kindDot,
                    { backgroundColor: colorForKind(featured.kind) },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.mediaTitle}>{featured.title}</Text>
                  <Text style={styles.mediaMeta}>
                    {featured.duration} · {featured.ageGroup}
                  </Text>
                </View>
              </View>
              <VideoEmbed
                youtubeId={featured.youtubeId}
                fileUri={featured.fileUri ?? undefined}
                coverUri={featured.coverUri ?? undefined}
                title={featured.title}
                kind={featured.kind}
                height={180}
              />
              <Text style={styles.mediaDesc}>{featured.description}</Text>
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => router.push("/parent/courses" as any)}
              >
                <Text style={styles.linkText}>
                  {t("parent.seeAll", { label: kindLabel })}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={C.primary} />
              </TouchableOpacity>
            </SoftCard>
          </View>
        );
      })}

      {/* ---------- Attendance ---------- */}
      <SectionLabel title={t("parent.childAttendance")} />
      <ImageSectionCard image={IMAGES.students} height={230}>
        <ImageChip label={selectedChild.name} />
        <Text style={styles.title}>{attendancePercent}% present</Text>
        <View style={styles.attRow}>
          <Text style={styles.stat}>
            <Text style={styles.statStrong}>{presentCount}</Text>{" "}
            {t("parent.present")}
          </Text>
          <Text style={styles.statDot}>·</Text>
          <Text style={styles.stat}>
            <Text style={styles.statStrong}>{absentCount}</Text>{" "}
            {t("parent.absent")}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.88}
          onPress={() => router.push("/parent/attendance" as any)}
        >
          <Text style={styles.ctaText}>{t("parent.viewAttendance")}</Text>
          <Ionicons name="checkmark-done-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </ImageSectionCard>

      {/* ---------- Upcoming event ---------- */}
      {upcomingEvent ? (
        <>
          <SectionLabel title={t("parent.upcomingEvent")} />
          <ImageSectionCard
            image={IMAGES.events}
            height={200}
            onPress={() =>
              router.push(`/parent/events/${upcomingEvent.id}` as any)
            }
          >
            <ImageChip label={upcomingEvent.audience} />
            <Text style={styles.title}>{upcomingEvent.title}</Text>
            <Text style={styles.meta}>
              {upcomingEvent.date} · {upcomingEvent.time}
            </Text>
          </ImageSectionCard>
        </>
      ) : null}

      {/* ---------- Chat shortcut ---------- */}
      <SectionLabel title={t("parent.chatTeacher")} />
      <SoftCard
        style={styles.chatCard}
        onPress={() => router.push("/parent/messages")}
      >
        <AvatarBubble initials="T" color={C.secondary} size={48} />
        <View style={{ flex: 1 }}>
          <Text style={styles.chatTitle}>{t("parent.messageTeacher")}</Text>
          <Text style={styles.chatSub}>{t("parent.askPickup")}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </SoftCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcomeRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  kicker: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  hello: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  group: {
    marginTop: 4,
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "500",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.secondary,
  },
  childScroll: { marginTop: 10, marginBottom: 4 },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  meta: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginVertical: 12,
  },
  label: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  verse: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontStyle: "italic",
    lineHeight: 22,
    marginBottom: 14,
  },
  cta: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  attRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    marginTop: 4,
  },
  stat: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
  statStrong: { color: "#fff", fontWeight: "800" },
  statDot: { color: "rgba(255,255,255,0.5)" },
  mediaCard: { marginBottom: 4 },
  mediaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  kindDot: { width: 10, height: 10, borderRadius: 5 },
  mediaTitle: { fontSize: 16, fontWeight: "700", color: C.text },
  mediaMeta: { marginTop: 2, fontSize: 12, color: C.muted, fontWeight: "500" },
  mediaDesc: { marginTop: 10, color: C.muted, fontSize: 13, lineHeight: 19 },
  linkRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  linkText: { color: C.primary, fontWeight: "700", fontSize: 13 },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  chatTitle: { fontSize: 16, fontWeight: "700", color: C.text },
  chatSub: { marginTop: 3, fontSize: 13, color: C.muted },

  // ---- new, for guards ----
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 10,
  },
  loadingText: { color: C.muted, fontSize: 14 },
  emptyText: {
    textAlign: "center",
    color: C.muted,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 20,
  },
});