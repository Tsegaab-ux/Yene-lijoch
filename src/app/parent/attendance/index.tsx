import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Screen,
  SoftCard,
  SectionLabel,
  ChildChip,
  AvatarBubble,
  PrimaryButton,
} from "../../../components/parent/ui";
import { ParentColors as C } from "../../../constants/parentTheme";
import { useSelectedChild } from "../../../contexts/SelectedChildContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useChildAttendance } from "@/hooks/useChildAttendance";
import { colorFor } from "@/utils/avatarColors";
import { createConversation } from "@/services/chatApi";
import { notify } from "@/utils/notify";
import { useChat } from "@/contexts/ChatContext";

// Format an ISO date "2026-09-21" → "September 21, 2026"
function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ParentAttendanceScreen() {
  const { childrenList, selectedChild, selectedId, setSelectedId, groupName } =
    useSelectedChild();
  const { t } = useLanguage();
  const { conversations, createConversation } = useChat();
  const [opening, setOpening] = useState(false);

  const { summary, records, isLoading, error } = useChildAttendance(
    selectedChild?.id
  );

  // Compute the attendance percentage from the summary.
  const percentage = useMemo(() => {
    if (!summary) return 0;
    const total = (summary.present ?? 0) + (summary.absent ?? 0);
    return total > 0 ? Math.round((summary.present / total) * 100) : 0;
  }, [summary]);

  // Derive the "days" list from the records.
  const days = useMemo(
    () =>
      records.map((r) => ({
        id: r.id,
        weekday: r.weekday ?? "",
        date: formatDate(r.lesson_date),
        lesson: r.lesson_title,
        status: r.status === "absent" ? "absent" : "present",
      })),
    [records]
  );

  const handleMessageTeacher = async () => {
    if (!selectedChild || opening) return;
    setOpening(true);
    try {
      // If the child already has a conversation, jump to it directly.
      const existing = conversations.find(
        (c) => c.childName === selectedChild.name
      );
      const conv =
        existing ?? (await createConversation(selectedChild.id));
      router.push(`/parent/messages/${conv.id}`);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        t("common.error");
      notify(t("common.error"), String(message));
    } finally {
      setOpening(false);
    }
  };

  // ---- Guard: no children -----------------------------------------
  if (!selectedChild) {
    return (
      <Screen>
        <Text style={styles.title}>{t("parent.attendanceTitle")}</Text>
        <Text style={styles.subtitle}>{t("parent.attendanceSub")}</Text>
        <SoftCard style={{ marginTop: 16 }}>
          <Text style={styles.childMeta}>{t("parent.noChildren")}</Text>
        </SoftCard>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>{t("parent.attendanceTitle")}</Text>
      <Text style={styles.subtitle}>{t("parent.attendanceSub")}</Text>

      {childrenList.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12, marginBottom: 8 }}
        >
          {childrenList.map((child) => (
            <ChildChip
              key={child.id}
              child={child}
              active={child.id === selectedId}
              onPress={() => setSelectedId(child.id)}
            />
          ))}
        </ScrollView>
      ) : null}

      <SoftCard style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <AvatarBubble
            initials={selectedChild.initials}
            color={colorFor(selectedChild.name)}
            size={52}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.childName}>{selectedChild.name}</Text>
            <Text style={styles.childMeta}>
              {groupName ?? selectedChild.groupName ?? ""}
              {selectedChild.grade ? ` · ${selectedChild.grade}` : ""}
            </Text>
          </View>
          <View style={styles.pctBox}>
            <Text style={styles.pct}>{percentage}%</Text>
            <Text style={styles.pctLabel}>{t("parent.rate")}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <SummaryItem
            value={`${summary?.present ?? 0}`}
            label={t("parent.present")}
            tone="success"
          />
          <SummaryItem
            value={`${summary?.absent ?? 0}`}
            label={t("parent.absent")}
            tone="danger"
          />
          <SummaryItem
            value={`${summary?.total ?? 0}`}
            label={t("parent.recorded")}
            tone="muted"
          />
        </View>

        <PrimaryButton
          label={
            opening
              ? t("parent.openingChat")
              : t("parent.messageTeacher")
          }
          icon="chatbubble-ellipses-outline"
          onPress={handleMessageTeacher}
        />
      </SoftCard>

      <SectionLabel title={t("parent.recentSundays")} />

      {isLoading && days.length === 0 ? (
        <SoftCard>
          <Text style={styles.childMeta}>{t("common.loading")}</Text>
        </SoftCard>
      ) : null}

      {error && days.length === 0 ? (
        <SoftCard>
          <Text style={[styles.childMeta, { color: C.danger }]}>{error}</Text>
        </SoftCard>
      ) : null}

      {!isLoading && !error && days.length === 0 ? (
        <SoftCard>
          <Text style={styles.childMeta}>
            {t("parent.noAttendance")}
          </Text>
        </SoftCard>
      ) : null}

      {days.map((day) => {
        const present = day.status === "present";
        return (
          <SoftCard key={day.id} style={styles.dayCard}>
            <View style={styles.dayRow}>
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: present ? C.successSoft : "#F8E8E6" },
                ]}
              >
                <Ionicons
                  name={present ? "checkmark" : "close"}
                  size={18}
                  color={present ? C.success : C.danger}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dayTitle}>
                  {day.weekday ? `${day.weekday}, ` : ""}
                  {day.date}
                </Text>
                <Text style={styles.dayLesson}>{day.lesson}</Text>
              </View>
              <Text
                style={[
                  styles.dayStatus,
                  { color: present ? C.success : C.danger },
                ]}
              >
                {present ? t("parent.present") : t("parent.absent")}
              </Text>
            </View>
          </SoftCard>
        );
      })}
    </Screen>
  );
}

function SummaryItem({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: "success" | "danger" | "muted";
}) {
  const color =
    tone === "success" ? C.success : tone === "danger" ? C.danger : C.muted;
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.4,
  },
  subtitle: { marginTop: 6, color: C.muted, fontSize: 14, fontWeight: "500" },
  summaryCard: { marginTop: 8, marginBottom: 8 },
  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  childName: { fontSize: 18, fontWeight: "700", color: C.text },
  childMeta: { marginTop: 3, color: C.muted, fontSize: 13 },
  pctBox: { alignItems: "center" },
  pct: { fontSize: 22, fontWeight: "800", color: C.primary },
  pctLabel: { fontSize: 11, color: C.muted, fontWeight: "600" },
  summaryRow: { flexDirection: "row", marginBottom: 8 },
  summaryItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  summaryValue: { fontSize: 22, fontWeight: "800" },
  summaryLabel: { marginTop: 4, fontSize: 12, color: C.muted, fontWeight: "600" },
  dayCard: { marginBottom: 10 },
  dayRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dayTitle: { fontSize: 14, fontWeight: "700", color: C.text },
  dayLesson: { marginTop: 3, fontSize: 13, color: C.muted },
  dayStatus: { fontSize: 12, fontWeight: "800" },
});