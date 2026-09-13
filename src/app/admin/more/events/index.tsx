import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Screen, TopBar, Card, Badge } from "../../../../components/admin/ui";
import { useAdminData } from "../../../../contexts/AdminDataContext";
import { AdminColors as C } from "../../../../constants/adminTheme";

export default function EventsScreen() {
  const { events } = useAdminData();

  return (
    <Screen>
      <TopBar
        title="Events"
        subtitle="Notify parents and teachers"
        actionLabel="+ Add"
        onAction={() => router.push("/admin/more/events/add")}
        onBack={() => router.back()}
      />

      {events.map((event) => (
        <Card key={event.id} style={styles.card}>
          <View style={styles.top}>
            <Badge label={event.audience} />
            {event.notifyParents ? <Badge label="notify parents" tone="success" /> : null}
          </View>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.meta}>
            {event.date} · {event.time}
          </Text>
          <Text style={styles.meta}>{event.location}</Text>
          <Text style={styles.body}>{event.description}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  top: { flexDirection: "row", gap: 8, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: "800", color: C.text },
  meta: { marginTop: 4, color: C.muted, fontSize: 13 },
  body: { marginTop: 8, color: C.muted, lineHeight: 20 },
});
