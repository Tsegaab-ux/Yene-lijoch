import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Screen, TopBar, Card, Badge } from "../../../components/admin/ui";
import { useAdminData } from "../../../contexts/AdminDataContext";
import { AdminColors as C } from "../../../constants/adminTheme";

export default function TeachersScreen() {
  const { teachers, classes } = useAdminData();

  return (
    <Screen>
      <TopBar
        title="Teachers"
        subtitle="Add and control teacher accounts"
        actionLabel="+ Add"
        onAction={() => router.push("/admin/teachers/add")}
      />

      {teachers.map((teacher) => {
        const assigned = classes.filter((c) => c.teacherId === teacher.id);
        return (
          <Card
            key={teacher.id}
            style={styles.card}
            onPress={() => router.push(`/admin/teachers/${teacher.id}`)}
          >
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{teacher.name}</Text>
                <Text style={styles.meta}>{teacher.email}</Text>
                <Text style={styles.meta}>{teacher.subject}</Text>
              </View>
              <Badge
                label={teacher.status}
                tone={teacher.status === "active" ? "success" : "danger"}
              />
            </View>
            <Text style={styles.assigned}>
              Classes: {assigned.length > 0 ? assigned.map((c) => c.name).join(", ") : "None"}
            </Text>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  name: { fontSize: 16, fontWeight: "800", color: C.text },
  meta: { marginTop: 3, color: C.muted, fontSize: 13 },
  assigned: { marginTop: 10, color: C.primary, fontWeight: "600", fontSize: 12 },
});
