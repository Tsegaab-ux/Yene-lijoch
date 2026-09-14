import React, { useMemo } from "react";
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
import { useSharedContent } from "../../../contexts/SharedContentContext";

export default function ParentAttendanceScreen() {
  const { childrenList, selectedChild, selectedId, setSelectedId, groupName } =
    useSelectedChild();
  const { getAttendanceForStudent, getAttendanceSummary } = useSharedContent();

  const days = useMemo(
    () => getAttendanceForStudent(selectedId),
    [getAttendanceForStudent, selectedId]
  );
  const summary = useMemo(
    () => getAttendanceSummary(selectedId),
    [getAttendanceSummary, selectedId]
  );

  return (
    <Screen>
      <Text style={styles.title}>Attendance</Text>
      <Text style={styles.subtitle}>
        Sunday school attendance for your children
      </Text>

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

      <SoftCard style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <AvatarBubble
            initials={selectedChild.initials}
            color={selectedChild.avatarColor}
            size={52}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.childName}>{selectedChild.name}</Text>
            <Text style={styles.childMeta}>
              {groupName} · {selectedChild.grade}
            </Text>
          </View>
          <View style={styles.pctBox}>
            <Text style={styles.pct}>{selectedChild.attendance}%</Text>
            <Text style={styles.pctLabel}>Rate</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <SummaryItem value={`${summary.present}`} label="Present" tone="success" />
          <SummaryItem value={`${summary.absent}`} label="Absent" tone="danger" />
          <SummaryItem value={`${summary.total}`} label="Recorded" tone="muted" />
        </View>

        <PrimaryButton
          label="Message Teacher"
          icon="chatbubble-ellipses-outline"
          onPress={() => router.push("/parent/messages")}
        />
      </SoftCard>

      <SectionLabel title="Recent Sundays" />
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
                  {day.weekday}, {day.date}
                </Text>
                <Text style={styles.dayLesson}>{day.lesson}</Text>
              </View>
              <Text
                style={[
                  styles.dayStatus,
                  { color: present ? C.success : C.danger },
                ]}
              >
                {present ? "Present" : "Absent"}
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
