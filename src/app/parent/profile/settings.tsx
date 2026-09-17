import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Screen, TopBar, Card } from "../../../components/parent/ui";
import { ParentColors as C } from "../../../constants/parentTheme";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSelectedChild } from "@/contexts/SelectedChildContext";
import { api } from "@/services/api";
import { notify } from "@/utils/notify";

const PREF_KEY = (userId: number | string) =>
  `prefs:${userId}:privateProfile`;

export default function AccountSettingsScreen() {
  const { t } = useLanguage();
  const { user, logout } = useAuthContext();
  const { parent } = useSelectedChild();

  const [privateProfile, setPrivateProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ---- Load the toggle from local storage --------------------------
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const raw = await AsyncStorage.getItem(PREF_KEY(user.id));
      setPrivateProfile(raw === null ? true : raw === "true");
    })();
  }, [user?.id]);

  const handleTogglePrivate = async (value: boolean) => {
    setPrivateProfile(value);
    if (user?.id) {
      await AsyncStorage.setItem(PREF_KEY(user.id), value ? "true" : "false");
    }
  };

  // ---- Change password --------------------------------------------
  const handleChangePassword = () => {
    router.push("/(auth)/change-password");
  };

  // ---- Delete (soft-deactivate) account ---------------------------
  const handleDeleteAccount = () => {
    notify(
      t("parent.settings.deleteConfirmTitle"),
      t("parent.settings.deleteConfirmBody"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("parent.settings.deleteAccount"),
          style: "destructive",
          onPress: async () => {
            setIsSaving(true);
            try {
              await api.post("/users/me/deactivate/", {
                reason: "parent_self_requested",
              });
              await logout();
              router.replace("/(auth)/login");
            } catch (err: any) {
              const message =
                err?.response?.data?.detail ??
                err?.message ??
                t("common.error");
              notify(t("common.error"), String(message));
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <TopBar
        title={t("parent.settings.title")}
        showBell={false}
        onBack={() => router.back()}
      />

      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {t("parent.settings.privateProfile")}
            </Text>
            <Text style={styles.sub}>
              {t("parent.settings.privateProfileSub")}
            </Text>
          </View>
          <Switch
            value={privateProfile}
            onValueChange={handleTogglePrivate}
            trackColor={{ true: C.primary }}
          />
        </View>
      </Card>

      <TouchableOpacity
        style={styles.button}
        onPress={handleChangePassword}
        disabled={isSaving}
      >
        <Text style={styles.buttonText}>
          {t("parent.settings.changePassword")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.ghost}
        onPress={handleDeleteAccount}
        disabled={isSaving}
      >
        <Text style={styles.ghostText}>
          {t("parent.settings.deleteAccount")}
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontWeight: "800", color: C.text, fontSize: 15 },
  sub: { marginTop: 4, color: C.muted, fontSize: 13, lineHeight: 18 },
  button: {
    marginTop: 20,
    height: 54,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  ghost: { marginTop: 14, alignItems: "center" },
  ghostText: { color: C.danger, fontWeight: "700" },
});