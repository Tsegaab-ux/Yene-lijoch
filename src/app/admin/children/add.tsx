import React, { useState } from "react";
import { Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { Screen, TopBar, Pill } from "../../../components/admin/ui";
import { useAdminData } from "../../../contexts/AdminDataContext";
import { AdminColors as C } from "../../../constants/adminTheme";

export default function AddChildScreen() {
  const { addChild, classes } = useAdminData();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("Grade 3");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [classId, setClassId] = useState(classes[0]?.id ?? "");

  const handleSave = () => {
    if (!name || !parentName || !parentEmail || !classId) {
      Alert.alert("Missing fields", "Please fill all required fields.");
      return;
    }
    addChild({
      name,
      grade,
      parentName,
      parentEmail,
      classId,
      progress: 0,
      attendance: 100,
    });
    Alert.alert("Child added", `${name} was enrolled successfully.`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <Screen>
      <TopBar title="Add Child" onBack={() => router.back()} />

      <Text style={styles.label}>Child name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" />

      <Text style={styles.label}>Grade</Text>
      <TextInput style={styles.input} value={grade} onChangeText={setGrade} placeholder="Grade 3" />

      <Text style={styles.label}>Parent name</Text>
      <TextInput style={styles.input} value={parentName} onChangeText={setParentName} />

      <Text style={styles.label}>Parent email</Text>
      <TextInput
        style={styles.input}
        value={parentEmail}
        onChangeText={setParentEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Assign class</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {classes.map((c) => (
          <Pill
            key={c.id}
            label={c.name}
            active={classId === c.id}
            onPress={() => setClassId(c.id)}
          />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save child</Text>
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
