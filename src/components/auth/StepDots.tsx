import React from "react";
import { View, StyleSheet } from "react-native";

export function StepDots({
  active,
  total,
  color,
}: {
  active: number;
  total: number;
  color: string;
}) {
  return (
    <View style={styles.steps}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.stepDot,
            i + 1 === active && { backgroundColor: color, width: 22 },
            i + 1 < active && { backgroundColor: color },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  steps: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 16,
  },
  stepDot: {
    height: 6,
    width: 6,
    borderRadius: 999,
    backgroundColor: "#D8D0C4",
  },
});
