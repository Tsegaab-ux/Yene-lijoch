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
  getOrganization,
  getPeopleForOrganization,
  personFullName,
} from "../../data/signupOrgs";
import { notify, notifyConfirm } from "../../utils/notify";

type Role = "parent" | "teacher";
type Relationship = "father" | "mother" | "guardian";

const ROLE_META: Record<
  Role,
  { color: string; home: "/parent" | "/teacher" }
> = {
  parent: { color: "#3D6B5A", home: "/parent" },
  teacher: { color: "#C45C26", home: "/teacher" },
};

export default function SignupPeople() {
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ role?: string; orgId?: string }>();

  const role = useMemo<Role>(() => {
    const raw = Array.isArray(params.role) ? params.role[0] : params.role;
    return raw === "teacher" ? "teacher" : "parent";
  }, [params.role]);

  const orgId = useMemo(() => {
    const raw = Array.isArray(params.orgId) ? params.orgId[0] : params.orgId;
    return Number(raw) || 0;
  }, [params.orgId]);

  const meta = ROLE_META[role];
  const org = getOrganization(orgId);
  const people = useMemo(() => getPeopleForOrganization(orgId), [orgId]);

  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [relationship, setRelationship] = useState<Relationship>("mother");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) => personFullName(p).toLowerCase().includes(q));
  }, [people, query]);

  const togglePerson = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const finish = () => {
    if (selectedIds.length === 0) {
      notify(
        t("common.error"),
        role === "parent" ? t("signup.pickChildren") : t("signup.pickStudents")
      );
      return;
    }

    // Payload-ready selection (no backend call yet)
    void {
      organization: orgId,
      student: selectedIds,
      ...(role === "parent" ? { relationship } : {}),
    };

    const roleLabel = t(`role.${role}`);
    notifyConfirm(
      t("common.success"),
      t("signup.success", { role: roleLabel }),
      t("signup.enterPortal"),
      () => router.replace(meta.home)
    );
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

        <StepDots active={3} total={3} color={meta.color} />

        <Text style={styles.title}>
          {role === "parent"
            ? t("signup.childrenTitle")
            : t("signup.studentsTitle")}
        </Text>
        <Text style={styles.subtitle}>
          {role === "parent"
            ? t("signup.childrenSub", { org: org?.name ?? "" })
            : t("signup.studentsSub", { org: org?.name ?? "" })}
        </Text>

        {org && (
          <View style={[styles.orgBadge, { backgroundColor: `${meta.color}14` }]}>
            <Ionicons name="business-outline" size={16} color={meta.color} />
            <Text style={[styles.orgBadgeText, { color: meta.color }]}>
              {org.name}
            </Text>
          </View>
        )}

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={20} color="#777" />
          <TextInput
            style={styles.searchInput}
            placeholder={
              role === "parent"
                ? t("signup.searchChildren")
                : t("signup.searchStudents")
            }
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
        </View>

        {role === "parent" && (
          <View style={styles.relBlock}>
            <Text style={styles.relLabel}>{t("signup.relationship")}</Text>
            <View style={styles.chipRow}>
              {(
                [
                  ["father", t("signup.father")],
                  ["mother", t("signup.mother")],
                  ["guardian", t("signup.guardian")],
                ] as const
              ).map(([value, label]) => {
                const active = relationship === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.relChip,
                      active && {
                        backgroundColor: meta.color,
                        borderColor: meta.color,
                      },
                    ]}
                    onPress={() => setRelationship(value)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.relChipText,
                        active && styles.relChipTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.empty}>{t("signup.peopleEmpty")}</Text>
        }
        renderItem={({ item }) => {
          const active = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              style={[
                styles.personCard,
                active && {
                  borderColor: meta.color,
                  backgroundColor: `${meta.color}12`,
                },
              ]}
              onPress={() => togglePerson(item.id)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: active ? meta.color : "#EFEAE2" },
                ]}
              >
                <Text
                  style={[styles.avatarText, active && { color: "#fff" }]}
                >
                  {item.first_name[0]}
                  {item.last_name[0]}
                </Text>
              </View>
              <View style={styles.personText}>
                <Text style={styles.personName}>{personFullName(item)}</Text>
                <Text style={styles.personMeta}>ID · {item.id}</Text>
              </View>
              <Ionicons
                name={active ? "checkbox" : "square-outline"}
                size={22}
                color={active ? meta.color : "#C4BBB0"}
              />
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          {t("signup.selectedCount", { count: selectedIds.length })}
        </Text>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            { backgroundColor: meta.color },
            selectedIds.length === 0 && styles.continueDisabled,
          ]}
          disabled={selectedIds.length === 0}
          onPress={finish}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>{t("signup.enterPortal")}</Text>
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
    marginBottom: 12,
  },
  orgBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 14,
  },
  orgBadgeText: {
    fontSize: 13,
    fontWeight: "700",
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
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#2C2A26",
  },
  relBlock: {
    marginBottom: 8,
  },
  relLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C2A26",
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  relChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5DFD5",
    backgroundColor: "#FFFFFF",
  },
  relChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2C2A26",
  },
  relChipTextActive: {
    color: "#FFFFFF",
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 140,
    gap: 10,
  },
  empty: {
    textAlign: "center",
    color: "#8A847A",
    marginTop: 40,
    fontSize: 14,
  },
  personCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E5DFD5",
    padding: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#6B655C",
  },
  personText: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2C2A26",
    marginBottom: 2,
  },
  personMeta: {
    fontSize: 12,
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
    gap: 10,
  },
  selectedCount: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: "#8A847A",
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
