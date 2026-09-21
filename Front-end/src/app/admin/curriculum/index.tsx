import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  Screen,
  SoftCard,
  TopBar,
  PrimaryButton,
  Field,
  Pill,
  SectionLabel,
} from "../../../components/admin/ui";
import { CalendarEmbed } from "../../../components/admin/CalendarEmbed";
import { GalleryUploadPanel } from "../../../components/admin/GalleryUploadPanel";
import { AdminColors as C } from "../../../constants/adminTheme";
import { useSharedContent } from "../../../contexts/SharedContentContext";
import { SharedCurriculum } from "../../../data/sharedContent";
import {
  confirmAction,
  notify,
  PickedFile,
} from "../../../utils/mediaPicker";
import { useLanguage } from "../../../contexts/LanguageContext";

const STATUSES: SharedCurriculum["status"][] = [
  "this_week",
  "upcoming",
  "completed",
];

export default function AdminCurriculumScreen() {
  const {
    curriculum,
    addCurriculum,
    setCurriculumDate,
    removeCurriculum,
    toggleCurriculumPublished,
  } = useSharedContent();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Creation");
  const [week, setWeek] = useState("1");
  const [date, setDate] = useState("September 21, 2026");
  const [year, setYear] = useState("2026");
  const [scripture, setScripture] = useState("");
  const [memoryVerse, setMemoryVerse] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] =
    useState<SharedCurriculum["status"]>("upcoming");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("September 21, 2026");
  const [mediaFile, setMediaFile] = useState<PickedFile | null>(null);
  const [coverFile, setCoverFile] = useState<PickedFile | null>(null);

  const resetForm = () => {
    setTitle("");
    setScripture("");
    setMemoryVerse("");
    setDescription("");
    setMediaFile(null);
    setCoverFile(null);
  };

  const handleAdd = () => {
    if (!title.trim()) {
      notify("Missing title", "Please enter a curriculum title.");
      return;
    }
    if (!date.trim()) {
      notify("Missing date", "Pick a date on the calendar.");
      return;
    }

    addCurriculum({
      title: title.trim(),
      category: category.trim() || "General",
      week: Number(week) || 1,
      date: date.trim(),
      year: year.trim() || String(new Date().getFullYear()),
      scripture: scripture.trim() || "Scripture TBA",
      memoryVerse: memoryVerse.trim() || "Memory verse TBA",
      description:
        description.trim() || "Sunday school curriculum lesson for parents.",
      status,
      published: true,
      coverUri: coverFile?.uri || (mediaFile?.kind === "image" ? mediaFile.uri : undefined),
      attachmentUri: mediaFile?.uri,
      attachmentName: mediaFile?.name,
      attachmentType: mediaFile?.kind,
    });

    resetForm();
    setShowForm(false);
    notify("Saved", "Curriculum is live for parents.");
  };

  return (
    <Screen>
      <TopBar
        title={t("admin.curriculumTitle")}
        subtitle={t("admin.curriculumSub")}
        actionLabel={showForm ? t("common.close") : `+ ${t("common.add")}`}
        onAction={() => setShowForm((v) => !v)}
      />

      {showForm ? (
        <SoftCard style={{ marginBottom: 14 }}>
          <Text style={styles.formTitle}>Add curriculum lesson</Text>
          <Field label="Title" value={title} onChangeText={setTitle} />
          <Field
            label="Category"
            value={category}
            onChangeText={setCategory}
            placeholder="Creation, Gospels..."
          />
          <Field label="Week number" value={week} onChangeText={setWeek} />

          <Text style={styles.label}>Given date (calendar)</Text>
          <CalendarEmbed
            value={date}
            onChange={(label, d) => {
              setDate(label);
              setYear(String(d.getFullYear()));
            }}
          />

          <GalleryUploadPanel
            mediaFile={mediaFile}
            coverFile={coverFile}
            onMedia={setMediaFile}
            onCover={setCoverFile}
            mediaLabel="curriculum picture, video, or music"
          />

          <Field
            label="Scripture"
            value={scripture}
            onChangeText={setScripture}
          />
          <Field
            label="Memory verse"
            value={memoryVerse}
            onChangeText={setMemoryVerse}
            multiline
          />
          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Text style={styles.label}>Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {STATUSES.map((s) => (
              <Pill
                key={s}
                label={s.replace("_", " ")}
                active={status === s}
                onPress={() => setStatus(s)}
              />
            ))}
          </ScrollView>
          <PrimaryButton
            label="Publish Curriculum"
            icon="book-outline"
            onPress={handleAdd}
          />
        </SoftCard>
      ) : null}

      <SectionLabel title={`${curriculum.length} lessons · year plan`} />
      {curriculum.map((item) => (
        <SoftCard key={item.id} style={styles.card}>
          <View style={styles.topRow}>
            {item.coverUri ? (
              <Image source={{ uri: item.coverUri }} style={styles.thumb} />
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.badge}>
                Week {item.week} · {item.category} · {item.year}
              </Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>
                Date: {item.date} · {item.status.replace("_", " ")}
              </Text>
              <Text style={styles.meta}>
                {item.published ? "Shown to parents" : "Hidden"}
                {item.attachmentName ? ` · ${item.attachmentName}` : ""}
              </Text>
            </View>
          </View>

          {editingId === item.id ? (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>Update date</Text>
              <CalendarEmbed
                value={editDate}
                onChange={(label) => setEditDate(label)}
              />
              <PrimaryButton
                label={t("teacher.saveDate")}
                onPress={() => {
                  if (!editDate.trim()) {
                    notify("Pick a date", "Select a day on the calendar.");
                    return;
                  }
                  setCurriculumDate(item.id, editDate.trim());
                  setEditingId(null);
                  notify("Updated", "Curriculum date saved.");
                }}
              />
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditingId(null)}
              >
                <Text style={styles.cancelText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionChip}
              onPress={() => {
                setEditingId(item.id);
                setEditDate(item.date);
              }}
            >
              <Text style={styles.actionText}>{t("teacher.setDate")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionChip}
              onPress={() => {
                setCurriculumDate(item.id, item.date, "this_week");
                notify("This week", `${item.title} is now this week's lesson.`);
              }}
            >
              <Text style={styles.actionText}>Make this week</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionChip}
              onPress={() => {
                toggleCurriculumPublished(item.id);
                notify(
                  item.published ? "Hidden" : "Published",
                  item.title
                );
              }}
            >
              <Text style={styles.actionText}>
                {item.published ? t("common.hide") : t("common.publish")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionChip}
              onPress={() =>
                confirmAction("Delete lesson?", item.title, () => {
                  removeCurriculum(item.id);
                  notify("Deleted", item.title);
                })
              }
            >
              <Text style={[styles.actionText, { color: C.danger }]}>
                {t("common.delete")}
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
  label: {
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
    fontSize: 13,
  },
  card: { marginBottom: 10 },
  topRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  thumb: { width: 56, height: 56, borderRadius: 12 },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    color: C.primary,
    textTransform: "uppercase",
  },
  title: { marginTop: 4, fontSize: 16, fontWeight: "700", color: C.text },
  meta: { marginTop: 4, fontSize: 13, color: C.muted },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  actionChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: C.primarySoft,
  },
  actionText: { fontWeight: "700", fontSize: 12, color: C.primary },
  cancelBtn: { marginTop: 10, alignItems: "center", padding: 8 },
  cancelText: { color: C.muted, fontWeight: "700" },
});
