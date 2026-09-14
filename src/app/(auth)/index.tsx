import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PhoneShell, usePhoneFrame } from "../../components/auth/PhoneShell";

const KIDS_IMAGE = require("../../../assets/images/welcome/kids-welcome.png");

type Slide = {
  key: string;
  type: "logo" | "photo";
};

const SLIDES: Slide[] = [
  { key: "logo", type: "logo" },
  { key: "photo", type: "photo" },
];

export default function WelcomeScreen() {
  const { frameW, frameH } = usePhoneFrame();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / frameW);
    if (next !== index && next >= 0 && next < SLIDES.length) setIndex(next);
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
      return;
    }
    router.push("/(auth)/role");
  };

  return (
    <PhoneShell background="#121816">
      <View style={[styles.root, { width: frameW, height: frameH }]}>
        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          bounces={false}
          getItemLayout={(_, i) => ({
            length: frameW,
            offset: frameW * i,
            index: i,
          })}
          renderItem={({ item }) =>
            item.type === "logo" ? (
              <LogoSlide width={frameW} height={frameH} />
            ) : (
              <PhotoSlide width={frameW} height={frameH} />
            )
          }
        />

        <SafeAreaView edges={["bottom"]} style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((slide, i) => (
              <View
                key={slide.key}
                style={[styles.dot, i === index && styles.dotActive]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.cta}
            onPress={goNext}
            activeOpacity={0.88}
          >
            <Text style={styles.ctaText}>
              {index === SLIDES.length - 1 ? "Continue" : "Next"}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginLink}>
              Already have an account?{" "}
              <Text style={styles.loginBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </PhoneShell>
  );
}

function LogoSlide({ width, height }: { width: number; height: number }) {
  return (
    <View style={[styles.slide, styles.logoSlide, { width, height }]}>
      <View
        style={[
          styles.glowA,
          {
            width: width * 0.95,
            height: width * 0.95,
            top: -width * 0.28,
            left: -width * 0.28,
          },
        ]}
      />
      <View
        style={[
          styles.glowB,
          {
            width: width * 0.75,
            height: width * 0.75,
            bottom: height * 0.14,
            right: -width * 0.28,
          },
        ]}
      />

      <View style={styles.markWrap}>
        <View style={styles.markOuter}>
          <View style={styles.markInner}>
            <Text style={styles.markYL}>YL</Text>
          </View>
          <View style={styles.markBadge}>
            <Ionicons name="heart" size={14} color="#FFF8F0" />
          </View>
        </View>
      </View>

      <Text style={styles.brand}>Yene Lijoch</Text>
      <Text style={styles.welcome}>Welcome</Text>
      <Text style={styles.tagline}>
        A home for Sunday school families — parents, teachers, and children
        growing together.
      </Text>
    </View>
  );
}

function PhotoSlide({ width, height }: { width: number; height: number }) {
  return (
    <View style={[styles.slide, { width, height, backgroundColor: "#1a1512" }]}>
      {/* Portrait crop: cover + center so landscape photo fills the phone */}
      <Image
        source={KIDS_IMAGE}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
        transition={200}
      />
      <View style={styles.photoScrimTop} />
      <View style={styles.photoScrimBottom} />

      <SafeAreaView edges={["top"]} style={styles.photoContent}>
        <Text style={styles.photoEyebrow}>Our children</Text>
        <Text style={styles.photoTitle}>Yene Lijoch</Text>
        <Text style={styles.photoBody}>
          Joyful learning, faith, and connection — built for every family.
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#1F2A24",
  },
  slide: {
    overflow: "hidden",
  },
  logoSlide: {
    backgroundColor: "#24352C",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  glowA: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(196, 92, 38, 0.22)",
  },
  glowB: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(61, 107, 90, 0.35)",
  },
  markWrap: {
    marginBottom: 24,
  },
  markOuter: {
    width: 112,
    height: 112,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  markInner: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#C45C26",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
      },
      default: {},
    }),
  },
  markYL: {
    color: "#FFF8F0",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 1,
  },
  markBadge: {
    position: "absolute",
    right: 6,
    bottom: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#3D6B5A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#24352C",
  },
  brand: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFF8F0",
    letterSpacing: -1,
    textAlign: "center",
  },
  welcome: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,248,240,0.78)",
    letterSpacing: 3.2,
    textTransform: "uppercase",
  },
  tagline: {
    marginTop: 16,
    textAlign: "center",
    color: "rgba(255,248,240,0.72)",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 300,
    paddingHorizontal: 8,
  },
  photoScrimTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "28%",
    backgroundColor: "rgba(18, 14, 10, 0.35)",
  },
  photoScrimBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "48%",
    backgroundColor: "rgba(18, 14, 10, 0.72)",
  },
  photoContent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 150,
    paddingHorizontal: 24,
  },
  photoEyebrow: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  photoTitle: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  photoBody: {
    marginTop: 8,
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 280,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 12,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: {
    width: 22,
    backgroundColor: "#C45C26",
  },
  cta: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#C45C26",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  loginLink: {
    textAlign: "center",
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginBottom: 2,
  },
  loginBold: {
    color: "#fff",
    fontWeight: "800",
  },
});
