import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  SoftCard,
  TopBar,
  Pill,
} from "../../components/admin/ui";
import { AdminNotice } from "../../data/sharedContent";
import { AdminColors as C } from "../../constants/adminTheme";
import { useSharedContent } from "../../contexts/SharedContentContext";
import { useChat } from "../../contexts/ChatContext";
import { router } from "expo-router";

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
  const { adminNotices, markAdminNoticesRead } = useSharedContent();
  const { teacherMessages, conversations, getConversation } = useChat();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  useEffect(() => {
    markAdminNoticesRead();
  }, [markAdminNoticesRead]);

  const chatItems: FeedItem[] = teacherMessages.map((m) => {
    const conv = getConversation(m.conversationId);
    return {
      id: `chat-${m.id}`,
      title: `Teacher · ${conv.teacherName}`,
      body: `${conv.childName}: ${m.text}`,
      time: m.timeLabel,
      category: "chat",
      unread: true,
    };
  });

  const contentItems: FeedItem[] = adminNotices.map((n: AdminNotice) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    time: n.time,
    category: n.category,
    unread: n.unread,
  }));

  const feed = useMemo(() => {
    const all = [...chatItems, ...contentItems];
    if (filter === "All") return all;
    return all.filter(
      (item) => item.category === filter.toLowerCase()
    );
  }, [chatItems, contentItems, filter]);

  return (
    <Screen>
      <TopBar
        title="Notifications"
        subtitle="Teacher chat + content updates"
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
            label={item}
            active={filter === item}
            onPress={() => setFilter(item)}
          />
        ))}
      </ScrollView>

      <SoftCard style={{ marginBottom: 12 }}>
        <Text style={styles.summary}>
          {conversations.length} parent–teacher chats ·{" "}
          {teacherMessages.length} teacher messages tracked
        </Text>
      </SoftCard>

      {feed.map((item) => (
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
      ))}
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
