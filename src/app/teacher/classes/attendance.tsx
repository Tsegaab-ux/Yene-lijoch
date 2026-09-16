import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  TouchableOpacity,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  SoftCard,
  BackHeader,
  PrimaryButton,
} from "../../../components/teacher/ui";
import { TeacherColors as C } from "../../../constants/teacherTheme";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useTeacher } from "@/contexts/TeacherContext";
import { useTeacherCurriculumContext } from "@/contexts/TeacherCurriculumContext";
import { useAttendance } from "@/hooks/useAttendance";
import { useStudentData } from "@/hooks/useStudentData";
import { Student } from "@/types/studentTypes";
import { AttendanceStatus } from "@/types/attendanceTypes";

// ------------------------------------------------------------------
// Cross-platform alert — RN Web stubs Alert.alert
// ------------------------------------------------------------------
function notify(title: string, message: string, onOk?: () => void) {
  if (Platform.OS === "web") {
    // eslint-disable-next-line no-alert
    window.alert(`${title}\n\n${message}`);
    onOk?.();
  } else {
    Alert.alert(title, message, [{ text: "OK", onPress: onOk }]);
  }
}

type Mark = "present" | "absent";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// ------------------------------------------------------------------
// Screen
// ------------------------------------------------------------------
export default function AttendanceScreen() {
  // ---- Real data sources -----------------------------------------
  const { primaryClass } = useTeacher();
  const { todayLesson } = useTeacherCurriculumContext();
  const { createStudent } = useStudentData();

  const {
    students: apiStudents,
    existing,
    isSaving,
    error: apiError,
    reload,
    saveAttendance,
  } = useAttendance(primaryClass?.id, todayLesson?.id);

  const { t } = useLanguage();

  // ---- Local UI state (unchanged) --------------------------------
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");

  const today = new Date();
  const [weekdayDraft, setWeekdayDraft] = useState(
    WEEKDAYS[today.getDay()]
  );
  const [dateDraft, setDateDraft] = useState(
    today.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  );

  // attendanceLabel — was from the mock; now derived from local state
  const attendanceLabel = `${weekdayDraft}, ${dateDraft}`;

  // Marks state — same shape as before, same key type ("string" ids)
  const [marks, setMarks] = useState<Record<string, Mark>>({});

  // ---- Pre-fill marks from server + students ----------------------
  useEffect(() => {
    setMarks((prev) => {
      const next = { ...prev };
      apiStudents.forEach((s) => {
        const key = String(s.id);
        if (!next[key]) {
          const serverStatus = existing[key];
          next[key] =
            serverStatus === "absent" ? "absent" : "present";
        }
      });
      return next;
    });
  }, [apiStudents, existing]);

  // ---- Adapt the roster to the shape the UI already expects ------
  // The original code read `s.attendance`. We compute it from `marks`.
  const students = useMemo(
    () =>
      apiStudents.map((s) => ({
        ...s,
        id: String(s.id), // keep ids as strings, matching the mock
        attendance: marks[String(s.id)] ?? "present",
      })),
    [apiStudents, marks]
  );

  const list = students; // alias, to keep the JSX identical

  const summary = useMemo(() => {
    const present = list.filter((s) => s.attendance === "present").length;
    const absent = list.filter((s) => s.attendance === "absent").length;
    return { present, absent, total: list.length };
  }, [list]);

  // ---- Handlers ---------------------------------------------------
  const toggle = (id: string) => {
    setMarks((prev) => ({
      ...prev,
      [id]: prev[id] === "present" ? "absent" : "present",
    }));
  };

  const handleSaveDate = () => {
    if (!dateDraft.trim()) {
      notify("Missing date", "Please enter the attendance date.");
      return;
    }
    notify("Date saved", `Attendance date set to ${weekdayDraft}, ${dateDraft}.`);
  };

  const handleAddStudent = async () => {
    if (!name.trim()) {
      notify("Missing name", "Please enter the student's name.");
      return;
    }
    if (!primaryClass?.id) {
      notify("No group", "You're not assigned to a group yet.");
      return;
    }
    try {
      const created = await createStudent({
        name: name.trim(),
        parentName: parent.trim() || "Parent",
        groupId: primaryClass.id,
      });
      setMarks((prev) => ({ ...prev, [String(created.id)]: "present" }));
      setName("");
      setParent("");
      setShowAdd(false);
      notify("Student added", `${created.name} was added to attendance.`);
      reload();
    } catch (err) {
      notify("Could not add student", String(err));
    }
  };

  const handleSaveAttendance = async () => {
    if (!todayLesson?.id) {
      notify("No lesson", "There's no lesson scheduled for today.");
      return;
    }
    try {
      await saveAttendance(marks);
      notify(
        "Attendance saved",
        `${weekdayDraft}, ${dateDraft}\n${summary.present} present · ${summary.absent} absent`,
        () => router.back()
      );
    } catch (err) {
      notify("Could not save", String(err));
    }
  };

  // ---- Render (identical to original, plus two guard branches) ---
  return (
    <Screen>
      <BackHeader title={t("teacher.attendance")} subtitle={attendanceLabel} />

      {!todayLesson ? (
        <SoftCard style={{ marginBottom: 14 }}>
          <Text style={styles.dateHint}>
            No lesson is scheduled for today. Ask your admin to mark a
            lesson as "this week" to enable attendance.
          </Text>
        </SoftCard>
      ) : null}

      <SoftCard style={styles.dateCard}>
        <View style={styles.dateHeader}>
          <Ionicons name="calendar-outline" size={18} color={C.primary} />
          <Text style={styles.dateCardTitle}>{t("teacher.setDate")}</Text>
        </View>
        <Text style={styles.dateHint}>
          Fill in the day and date yourself for this attendance session.
        </Text>

        <Text style={styles.label}>Day</Text>
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((day) => {
            const active = weekdayDraft === day;
            return (
              <TouchableOpacity
                key={day}
                style={[styles.weekdayChip, active && styles.weekdayChipActive]}
                onPress={() => setWeekdayDraft(day)}
              >
                <Text
                  style={[
                    styles.weekdayChipText,
                    active && styles.weekdayChipTextActive,
                  ]}
                >
                  {day.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. September 14, 2026"
          placeholderTextColor={C.muted}
          value={dateDraft}
          onChangeText={setDateDraft}
        />

        <TouchableOpacity style={styles.saveDateBtn} onPress={handleSaveDate}>
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={styles.saveDateText}>{t("teacher.saveDate")}</Text>
        </TouchableOpacity>
      </SoftCard>

      <View style={styles.topRow}>
        <Text style={styles.count}>
          {summary.total} {t("teacher.studentsSub")}
        </Text>
        <TouchableOpacity
          style={styles.addChip}
          onPress={() => setShowAdd(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="person-add-outline" size={16} color={C.primary} />
          <Text style={styles.addChipText}>{t("teacher.addStudent")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Ionicons name="checkmark" size={16} color={C.success} />
          <Text style={[styles.legendText, { color: C.success }]}>
            {t("parent.present")}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="close" size={16} color={C.danger} />
          <Text style={[styles.legendText, { color: C.danger }]}>
            {t("parent.absent")}
          </Text>
        </View>
      </View>

      <SoftCard style={styles.listCard}>
        {list.map((student, index) => (
          <AttendanceRow
            key={student.id}
            student={student}
            last={index === list.length - 1}
            onPress={() => toggle(student.id)}
          />
        ))}
      </SoftCard>

      {apiError ? (
        <Text style={[styles.dateHint, { color: C.danger, marginTop: 8 }]}>
          {apiError}
        </Text>
      ) : null}

      <PrimaryButton
        label={t("teacher.saveAttendance")}
        icon="checkmark-done-outline"
        onPress={handleSaveAttendance}
      />

      <Modal
        visible={showAdd}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAdd(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowAdd(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{t("teacher.addStudent")}</Text>
            <Text style={styles.modalSub}>
              Add a child to your group attendance list.
            </Text>

            <Text style={styles.label}>Student name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ruth Bekele"
              placeholderTextColor={C.muted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Parent name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Hanna Bekele"
              placeholderTextColor={C.muted}
              value={parent}
              onChangeText={setParent}
            />

            <PrimaryButton
              label={t("teacher.addStudent")}
              onPress={handleAddStudent}
            />
            <TouchableOpacity
              style={styles.cancel}
              onPress={() => setShowAdd(false)}
            >
              <Text style={styles.cancelText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

// ------------------------------------------------------------------
// Row — prop type widened to accept the adapted student shape
// ------------------------------------------------------------------
function AttendanceRow({
  student,
  last,
  onPress,
}: {
  student: Student & { attendance: Mark };
  last: boolean;
  onPress: () => void;
}) {
  const present = student.attendance === "present";

  return (
    <SoftCard style={[styles.row, !last && styles.rowBorder]} onPress={onPress}>
      <Text style={styles.name}>{student.name}</Text>
      <View
        style={[
          styles.mark,
          { backgroundColor: present ? C.successSoft : "#FDECEC" },
        ]}
      >
        <Ionicons
          name={present ? "checkmark" : "close"}
          size={18}
          color={present ? C.success : C.danger}
        />
      </View>
    </SoftCard>
  );
}

// ------------------------------------------------------------------
// Styles — unchanged from your original
// ------------------------------------------------------------------
const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateCard: {
    marginBottom: 14,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  dateCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
  },
  dateHint: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  weekdayRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  weekdayChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: C.bgSoft,
    borderWidth: 1,
    borderColor: C.border,
  },
  weekdayChipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  weekdayChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
  },
  weekdayChipTextActive: {
    color: "#fff",
  },
  saveDateBtn: {
    marginTop: 8,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.secondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveDateText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  count: {
    fontSize: 16,
    fontWeight: "600",
    color: C.muted,
  },
  addChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addChipText: {
    color: C.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  legend: {
    flexDirection: "row",
    gap: 18,
    marginBottom: 14,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendText: {
    fontSize: 14,
    fontWeight: "700",
  },
  listCard: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: "transparent",
    borderRadius: 0,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: C.text,
    flex: 1,
  },
  mark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
  },
  modalSub: {
    marginTop: 6,
    marginBottom: 14,
    color: C.muted,
    lineHeight: 20,
  },
  label: {
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: C.bg,
    color: C.text,
    marginBottom: 8,
  },
  cancel: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelText: {
    color: C.muted,
    fontWeight: "600",
  },
});