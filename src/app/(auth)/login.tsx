import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LanguageToggle } from "../../components/LanguageToggle";
import { useLanguage } from "../../contexts/LanguageContext";

export default function LoginScreen() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert(t("common.error"), t("login.missing"));
      return;
    }

    // Temporary UI/demo login system
    if (email === "parent@test.com") {
      router.replace("/parent");
      return;
    }

    if (email === "teacher@test.com") {
      router.replace("/teacher");
      return;
    }

    if (email === "admin@test.com") {
      router.replace("/admin");
      return;
    }

    Alert.alert(t("login.demoTitle"), t("login.demoHint"));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.langRow}>
        <LanguageToggle tone="dark" />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{t("login.title")}</Text>

        <Text style={styles.subtitle}>{t("login.subtitle")}</Text>

        <Text style={styles.label}>{t("login.email")}</Text>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#77758A"
            style={styles.inputIcon}
          />

          <TextInput
            style={styles.input}
            placeholder={t("login.emailPlaceholder")}
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Text style={styles.label}>{t("login.password")}</Text>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#77758A"
            style={styles.inputIcon}
          />

          <TextInput
            style={styles.input}
            placeholder={t("login.passwordPlaceholder")}
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={21}
              color="#77758A"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.forgot}
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          <Text style={styles.forgotText}>{t("login.forgot")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{t("login.login")}</Text>

          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/role")}>
          <Text style={styles.signup}>
            {t("login.noAccount")}{" "}
            <Text style={styles.signupBold}>{t("common.signup")}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9F1",
  },

  langRow: {
    paddingHorizontal: 30,
    paddingTop: 8,
    alignItems: "flex-end",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#25233A",
  },

  subtitle: {
    fontSize: 15,
    color: "#77758A",
    marginTop: 8,
    marginBottom: 35,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#25233A",
    marginBottom: 8,
  },

  inputWrapper: {
    height: 55,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E5EF",
    borderRadius: 16,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#25233A",
  },

  eyeButton: {
    padding: 5,
  },

  forgot: {
    alignItems: "flex-end",
    marginBottom: 25,
  },

  forgotText: {
    color: "#6C63FF",
    fontWeight: "600",
  },

  button: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  signup: {
    textAlign: "center",
    color: "#77758A",
    marginTop: 25,
  },

  signupBold: {
    color: "#6C63FF",
    fontWeight: "700",
  },
});
