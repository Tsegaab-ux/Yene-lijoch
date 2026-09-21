import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PhoneShell, usePhoneFrame } from "../../components/auth/PhoneShell";
import { LanguageToggle } from "../../components/LanguageToggle";
import { useLanguage } from "../../contexts/LanguageContext";

export type AuthRole = "parent" | "teacher" | "admin";

type RoleCard = {
  id: AuthRole;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  soft: string;
};

const ROLE_BASE: Omit<RoleCard, "title" | "subtitle">[] = [
  {
    id: "parent",
    icon: "home-outline",
    color: "#3D6B5A",
    soft: "#E3EFE9",
  },
  {
    id: "teacher",
    icon: "school-outline",
    color: "#C45C26",
    soft: "#F8E8DC",
  },
  {
    id: "admin",
    icon: "shield-checkmark-outline",
    color: "#2D6A4F",
    soft: "#E4F2EB",
  },
];

export default function RoleSelectScreen() {
  const { t } = useLanguage();
  const { frameW, frameH } = usePhoneFrame();
  const listRef = useRef<FlatList<RoleCard>>(null);
  const [index, setIndex] = useState(0);

  const ROLES = useMemo<RoleCard[]>(
    () =>
      ROLE_BASE.map((role) => ({
        ...role,
        title: t(`role.${role.id}`),
        subtitle: t(`role.${role.id}Desc`),
      })),
    [t]
  );

  const selected = ROLES[index];

  const cardGap = 14;
  const cardWidth = Math.min(frameW * 0.82, 300);
  const side = (frameW - cardWidth) / 2;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(
      e.nativeEvent.contentOffset.x / (cardWidth + cardGap)
    );
    if (next >= 0 && next < ROLES.length && next !== index) {
      setIndex(next);
    }
  };

  const continueSignup = () => {
    router.push({
      pathname: "/(auth)/signup",
      params: { role: selected.id },
    });
  };

  return (
    <PhoneShell background="#EDE8E0">
      <View style={[styles.root, { width: frameW, height: frameH }]}>
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <View style={styles.langRow}>
            <LanguageToggle tone="dark" />
          </View>

          <View style={styles.header}>
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#2C2A26" />
            </TouchableOpacity>
            <Text style={styles.kicker}>{t("role.kicker")}</Text>
            <Text style={styles.title}>{t("role.title")}</Text>
            <Text style={styles.subtitle}>{t("role.subtitle")}</Text>
          </View>

          <View style={styles.carousel}>
            <FlatList
              ref={listRef}
              data={ROLES}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardWidth + cardGap}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingHorizontal: side,
                alignItems: "center",
              }}
              onScroll={onScroll}
              scrollEventThrottle={16}
              renderItem={({ item, index: i }) => (
                <TouchableOpacity
                  activeOpacity={0.92}
                  onPress={() => {
                    setIndex(i);
                    listRef.current?.scrollToOffset({
                      offset: i * (cardWidth + cardGap),
                      animated: true,
                    });
                  }}
                  style={[
                    styles.card,
                    {
                      width: cardWidth,
                      backgroundColor: item.soft,
                      borderColor: i === index ? item.color : "transparent",
                      marginRight: i === ROLES.length - 1 ? 0 : cardGap,
                    },
                  ]}
                >
                  <View
                    style={[styles.iconWrap, { backgroundColor: item.color }]}
                  >
                    <Ionicons name={item.icon} size={30} color="#fff" />
                  </View>
                  <Text style={[styles.cardTitle, { color: item.color }]}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardBody}>{item.subtitle}</Text>
                  {i === index ? (
                    <View
                      style={[
                        styles.selectedPill,
                        { backgroundColor: item.color },
                      ]}
                    >
                      <Ionicons name="checkmark" size={14} color="#fff" />
                      <Text style={styles.selectedText}>{t("common.selected")}</Text>
                    </View>
                  ) : (
                    <Text style={styles.tapHint}>{t("role.tapOrSlide")}</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>

          <View style={styles.dots}>
            {ROLES.map((role, i) => (
              <View
                key={role.id}
                style={[
                  styles.dot,
                  i === index && {
                    width: 22,
                    backgroundColor: selected.color,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.cta, { backgroundColor: selected.color }]}
              onPress={continueSignup}
              activeOpacity={0.88}
            >
              <Text style={styles.ctaText}>
                {t("role.continueAs", { role: selected.title })}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.loginLink}>
                {t("role.alreadyRegistered")}{" "}
                <Text style={styles.loginBold}>{t("common.login")}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </PhoneShell>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#F7F4EF",
  },
  safe: {
    flex: 1,
  },
  langRow: {
    paddingHorizontal: 20,
    paddingTop: 4,
    alignItems: "flex-end",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    marginBottom: 12,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5DFD5",
  },
  kicker: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#8A847A",
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#2C2A26",
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#8A847A",
  },
  carousel: {
    flex: 1,
    justifyContent: "center",
    minHeight: 280,
  },
  card: {
    minHeight: 280,
    borderRadius: 24,
    padding: 22,
    borderWidth: 2,
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#2C2A26",
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  cardBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#5C564E",
  },
  selectedPill: {
    alignSelf: "flex-start",
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  selectedText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },
  tapHint: {
    marginTop: 18,
    color: "#8A847A",
    fontWeight: "600",
    fontSize: 13,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D5CFC5",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 12,
  },
  cta: {
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  loginLink: {
    textAlign: "center",
    color: "#8A847A",
    fontSize: 13,
  },
  loginBold: {
    color: "#C45C26",
    fontWeight: "800",
  },
});
