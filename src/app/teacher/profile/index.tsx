import React from "react";
import { Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import {
  Screen,
  SoftCard,
  AvatarBubble,
} from "../../../components/teacher/ui";
import { TEACHER, STUDENTS } from "../../../data/teacherMock";
import { TeacherColors as C } from "../../../constants/teacherTheme";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

export default function TeacherProfileScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Teacher account and settings</Text>

      <SoftCard style={styles.hero}>
        <AvatarBubble initials="HB" color={C.primary} size={72} />
        <Text style={styles.name}>{TEACHER.name}</Text>
        <Text style={styles.meta}>{TEACHER.title}</Text>
        <Text style={styles.meta}>
          {TEACHER.program} · {TEACHER.group}
        </Text>
        <Text style={styles.meta}>{STUDENTS.length} students</Text>
      </SoftCard>

      <SoftCard style={{ marginTop: 16 }}>
        <Menu
          icon="person-outline"
          title="Teacher Information"
          onPress={() => router.push("/teacher/profile/info")}
        />
        <Menu
          icon="settings-outline"
          title="Settings"
          onPress={() => router.push("/teacher/profile/settings")}
        />
        <Menu
          icon="globe-outline"
          title="Language"
          onPress={() => router.push("/teacher/profile/language")}
        />
        <Menu
          icon="help-circle-outline"
          title="Help & Support"
          onPress={() => router.push("/teacher/profile/help")}
        />
        <Menu
          icon="log-out-outline"
          title="Logout"
          danger
          onPress={() =>
            Alert.alert("Logout", "Are you sure you want to log out?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Logout",
                style: "destructive",
                onPress: () => router.replace("/(auth)/login"),
              },
            ])
          }
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
      <Text style={[styles.menuTitle, danger && { color: C.danger }]}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color={C.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
