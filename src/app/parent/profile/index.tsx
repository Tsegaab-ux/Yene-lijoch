import React from "react";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  SoftCard,
  AvatarBubble,
  MenuRow,
} from "../../../components/parent/ui";
import { LanguageToggle } from "../../../components/LanguageToggle";
import { ParentColors as C } from "../../../constants/parentTheme";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useSelectedChild } from "../../../contexts/SelectedChildContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { notify } from "@/utils/notify";
import { colorFor, deriveInitials } from "@/utils/avatarColors";

export default function ProfileScreen() {
  const { t, lang } = useLanguage();
  const { logout } = useAuthContext();
  const { parent, childrenList } = useSelectedChild();

  console.log(parent)
  // Notifications endpoint not built yet — placeholder count.
  const unread = 0;

  const handleLogout = () => {
    notify(
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

  const displayName = parent?.full_name || t("parent.parentFallback");
  const displayEmail = parent?.email || "";
  const initials = deriveInitials(displayName);
  const languageLabel =
    lang === "am" ? t("common.amharic") : t("common.english");

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
        <AvatarBubble
          initials={initials}
          color={colorFor(displayName)}
          size={64}
        />
        <Text style={styles.name}>{displayName}</Text>
        {displayEmail ? (
          <Text style={styles.meta}>{displayEmail}</Text>
        ) : null}
        <Text style={styles.meta}>
          {t("parent.roleLabel")} · {childrenList.length}{" "}
          {childrenList.length === 1
            ? t("parent.childSingular")
            : t("parent.childPlural")}
        </Text>
      </SoftCard>

      <SoftCard style={{ marginTop: 16 }}>
        <MenuRow
          icon="person-outline"
          title={t("parent.menu.profile")}
          subtitle={t("parent.menu.profileSub")}
          onPress={() => router.push("/parent/profile/account")}
        />
        <MenuRow
          icon="people-outline"
          title={t("parent.menu.children")}
          subtitle={t("parent.menu.childrenSub")}
          onPress={() => router.push("/parent/profile/children")}
        />
        <MenuRow
          icon="settings-outline"
          title={t("parent.menu.settings")}
          subtitle={t("parent.menu.settingsSub")}
          onPress={() => router.push("/parent/profile/settings")}
        />
        <MenuRow
          icon="globe-outline"
          title={t("parent.menu.language")}
          subtitle={languageLabel}
          onPress={() => router.push("/parent/profile/language")}
        />
        <MenuRow
          icon="notifications-outline"
          title={t("parent.menu.notifications")}
          subtitle={t("parent.menu.notificationsSub")}
          onPress={() => router.push("/parent/profile/notification-settings")}
        />
        <MenuRow
          icon="help-circle-outline"
          title={t("parent.menu.help")}
          subtitle={t("parent.menu.helpSub")}
          onPress={() => router.push("/parent/profile/help")}
        />
        <MenuRow
          icon="log-out-outline"
          title={t("parent.logout")}
          subtitle={t("common.login")}
          danger
          onPress={handleLogout}
        />
      </SoftCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  langRow: { alignItems: "flex-end", marginBottom: 8 },
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
  subtitle: { marginTop: 4, color: C.muted, fontSize: 14 },
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