import React from "react";
import { Text, StyleSheet } from "react-native";
import { Screen, SoftCard, BackHeader } from "../../../components/teacher/ui";
import { TeacherColors as C } from "../../../constants/teacherTheme";
import { useLanguage } from "../../../contexts/LanguageContext";

const LANGUAGES = [
  { code: "en", key: "teacher.language.english" },
  { code: "am", key: "teacher.language.amharic" },
] as const;

// If you add om / ti later, extend both the array and the locale files:
// { code: "om", key: "teacher.language.afanOromo" }
// { code: "ti", key: "teacher.language.tigrinya" }

export default function TeacherLanguageScreen() {
  const { t, lang, setLang } = useLanguage();

  return (
    <Screen>
      <BackHeader title={t("teacher.language.title")} />
      {LANGUAGES.map(({ code, key }) => {
        const selected = lang === code;
        return (
          <SoftCard
            key={code}
            style={[styles.card, selected && styles.active]}
            onPress={() => setLang(code)}
          >
            <Text style={styles.title}>{t(key)}</Text>
            {selected ? (
              <Text style={styles.check}>{t("common.selected")}</Text>
            ) : null}
          </SoftCard>
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
  title: { fontWeight: "700", color: C.text },
  check: { color: C.primary, fontWeight: "700" },
});