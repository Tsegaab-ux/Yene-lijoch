import React, { useState } from "react";
import { Text, StyleSheet, TextInput } from "react-native";
import {
  Screen,
  SoftCard,
  BackHeader,
  PrimaryButton,
} from "../../components/teacher/ui";
import { TeacherColors as C } from "../../constants/teacherTheme";
import { useLanguage } from "../../contexts/LanguageContext";
import { api } from "@/services/api";
import { notify } from "@/utils/notify";

export default function ChangePasswordScreen() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!current || !next || !confirm) {
      notify(t("common.error"), t("teacher.changePassword.missing"));
      return;
    }
    if (next.length < 8) {
      notify(t("common.error"), t("teacher.changePassword.tooShort"));
      return;
    }
    if (next !== confirm) {
      notify(t("common.error"), t("teacher.changePassword.mismatch"));
      return;
    }

    setIsSaving(true);
    try {
      await api.post("/users/change-password/", {
        current_password: current,
        new_password: next,
      });
      notify(
        t("teacher.changePassword.successTitle"),
        t("teacher.changePassword.successBody")
      );
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err: any) {
      const message =
        err?.response?.data?.error ??
        err?.response?.data?.detail ??
        err?.message ??
        t("common.error");
      notify(t("teacher.changePassword.errorTitle"), String(message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <BackHeader title={t("teacher.changePassword.title")} />
      <SoftCard>
        <Text style={styles.label}>{t("teacher.changePassword.current")}</Text>
        <TextInput
          style={styles.input}
          value={current}
          onChangeText={setCurrent}
          secureTextEntry
          autoCapitalize="none"
        />

        <Text style={styles.label}>{t("teacher.changePassword.next")}</Text>
        <TextInput
          style={styles.input}
          value={next}
          onChangeText={setNext}
          secureTextEntry
          autoCapitalize="none"
        />

        <Text style={styles.label}>{t("teacher.changePassword.confirm")}</Text>
        <TextInput
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          autoCapitalize="none"
        />
      </SoftCard>

      <PrimaryButton
        label={
          isSaving
            ? t("teacher.changePassword.saving")
            : t("teacher.changePassword.save")
        }
        onPress={handleSave}
        disabled={isSaving}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: "600", color: C.text, marginBottom: 8, marginTop: 10 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: C.text,
    backgroundColor: C.bg,
  },
});