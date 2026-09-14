import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, SoftCard, BackHeader } from "../../components/parent/ui";
import { ParentNotice } from "../../data/sharedContent";
import { ParentColors as C } from "../../constants/parentTheme";
import { useSharedContent } from "../../contexts/SharedContentContext";
import { useLanguage } from "../../contexts/LanguageContext";

const FILTERS = ["All", "Attendance", "Events", "Courses", "Chat"] as const;

const ICONS: Record<ParentNotice["category"], keyof typeof Ionicons.glyphMap> = {
  attendance: "checkmark-done-outline",
  events: "calendar-outline",
  courses: "book-outline",
  chat: "chatbubble-outline",
  system: "information-circle-outline",
};

export default function NotificationsScreen() {
  const { parentNotices } = useSharedContent();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const filterLabel = (item: (typeof FILTERS)[number]) => {
    if (item === "All") return t("parent.all");
    if (item === "Attendance") return t("tabs.attendance");
    if (item === "Events") return t("tabs.events");
    if (item === "Courses") return t("tabs.courses");
    return item;
  };

  const items = useMemo(() => {
    if (filter === "All") return parentNotices;
    return parentNotices.filter(
      (item) => item.category === filter.toLowerCase()
    );
  }, [filter, parentNotices]);

  return (
    <Screen>
      <BackHeader
        title={t("parent.notificationsTitle")}
        subtitle={t("parent.notificationsSub")}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12 }}
      >
        {FILTERS.map((item) => {
          const active = filter === item;
          return (
            <SoftCard
              key={item}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {filterLabel(item)}
              </Text>
            </SoftCard>
          );
        })}
      </ScrollView>

      {items.map((item) => (
        <SoftCard
          key={item.id}
          style={[styles.card, item.unread && styles.unread]}
          onPress={() => {
            if (item.category === "chat") router.push("/parent/messages");
            else if (item.category === "attendance")
              router.push("/parent/attendance" as any);
            else if (item.category === "events") router.push("/parent/events");
            else if (item.category === "courses")
              router.push("/parent/courses" as any);
          }}
        >
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Ionicons name={ICONS[item.category]} size={18} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.time}>
                {item.time} · {item.category}
              </Text>
            </View>
            {item.unread ? <View style={styles.dot} /> : null}
          </View>
        </SoftCard>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  unread: { borderColor: C.primary },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontWeight: "800", color: C.text, fontSize: 15 },
  body: { marginTop: 4, color: C.muted, lineHeight: 20 },
  time: {
    marginTop: 8,
    color: C.muted,
    fontSize: 12,
    textTransform: "capitalize",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.secondary,
    marginTop: 6,
  },
});
