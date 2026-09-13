import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, Alert } from "react-native";
import { router } from "expo-router";
import { Screen, SoftCard, BackHeader, PrimaryButton, GhostButton } from "../../../components/teacher/ui";
import { TeacherColors as C } from "../../../constants/teacherTheme";

export default function TeacherSettingsScreen() {
  const [notifyParents, setNotifyParents] = useState(true);

  return (
    <Screen>
      <BackHeader title="Settings" />
      <SoftCard>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Notify parents on updates</Text>
            <Text style={styles.sub}>
              Send alerts for attendance and lesson notes.
            </Text>
          </View>
          <Switch
            value={notifyParents}
            onValueChange={setNotifyParents}
            trackColor={{ true: C.primary }}
          />
        </View>
      </SoftCard>

      <PrimaryButton
        label="Change password"
        onPress={() => router.push("/(auth)/reset-password")}
      />
      <GhostButton
        label="Delete account"
        onPress={() =>
          Alert.alert("Delete account", "This will be available after backend setup.")
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontWeight: "700", color: C.text, fontSize: 15 },
  sub: { marginTop: 4, color: C.muted, fontSize: 13, lineHeight: 18 },
});
