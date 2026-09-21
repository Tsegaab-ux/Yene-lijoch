import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLanguage } from "../contexts/LanguageContext";

type Props = {
  /** light = for dark welcome backgrounds */
  tone?: "light" | "dark";
};

export function LanguageToggle({ tone = "light" }: Props) {
  const { lang, setLang, t } = useLanguage();
  const light = tone === "light";

  return (
    <View style={[styles.wrap, light ? styles.wrapLight : styles.wrapDark]}>
      <Text style={[styles.label, light ? styles.labelLight : styles.labelDark]}>
        {t("common.language")}
      </Text>
      <View style={[styles.row, !light && styles.rowDark]}>
        <TouchableOpacity
          style={[
            styles.chip,
            lang === "en" &&
              (light ? styles.chipActiveLight : styles.chipActiveDark),
          ]}
          onPress={() => setLang("en")}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.chipText,
              light ? styles.chipTextLight : styles.chipTextDark,
              lang === "en" && styles.chipTextActive,
            ]}
          >
            EN
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.chip,
            lang === "am" &&
              (light ? styles.chipActiveLight : styles.chipActiveDark),
          ]}
          onPress={() => setLang("am")}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.chipText,
              light ? styles.chipTextLight : styles.chipTextDark,
              lang === "am" && styles.chipTextActive,
            ]}
          >
            አማ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "flex-end",
    gap: 6,
  },
  wrapLight: {},
  wrapDark: {},
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  labelLight: { color: "rgba(255,248,240,0.7)" },
  labelDark: { color: "#8A847A" },
  row: {
    flexDirection: "row",
    gap: 6,
    padding: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  rowDark: {
    backgroundColor: "rgba(44, 42, 38, 0.08)",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chipActiveLight: {
    backgroundColor: "#C45C26",
  },
  chipActiveDark: {
    backgroundColor: "#3D6B5A",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800",
  },
  chipTextLight: { color: "rgba(255,255,255,0.75)" },
  chipTextDark: { color: "#5C564E" },
  chipTextActive: { color: "#fff" },
});
