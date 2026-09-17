import React, { useEffect, useMemo, useState } from "react";
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
import { useLanguage } from "../../../contexts/LanguageContext";
import { useClassrooms } from "@/hooks/useClassrooms";
import { useLessons } from "@/hooks/useLessons";
import { LessonStatus } from "@/types/lessonTypes";
import { PickedFile } from "@/utils/mediaPicker";
import { notify } from "@/utils/notify";

const STATUSES: LessonStatus[] = ["this_week", "upcoming", "completed"];

// Cross-platform confirm dialog.
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

/**
 * Convert a human-readable date ("September 21, 2026") to an ISO date
 * string ("2026-09-21"). Returns null if the input can't be parsed.
 */
function parseDateLabel(label: string): string | null {
  if (!label) return null;
  const d = new Date(label);
  if (isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AdminCurriculumScreen() {
  const { t } = useLanguage();
  const { classrooms, fetchClassrooms, fetchClassroomsFiltered } = useClassrooms();
  const {
    lessons,
    isLoading,
    createLesson,
    deleteLesson,
    makeThisWeek,
    togglePublish,
    setDate: setLessonDate,
  } = useLessons();

  // ------------------------------------------------------------------
  // Class selection (required for new lessons)
  // ------------------------------------------------------------------
  const [classroomId, setClassroomId] = useState<number | null>(null);

  useEffect(() => {
    if (classroomId === null && classrooms.length > 0) {
      setClassroomId(classrooms[0].id as number);
    }
  }, [classrooms, classroomId]);

  // ------------------------------------------------------------------
  // Form state
  // ------------------------------------------------------------------
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Creation");
  const [week, setWeek] = useState("1");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [date, setDate] = useState("September 21, 2026");
  const [scripture, setScripture] = useState("");
  const [memoryVerse, setMemoryVerse] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<LessonStatus>("upcoming");
  const [mediaFile, setMediaFile] = useState<PickedFile | null>(null);
  const [coverFile, setCoverFile] = useState<PickedFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ------------------------------------------------------------------
  // Editing state
  // ------------------------------------------------------------------
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState("September 21, 2026");
  const [isSavingDate, setIsSavingDate] = useState(false);

  // Lessons scoped to the selected classroom (if any)
  const visibleLessons = useMemo(() => {
    if (classroomId === null) return lessons;
    return lessons.filter(
      (l) =>
        l.classroom_id === null ||
        l.classroom_id === undefined ||
        Number(l.classroom_id) === classroomId
    );
  }, [lessons, classroomId]);

  const resetForm = () => {
    setTitle("");
    setScripture("");
    setMemoryVerse("");
    setDescription("");
    setMediaFile(null);
    setCoverFile(null);
  };

  // ------------------------------------------------------------------
  // Create
  // ------------------------------------------------------------------
  const handleAdd = async () => {
    // Coerce every form value to a string before touching it.
    const safeTitle = String(title ?? "").trim();
    const safeDate = String(date ?? "").trim();
    const safeCategory = String(category ?? "").trim();
    const safeScripture = String(scripture ?? "").trim();
    const safeMemoryVerse = String(memoryVerse ?? "").trim();
    const safeDescription = String(description ?? "").trim();
    const safeWeek = String(week ?? "").trim();
    const safeYear = String(year ?? "").trim();

    if (!safeTitle) {
      notify(t("common.error"), t("admin.curriculumTitleRequired"));
      return;
    }
    if (!safeDate) {
      notify(t("common.error"), t("admin.curriculumDateRequired"));
      return;
    }
    if (classroomId === null) {
      notify(t("common.error"), t("admin.curriculumClassRequired"));
      return;
    }

    const lessonDate = parseDateLabel(safeDate);
    if (!lessonDate) {
      notify(t("common.error"), t("admin.curriculumInvalidDate"));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        classroom: classroomId,
        title: safeTitle,
        category: safeCategory || "General",
        week: Number(safeWeek) || 1,
        lesson_date: lessonDate,
        date_label: safeDate,
        year: Number(safeYear) || new Date().getFullYear(),
        scripture: safeScripture || "Scripture TBA",
        memory_verse: safeMemoryVerse || "Memory verse TBA",
        description:
          safeDescription ||
          "Sunday school curriculum lesson for parents.",
        status,
        published: true,
      };

      if (coverFile?.file) payload.cover = coverFile.file;
      if (mediaFile?.file) payload.attachment = mediaFile.file;
      if (mediaFile?.name) payload.attachment_name = mediaFile.name;
      if (mediaFile?.kind) payload.attachment_type = mediaFile.kind;

      await createLesson(payload as any);

      resetForm();
      setShowForm(false);
      notify(t("common.success"), t("admin.curriculumSaved"));
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: unknown; status?: number };
        message?: unknown;
      };
      console.error("[curriculum] create failed:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      const message =
        error.response?.data ?? error.message ?? t("common.error");
      notify(t("common.error"), String(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------------------------------------
  // Edit date
  // ------------------------------------------------------------------
  const handleSaveDate = async (itemId: number | undefined) => {
    if (itemId === undefined || itemId === null) {
      notify(t("common.error"), t("admin.curriculumMissingId"));
      return;
    }
    if (!editDate.trim()) {
      notify(t("common.error"), t("admin.curriculumPickDate"));
      return;
    }

    const iso = parseDateLabel(editDate);
    if (!iso) {
      notify(t("common.error"), t("admin.curriculumInvalidDate"));
      return;
    }

    setIsSavingDate(true);
    try {
      await setLessonDate(itemId, iso, editDate);
      setEditingId(null);
      notify(t("common.success"), t("admin.curriculumDateSaved"));
    } catch (err: unknown) {
      notify(t("common.error"), String(err));
    } finally {
      setIsSavingDate(false);
    }
  };

  // ------------------------------------------------------------------
  // Row actions
  // ------------------------------------------------------------------
  const handleMakeThisWeek = async (itemId: number | undefined, title: string) => {
    if (itemId === undefined) return;
    try {
      await makeThisWeek(itemId);
      notify(t("common.success"), t("admin.curriculumMadeThisWeek", { title }));
    } catch (err: unknown) {
      notify(t("common.error"), String(err));
    }
  };

  const handleTogglePublish = async (itemId: number | undefined) => {
    if (itemId === undefined) return;
    try {
      await togglePublish(itemId);
    } catch (err: unknown) {
      notify(t("common.error"), String(err));
    }
  };

  const handleRemove = async (itemId: number | undefined, title: string) => {
    if (itemId === undefined) return;
    const ok = await confirm(t("admin.curriculumDeleteConfirm"), title);
    if (!ok) return;
    try {
      await deleteLesson(itemId);
      notify(t("common.success"), title);
    } catch (err: unknown) {
      notify(t("common.error"), String(err));
    }
  };

  useEffect(()=> {
    fetchClassrooms();
  },[]);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <Screen>
      <TopBar
        title={t("admin.curriculumTitle")}
        subtitle={t("admin.curriculumSub")}
        actionLabel={showForm ? t("common.close") : `+ ${t("common.add")}`}
        onAction={() => setShowForm((v) => !v)}
      />

      {/* ---------- Add form ---------- */}
      {showForm ? (
        <SoftCard style={{ marginBottom: 14 }}>
          <Text style={styles.formTitle}>
            {t("admin.curriculumAddTitle")}
          </Text>

          {/* Class picker (only when > 1 class) */}
          {classrooms.length > 0 ? (
            <>
              <Text style={styles.label}>{t("admin.curriculumClass")}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 8 }}
              >
                {classrooms.map((c) => (
                  <Pill
                    key={c.id}
                    label={c.name}
                    active={classroomId === c.id}
                    onPress={() => setClassroomId(c.id as number)}
                  />
                ))}
              </ScrollView>
            </>
          ) : null}

          <Field
            label={t("admin.curriculumFieldTitle")}
            value={title}
            onChangeText={setTitle}
          />
          <Field
            label={t("admin.curriculumFieldCategory")}
            value={category}
            onChangeText={setCategory}
            placeholder="Creation, Gospels..."
          />
          <Field
            label={t("admin.curriculumFieldWeek")}
            value={week}
            onChangeText={setWeek}
          />

          <Text style={styles.label}>{t("admin.curriculumDateLabel")}</Text>
          <CalendarEmbed
            value={date}
            onChange={(label, d) => {
              setDate(label);                          // ← fixed
              setYear(String(d.getFullYear()));
            }}
          />

          <GalleryUploadPanel
            mediaFile={mediaFile}
            coverFile={coverFile}
            onMedia={setMediaFile}
            onCover={setCoverFile}
            mediaLabel={t("admin.curriculumMediaLabel")}
          />

          <Field
            label={t("admin.curriculumFieldScripture")}
            value={scripture}
            onChangeText={setScripture}
          />
          <Field
            label={t("admin.curriculumFieldMemory")}
            value={memoryVerse}
            onChangeText={setMemoryVerse}
            multiline
          />
          <Field
            label={t("admin.curriculumFieldDescription")}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>{t("admin.curriculumStatus")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {STATUSES.map((s) => (
              <Pill
                key={s}
                label={t(`admin.curriculumStatus_${s}`)}
                active={status === s}
                onPress={() => setStatus(s)}
              />
            ))}
          </ScrollView>

          <PrimaryButton
            label={
              isSubmitting
                ? t("admin.curriculumPublishing")
                : t("admin.curriculumPublish")
            }
            icon="book-outline"
            onPress={handleAdd}
            disabled={isSubmitting}
          />
        </SoftCard>
      ) : null}

      {/* ---------- Count ---------- */}
      <SectionLabel
        title={t("admin.curriculumCount", { count: visibleLessons.length })}
      />

      {/* ---------- States ---------- */}
      {isLoading && visibleLessons.length === 0 ? (
        <SoftCard style={styles.card}>
          <Text style={styles.meta}>{t("common.loading")}</Text>
        </SoftCard>
      ) : null}

      {!isLoading && visibleLessons.length === 0 ? (
        <SoftCard style={styles.card}>
          <Text style={styles.meta}>{t("admin.curriculumEmpty")}</Text>
        </SoftCard>
      ) : null}

      {/* ---------- Lesson rows ---------- */}
      {visibleLessons.map((item) => {
        const coverUri = item.coverUri;
        const isEditing = editingId === item.id;
        const lessonId = typeof item.id === "number" ? item.id : undefined;

        return (
          <SoftCard key={String(item.id)} style={styles.card}>
            <View style={styles.topRow}>
              {coverUri ? (
                <Image source={{ uri: coverUri }} style={styles.thumb} />
              ) : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.badge}>
                  {t("admin.curriculumWeekBadge", {
                    week: item.week,
                    category: item.category ?? "",
                    year: item.year,
                  })}
                </Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>
                  {t("admin.curriculumDateLine", {
                    date: item.date,
                    status: t(`admin.curriculumStatus_${item.status}`),
                  })}
                </Text>
                <Text style={styles.meta}>
                  {item.published
                    ? t("admin.curriculumShown")
                    : t("admin.curriculumHidden")}
                  {item.attachment_name ? ` · ${item.attachment_name}` : ""}
                </Text>
              </View>
            </View>

            {/* ---------- Inline date editor ---------- */}
            {isEditing ? (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.label}>
                  {t("admin.curriculumEditDate")}
                </Text>
                <CalendarEmbed
                  value={editDate}
                  onChange={(label) => setEditDate(label)}
                />
                <PrimaryButton
                  label={
                    isSavingDate
                      ? t("admin.curriculumSaving")
                      : t("teacher.saveDate")
                  }
                  onPress={() => handleSaveDate(lessonId)}
                  disabled={isSavingDate || !editDate.trim()}
                />
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setEditingId(null)}
                >
                  <Text style={styles.cancelText}>{t("common.cancel")}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* ---------- Row actions ---------- */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionChip}
                onPress={() => {
                  if (lessonId === undefined) return;
                  setEditingId(lessonId);
                  setEditDate(item.date);
                }}
              >
                <Text style={styles.actionText}>
                  {t("teacher.setDate")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionChip}
                onPress={() => handleMakeThisWeek(lessonId, item.title)}
              >
                <Text style={styles.actionText}>
                  {t("admin.curriculumMakeThisWeek")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionChip}
                onPress={() => handleTogglePublish(lessonId)}
              >
                <Text style={styles.actionText}>
                  {item.published ? t("common.hide") : t("common.publish")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionChip}
                onPress={() => handleRemove(lessonId, item.title)}
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