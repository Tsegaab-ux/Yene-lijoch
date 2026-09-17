import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { LanguageToggle } from "../../components/LanguageToggle";
import { useLanguage } from "../../contexts/LanguageContext";
import { StepDots } from "../../components/auth/StepDots";
import {
  Organization,
  searchOrganizations,
} from "../../data/signupOrgs";

type Role = "parent" | "teacher";

const ROLE_COLOR: Record<Role, string> = {
  parent: "#3D6B5A",
  teacher: "#C45C26",
};

export default function SignupOrganization() {
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ role?: string }>();
  const role = useMemo<Role>(() => {
    const raw = Array.isArray(params.role) ? params.role[0] : params.role;
    return raw === "teacher" ? "teacher" : "parent";
  }, [params.role]);

  const color = ROLE_COLOR[role];
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Organization | null>(null);

  const results = useMemo(() => searchOrganizations(query), [query]);

  const continueNext = () => {
    if (!selected) return;
    router.push(`/signup-people?role=${role}&orgId=${selected.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top}>
        <View style={styles.langRow}>
          <LanguageToggle tone="dark" />
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2C2A26" />
        </TouchableOpacity>

        <StepDots active={2} total={3} color={color} />

        <Text style={styles.title}>{t("signup.orgTitle")}</Text>
        <Text style={styles.subtitle}>{t("signup.orgSub")}</Text>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={20} color="#777" />
          <TextInput
            style={styles.searchInput}
            placeholder={t("signup.orgSearchPlaceholder")}
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.empty}>{t("signup.orgEmpty")}</Text>
        }
        renderItem={({ item }) => {
          const active = selected?.id === item.id;
          return (
            <TouchableOpacity
              style={[
                styles.orgCard,
                active && { borderColor: color, backgroundColor: `${color}12` },
              ]}
              onPress={() => setSelected(item)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.orgIcon,
                  { backgroundColor: active ? color : "#EFEAE2" },
                ]}
              >
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={active ? "#fff" : "#6B655C"}
                />
              </View>
              <View style={styles.orgText}>
                <Text style={styles.orgName}>{item.name}</Text>
                <Text style={styles.orgCity}>{item.city}</Text>
              </View>
              {active && (
                <Ionicons name="checkmark-circle" size={22} color={color} />
              )}
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            { backgroundColor: color },
            !selected && styles.continueDisabled,
          ]}
          disabled={!selected}
          onPress={continueNext}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>{t("common.continue")}</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F4EF",
  },
  top: {
    paddingHorizontal: 24,
    paddingTop: 12,
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
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C2A26",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#8A847A",
    marginBottom: 18,
  },
  searchWrap: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5DFD5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#2C2A26",
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 10,
  },
  empty: {
    textAlign: "center",
    color: "#8A847A",
    marginTop: 40,
    fontSize: 14,
  },
  orgCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E5DFD5",
    padding: 14,
  },
  orgIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  orgText: {
    flex: 1,
  },
  orgName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2C2A26",
    marginBottom: 2,
  },
  orgCity: {
    fontSize: 13,
    color: "#8A847A",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    paddingBottom: 32,
    backgroundColor: "#F7F4EF",
    borderTopWidth: 1,
    borderTopColor: "#E5DFD5",
  },
  continueBtn: {
    height: 56,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  continueDisabled: {
    opacity: 0.4,
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
