import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  SoftCard,
  TopBar,
  PrimaryButton,
  Field,
  Pill,
  SectionLabel,
} from "../../../components/admin/ui";
import { GalleryUploadPanel } from "../../../components/admin/GalleryUploadPanel";
import {
  MEDIA_KIND_LABELS,
  MediaKind,
} from "../../../data/sharedContent";
import { AdminColors as C } from "../../../constants/adminTheme";
import { useSharedContent } from "../../../contexts/SharedContentContext";
import {
  confirmAction,
  notify,
  PickedFile,
} from "../../../utils/mediaPicker";

const KINDS: MediaKind[] = [
  "video",
  "song",
  "bible_story",
  "course",
  "picture",
];

export default function AdminVideosScreen() {
  const { media, addMedia, removeMedia, toggleMediaPublished } =
    useSharedContent();
  const [showForm, setShowForm] = useState(false);
  const [kind, setKind] = useState<MediaKind>("video");
  const [title, setTitle] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [duration, setDuration] = useState("");
  const [ageGroup, setAgeGroup] = useState("Ages 5–10");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState<"All" | MediaKind>("All");
  const [mediaFile, setMediaFile] = useState<PickedFile | null>(null);
  const [coverFile, setCoverFile] = useState<PickedFile | null>(null);

  const list = useMemo(() => {
    if (filter === "All") return media;
    return media.filter((m) => m.kind === filter);
  }, [media, filter]);

  const extractId = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const match = trimmed.match(
      /(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/
    );
    return match?.[1] ?? trimmed;
  };

  const resetForm = () => {
    setTitle("");
    setYoutubeId("");
    setDuration("");
    setDescription("");
    setMediaFile(null);
    setCoverFile(null);
  };

  const handleUpload = () => {
    if (!title.trim()) {
      notify("Missing title", "Please enter a title.");
      return;
    }

    const hasGallery = !!mediaFile || !!coverFile;
    const hasYoutube = !!youtubeId.trim();

    if (!hasGallery && !hasYoutube && kind !== "picture") {
      notify(
        "Add media",
        "Upload from gallery or paste a YouTube link."
      );
      return;
    }

    if (kind === "picture" && !coverFile && !mediaFile && !hasYoutube) {
      notify("Add picture", "Choose a picture from your gallery.");
      return;
    }

    // Auto-detect kind from gallery file when useful
    let finalKind = kind;
    if (mediaFile?.kind === "audio") finalKind = "song";
    if (mediaFile?.kind === "image" && kind === "video") finalKind = "picture";
    if (kind === "picture" && !mediaFile && coverFile) {
      // picture-only upload uses cover as main
    }

    const mainUri =
      mediaFile?.uri ||
      (finalKind === "picture" ? coverFile?.uri : undefined);

    addMedia({
      title: title.trim(),
      kind: finalKind,
      youtubeId: extractId(youtubeId),
      duration: duration.trim() || (mediaFile ? "Gallery" : "3:00"),
      ageGroup: ageGroup.trim() || "All ages",
      description:
        description.trim() ||
        `Uploaded for parents in ${MEDIA_KIND_LABELS[finalKind]}.`,
      published: true,
      source: hasGallery ? "gallery" : "youtube",
      localUri: mainUri,
      coverUri: coverFile?.uri || (mediaFile?.kind === "image" ? mediaFile.uri : undefined),
      fileName: mediaFile?.name || coverFile?.name,
      mimeType: mediaFile?.mimeType || coverFile?.mimeType,
    });

    resetForm();
    setShowForm(false);
    notify("Uploaded", "Parents can now see this on their portal.");
  };

  return (
    <Screen>
      <TopBar
        title="Videos"
        subtitle="Upload videos, music, pictures from gallery"
        actionLabel={showForm ? "Close" : "+ Upload"}
        onAction={() => setShowForm((v) => !v)}
      />

      {showForm ? (
        <SoftCard style={{ marginBottom: 14 }}>
          <Text style={styles.formTitle}>Upload media</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10 }}
          >
            {KINDS.map((k) => (
              <Pill
                key={k}
                label={MEDIA_KIND_LABELS[k]}
                active={kind === k}
                onPress={() => setKind(k)}
              />
            ))}
          </ScrollView>

          <GalleryUploadPanel
            mediaFile={mediaFile}
            coverFile={coverFile}
            onMedia={setMediaFile}
            onCover={setCoverFile}
            mediaLabel="video, music, curriculum clip, or picture"
          />

          <Field
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Noah’s Ark Adventure"
          />
          <Field
            label="YouTube link (optional)"
            value={youtubeId}
            onChangeText={setYoutubeId}
            placeholder="Paste YouTube URL if not using gallery"
          />
          <Field
            label="Duration"
            value={duration}
            onChangeText={setDuration}
            placeholder="e.g. 4:20"
          />
          <Field
            label="Age group"
            value={ageGroup}
            onChangeText={setAgeGroup}
            placeholder="Ages 5–10"
          />
          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Short description for parents"
            multiline
          />
          <PrimaryButton
            label="Publish to Parents"
            icon="cloud-upload-outline"
            onPress={handleUpload}
          />
        </SoftCard>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 10 }}
      >
        <Pill
          label="All"
          active={filter === "All"}
          onPress={() => setFilter("All")}
        />
        {KINDS.map((k) => (
          <Pill
            key={k}
            label={MEDIA_KIND_LABELS[k]}
            active={filter === k}
            onPress={() => setFilter(k)}
          />
        ))}
      </ScrollView>

      <SectionLabel title={`${list.length} items`} />
      {list.map((item) => (
        <SoftCard key={item.id} style={styles.card}>
          <View style={styles.row}>
            {item.coverUri || (item.localUri && item.kind === "picture") ? (
              <Image
                source={{ uri: item.coverUri || item.localUri }}
                style={styles.thumb}
              />
            ) : (
              <View style={[styles.icon, { backgroundColor: item.color }]}>
                <Ionicons
                  name={
                    item.kind === "song"
                      ? "musical-notes"
                      : item.kind === "picture"
                        ? "image"
                        : "play"
                  }
                  size={16}
                  color="#fff"
                />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.badge}>{MEDIA_KIND_LABELS[item.kind]}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.published ? "Live" : "Hidden"} · {item.source}
                {item.fileName ? ` · ${item.fileName}` : ""}
                {item.youtubeId ? ` · ${item.youtubeId}` : ""}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionChip}
              onPress={() => {
                toggleMediaPublished(item.id);
                notify(
                  item.published ? "Hidden" : "Published",
                  item.title
                );
              }}
            >
              <Text style={styles.actionText}>
                {item.published ? "Hide" : "Publish"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionChip}
              onPress={() =>
                confirmAction("Remove media?", item.title, () => {
                  removeMedia(item.id);
                  notify("Removed", item.title);
                })
              }
            >
              <Text style={[styles.actionText, { color: C.danger }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </SoftCard>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  formTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.text,
    marginBottom: 10,
  },
  card: { marginBottom: 10 },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  thumb: { width: 48, height: 48, borderRadius: 12 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    color: C.primary,
    textTransform: "uppercase",
  },
  title: { marginTop: 2, fontSize: 15, fontWeight: "700", color: C.text },
  meta: { marginTop: 3, fontSize: 12, color: C.muted },
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: C.primarySoft,
  },
  actionText: { fontWeight: "700", fontSize: 12, color: C.primary },
});
