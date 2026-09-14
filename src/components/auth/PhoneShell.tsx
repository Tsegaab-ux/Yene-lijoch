import React, { useMemo } from "react";
import { View, StyleSheet, useWindowDimensions, Platform } from "react-native";

/** iPhone-like portrait shell for web + large tablets */
export const PHONE_MAX_WIDTH = 390;
export const PHONE_MAX_HEIGHT = 844;

export function usePhoneFrame() {
  const { width: winW, height: winH } = useWindowDimensions();

  return useMemo(() => {
    const frameW = Math.min(winW, PHONE_MAX_WIDTH);
    // Keep a tall phone ratio (~19.5:9) when window is wide/short
    const idealH = Math.round(frameW * (844 / 390));
    const frameH = Math.min(winH, idealH, PHONE_MAX_HEIGHT);
    const isFramed = winW > PHONE_MAX_WIDTH + 24;

    return { frameW, frameH, winW, winH, isFramed };
  }, [winW, winH]);
}

export function PhoneShell({
  children,
  background = "#0E1411",
}: {
  children: React.ReactNode;
  background?: string;
}) {
  const { frameW, frameH, isFramed } = usePhoneFrame();

  return (
    <View style={[styles.outer, { backgroundColor: background }]}>
      <View
        style={[
          styles.phone,
          {
            width: frameW,
            height: frameH,
            maxHeight: "100%",
            borderRadius: isFramed ? 28 : 0,
            overflow: "hidden",
            ...Platform.select({
              web: isFramed
                ? {
                    boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
                  }
                : {},
              default: {},
            }),
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  phone: {
    position: "relative",
    backgroundColor: "#000",
  },
});
