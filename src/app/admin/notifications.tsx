import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Screen,
  SoftCard,
  TopBar,
  Pill,
} from "../../components/admin/ui";
import { AdminColors as C } from "../../constants/adminTheme";
import { useNotifications } from "../../contexts/NotificationContext";
import { useChat } from "../../contexts/ChatContext";
import { useLanguage } from "../../contexts/LanguageContext";

type FeedItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  category: string;
  unread?: boolean;
};

const FILTERS = ["All", "Chat", "Videos", "Curriculum", "Groups", "Events"] as const;

export default function AdminNotificationsScreen() {
  const { t } = useLanguage();
  const { notifications, markAllRead } = useNotifications();
  const { teacherMessages, getConversation } = useChat();

  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  // Mark notifications as read once when the screen mounts.
  useEffect(() => {
    markAllRead();
  }, []);

  const filterLabel = (item: (typeof FILTERS)[number]) => {
    if (item === "All") return t("parent.all");
    if (item === "Videos") return t("tabs.videos");
    if (item === "Curriculum") return t("tabs.curriculum");
    if (item === "Groups") return t("tabs.groups");
    if (item === "Events") return t("tabs.events");
    return item;
  };

  // ------------------------------------------------------------------
  // Chat items — derived from teacherMessages. Guard against undefined
  // conversation lookups, which happen when a message belongs to a
  // conversation not yet in the local cache.
  // ------------------------------------------------------------------
  const chatItems: FeedItem[] = useMemo(
    () =>
      teacherMessages.map((m) => {
        const conv = getConversation(m.conversationId);
        const teacherName = conv?.teacherName ?? t("parent.teacherFallback");
        const childName = conv?.childName ?? "";
        return {
          id: `chat-${m.id}`,
          title: `${t("parent.roleTeacher")} · ${teacherName}`,
          body: childName ? `${childName}: ${m.text}` : m.text,
          time: m.timeLabel ?? "",
          category: "chat",
          unread: true,
        };
      }),
    [teacherMessages, getConversation, t]
  );

  // ------------------------------------------------------------------
  // Backend notifications — already shaped for a feed.
  // ------------------------------------------------------------------
  const contentItems: FeedItem[] = useMemo(
    () =>
      notifications.map((n) => ({
        id: `notif-${n.id}`,
        title: n.title ?? "",
        body: n.body ?? "",
        time: n.created_at
          ? new Date(n.created_at).toLocaleString()
          : "",
        category: n.category ?? "other",
        notification_type: n.notification_type ?? "",
        unread: !n.is_read,
      })),
    [notifications]
  );

  // ------------------------------------------------------------------
  // Filter
  // ------------------------------------------------------------------
  const feed = useMemo(() => {
    const all = [...chatItems, ...contentItems];
    if (filter === "All") return all;
    return all.filter(
      (item) => item.category.toLowerCase() === filter.toLowerCase()
    );
  }, [chatItems, contentItems, filter]);

  return (
    <Screen>
      <TopBar
        title={t("admin.notificationsTitle")}
        subtitle={t("admin.notificationsSub")}
        onBack={() => router.back()}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12 }}
      >
        {FILTERS.map((item) => (
          <Pill
            key={item}
            label={filterLabel(item)}
            active={filter === item}
            onPress={() => setFilter(item)}
          />
        ))}
      </ScrollView>

      <SoftCard style={{ marginBottom: 12 }}>
        <Text style={styles.summary}>
          {t("admin.notificationsSummary", {
            chats: chatItems.length,
            messages: teacherMessages.length,
          })}
        </Text>
      </SoftCard>

      {feed.length === 0 ? (
        <SoftCard style={styles.card}>
          <Text style={styles.body}>{t("admin.noNotifications")}</Text>
        </SoftCard>
      ) : (
        feed.map((item) => (
          <SoftCard key={item.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.icon}>
                <Ionicons
                  name={
                    item.category === "chat"
                      ? "chatbubble-outline"
                      : "notifications-outline"
                  }
                  size={18}
                  color={C.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>
                  {item.time} · {item.category}
                </Text>
              </View>
            </View>
          </SoftCard>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { color: C.muted, fontSize: 13, fontWeight: "600" },
  card: { marginBottom: 10 },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontWeight: "800", color: C.text, fontSize: 14 },
  body: { marginTop: 4, color: C.muted, lineHeight: 19, fontSize: 13 },
  time: {
    marginTop: 8,
    color: C.muted,
    fontSize: 11,
    textTransform: "capitalize",
  },
});