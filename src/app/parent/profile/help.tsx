import React from "react";
import { Text, StyleSheet, Linking, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Screen, TopBar, Card } from "../../../components/parent/ui";
import { ParentColors as C } from "../../../constants/parentTheme";
import { useLanguage } from "../../../contexts/LanguageContext";
import { SUPPORT_EMAIL } from "../../../constants/support";
import { notify } from "@/utils/notify";

const FAQ_KEYS = [
  "parent.help.faq.switchChildren",
  "parent.help.faq.videos",
  "parent.help.faq.attendance",
  "parent.help.faq.messaging",
] as const;

export default function HelpScreen() {
  const { t } = useLanguage();

  const handleContact = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      "Parent app support"
    )}`;

    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      notify(
        t("common.error"),
        t("parent.help.noMailApp", { email: SUPPORT_EMAIL })
      );
      return;
    }

    try {
      await Linking.openURL(url);
    } catch (err) {
      notify(t("common.error"), String(err));
    }
  };

  return (
    <Screen>
      <TopBar
        title={t("parent.help.title")}
        showBell={false}
        onBack={() => router.back()}
      />

      {FAQ_KEYS.map((key) => (
        <Card key={key} style={{ marginBottom: 12 }}>
          <Text style={styles.q}>{t(`${key}.q`)}</Text>
          <Text style={styles.a}>{t(`${key}.a`)}</Text>
        </Card>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleContact}>
        <Text style={styles.buttonText}>{t("parent.help.contactSupport")}</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  q: { fontWeight: "800", color: C.text, marginBottom: 6 },
  a: { color: C.muted, lineHeight: 20 },
  button: {
    marginTop: 8,
    height: 54,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});