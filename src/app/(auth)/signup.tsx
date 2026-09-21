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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { LanguageToggle } from "../../components/LanguageToggle";
import { StepDots } from "../../components/auth/StepDots";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

type Role = "parent" | "teacher" | "admin";

const ROLE_META: Record<
  Role,
  { color: string; home: "/parent" | "/teacher" | "/admin" }
> = {
  parent: { color: "#3D6B5A", home: "/parent" },
  teacher: { color: "#C45C26", home: "/teacher" },
  admin: { color: "#2D6A4F", home: "/admin" },
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function Signup() {
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ role?: string }>();
  const role = useMemo<Role>(() => {
    const raw = Array.isArray(params.role) ? params.role[0] : params.role;
    if (raw === "teacher" || raw === "admin" || raw === "parent") return raw;
    return "parent";
  }, [params.role]);

  const meta = ROLE_META[role];
  const roleLabel = t(`role.${role}`);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();

  const [contact, setContact] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");

  const goToOrganization = () => {
    router.push(`/signup-organization?role=${role}`);
  };

  const handleContinue = () => {
    setFormError("");

    if (password !== confirmPassword) {
      const msg = t("signup.passwordMismatch");
      setFormError(msg);
      notify(t("common.error"), msg);
      return;
    }
    if (password.length < 6) {
      const msg = t("signup.passwordShort");
      setFormError(msg);
      notify(t("common.error"), msg);
      return;
    }

    if (role === "parent") {
      if (!username.trim() || !email.trim() || !password) {
        const msg = t("signup.missing");
        setFormError(msg);
        notify(t("common.error"), msg);
        return;
      }
      if (dateOfBirth.trim() && !DATE_RE.test(dateOfBirth.trim())) {
        const msg = t("signup.invalidDate");
        setFormError(msg);
        notify(t("common.error"), msg);
        return;
      }
      goToOrganization();
      return;
    }

    if (role === "teacher") {
      if (
        !username.trim() ||
        !email.trim() ||
        !firstName.trim() ||
        !lastName.trim() ||
        !password
      ) {
        const msg = t("signup.missing");
        setFormError(msg);
        notify(t("common.error"), msg);
        return;
      }
      goToOrganization();
      return;
    }

    if (!fullName || !email || !phone || !password) {
      const msg = t("signup.missing");
      setFormError(msg);
      notify(t("common.error"), msg);
      return;
    }

    notifyConfirm(
      t("common.success"),
      t("signup.success", { role: roleLabel }),
      t("common.continue"),
      () => router.replace(meta.home)
    );
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
          <View style={styles.langRow}>
            <LanguageToggle tone="dark" />
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2C2A26" />
          </TouchableOpacity>

          <StepDots active={1} total={role === "admin" ? 1 : 3} color={meta.color} />

          <View style={[styles.roleChip, { backgroundColor: `${meta.color}18` }]}>
            <Text style={[styles.roleChipText, { color: meta.color }]}>
              {t("signup.signingAs", { role: roleLabel })}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/role")}>
              <Text style={[styles.changeRole, { color: meta.color }]}>
                {t("common.change")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>{t("signup.title")}</Text>
            <Text style={styles.subtitle}>
              {role === "admin"
                ? t("signup.subtitle")
                : t("signup.accountStepSub")}
            </Text>
          </View>

          {role === "parent" && (
            <>
              <Field
                label={t("signup.username")}
                icon="person-outline"
                placeholder={t("signup.usernamePlaceholder")}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              <Field
                label={t("signup.email")}
                icon="mail-outline"
                placeholder={t("signup.emailPlaceholder")}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Field
                label={`${t("signup.contact")} (${t("signup.optional")})`}
                icon="call-outline"
                placeholder={t("signup.contactPlaceholder")}
                value={contact}
                onChangeText={setContact}
                keyboardType="phone-pad"
              />
              <Field
                label={`${t("signup.dateOfBirth")} (${t("signup.optional")})`}
                icon="calendar-outline"
                placeholder={t("signup.dateOfBirthPlaceholder")}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                autoCapitalize="none"
              />
              <Field
                label={`${t("signup.address")} (${t("signup.optional")})`}
                icon="location-outline"
                placeholder={t("signup.addressPlaceholder")}
                value={address}
                onChangeText={setAddress}
              />
            </>
          )}

          {role === "teacher" && (
            <>
              <Field
                label={t("signup.username")}
                icon="person-outline"
                placeholder={t("signup.usernamePlaceholder")}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              <Field
                label={t("signup.email")}
                icon="mail-outline"
                placeholder={t("signup.emailPlaceholder")}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Field
                label={t("signup.firstName")}
                icon="person-outline"
                placeholder={t("signup.firstNamePlaceholder")}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              <Field
                label={t("signup.lastName")}
                icon="person-outline"
                placeholder={t("signup.lastNamePlaceholder")}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </>
          )}

          {role === "admin" && (
            <>
              <Field
                label={t("signup.fullName")}
                icon="person-outline"
                placeholder={t("signup.fullNamePlaceholder")}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
              <Field
                label={t("signup.email")}
                icon="mail-outline"
                placeholder={t("signup.emailPlaceholder")}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Field
                label={t("signup.phone")}
                icon="call-outline"
                placeholder={t("signup.phonePlaceholder")}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </>
          )}

          <PasswordFields
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            t={t}
          />

          {!!formError && <Text style={styles.formError}>{formError}</Text>}

          <TouchableOpacity
            style={[styles.signupButton, { backgroundColor: meta.color }]}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.signupButtonText}>
              {role === "admin" ? t("signup.create") : t("common.continue")}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t("signup.already")}</Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text style={[styles.loginLink, { color: meta.color }]}>
                {" "}
                {t("common.login")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

function Field({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: FieldProps) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name={icon} size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </View>
    </View>
  );
}

type PasswordProps = {
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (v: boolean) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
};

function PasswordFields({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  t,
}: PasswordProps) {
  return (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t("signup.password")}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#777"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder={t("signup.passwordPlaceholder")}
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
        <Text style={styles.label}>{t("signup.confirmPassword")}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#777"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder={t("signup.confirmPlaceholder")}
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={21}
              color="#777"
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
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
  langRow: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
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
  formError: {
    color: "#B42318",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
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
