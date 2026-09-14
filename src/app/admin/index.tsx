import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  SoftCard,
  SectionLabel,
  MenuRow,
} from "../../components/admin/ui";
import { LanguageToggle } from "../../components/LanguageToggle";
import { ADMIN_PROFILE } from "../../data/sharedContent";
import { AdminColors as C } from "../../constants/adminTheme";
import { useSharedContent } from "../../contexts/SharedContentContext";
import { useChat } from "../../contexts/ChatContext";
import { useLanguage } from "../../contexts/LanguageContext";

export default function AdminHome() {
  const { t } = useLanguage();
  const {
    media,
    curriculum,
    students,
    groups,
    events,
    adminNotices,
  } = useSharedContent();
  const { teacherMessages } = useChat();
  const unread =
    adminNotices.filter((n) => n.unread).length +
    teacherMessages.slice(0, 5).length;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>{t("admin.portal")}</Text>
          <Text style={styles.title}>
            {t("admin.hi", { name: ADMIN_PROFILE.name.split(" ")[0] })}
          </Text>
          <Text style={styles.sub}>{ADMIN_PROFILE.school}</Text>
        </View>
        <View style={styles.headerActions}>
          <LanguageToggle tone="dark" />
          <TouchableOpacity
            style={styles.bell}
            onPress={() => router.push("/admin/notifications" as any)}
          >
            <Ionicons name="notifications-outline" size={20} color={C.text} />
            {unread > 0 ? <View style={styles.dot} /> : null}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.stats}>
        <Stat label={t("tabs.videos")} value={`${media.length}`} />
        <Stat label={t("parent.lessons")} value={`${curriculum.length}`} />
        <Stat label={t("teacher.studentsSub")} value={`${students.length}`} />
        <Stat label={t("admin.events")} value={`${events.length}`} />
      </View>

      <SectionLabel title={t("admin.manageContent")} />
      <SoftCard>
        <MenuRow
          icon="videocam-outline"
          title={t("admin.uploadVideos")}
          subtitle={t("admin.uploadVideosSub")}
          onPress={() => router.push("/admin/videos" as any)}
        />
        <MenuRow
          icon="book-outline"
          title={t("admin.yearlyCurriculum")}
          subtitle={t("admin.yearlyCurriculumSub")}
          onPress={() => router.push("/admin/curriculum" as any)}
        />
        <MenuRow
          icon="people-outline"
          title={t("admin.groupsStudents")}
          subtitle={t("admin.groupsStudentsSub")}
          onPress={() => router.push("/admin/groups" as any)}
        />
        <MenuRow
          icon="calendar-outline"
          title={t("admin.events")}
          subtitle={t("admin.eventsMenuSub")}
          onPress={() => router.push("/admin/events" as any)}
        />
        <MenuRow
          icon="chatbubbles-outline"
          title={t("admin.chatAlerts")}
          subtitle={t("admin.chatAlertsSub")}
          onPress={() => router.push("/admin/notifications" as any)}
        />
      </SoftCard>

      <SectionLabel title={t("admin.recentActivity")} />
      {adminNotices.slice(0, 4).map((n) => (
        <SoftCard key={n.id} style={styles.notice}>
          <Text style={styles.noticeTitle}>{n.title}</Text>
          <Text style={styles.noticeBody}>{n.body}</Text>
          <Text style={styles.noticeTime}>{n.time}</Text>
        </SoftCard>
      ))}

      <SoftCard
        style={{ marginTop: 8 }}
        onPress={() =>
          Alert.alert(t("admin.logout"), t("admin.logout"), [
            { text: t("common.cancel"), style: "cancel" },
            {
              text: t("admin.logout"),
              style: "destructive",
              onPress: () => router.replace("/(auth)/login"),
            },
          ])
        }
      >
        <Text style={styles.logout}>{t("admin.logout")}</Text>
      </SoftCard>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  kicker: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.4,
  },
  sub: { marginTop: 4, color: C.muted, fontSize: 14 },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.danger,
  },
  stats: { flexDirection: "row", gap: 8, marginBottom: 8 },
  stat: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 12,
    alignItems: "center",
  },
  statValue: { fontSize: 18, fontWeight: "800", color: C.primary },
  statLabel: { marginTop: 2, fontSize: 11, color: C.muted, fontWeight: "600" },
  notice: { marginBottom: 10 },
  noticeTitle: { fontWeight: "800", color: C.text, fontSize: 14 },
  noticeBody: { marginTop: 4, color: C.muted, fontSize: 13, lineHeight: 18 },
  noticeTime: { marginTop: 6, color: C.muted, fontSize: 11 },
  logout: {
    textAlign: "center",
    color: C.danger,
    fontWeight: "800",
    fontSize: 15,
  },
});
