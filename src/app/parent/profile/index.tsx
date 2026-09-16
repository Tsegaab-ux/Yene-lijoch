import React from "react";
import { Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import {
  Screen,
  SoftCard,
  AvatarBubble,
  MenuRow,
} from "../../../components/parent/ui";
import { LanguageToggle } from "../../../components/LanguageToggle";
import { PARENT, NOTIFICATIONS } from "../../../data/parentMock";
import { useSelectedChild } from "../../../contexts/SelectedChildContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { ParentColors as C } from "../../../constants/parentTheme";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "@/contexts/AuthContext";

export default function ProfileScreen() {
  const { t } = useLanguage();
  const { logout, user, } = useAuthContext();
  const { childrenList } = useSelectedChild();
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;

  const handleLogout = () => {
    Alert.alert(
      t("parent.logout"),
      t("parent.logout"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("parent.logout"),
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } finally {
              router.replace("/(auth)/login");
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <View style={styles.langRow}>
        <LanguageToggle tone="dark" />
      </View>

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t("parent.profileTitle")}</Text>
          <Text style={styles.subtitle}>{t("parent.profileSub")}</Text>
        </View>
        <TouchableOpacity
          style={styles.bell}
          onPress={() => router.push("/parent/notifications")}
        >
          <Ionicons name="notifications-outline" size={20} color={C.text} />
          {unread > 0 ? <View style={styles.dot} /> : null}
        </TouchableOpacity>
      </View>

      <SoftCard style={styles.hero}>
        <AvatarBubble initials="TM" color={C.primary} size={64} />
        <Text style={styles.name}>{PARENT.name}</Text>
        <Text style={styles.meta}>{PARENT.email}</Text>
        <Text style={styles.meta}>
          {PARENT.role} · {childrenList.length} children
        </Text>
      </SoftCard>

      <SoftCard style={{ marginTop: 16 }}>
        <MenuRow
          icon="person-outline"
          title="Parent Profile"
          subtitle="Name, email, and phone"
          onPress={() => router.push("/parent/profile/account")}
        />
        <MenuRow
          icon="people-outline"
          title="My Children"
          subtitle="Manage connected children"
          onPress={() => router.push("/parent/profile/children")}
        />
        <MenuRow
          icon="settings-outline"
          title="Account Settings"
          subtitle="Password and privacy"
          onPress={() => router.push("/parent/profile/settings")}
        />
        <MenuRow
          icon="globe-outline"
          title="Language"
          subtitle="English"
          onPress={() => router.push("/parent/profile/language")}
        />
        <MenuRow
          icon="notifications-outline"
          title="Notifications Settings"
          subtitle="Attendance, events, courses, chat"
          onPress={() => router.push("/parent/profile/notification-settings")}
        />
        <MenuRow
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="FAQs and contact"
          onPress={() => router.push("/parent/profile/help")}
        />
        <MenuRow
          icon="log-out-outline"
          title={t("parent.logout")}
          subtitle={t("common.login")}
          danger
          onPress={()=> handleLogout()}
        />
      </SoftCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  langRow: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 4,
    color: C.muted,
    fontSize: 14,
  },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.bgSoft,
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
    backgroundColor: C.secondary,
  },
  hero: { alignItems: "center", paddingVertical: 24 },
  name: { marginTop: 12, fontSize: 20, fontWeight: "800", color: C.text },
  meta: { marginTop: 4, color: C.muted },
});
