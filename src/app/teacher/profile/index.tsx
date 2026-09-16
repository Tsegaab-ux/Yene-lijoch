import React from "react";
import { Text, StyleSheet, Alert, TouchableOpacity, View, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  SoftCard,
  AvatarBubble,
} from "../../../components/teacher/ui";
import { LanguageToggle } from "../../../components/LanguageToggle";
import { TeacherColors as C } from "../../../constants/teacherTheme";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacher } from "@/contexts/TeacherContext";

// ------------------------------------------------------------------
// Cross-platform alert — RN Web no-ops Alert.alert.
// ------------------------------------------------------------------
function notify(
  title: string,
  message: string,
  buttons?: { text: string; style?: "cancel" | "destructive" | "default"; onPress?: () => void }[]
) {
  if (Platform.OS === "web") {
    const ok = buttons?.find((b) => b.style !== "cancel");
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${message}`)) {
      ok?.onPress?.();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

export default function TeacherProfileScreen() {
  const { t } = useLanguage();
  const { logout } = useAuthContext();
  const { teacher, isLoading, error } = useTeacher();

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

  // ---- Loading ---------------------------------------------------
  if (isLoading && !teacher) {
    return (
      <Screen>
        <View style={styles.langRow}>
          <LanguageToggle tone="dark" />
        </View>
        <Text style={styles.title}>{t("teacher.profileTitle")}</Text>
        <SoftCard style={styles.hero}>
          <Text style={styles.meta}>{t("common.loading")}</Text>
        </SoftCard>
      </Screen>
    );
  }

  // ---- Error / not-found -----------------------------------------
  if (error || !teacher) {
    return (
      <Screen>
        <View style={styles.langRow}>
          <LanguageToggle tone="dark" />
        </View>
        <Text style={styles.title}>{t("teacher.profileTitle")}</Text>
        <SoftCard style={styles.hero}>
          <Text style={[styles.meta, { color: C.danger }]}>
            {error ?? t("teacher.profile.loadError")}
          </Text>
        </SoftCard>
      </Screen>
    );
  }

  // ---- Loaded ----------------------------------------------------
  const studentCount = (teacher.classes ?? []).reduce(
    (sum, c) => sum + (c.student_count ?? 0),
    0
  );

  return (
    <Screen>
      <View style={styles.langRow}>
        <LanguageToggle tone="dark" />
      </View>

      <Text style={styles.title}>{t("teacher.profileTitle")}</Text>
      <Text style={styles.subtitle}>{t("teacher.profileSubtitle")}</Text>

      <SoftCard style={styles.hero}>
        <AvatarBubble
          initials={getInitials(teacher.full_name)}
          color={C.primary}
          size={72}
        />
        <Text style={styles.name}>
          {teacher.full_name || teacher.username}
        </Text>

        {teacher.organization?.name ? (
          <Text style={styles.meta}>{teacher.organization.name}</Text>
        ) : null}

        <Text style={styles.meta}>
          {teacher.program || t("teacher.portal")}
          {teacher.group ? ` · ${teacher.group}` : ""}
        </Text>

        {studentCount > 0 ? (
          <Text style={styles.meta}>
            {studentCount} {t("teacher.studentsSub")}
          </Text>
        ) : null}
      </SoftCard>

      <SoftCard style={{ marginTop: 16 }}>
        <Menu
          icon="person-outline"
          title={t("teacher.profile.info")}
          onPress={() => router.push("/teacher/profile/info")}
        />
        <Menu
          icon="settings-outline"
          title={t("teacher.profile.settings")}
          onPress={() => router.push("/teacher/profile/settings")}
        />
        <Menu
          icon="globe-outline"
          title={t("teacher.profile.language")}
          onPress={() => router.push("/teacher/profile/language")}
        />
        <Menu
          icon="help-circle-outline"
          title={t("teacher.profile.help")}
          onPress={() => router.push("/teacher/profile/help")}
        />
        <Menu
          icon="log-out-outline"
          title={t("parent.logout")}
          danger
          onPress={handleLogout}
        />
      </SoftCard>
    </Screen>
  );
}

function Menu({
  icon,
  title,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menu} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.menuIcon, danger && { backgroundColor: "#FDECEC" }]}>
        <Ionicons name={icon} size={20} color={danger ? C.danger : C.primary} />
      </View>
      <Text style={[styles.menuTitle, danger && { color: C.danger }]}>
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={C.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  langRow: { alignItems: "flex-end", marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "700", color: C.text, letterSpacing: -0.4 },
  subtitle: { marginTop: 6, color: C.muted, fontSize: 14, marginBottom: 8 },
  hero: { alignItems: "center", paddingVertical: 24 },
  name: { marginTop: 12, fontSize: 20, fontWeight: "700", color: C.text },
  meta: { marginTop: 4, color: C.muted },
  menu: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: { flex: 1, fontSize: 15, fontWeight: "600", color: C.text },
});