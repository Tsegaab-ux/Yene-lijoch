import React from "react";
import { Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Screen, TopBar, Card } from "../../../components/parent/ui";
import { ParentColors as C } from "../../../constants/parentTheme";
import { useLanguage } from "../../../contexts/LanguageContext";

const LANGUAGES = [
  { code: "en", key: "parent.language.english" },
  { code: "am", key: "parent.language.amharic" },
] as const;

// To add Afan Oromo or Tigrinya later, extend both this array and the
// `Lang` type in your locale file, then add `parent.language.afanOromo`
// and `parent.language.tigrinya` keys in both locales.

export default function LanguageScreen() {
  const { t, lang, setLang } = useLanguage();

  return (
    <Screen>
      <TopBar
        title={t("parent.language.title")}
        showBell={false}
        onBack={() => router.back()}
      />

      {LANGUAGES.map(({ code, key }) => {
        const selected = lang === code;
        return (
          <Card
            key={code}
            style={[styles.card, selected && styles.active]}
            onPress={() => setLang(code)}
          >
            <Text style={styles.title}>{t(key)}</Text>
            {selected ? (
              <Text style={styles.check}>{t("common.selected")}</Text>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  active: { borderColor: C.primary },
  title: { fontWeight: "800", color: C.text },
  check: { color: C.primary, fontWeight: "700" },
});