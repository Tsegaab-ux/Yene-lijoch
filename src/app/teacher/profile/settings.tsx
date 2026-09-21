import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Screen,
  SoftCard,
  BackHeader,
  PrimaryButton,
  GhostButton,
} from "../../../components/teacher/ui";
import { TeacherColors as C } from "../../../constants/teacherTheme";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { notify } from "@/utils/notify";

export default function TeacherSettingsScreen() {
  const { t } = useLanguage();
  const { user, logout } = useAuthContext();
  const [notifyParents, setNotifyParents] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const raw = await AsyncStorage.getItem(`prefs:${user.id}:notifyParents`);
      setNotifyParents(raw === null ? true : raw === "true");
    })();
  }, [user?.id]);

  const handleToggleNotify = async (value: boolean) => {
    setNotifyParents(value);
    if (user?.id) {
      await AsyncStorage.setItem(
        `prefs:${user.id}:notifyParents`,
        value ? "true" : "false"
      );
    }
  };

  const handleChangePassword = () => {
    router.push("/(auth)/change-password");
  };

  const handleDeleteAccount = () => {
    notify(
      t("teacher.settings.deleteConfirmTitle"),
      t("teacher.settings.deleteConfirmBody"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("teacher.settings.deleteAccount"),
          style: "destructive",
          onPress: async () => {
            try {
              await api.post("/users/me/deactivate/", {
                reason: "self_requested",
              });
              await logout();
              router.replace("/(auth)/login");
            } catch (err: any) {
              const message =
                err?.response?.data?.detail ??
                err?.message ??
                t("common.error");
              notify(t("common.error"), String(message));
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <BackHeader title={t("teacher.settings.title")} />

      <SoftCard>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {t("teacher.settings.notifyParents")}
            </Text>
            <Text style={styles.sub}>
              {t("teacher.settings.notifyParentsSub")}
            </Text>
          </View>
          <Switch
            value={notifyParents}
            onValueChange={handleToggleNotify}
            trackColor={{ true: C.primary }}
          />
        </View>
      </SoftCard>

      <PrimaryButton
        label={t("teacher.settings.changePassword")}
        onPress={handleChangePassword}
        disabled={false}
      />
      <GhostButton
        label={t("teacher.settings.deleteAccount")}
        onPress={handleDeleteAccount}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontWeight: "700", color: C.text, fontSize: 15 },
  sub: { marginTop: 4, color: C.muted, fontSize: 13, lineHeight: 18 },
});