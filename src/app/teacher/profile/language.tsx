import React, { useState } from "react";
import { Text, StyleSheet } from "react-native";
import { Screen, SoftCard, BackHeader } from "../../../components/teacher/ui";
import { TeacherColors as C } from "../../../constants/teacherTheme";

const LANGUAGES = ["English", "Amharic", "Afan Oromo", "Tigrinya"];

export default function TeacherLanguageScreen() {
  const [selected, setSelected] = useState("English");

  return (
    <Screen>
      <BackHeader title="Language" />
      {LANGUAGES.map((lang) => (
        <SoftCard
          key={lang}
          style={[styles.card, selected === lang && styles.active]}
          onPress={() => setSelected(lang)}
        >
          <Text style={styles.title}>{lang}</Text>
          {selected === lang ? <Text style={styles.check}>Selected</Text> : null}
        </SoftCard>
      ))}
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
