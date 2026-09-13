import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  TopBar,
  Card,
  SectionHeader,
  StatCard,
  goAdmin,
} from "../../components/admin/ui";
import { useAdminData } from "../../contexts/AdminDataContext";
import { ADMIN } from "../../data/adminMock";
import { AdminColors as C } from "../../constants/adminTheme";

export default function AdminHome() {
  const { teachers, children, classes, events, lessons } = useAdminData();
  const activeTeachers = teachers.filter((t) => t.status === "active").length;
  const parentEvents = events.filter((e) => e.notifyParents).length;

  return (
    <Screen>
      <TopBar
        title={`Admin · ${ADMIN.name.split(" ")[0]}`}
        subtitle={ADMIN.school}
      />

      <Card style={styles.hero}>
        <Text style={styles.heroTitle}>School Control Center</Text>
        <Text style={styles.heroSub}>
          Manage teachers, children, classes, events, and lesson progress.
        </Text>
      </Card>

      <View style={styles.stats}>
        <StatCard
          label="Teachers"
          value={`${activeTeachers}/${teachers.length}`}
          icon="school-outline"
          onPress={() => router.push("/admin/teachers")}
        />
        <StatCard
          label="Children"
          value={`${children.length}`}
          icon="happy-outline"
          onPress={() => router.push("/admin/children")}
        />
        <StatCard
          label="Classes"
          value={`${classes.length}`}
          icon="people-outline"
          onPress={() => router.push("/admin/classes")}
        />
        <StatCard
          label="Events"
          value={`${parentEvents}`}
          icon="calendar-outline"
          onPress={() => router.push("/admin/more/events")}
        />
      </View>

      <SectionHeader title="Quick Actions" />
      <View style={styles.actions}>
        <Action icon="person-add-outline" label="Add Teacher" onPress={() => goAdmin("/admin/teachers/add")} />
        <Action icon="add-circle-outline" label="Add Child" onPress={() => goAdmin("/admin/children/add")} />
        <Action icon="link-outline" label="Assign Class" onPress={() => router.push("/admin/classes")} />
        <Action icon="megaphone-outline" label="Add Event" onPress={() => goAdmin("/admin/more/events/add")} />
      </View>

      <SectionHeader
        title="Recent Events"
        action="See all"
        onPress={() => goAdmin("/admin/more/events")}
      />
      {events.slice(0, 2).map((event) => (
        <Card key={event.id} style={styles.listCard}>
          <Text style={styles.kicker}>{event.audience}</Text>
          <Text style={styles.cardTitle}>{event.title}</Text>
          <Text style={styles.meta}>
            {event.date} · {event.time}
          </Text>
          {event.notifyParents ? (
            <Text style={styles.notify}>Parents will be notified</Text>
          ) : null}
        </Card>
      ))}

      <SectionHeader
        title="Lesson Progress"
        action="Manage"
        onPress={() => goAdmin("/admin/more/lessons")}
      />
      {lessons.slice(0, 2).map((lesson) => (
        <Card key={lesson.id} style={styles.listCard}>
          <Text style={styles.cardTitle}>{lesson.title}</Text>
          <Text style={styles.meta}>
            {lesson.subject} · {lesson.progress}% · {lesson.status}
          </Text>
        </Card>
      ))}
    </Screen>
  );
}

function Action({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.action} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={20} color={C.primary} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: C.primarySoft, borderColor: C.accentSoft },
  heroTitle: { fontSize: 18, fontWeight: "800", color: C.text },
  heroSub: { marginTop: 6, color: C.muted, lineHeight: 20 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  action: { width: "47%", alignItems: "center", marginBottom: 8 },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionLabel: { fontSize: 12, fontWeight: "700", color: C.text, textAlign: "center" },
  listCard: { marginBottom: 10 },
  kicker: { color: C.primary, fontWeight: "800", fontSize: 12, textTransform: "capitalize", marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: C.text },
  meta: { marginTop: 4, color: C.muted, fontSize: 13 },
  notify: { marginTop: 6, color: C.success, fontWeight: "700", fontSize: 12 },
});
