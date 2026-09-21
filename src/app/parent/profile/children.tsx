import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Screen, TopBar, Card } from "../../../components/parent/ui";
import { AvatarBubble } from "../../../components/parent/ui";
import { ParentColors as C } from "../../../constants/parentTheme";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useSelectedChild } from "../../../contexts/SelectedChildContext";
import { colorFor, deriveInitials } from "@/utils/avatarColors";
import { notify } from "@/utils/notify";

export default function MyChildrenScreen() {
  const { t } = useLanguage();
  const { childrenList, selectedId, setSelectedId } = useSelectedChild();

  const handleAddChild = () => {
    notify(
      t("parent.children.addTitle"),
      t("parent.children.addBody")
    );
  };

  return (
    <Screen>
      <TopBar
        title={t("parent.children.title")}
        showBell={false}
        onBack={() => router.back()}
      />

      {childrenList.length === 0 ? (
        <Card style={styles.card}>
          <Text style={styles.meta}>{t("parent.noChildren")}</Text>
        </Card>
      ) : (
        childrenList.map((child) => {
          const active = child.id === selectedId;
          const name = child.name || child.initials || "?";
          return (
            <Card
              key={child.id}
              style={[styles.card, active && styles.active]}
              onPress={() => setSelectedId(child.id)}
            >
              <View style={styles.row}>
                <AvatarBubble
                  initials={child.initials || deriveInitials(child.name)}
                  color={colorFor(name)}
                  size={52}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{name}</Text>
                  {child.grade || child.age ? (
                    <Text style={styles.meta}>
                      {[
                        child.grade,
                        child.age
                          ? `${t("parent.children.age")} ${child.age}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  ) : null}
                  {child.groupName ? (
                    <Text style={styles.meta}>{child.groupName}</Text>
                  ) : null}
                </View>
              </View>
            </Card>
          );
        })
      )}

      <TouchableOpacity style={styles.button} onPress={handleAddChild}>
        <Text style={styles.buttonText}>{t("parent.children.add")}</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  active: { borderColor: C.primary },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  name: { fontWeight: "800", fontSize: 16, color: C.text },
  meta: { marginTop: 3, color: C.muted, fontSize: 13 },
  button: {
    marginTop: 8,
    height: 54,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});