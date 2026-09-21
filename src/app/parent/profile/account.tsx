import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Screen, TopBar, Card } from "../../../components/parent/ui";
import { ParentColors as C } from "../../../constants/parentTheme";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useSelectedChild } from "../../../contexts/SelectedChildContext";
import { notify } from "@/utils/notify";
import { api } from "@/services/api";

export default function ParentProfileScreen() {
  const { t } = useLanguage();
  const { parent, refetch } = useSelectedChild();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fill the form once the parent object arrives.
  useEffect(() => {
    if (parent) {
      setName(parent.full_name ?? "");
      setEmail(parent.email ?? "");
      setPhone(parent.contact ?? "");
    }
  }, [parent]);

  const handleSave = async () => {
    if (!name.trim()) {
      notify(t("common.error"), t("parent.profileForm.nameRequired"));
      return;
    }

    setIsSaving(true);
    try {
      await api.patch("/parents/me/", {
        full_name: name.trim(),
        email: email.trim() || undefined,
        contact: phone.trim() || undefined,
      });
      await refetch();
      notify(
        t("parent.profileForm.saved"),
        t("parent.profileForm.savedBody")
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        t("common.error");
      notify(t("common.error"), String(message));
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Loading guard (before the form renders) -------------------
  if (!parent) {
    return (
      <Screen>
        <TopBar
          title={t("parent.profileForm.title")}
          showBell={false}
          onBack={() => router.back()}
        />
        <Card>
          <ActivityIndicator color={C.primary} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar
        title={t("parent.profileForm.title")}
        showBell={false}
        onBack={() => router.back()}
      />

      <Card>
        <Text style={styles.label}>{t("parent.profileForm.fullName")}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>{t("parent.profileForm.email")}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>{t("parent.profileForm.phone")}</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </Card>

      <TouchableOpacity
        style={[styles.button, isSaving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.buttonText}>
          {isSaving
            ? t("parent.profileForm.saving")
            : t("parent.profileForm.save")}
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: "700", color: C.text, marginBottom: 8, marginTop: 10 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: C.text,
    backgroundColor: C.bg,
  },
  button: {
    marginTop: 20,
    height: 54,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});