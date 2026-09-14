import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AdminColors as C } from "../../constants/adminTheme";
import {
  pickAudioOrAnyFile,
  pickFromGallery,
  PickedFile,
  notify,
} from "../../utils/mediaPicker";

type Props = {
  mediaFile: PickedFile | null;
  coverFile: PickedFile | null;
  onMedia: (file: PickedFile | null) => void;
  onCover: (file: PickedFile | null) => void;
  mediaLabel?: string;
};

export function GalleryUploadPanel({
  mediaFile,
  coverFile,
  onMedia,
  onCover,
  mediaLabel = "video, song, or curriculum file",
}: Props) {
  const pickMedia = async () => {
    const file = await pickFromGallery({ images: true, videos: true });
    if (file) {
      onMedia(file);
      notify("Added from gallery", file.name);
    }
  };

  const pickMusicOrFile = async () => {
    const file = await pickAudioOrAnyFile();
    if (file) {
      onMedia(file);
      notify("File attached", file.name);
    }
  };

  const pickCover = async () => {
    const file = await pickFromGallery({ images: true, videos: false });
    if (file) {
      onCover(file);
      notify("Picture added", file.name);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Upload from gallery</Text>
      <Text style={styles.hint}>
        Add a picture cover and a {mediaLabel} from your device.
      </Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={pickCover} activeOpacity={0.85}>
          <Ionicons name="image-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Add picture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={pickMedia} activeOpacity={0.85}>
          <Ionicons name="videocam-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Photo / Video</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.btn, styles.btnSecondary]}
        onPress={pickMusicOrFile}
        activeOpacity={0.85}
      >
        <Ionicons name="musical-notes-outline" size={18} color={C.primary} />
        <Text style={[styles.btnText, { color: C.primary }]}>
          Music / any file
        </Text>
      </TouchableOpacity>

      {coverFile ? (
        <View style={styles.previewRow}>
          <Image source={{ uri: coverFile.uri }} style={styles.thumb} />
          <View style={{ flex: 1 }}>
            <Text style={styles.previewTitle}>Cover picture</Text>
            <Text style={styles.previewName}>{coverFile.name}</Text>
          </View>
          <TouchableOpacity onPress={() => onCover(null)}>
            <Ionicons name="close-circle" size={22} color={C.danger} />
          </TouchableOpacity>
        </View>
      ) : null}

      {mediaFile ? (
        <View style={styles.previewRow}>
          {mediaFile.kind === "image" ? (
            <Image source={{ uri: mediaFile.uri }} style={styles.thumb} />
          ) : (
            <View style={styles.fileIcon}>
              <Ionicons
                name={
                  mediaFile.kind === "audio"
                    ? "musical-notes"
                    : mediaFile.kind === "video"
                      ? "videocam"
                      : "document"
                }
                size={20}
                color="#fff"
              />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.previewTitle}>
              {mediaFile.kind === "audio"
                ? "Music file"
                : mediaFile.kind === "video"
                  ? "Video file"
                  : mediaFile.kind === "image"
                    ? "Picture"
                    : "Attached file"}
            </Text>
            <Text style={styles.previewName}>{mediaFile.name}</Text>
          </View>
          <TouchableOpacity onPress={() => onMedia(null)}>
            <Ionicons name="close-circle" size={22} color={C.danger} />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.primarySoft,
  },
  label: {
    fontWeight: "800",
    color: C.text,
    fontSize: 14,
    marginBottom: 4,
  },
  hint: {
    color: C.muted,
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 17,
  },
  row: { flexDirection: "row", gap: 8, marginBottom: 8 },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  btnSecondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: C.primary,
    marginBottom: 4,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  previewRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
  },
  thumb: { width: 48, height: 48, borderRadius: 10 },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  previewTitle: { fontSize: 12, fontWeight: "700", color: C.primary },
  previewName: { marginTop: 2, fontSize: 12, color: C.muted },
});
