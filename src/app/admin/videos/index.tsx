import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
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
import { AdminColors as C } from "../../../constants/adminTheme";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useMediaContext } from "@/contexts/MediaContext";
import { MediaKind, MediaSource } from "@/types/mediaTypes";
import { MEDIA_KIND_KEYS } from "@/utils/mediaLabels";
import { colorForKind } from "@/utils/mediaColors";
import { PickedFile } from "@/utils/mediaPicker";
import { notify } from "@/utils/notify";

const KINDS: MediaKind[] = [
  "video",
  "song",
  "bible_story",
  "course",
  "picture",
];

// ----------------------------------------------------------------------
// Cross-platform confirm dialog
// ----------------------------------------------------------------------
function confirm(title: string, message: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      { text: "Delete", style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}

// ----------------------------------------------------------------------
// Server error flattening — DRF returns { field: [msg] } / { detail }
// ----------------------------------------------------------------------
function extractServerMessage(err: any, fallback: string): string {
  const data = err?.response?.data;
  if (!data) return err?.message ?? fallback;
  if (typeof data === "string") return data;
  if (data.detail) {
    return Array.isArray(data.detail)
      ? data.detail.map(String).join(", ")
      : String(data.detail);
  }
  const msgs = Object.values(data).flat().filter(Boolean).map(String);
  return msgs.length ? msgs.join(", ") : fallback;
}

export default function AdminVideosScreen() {
  const { t } = useLanguage();
  const {
    media,
    isLoading,
    isSaving,
    createMedia,
    deleteMedia,
    toggleMediaPublish,
  } = useMediaContext();

  const [showForm, setShowForm] = useState(false);
  const [kind, setKind] = useState<MediaKind>("video");
  const [title, setTitle] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [duration, setDuration] = useState("");
  const [ageGroup, setAgeGroup] = useState("Ages 5–10");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(true);
  const [filter, setFilter] = useState<"All" | MediaKind>("All");
  const [mediaFile, setMediaFile] = useState<PickedFile | null>(null);
  const [coverFile, setCoverFile] = useState<PickedFile | null>(null);

  const list = useMemo(() => {
    if (filter === "All") return media;
    return media.filter((m) => m.kind === filter);
  }, [media, filter]);

  const kindLabel = (k: MediaKind) => t(MEDIA_KIND_KEYS[k]);

  const extractId = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const match = trimmed.match(
      /(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/,
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
    // Deliberately sticky: kind / ageGroup / published keep their values
    // between uploads. Uncomment to reset:
    // setKind("video"); setAgeGroup("Ages 5–10"); setPublished(true);
  };

  // ------------------------------------------------------------------
  // Upload
  // ------------------------------------------------------------------
  const handleUpload = async () => {
    if (!title.trim()) {
      notify(t("common.error"), t("admin.uploadTitleRequired"));
      return;
    }

    const hasMediaFile = !!mediaFile;
    const hasCover = !!coverFile;
    const hasYoutube = !!youtubeId.trim();

    // A picture can be represented by its cover alone; anything else
    // needs a real media file or a YouTube link.
    const hasContent =
      hasMediaFile || hasYoutube || (kind === "picture" && hasCover);

    if (!hasContent) {
      notify(
        t("common.error"),
        kind === "picture"
          ? t("admin.uploadAddPicture")
          : t("admin.uploadAddMedia"),
      );
      return;
    }

    // Auto-detect kind from the picked file when useful.
    let finalKind = kind;
    if (mediaFile?.kind === "audio") finalKind = "song";
    if (mediaFile?.kind === "image" && kind === "video") finalKind = "picture";

    // Source resolution: a media file is gallery; YouTube alone is
    // youtube; cover-only is still gallery.
    let source: MediaSource;
    if (hasMediaFile) source = "gallery";
    else if (hasYoutube) source = "youtube";
    else source = "gallery";

    if (__DEV__) {
      console.log("[handleUpload] sending", {
        mediaFile,
        coverFile,
        finalKind,
        source,
      });
    }

    try {
      await createMedia({
        title: title.trim(),
        kind: finalKind,
        youtubeId: extractId(youtubeId),
        duration: duration.trim() || (mediaFile ? "Gallery" : "3:00"),
        ageGroup: ageGroup.trim() || "All ages",
        description:
          description.trim() ||
          t("admin.uploadDefaultDescription", { kind: kindLabel(finalKind) }),
        published,
        source,
        // PickedFile *is* the file — do not reach for `.file`.
        file: mediaFile ? (mediaFile as unknown as File) : null,
        cover: coverFile ? (coverFile as unknown as File) : null,
        fileName: mediaFile?.name ?? undefined,
        mimeType: mediaFile?.mimeType ?? undefined,
      });

      resetForm();
      setShowForm(false);
      notify(t("common.success"), t("admin.uploadSuccess"));
    } catch (err: any) {
      notify(t("common.error"), extractServerMessage(err, t("common.error")));
    }
  };

  // ------------------------------------------------------------------
  // Toggle publish
  // ------------------------------------------------------------------
  const handleTogglePublish = async (id: number | string) => {
    try {
      await toggleMediaPublish(id);
    } catch (err: any) {
      notify(t("common.error"), extractServerMessage(err, t("common.error")));
    }
  };

  // ------------------------------------------------------------------
  // Delete
  // ------------------------------------------------------------------
  const handleRemove = async (item: { id: number | string; title: string }) => {
    const ok = await confirm(t("admin.removeConfirmTitle"), item.title);
    if (!ok) return;
    try {
      await deleteMedia(item.id);
      notify(t("common.success"), item.title);
    } catch (err: any) {
      notify(t("common.error"), extractServerMessage(err, t("common.error")));
    }
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <Screen>
      <TopBar
        title={t("admin.videosTitle")}
        subtitle={t("admin.videosSub")}
        actionLabel={showForm ? t("common.close") : `+ ${t("admin.upload")}`}
        onAction={() => setShowForm((v) => !v)}
      />

      {showForm ? (
        <SoftCard style={{ marginBottom: 14 }}>
          <Text style={styles.formTitle}>{t("admin.uploadTitle")}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10 }}
          >
            {KINDS.map((k) => (
              <Pill
                key={k}
                label={kindLabel(k)}
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
            mediaLabel={t("admin.uploadMediaLabel")}
          />

          <Field
            label={t("admin.uploadFieldTitle")}
            value={title}
            onChangeText={setTitle}
            placeholder={t("admin.uploadFieldTitlePlaceholder")}
          />
          <Field
            label={t("admin.uploadFieldYoutube")}
            value={youtubeId}
            onChangeText={setYoutubeId}
            placeholder={t("admin.uploadFieldYoutubePlaceholder")}
          />
          <Field
            label={t("admin.uploadFieldDuration")}
            value={duration}
            onChangeText={setDuration}
            placeholder={t("admin.uploadFieldDurationPlaceholder")}
          />
          <Field
            label={t("admin.uploadFieldAge")}
            value={ageGroup}
            onChangeText={setAgeGroup}
            placeholder={t("admin.uploadFieldAgePlaceholder")}
          />
          <Field
            label={t("admin.uploadFieldDescription")}
            value={description}
            onChangeText={setDescription}
            placeholder={t("admin.uploadFieldDescriptionPlaceholder")}
            multiline
          />
          <PrimaryButton
            label={
              isSaving ? t("admin.uploading") : t("admin.publishToParents")
            }
            icon="cloud-upload-outline"
            onPress={handleUpload}
            disabled={isSaving}
          />
        </SoftCard>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 10 }}
      >
        <Pill
          label={t("parent.all")}
          active={filter === "All"}
          onPress={() => setFilter("All")}
        />
        {KINDS.map((k) => (
          <Pill
            key={k}
            label={kindLabel(k)}
            active={filter === k}
            onPress={() => setFilter(k)}
          />
        ))}
      </ScrollView>

      <SectionLabel title={t("admin.itemsCount", { count: list.length })} />

      {isLoading && list.length === 0 ? (
        <SoftCard style={styles.card}>
          <Text style={styles.meta}>{t("common.loading")}</Text>
        </SoftCard>
      ) : null}

      {!isLoading && list.length === 0 ? (
        <SoftCard style={styles.card}>
          <Text style={styles.meta}>{t("admin.noMedia")}</Text>
        </SoftCard>
      ) : null}

      {list.map((item) => {
        const thumbUri =
          item.coverUri || (item.kind === "picture" ? item.fileUri : null);

        return (
          <SoftCard key={item.id} style={styles.card}>
            <View style={styles.row}>
              {thumbUri ? (
                <Image source={{ uri: thumbUri }} style={styles.thumb} />
              ) : (
                <View
                  style={[
                    styles.icon,
                    { backgroundColor: colorForKind(item.kind) },
                  ]}
                >
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
                <Text style={styles.badge}>{kindLabel(item.kind)}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>
                  {item.published ? t("admin.live") : t("admin.hidden")} ·{" "}
                  {item.source}
                  {item.fileName ? ` · ${item.fileName}` : ""}
                  {item.youtubeId ? ` · ${item.youtubeId}` : ""}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionChip}
                onPress={() => handleTogglePublish(item.id)}
              >
                <Text style={styles.actionText}>
                  {item.published ? t("common.hide") : t("common.publish")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionChip}
                onPress={() => handleRemove(item)}
              >
                <Text style={[styles.actionText, { color: C.danger }]}>
                  {t("common.delete")}
                </Text>
              </TouchableOpacity>
            </View>
          </SoftCard>
        );
      })}
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