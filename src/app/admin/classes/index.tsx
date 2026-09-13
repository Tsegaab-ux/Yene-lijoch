import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Screen, TopBar, Card, Badge } from "../../../components/admin/ui";
import { useAdminData } from "../../../contexts/AdminDataContext";
import { AdminColors as C } from "../../../constants/adminTheme";

export default function ClassesScreen() {
  const { classes, teachers } = useAdminData();

  return (
    <Screen>
      <TopBar title="Classes" subtitle="Assign teachers to classes" />

      {classes.map((item) => {
        const teacher = teachers.find((t) => t.id === item.teacherId);
        return (
          <Card
            key={item.id}
            style={styles.card}
            onPress={() => router.push(`/admin/classes/${item.id}`)}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.grade} · {item.subject} · {item.room}
            </Text>
            <Text style={styles.meta}>{item.studentCount} students</Text>
            <View style={{ marginTop: 10 }}>
              <Badge
                label={teacher ? teacher.name : "No teacher"}
                tone={teacher ? "success" : "warning"}
              />
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  name: { fontSize: 16, fontWeight: "800", color: C.text },
  meta: { marginTop: 4, color: C.muted, fontSize: 13 },
});
