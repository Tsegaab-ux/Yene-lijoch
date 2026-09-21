import React, { useEffect, useState } from "react";
import { Text, StyleSheet, TextInput } from "react-native";
import {
  Screen,
  SoftCard,
  BackHeader,
  PrimaryButton,
} from "../../../components/teacher/ui";
import { TeacherColors as C } from "../../../constants/teacherTheme";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useTeacher } from "@/contexts/TeacherContext";
import { notify } from "@/utils/notify";

function splitName(full: string): { first_name: string; last_name: string } {
  const parts = (full || "").trim().split(/\s+/);
  if (parts.length === 0) return { first_name: "", last_name: "" };
  if (parts.length === 1) return { first_name: parts[0], last_name: "" };
  return { first_name: parts[0], last_name: parts.slice(1).join(" ") };
}

export default function TeacherInfoScreen() {
  const { t } = useLanguage();
  const { teacher, isLoading, isSaving, error, updateTeacher } = useTeacher();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [group, setGroup] = useState("");

  useEffect(() => {
    if (teacher) {
      setName(teacher.full_name ?? "");
      setEmail(teacher.email ?? "");
      setPhone(teacher.contact ?? "");
      setGroup(teacher.group ?? "");
    }
  }, [teacher]);

  const handleSave = async () => {
    const { first_name, last_name } = splitName(name);
    try {
      await updateTeacher({
        first_name,
        last_name,
        email: email.trim() || undefined,
        contact: phone.trim() || undefined,
      });
      notify(t("teacher.info.saved"), t("teacher.info.savedBody"));
    } catch (err) {
      notify(t("common.error"), String(err));
    }
  };

  if (isLoading && !teacher) {
    return (
      <Screen>
        <BackHeader title={t("teacher.info.title")} />
        <SoftCard>
          <Text style={styles.hint}>{t("common.loading")}</Text>
        </SoftCard>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackHeader title={t("teacher.info.title")} />
      <SoftCard>
        <Text style={styles.label}>{t("teacher.info.fullName")}</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>{t("teacher.info.email")}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>{t("teacher.info.phone")}</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>{t("teacher.info.group")}</Text>
        <TextInput
          style={[styles.input, styles.inputReadonly]}
          value={group}
          editable={false}
          selectTextOnFocus={false}
        />
        <Text style={styles.hint}>{t("teacher.info.groupHint")}</Text>
      </SoftCard>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <PrimaryButton
        label={isSaving ? t("teacher.info.saving") : t("teacher.info.save")}
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
  inputReadonly: { backgroundColor: C.bgSoft, color: C.muted },
  hint: { marginTop: 6, color: C.muted, fontSize: 12, lineHeight: 16 },
  errorText: {
    marginTop: 12,
    color: C.danger,
    fontSize: 13,
    textAlign: "center",
  },
});
