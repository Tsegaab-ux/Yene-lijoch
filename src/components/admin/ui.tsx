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
        contentContainerStyle={[styles.scroll, padded && { paddingHorizontal: 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

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
            <Ionicons name="arrow-back" size={22} color={C.text} />
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

export function Card({
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
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionHeader({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function StatCard({
  label,
  value,
  icon,
  onPress,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}) {
  return (
    <Card style={styles.statCard} onPress={onPress}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={20} color={C.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

export function Badge({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "success" | "danger" | "warning";
}) {
  const bg =
    tone === "success"
      ? C.successSoft
      : tone === "danger"
        ? "#FDECEC"
        : tone === "warning"
          ? "#FFF8E6"
          : C.primarySoft;
  const color =
    tone === "success"
      ? C.success
      : tone === "danger"
        ? C.danger
        : tone === "warning"
          ? "#B7791F"
          : C.primary;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
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
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.menuIcon, danger && { backgroundColor: "#FDECEC" }]}>
        <Ionicons name={icon} size={20} color={danger ? C.danger : C.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuTitle, danger && { color: C.danger }]}>{title}</Text>
        {subtitle ? <Text style={styles.menuSub}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.muted} />
    </TouchableOpacity>
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
      onPress={onPress}
      style={[styles.pill, active && styles.pillActive]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function ProgressBar({ value, color = C.primary }: { value: number; color?: string }) {
  return (
    <View style={styles.barTrack}>
      <View
        style={[styles.barFill, { width: `${Math.min(value, 100)}%`, backgroundColor: color }]}
      />
    </View>
  );
}

export function goAdmin(path: string) {
  router.push(path as any);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingTop: 8, paddingBottom: 32 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    gap: 10,
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  topTitle: { fontSize: 24, fontWeight: "800", color: C.text },
  topSubtitle: { marginTop: 2, color: C.muted, fontSize: 13 },
  actionBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: C.text },
  sectionAction: { color: C.primary, fontWeight: "700", fontSize: 13 },
  statCard: { flex: 1, minWidth: "47%" },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: "800", color: C.text },
  statLabel: { marginTop: 4, color: C.muted, fontSize: 12, fontWeight: "600" },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: "800", textTransform: "capitalize" },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  menuSub: { marginTop: 2, color: C.muted, fontSize: 12 },
  barTrack: {
    height: 8,
    backgroundColor: C.primarySoft,
    borderRadius: 8,
    overflow: "hidden",
  },
  barFill: { height: 8, borderRadius: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 8,
    marginBottom: 8,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { color: C.muted, fontWeight: "700", fontSize: 13 },
  pillTextActive: { color: "#fff" },
});
