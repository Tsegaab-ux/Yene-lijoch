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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ParentColors as C } from "../../constants/parentTheme";
import { ParentChild } from "@/types/parentTypes";

type ChildLike = {
  id: string;
  name: string;
  initials: string;
};

type IconButtonProps = {
  name: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  badgeCount?: number;
  showDot?: boolean;
  accessibilityLabel: string;
};

export function IconButton({
  name,
  onPress,
  badgeCount = 0,
  showDot = false,
  accessibilityLabel,
}: IconButtonProps) {
  const showBadge = badgeCount > 0;
  const label = showBadge
    ? `${accessibilityLabel}, ${badgeCount} unread`
    : accessibilityLabel;

  return (
    <TouchableOpacity
      style={styles.iconBtn}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name={name} size={20} color="#fff" />

      {showBadge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {badgeCount > 99 ? "99+" : badgeCount}
          </Text>
        </View>
      ) : showDot ? (
        <View style={styles.dot} />
      ) : null}
    </TouchableOpacity>
  );
}

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

export function GhostButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.ghostBtn}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.ghostBtnText}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={C.primary} />
    </TouchableOpacity>
  );
}

export function BackHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.backHeader}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={C.text} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.backTitle}>{title}</Text>
        {subtitle ? <Text style={styles.backSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export function AvatarBubble({
  initials,
  color,
  size = 44,
}: {
  initials: string;
  color: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }]}>
        {initials}
      </Text>
    </View>
  );
}

export function ChildChip({
  child,
  active,
  onPress,
}: {
  child: ParentChild;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.childChip, active && styles.childChipActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <AvatarBubble
        initials={child.initials}
        color={C.primary}
        size={28}
      />
      <Text style={[styles.childChipText, active && styles.childChipTextActive]}>
        {child.name.split(" ")[0]}
      </Text>
    </TouchableOpacity>
  );
}

export function Card(props: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  return <SoftCard {...props} />;
}

export function TopBar({
  title,
  subtitle,
  showBell = true,
  unread = 0,
  onBack,
}: {
  title: string;
  subtitle?: string;
  showBell?: boolean;
  unread?: number;
  onBack?: () => void;
}) {
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarLeft}>
        {onBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.backTitle}>{title}</Text>
          {subtitle ? <Text style={styles.backSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {showBell ? (
        <TouchableOpacity
          style={styles.bell}
          onPress={() => router.push("/parent/notifications")}
        >
          <Ionicons name="notifications-outline" size={22} color={C.text} />
          {unread > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function Avatar({
  child,
  size = 44,
}: {
  child: ParentChild;
  size?: number;
}) {
  return (
    <AvatarBubble
      initials={child.initials}
      color={C.primary}
      size={size}
    />
  );
}

export function MenuRow({
  icon,
  label,
  title,
  subtitle,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  title?: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const heading = title ?? label ?? "";
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.85}>
      <View
        style={[
          styles.menuIcon,
          danger && { backgroundColor: "#F8E8E6" },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={danger ? C.danger : C.primary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, danger && { color: C.danger }]}>
          {heading}
        </Text>
        {subtitle ? <Text style={styles.menuSub}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.secondary,
  },
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    paddingTop: 12,
    paddingBottom: 36,
  },
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
        shadowColor: C.shadow,
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
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
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  ghostBtn: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ghostBtnText: {
    color: C.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  backHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.bgSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  backTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: C.text,
  },
  backSubtitle: {
    marginTop: 2,
    color: C.muted,
    fontSize: 13,
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
  },
  childChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 8,
  },
  childChipActive: {
    backgroundColor: C.primarySoft,
    borderColor: C.primary,
  },
  childChipText: {
    fontWeight: "700",
    color: C.muted,
    fontSize: 13,
  },
  childChipTextActive: {
    color: C.primary,
  },
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
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
  },
  menuSub: {
    marginTop: 2,
    fontSize: 12,
    color: C.muted,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  topBarLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.bgSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.secondary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
});
