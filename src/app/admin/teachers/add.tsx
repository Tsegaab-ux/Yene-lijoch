import React, { useState } from "react";
import { Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Screen, TopBar } from "../../../components/admin/ui";
import { useAdminData } from "../../../contexts/AdminDataContext";
import { AdminColors as C } from "../../../constants/adminTheme";

export default function AddTeacherScreen() {
  const { addTeacher } = useAdminData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");

  const handleSave = () => {
    if (!name || !email || !subject) {
      Alert.alert("Missing fields", "Name, email, and subject are required.");
      return;
    }
    addTeacher({ name, email, phone, subject, status: "active" });
    Alert.alert("Teacher added", `${name} was added successfully.`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <Screen>
      <TopBar title="Add Teacher" onBack={() => router.back()} />
      <Text style={styles.label}>Full name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Teacher name" />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="teacher@yenelijoch.com"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="+251 ..."
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Subject</Text>
      <TextInput style={styles.input} value={subject} onChangeText={setSubject} placeholder="Math, Amharic..." />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save teacher</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: "700", color: C.text, marginBottom: 8, marginTop: 12 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: C.card,
    color: C.text,
  },
  button: {
    marginTop: 24,
    height: 54,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
