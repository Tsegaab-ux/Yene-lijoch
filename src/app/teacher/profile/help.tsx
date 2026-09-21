import React from "react";
import { Text, StyleSheet, Linking, Platform, Alert } from "react-native";
import {
  Screen,
  SoftCard,
  BackHeader,
  PrimaryButton,
} from "../../../components/teacher/ui";
import { TeacherColors as C } from "../../../constants/teacherTheme";
import { useLanguage } from "../../../contexts/LanguageContext";

const SUPPORT_EMAIL = "support@yenelijoch.com";

// FAQ keys live here so adding a question = one new key in the locale file.
const FAQ_KEYS = [
  "teacher.help.faq.attendance",
  "teacher.help.faq.todayLesson",
  "teacher.help.faq.messageParent",
] as const;

export default function TeacherHelpScreen() {
  const { t } = useLanguage();

  const handleContact = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      "Teacher app support"
    )}`;

    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      const message = `We couldn't open your mail app. You can reach us at ${SUPPORT_EMAIL}.`;
      if (Platform.OS === "web") {
        window.alert(message);
      } else {
        Alert.alert("No mail app", message);
      }
      return;
    }

    await Linking.openURL(url);
  };

  return (
    <Screen>
      <BackHeader title={t("teacher.help.title")} />

      {FAQ_KEYS.map((key) => (
        <SoftCard key={key} style={{ marginBottom: 12 }}>
          <Text style={styles.q}>{t(`${key}.q`)}</Text>
          <Text style={styles.a}>{t(`${key}.a`)}</Text>
        </SoftCard>
      ))}

      <PrimaryButton
        label={t("teacher.help.contactSupport")}
        icon="mail-outline"
        onPress={handleContact}
        disabled={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  q: { fontWeight: "700", color: C.text, marginBottom: 6 },
  a: { color: C.muted, lineHeight: 20 },
});