import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, SoftCard, BackHeader } from "../../components/parent/ui";
import { ParentColors as C } from "../../constants/parentTheme";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNotifications } from "../../contexts/NotificationContext";

const FILTERS = ["All", "Attendance", "Videos", "Events", "Curriculum", "Chat"] as const;

// Map backend categories to the icon set. Falls back to `system` for
// any category the filter bar doesn't know about.
const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  attendance: "checkmark-done-outline",
  events: "calendar-outline",
  courses: "book-outline",
  chat: "chatbubble-outline",
  system: "information-circle-outline",
};

// Format the ISO timestamp as a short, human-readable string.
function formatTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsScreen() {
  const { t } = useLanguage();
  const { notifications, loading, markRead } = useNotifications();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const filterLabel = (item: (typeof FILTERS)[number]) => {
    if (item === "All") return t("parent.all");
    if (item === "Attendance") return t("tabs.attendance");
    if (item === "Videos") return t("tabs.videos");
    if (item === "Events") return t("tabs.events");
    if (item === "Curriculum") return t("tabs.curriculum");
    if (item === "Chat") return t("tabs.messages");
    return item;
  };

  const items = useMemo(() => {
    if (filter === "All") return notifications;
    return notifications.filter(
      (n) => (n.category ?? "").toLowerCase() === filter.toLowerCase()
    );
  }, [filter, notifications]);

  // ------------------------------------------------------------------
  // Tap handler: mark read + navigate based on category.
  // ------------------------------------------------------------------
  const handlePress = async (notification: (typeof notifications)[number]) => {
    if (!notification.is_read) {
      markRead(notification.id).catch(() => {});
    }

    const cat = (notification.category ?? "").toLowerCase();
    if (cat === "chat") {
      // If the backend includes a conversation_id in the payload,
      // route directly to the thread. Otherwise go to the list.
      const convId = (notification as any).conversation_id;
      if (convId) router.push(`/parent/messages/${convId}` as any);
      else router.push("/parent/messages" as any);
    } else if (cat === "attendance") {
      router.push("/parent/attendance" as any);
    } else if (cat === "events") {
      router.push("/parent/events" as any);
    } else if (cat === "courses") {
      router.push("/parent/lessons" as any);
    }
    // Unknown categories: just mark read, don't navigate.
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
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

      {loading && notifications.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} />
          <Text style={styles.emptyText}>{t("common.loading")}</Text>
        </View>
      ) : null}

      {!loading && items.length === 0 ? (
        <SoftCard>
          <Text style={styles.emptyText}>{t("parent.noNotifications")}</Text>
        </SoftCard>
      ) : null}

      {items.map((item) => {
        const category = (item.category ?? "system").toLowerCase();
        const icon = ICONS[category] ?? ICONS.system;
        const unread = !item.is_read;

        return (
          <SoftCard
            key={item.id}
            style={[styles.card, unread && styles.unread]}
            onPress={() => handlePress(item)}
          >
            <View style={styles.row}>
              <View style={styles.iconBox}>
                <Ionicons name={icon} size={18} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title ?? ""}</Text>
                <Text style={styles.body}>{item.body ?? ""}</Text>
                <Text style={styles.time}>
                  {formatTime(item.created_at)} · {category}
                </Text>
              </View>
              {unread ? <View style={styles.dot} /> : null}
            </View>
          </SoftCard>
        );
      })}
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
  center: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    color: C.muted,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 20,
  },
});