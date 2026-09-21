import React, { useState } from "react";
import { Text, StyleSheet, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import {
  Screen,
  SoftCard,
  BackHeader,
  PrimaryButton,
} from "../../../components/teacher/ui";
import { TEACHER } from "../../../data/teacherMock";
import { TeacherColors as C } from "../../../constants/teacherTheme";

export default function TeacherInfoScreen() {
  const [name, setName] = useState(TEACHER.name);
  const [email, setEmail] = useState(TEACHER.email);
  const [phone, setPhone] = useState(TEACHER.phone);
  const [group, setGroup] = useState(TEACHER.group);

  return (
    <Screen>
      <BackHeader title="Teacher Information" />
      <SoftCard>
        <Text style={styles.label}>Full name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <Text style={styles.label}>Group</Text>
        <TextInput style={styles.input} value={group} onChangeText={setGroup} />
      </SoftCard>
      <PrimaryButton
        label="Save changes"
        onPress={() => Alert.alert("Saved", "Teacher information was updated.")}
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
