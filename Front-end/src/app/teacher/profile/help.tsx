import React from "react";
import { Text, StyleSheet, Linking } from "react-native";
import { Screen, SoftCard, BackHeader, PrimaryButton } from "../../../components/teacher/ui";
import { TeacherColors as C } from "../../../constants/teacherTheme";

const FAQS = [
  {
    q: "How do I take attendance?",
    a: "Open Students, then tap Present / Absent / Mark next to each child.",
  },
  {
    q: "Where is today's lesson?",
    a: "Home shows Today's Lesson. Open Curriculum for the full list.",
  },
  {
    q: "How do I message a parent?",
    a: "Open a student profile, then tap Message parent.",
  },
];

export default function TeacherHelpScreen() {
  return (
    <Screen>
      <BackHeader title="Help & Support" />
      {FAQS.map((item) => (
        <SoftCard key={item.q} style={{ marginBottom: 12 }}>
          <Text style={styles.q}>{item.q}</Text>
          <Text style={styles.a}>{item.a}</Text>
        </SoftCard>
      ))}
      <PrimaryButton
        label="Contact support"
        icon="mail-outline"
        onPress={() => Linking.openURL("mailto:support@yenelijoch.com")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  q: { fontWeight: "700", color: C.text, marginBottom: 6 },
  a: { color: C.muted, lineHeight: 20 },
});
