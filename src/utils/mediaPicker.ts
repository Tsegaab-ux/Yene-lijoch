import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

export type PickedFile = {
  uri: string;
  name: string;
  mimeType: string;
  kind: "image" | "video" | "audio" | "file";
  file: File;
};

function classifyMime(mime: string, name: string): PickedFile["kind"] {
  const lower = `${mime} ${name}`.toLowerCase();
  if (lower.includes("image") || /\.(png|jpe?g|gif|webp|heic)$/i.test(name)) {
    return "image";
  }
  if (lower.includes("video") || /\.(mp4|mov|webm|m4v)$/i.test(name)) {
    return "video";
  }
  if (lower.includes("audio") || /\.(mp3|m4a|wav|aac|ogg)$/i.test(name)) {
    return "audio";
  }
  return "file";
}

async function ensureMediaPermission() {
  if (Platform.OS === "web") return true;
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) return true;
  const asked = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return asked.granted;
}

export async function pickFromGallery(options?: {
  images?: boolean;
  videos?: boolean;
}): Promise<PickedFile | null> {
  const allowImages = options?.images !== false;
  const allowVideos = options?.videos !== false;

  const granted = await ensureMediaPermission();
  if (!granted) {
    notify("Permission needed", "Allow gallery access to upload files.");
    return null;
  }

  const mediaTypes: ImagePicker.MediaType[] = [];
  if (allowImages) mediaTypes.push("images");
  if (allowVideos) mediaTypes.push("videos");

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes:
      mediaTypes.length === 0
        ? ["images", "videos"]
        : mediaTypes.length === 1
          ? mediaTypes[0]
          : mediaTypes,
    allowsEditing: false,
    quality: 0.9,
  });

  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  const name =
    asset.fileName ||
    asset.uri.split("/").pop() ||
    `gallery-${Date.now()}`;
  const mimeType = asset.mimeType || "application/octet-stream";

  return {
    uri: asset.uri,
    name,
    mimeType,
    kind: classifyMime(mimeType, name),
  };
}

export async function pickAudioOrAnyFile(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["audio/*", "video/*", "image/*", "*/*"],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  const name = asset.name || `file-${Date.now()}`;
  const mimeType = asset.mimeType || "application/octet-stream";

  return {
    uri: asset.uri,
    name,
    mimeType,
    kind: classifyMime(mimeType, name),
  };
}

export function notify(title: string, message?: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.alert(message ? `${title}\n\n${message}` : title);
    }
    return;
  }
  Alert.alert(title, message);
}

export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void
) {
  if (Platform.OS === "web") {
    const ok =
      typeof window !== "undefined"
        ? window.confirm(`${title}\n\n${message}`)
        : false;
    if (ok) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: "OK", style: "destructive", onPress: onConfirm },
  ]);
}

export function formatLongDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
