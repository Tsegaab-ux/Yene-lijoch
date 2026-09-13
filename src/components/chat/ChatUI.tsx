import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ChatMessage, ChatRole, Conversation } from "../../data/chatMock";

type Theme = {
  bg: string;
  card: string;
  text: string;
  muted: string;
  primary: string;
  primarySoft: string;
  border: string;
  bubbleMine: string;
  bubbleOther: string;
};

export function ChatAvatar({
  initials,
  color,
  size = 48,
}: {
  initials: string;
  color: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.32 }]}>
        {initials}
      </Text>
    </View>
  );
}

export function ConversationRow({
  title,
  subtitle,
  preview,
  time,
  unread,
  initials,
  color,
  onPress,
  theme,
}: {
  title: string;
  subtitle: string;
  preview: string;
  time: string;
  unread: number;
  initials: string;
  color: string;
  onPress: () => void;
  theme: Theme;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <ChatAvatar initials={initials} color={color} />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowTitle, { color: theme.text }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.rowTime, { color: theme.muted }]}>{time}</Text>
        </View>
        <Text style={[styles.rowSub, { color: theme.muted }]} numberOfLines={1}>
          {subtitle}
        </Text>
        <View style={styles.rowBottom}>
          <Text
            style={[
              styles.rowPreview,
              { color: unread > 0 ? theme.text : theme.muted },
              unread > 0 && { fontWeight: "600" },
            ]}
            numberOfLines={1}
          >
            {preview}
          </Text>
          {unread > 0 ? (
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <Text style={styles.badgeText}>{unread}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function ChatThread({
  role,
  conversation,
  messages,
  onSend,
  onOpen,
  theme,
}: {
  role: ChatRole;
  conversation: Conversation;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onOpen?: () => void;
  theme: Theme;
}) {
  const [text, setText] = useState("");
  const listRef = useRef<FlatList>(null);
  const otherName =
    role === "teacher" ? conversation.parentName : conversation.teacherName;
  const otherInitials =
    role === "teacher"
      ? conversation.parentInitials
      : conversation.teacherInitials;
  const otherColor =
    role === "teacher" ? conversation.parentColor : conversation.teacherColor;

  useEffect(() => {
    onOpen?.();
  }, [conversation.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(t);
  }, [messages.length]);

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <ChatAvatar initials={otherInitials} color={otherColor} size={40} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {otherName}
          </Text>
          <Text style={[styles.headerSub, { color: theme.muted }]}>
            About {conversation.childName}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.thread}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const mine = item.sender === role;
            return (
              <View
                style={[
                  styles.bubbleWrap,
                  mine ? styles.bubbleWrapMine : styles.bubbleWrapOther,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    mine
                      ? { backgroundColor: theme.bubbleMine }
                      : { backgroundColor: theme.bubbleOther },
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      { color: mine ? "#FFFFFF" : theme.text },
                    ]}
                  >
                    {item.text}
                  </Text>
                </View>
                <Text style={[styles.bubbleTime, { color: theme.muted }]}>
                  {item.timeLabel}
                </Text>
              </View>
            );
          }}
        />

        <View
          style={[
            styles.composer,
            { borderTopColor: theme.border, backgroundColor: theme.card },
          ]}
        >
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: theme.bg, borderColor: theme.border },
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Type a message..."
              placeholderTextColor={theme.muted}
              value={text}
              onChangeText={setText}
              multiline
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: text.trim() ? theme.primary : theme.border },
            ]}
            onPress={send}
            disabled={!text.trim()}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function ChatListShell({
  title,
  subtitle,
  children,
  theme,
  search,
  onSearch,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  theme: Theme;
  search: string;
  onSearch: (v: string) => void;
}) {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.listSub, { color: theme.muted }]}>{subtitle}</Text>
        <View
          style={[
            styles.search,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Ionicons name="search" size={18} color={theme.muted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search conversations"
            placeholderTextColor={theme.muted}
            value={search}
            onChangeText={onSearch}
            autoCapitalize="none"
          />
        </View>
      </View>
      <View style={[styles.listCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  avatar: { alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700" },
  listHeader: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  listTitle: { fontSize: 28, fontWeight: "700", letterSpacing: -0.4 },
  listSub: { marginTop: 6, fontSize: 14, marginBottom: 14 },
  search: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  listCard: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  rowBody: { flex: 1 },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  rowTitle: { flex: 1, fontSize: 16, fontWeight: "700" },
  rowTime: { fontSize: 12, fontWeight: "600" },
  rowSub: { marginTop: 2, fontSize: 12 },
  rowBottom: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowPreview: { flex: 1, fontSize: 13 },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  headerSub: { marginTop: 2, fontSize: 12 },
  thread: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 10,
  },
  bubbleWrap: { maxWidth: "82%", marginBottom: 10 },
  bubbleWrapMine: { alignSelf: "flex-end", alignItems: "flex-end" },
  bubbleWrapOther: { alignSelf: "flex-start", alignItems: "flex-start" },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  bubbleTime: { marginTop: 4, fontSize: 11 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  inputWrap: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 10 : 4,
    justifyContent: "center",
  },
  input: { fontSize: 15, maxHeight: 90 },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
