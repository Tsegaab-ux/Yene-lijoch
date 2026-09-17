import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { ParentColors as C } from "../../constants/parentTheme";

type Props = {
  youtubeId?: string;
  fileUri?: string;
  coverUri?: string;
  title?: string;
  kind?: string;
  height?: number;
};

function watchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

function embedUrl(id: string) {
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
}

function isImageUri(uri: string, kind?: string) {
  if (kind === "picture") return true;
  return /\.(png|jpe?g|gif|webp|heic)(\?|$)/i.test(uri);
}

function isVideoUri(uri: string) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(uri);
}

function isAudioUri(uri: string, kind?: string) {
  if (kind === "song") return true;
  return /\.(mp3|m4a|wav|aac|ogg)(\?|$)/i.test(uri);
}

export function VideoEmbed({
  youtubeId,
  fileUri,
  coverUri,
  title,
  kind,
  height = 200,
}: Props) {
  const openYoutube = async () => {
    if (!youtubeId) return;
    const url = watchUrl(youtubeId);
    if (Platform.OS === "web") {
      await Linking.openURL(url);
      return;
    }
    await WebBrowser.openBrowserAsync(url);
  };

  const openLocal = async () => {
    if (!fileUri) return;
    await Linking.openURL(fileUri);
  };

  if (fileUri && isImageUri(fileUri, kind)) {
    return (
      <View style={[styles.wrap, { height }]}>
        <Image
          source={{ uri: fileUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </View>
    );
  }

  if (fileUri && Platform.OS === "web" && isVideoUri(fileUri)) {
    return (
      <View style={[styles.wrap, { height }]}>
        {React.createElement("video", {
          src: fileUri,
          controls: true,
          style: {
            width: "100%",
            height: "100%",
            borderRadius: 16,
            backgroundColor: "#000",
          },
        })}
      </View>
    );
  }

  if (fileUri && Platform.OS === "web" && isAudioUri(fileUri, kind)) {
    return (
      <View style={[styles.wrap, styles.nativeCard, { height }]}>
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={styles.coverBg}
            resizeMode="cover"
          />
        ) : null}
        {React.createElement("audio", {
          src: fileUri,
          controls: true,
          style: { width: "90%" },
        })}
        {title ? <Text style={styles.playTitle}>{title}</Text> : null}
      </View>
    );
  }

  if (fileUri) {
    return (
      <TouchableOpacity
        style={[styles.wrap, styles.nativeCard, { height }]}
        onPress={openLocal}
        activeOpacity={0.9}
      >
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={styles.coverBg}
            resizeMode="cover"
          />
        ) : null}
        <View style={styles.playCircle}>
          <Ionicons
            name={kind === "song" ? "musical-notes" : "play"}
            size={28}
            color="#fff"
          />
        </View>
        <Text style={styles.playLabel}>
          {kind === "song" ? "Tap to play music" : "Tap to open file"}
        </Text>
        {title ? <Text style={styles.playTitle}>{title}</Text> : null}
      </TouchableOpacity>
    );
  }

  if (coverUri && !youtubeId) {
    return (
      <View style={[styles.wrap, { height }]}>
        <Image
          source={{ uri: coverUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </View>
    );
  }

  if (!youtubeId) {
    return (
      <View style={[styles.wrap, styles.nativeCard, { height }]}>
        <Text style={styles.playLabel}>No media attached</Text>
      </View>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View style={[styles.wrap, { height }]}>
        {React.createElement("iframe", {
          src: embedUrl(youtubeId),
          title: title ?? "Kids video",
          style: {
            border: 0,
            width: "100%",
            height: "100%",
            borderRadius: 16,
          },
          allow:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          allowFullScreen: true,
        })}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.wrap, styles.nativeCard, { height }]}
      onPress={openYoutube}
      activeOpacity={0.9}
    >
      <View style={styles.playCircle}>
        <Ionicons name="play" size={28} color="#fff" />
      </View>
      <Text style={styles.playLabel}>Tap to watch</Text>
      {title ? <Text style={styles.playTitle}>{title}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  nativeCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
    paddingHorizontal: 20,
  },
  coverBg: {
    ...StyleSheet.absoluteFill,
    opacity: 0.35,
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  playLabel: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
    fontSize: 13,
  },
  playTitle: {
    marginTop: 6,
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },
});
