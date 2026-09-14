import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StyleProp,
  ViewStyle,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AdminColors as C } from "../../constants/adminTheme";

export function Screen({
  children,
  padded = true,
}: {
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          padded && { paddingHorizontal: 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

export function SoftCard({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={0.88}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export const Card = SoftCard;

export function TopBar({
  title,
  subtitle,
  onBack,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.topBar}>
      <View style={styles.topLeft}>
        {onBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>{title}</Text>
          {subtitle ? <Text style={styles.topSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {actionLabel ? (
        <TouchableOpacity style={styles.actionBtn} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <TouchableOpacity
      style={styles.primaryBtn}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {icon ? <Ionicons name={icon} size={18} color="#fff" /> : null}
      <Text style={styles.primaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        multiline={multiline}
      />
    </View>
  );
}

export function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.pill, active && styles.pillActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function MenuRow({
  icon,
  title,
  subtitle,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.85}>
      <View
        style={[styles.menuIcon, danger && { backgroundColor: "#FCE8E8" }]}
      >
        <Ionicons name={icon} size={18} color={danger ? C.danger : C.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuTitle, danger && { color: C.danger }]}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.menuSub}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingTop: 12, paddingBottom: 36 },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    ...Platform.select({
      ios: {
        shadowColor: "#1B2B23",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  topLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: { fontSize: 22, fontWeight: "700", color: C.text },
  topSubtitle: { marginTop: 2, color: C.muted, fontSize: 13 },
  actionBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  primaryBtn: {
    marginTop: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: C.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  fieldLabel: {
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
    fontSize: 13,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: C.text,
    backgroundColor: "#fff",
  },
  inputMulti: { height: 90, paddingTop: 12, textAlignVertical: "top" },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: C.primarySoft,
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 8,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontWeight: "700", fontSize: 12, color: C.muted },
  pillTextActive: { color: "#fff" },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: { fontSize: 15, fontWeight: "600", color: C.text },
  menuSub: { marginTop: 2, fontSize: 12, color: C.muted },
});
