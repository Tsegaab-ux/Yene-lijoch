import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Image } from "expo-image";

type ImageSectionCardProps = {
  image: number;
  children: React.ReactNode;
  onPress?: () => void;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

export function ImageSectionCard({
  image,
  children,
  onPress,
  height = 210,
  style,
}: ImageSectionCardProps) {
  const content = (
    <View style={[styles.wrap, { minHeight: height }, style]}>
      <Image
        source={image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />
      {/* Soft top fade so the photo stays visible */}
      <View style={styles.topFade} pointerEvents="none" />
      {/* Dark bottom area for readable text */}
      <View style={styles.bottomScrim} pointerEvents="none" />
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.92} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export function ImageChip({
  label,
  tone = "light",
}: {
  label: string;
  tone?: "light" | "accent";
}) {
  return (
    <View
      style={[
        styles.chip,
        tone === "accent" ? styles.chipAccent : styles.chipLight,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          tone === "accent" ? styles.chipTextAccent : styles.chipTextLight,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#2C2A26",
        shadowOpacity: 0.14,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 3 },
      default: {
        shadowColor: "#2C2A26",
        shadowOpacity: 0.14,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      },
    }),
  },
  topFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "35%",
    backgroundColor: "rgba(20, 16, 12, 0.12)",
  },
  bottomScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "72%",
    backgroundColor: "rgba(18, 14, 10, 0.62)",
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 18,
  },
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  chipLight: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  chipAccent: {
    backgroundColor: "#C45C26",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  chipTextLight: {
    color: "#FFFFFF",
  },
  chipTextAccent: {
    color: "#FFFFFF",
  },
});
