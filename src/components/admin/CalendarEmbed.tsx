import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AdminColors as C } from "../../constants/adminTheme";
import { formatLongDate } from "../../utils/mediaPicker";

type Props = {
  value: string;
  onChange: (label: string, date: Date) => void;
};

function parseLabel(label: string): Date | null {
  const parsed = Date.parse(label);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed);
}

export function CalendarEmbed({ value, onChange }: Props) {
  const selected = parseLabel(value) ?? new Date(2026, 8, 21);
  const [cursor, setCursor] = useState(
    new Date(selected.getFullYear(), selected.getMonth(), 1)
  );

  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();
    const cells: Array<number | null> = [];
    for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
    for (let d = 1; d <= total; d += 1) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const monthLabel = cursor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
          }
        >
          <Ionicons name="chevron-back" size={18} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.month}>{monthLabel}</Text>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
          }
        >
          <Ionicons name="chevron-forward" size={18} color={C.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <Text key={`${d}-${i}`} style={styles.weekDay}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day, index) => {
          if (!day) {
            return <View key={`empty-${index}`} style={styles.cell} />;
          }
          const date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
          const active =
            date.getFullYear() === selected.getFullYear() &&
            date.getMonth() === selected.getMonth() &&
            date.getDate() === selected.getDate();

          return (
            <TouchableOpacity
              key={`day-${day}`}
              style={[styles.cell, active && styles.cellActive]}
              onPress={() => onChange(formatLongDate(date), date)}
            >
              <Text style={[styles.dayText, active && styles.dayTextActive]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.selected}>Selected: {formatLongDate(selected)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  month: {
    fontSize: 15,
    fontWeight: "800",
    color: C.text,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  weekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  cellActive: {
    backgroundColor: C.primary,
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
  },
  dayTextActive: {
    color: "#fff",
  },
  selected: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
    color: C.primary,
  },
});
