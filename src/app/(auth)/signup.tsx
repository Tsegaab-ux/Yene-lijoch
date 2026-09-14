import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

type Role = "parent" | "teacher" | "admin";

const ROLE_META: Record<
  Role,
  { label: string; color: string; home: "/parent" | "/teacher" | "/admin" }
> = {
  parent: { label: "Parent", color: "#3D6B5A", home: "/parent" },
  teacher: { label: "Teacher", color: "#C45C26", home: "/teacher" },
  admin: { label: "Admin", color: "#2D6A4F", home: "/admin" },
};

export default function Signup() {
  const params = useLocalSearchParams<{ role?: string }>();
  const role = useMemo<Role>(() => {
    const raw = Array.isArray(params.role) ? params.role[0] : params.role;
    if (raw === "teacher" || raw === "admin" || raw === "parent") return raw;
    return "parent";
  }, [params.role]);

  const meta = ROLE_META[role];

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Alert.alert("Missing information", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Error", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Password Error",
        "Password must be at least 6 characters long."
      );
      return;
    }

    Alert.alert("Success", `Your ${meta.label.toLowerCase()} account is ready!`, [
      {
        text: "Continue",
        onPress: () => router.replace(meta.home),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2C2A26" />
          </TouchableOpacity>

          <View style={[styles.roleChip, { backgroundColor: `${meta.color}18` }]}>
            <Text style={[styles.roleChipText, { color: meta.color }]}>
              Signing up as {meta.label}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/role")}>
              <Text style={[styles.changeRole, { color: meta.color }]}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Yene Lijoch and stay connected with your child's learning.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#777"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#777"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#777"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#777"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={21}
                  color="#777"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#777"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={
                    showConfirmPassword ? "eye-off-outline" : "eye-outline"
                  }
                  size={21}
                  color="#777"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.signupButton, { backgroundColor: meta.color }]}
            onPress={handleSignup}
            activeOpacity={0.8}
          >
            <Text style={styles.signupButtonText}>Create Account</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text style={[styles.loginLink, { color: meta.color }]}>
                {" "}
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F4EF",
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5DFD5",
  },
  roleChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    marginBottom: 18,
  },
  roleChipText: {
    fontWeight: "800",
    fontSize: 13,
  },
  changeRole: {
    fontWeight: "700",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2C2A26",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#8A847A",
    maxWidth: 340,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C2A26",
    marginBottom: 8,
  },
  inputWrapper: {
    height: 55,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5DFD5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#2C2A26",
  },
  signupButton: {
    height: 56,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 10,
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  loginText: {
    color: "#8A847A",
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "800",
  },
});
