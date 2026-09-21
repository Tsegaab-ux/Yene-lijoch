import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { AdminColors as C } from "../../../constants/adminTheme";
import { useClassrooms } from "@/hooks/useClassrooms";
import { useLanguage } from "../../../contexts/LanguageContext";
import { notify } from "@/utils/notify";

type DraftStudent = {
  key: string;
  name: string;
  grade: string;
  age: string;
  parentName: string;
  parentEmail: string;
};

function emptyDraft(): DraftStudent {
  return {
    key: `d-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    grade: "Grade 3",
    age: "8",
    parentName: "",
    parentEmail: "parent@test.com",
  };
}

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

export default function AdminGroupsScreen() {
  const { t } = useLanguage();
  const {
    classrooms: groups,
    isLoading,
    fetchClassrooms,
    addClassroom,
    deleteClassroom,
    addStudentToClass,
    removeStudentFromClass,
  } = useClassrooms();

  // Fetch once on mount.
  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  const [showCreate, setShowCreate] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [teacherName, setTeacherName] = useState("Hana Bekele");
  const [drafts, setDrafts] = useState<DraftStudent[]>([emptyDraft()]);

  const [targetGroupId, setTargetGroupId] = useState<number | string>(
    groups[0]?.id ?? ""
  );
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("Grade 3");
  const [age, setAge] = useState("8");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("parent@test.com");

  // Sync the "add student to which group" picker if the group list changes.
  useEffect(() => {
    if (!groups.find((g) => String(g.id) === String(targetGroupId)) && groups[0]) {
      setTargetGroupId(groups[0].id);
    }
  }, [groups, targetGroupId]);

  const updateDraft = (key: string, patch: Partial<DraftStudent>) => {
    setDrafts((prev) =>
      prev.map((d) => (d.key === key ? { ...d, ...patch } : d))
    );
  };

  // ------------------------------------------------------------------
  // Create group with students
  // ------------------------------------------------------------------
  const handleCreateGroupWithStudents = async () => {
    if (!groupName.trim()) {
      notify(t("common.error"), t("admin.groupNameRequired"));
      return;
    }

    const validStudents = drafts.filter((d) => d.name.trim());

    try {
      const created = await addClassroom({
        name: groupName.trim(),
        teacherName: teacherName.trim() || undefined,
        students: validStudents.map((d) => ({
          name: d.name.trim(),
          grade: d.grade.trim() || "Grade 1",
          age: Number(d.age) || 6,
          parentName: d.parentName.trim() || "Parent",
          parentEmail: d.parentEmail.trim() || "parent@test.com",
        })),
      });

      setTargetGroupId(created.id);
      setGroupName("");
      setTeacherName("Hana Bekele");
      setDrafts([emptyDraft()]);
      setShowCreate(false);

      notify(
        t("common.success"),
        t("admin.groupCreated", {
          name: created.name,
          count: validStudents.length,
        })
      );
    } catch (err: any) {
      notify(t("common.error"), String(err));
    }
  };

  // ------------------------------------------------------------------
  // Add student to an existing group
  // ------------------------------------------------------------------
  const handleAddStudentToExisting = async () => {
    if (!studentName.trim()) {
      notify(t("common.error"), t("admin.studentNameRequired"));
      return;
    }
    if (!targetGroupId) {
      notify(t("common.error"), t("admin.createGroupFirst"));
      return;
    }

    try {
      await addStudentToClass(targetGroupId, {
        name: studentName.trim(),
        grade: grade.trim() || "Grade 1",
        age: Number(age) || 6,
        parentName: parentName.trim() || "Parent",
        parentEmail: parentEmail.trim() || "parent@test.com",
      });

      setStudentName("");
      setParentName("");
      setShowAddStudent(false);
      notify(t("common.success"), t("admin.studentAddedToGroup"));
    } catch (err: any) {
      notify(t("common.error"), String(err));
    }
  };

  // ------------------------------------------------------------------
  // Remove student
  // ------------------------------------------------------------------
  const handleRemoveStudent = async (groupId: number | string, studentId: number | string, name: string) => {
    const ok = await confirm(t("admin.removeStudentTitle"), name);
    if (!ok) return;
    try {
      await removeStudentFromClass(groupId, studentId);
      notify(t("common.success"), name);
    } catch (err: any) {
      notify(t("common.error"), String(err));
    }
  };

  // ------------------------------------------------------------------
  // Delete group
  // ------------------------------------------------------------------
  const handleDeleteGroup = async (groupId: number | string, name: string) => {
    const ok = await confirm(
      t("admin.deleteGroupTitle"),
      t("admin.deleteGroupBody", { name })
    );
    if (!ok) return;
    try {
      await deleteClassroom(groupId);
      notify(t("common.success"), name);
    } catch (err: any) {
      notify(t("common.error"), String(err));
    }
  };

  // Total student count across all groups (approximate — sums rosters).
  const totalStudents = groups.reduce(
    (sum, g) => sum + (g.roster?.length ?? g.student_count ?? 0),
    0
  );

  return (
    <Screen>
      <TopBar
        title={t("admin.groupsTitle")}
        subtitle={t("admin.groupsSub")}
        actionLabel={showCreate ? t("common.close") : `+ ${t("admin.group")}`}
        onAction={() => {
          setShowCreate((v) => !v);
          setShowAddStudent(false);
        }}
      />

      <View style={styles.quickRow}>
        <TouchableOpacity
          style={[styles.quickBtn, styles.quickPrimary]}
          onPress={() => {
            setShowCreate(true);
            setShowAddStudent(false);
          }}
        >
          <Ionicons name="people" size={16} color="#fff" />
          <Text style={styles.quickPrimaryText}>
            {t("admin.newGroupStudents")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => {
            setShowAddStudent((v) => !v);
            setShowCreate(false);
          }}
        >
          <Ionicons name="person-add-outline" size={16} color={C.primary} />
          <Text style={styles.quickText}>{t("admin.addStudent")}</Text>
        </TouchableOpacity>
      </View>

      {/* ---------- Create group form ---------- */}
      {showCreate ? (
        <SoftCard style={{ marginBottom: 14 }}>
          <Text style={styles.formTitle}>{t("admin.createGroupTitle")}</Text>
          <Field
            label={t("admin.groupName")}
            value={groupName}
            onChangeText={setGroupName}
            placeholder={t("admin.groupNamePlaceholder")}
          />
          <Field
            label={t("admin.teacherName")}
            value={teacherName}
            onChangeText={setTeacherName}
            placeholder={t("admin.teacherNamePlaceholder")}
          />

          <Text style={styles.section}>
            {t("admin.studentsInThisGroup")}
          </Text>
          <Text style={styles.hint}>{t("admin.studentsInThisGroupHint")}</Text>

          {drafts.map((draft, index) => (
            <View key={draft.key} style={styles.draftCard}>
              <View style={styles.draftHeader}>
                <Text style={styles.draftTitle}>
                  {t("admin.studentNumber", { n: index + 1 })}
                </Text>
                {drafts.length > 1 ? (
                  <TouchableOpacity
                    onPress={() =>
                      setDrafts((prev) =>
                        prev.filter((d) => d.key !== draft.key)
                      )
                    }
                  >
                    <Ionicons name="trash-outline" size={18} color={C.danger} />
                  </TouchableOpacity>
                ) : null}
              </View>
              <Field
                label={t("admin.studentName")}
                value={draft.name}
                onChangeText={(name) => updateDraft(draft.key, { name })}
                placeholder={t("admin.studentNamePlaceholder")}
              />
              <Field
                label={t("admin.grade")}
                value={draft.grade}
                onChangeText={(gradeValue) =>
                  updateDraft(draft.key, { grade: gradeValue })
                }
              />
              <Field
                label={t("admin.age")}
                value={draft.age}
                onChangeText={(ageValue) =>
                  updateDraft(draft.key, { age: ageValue })
                }
              />
              <Field
                label={t("admin.parentName")}
                value={draft.parentName}
                onChangeText={(parentNameValue) =>
                  updateDraft(draft.key, { parentName: parentNameValue })
                }
              />
              <Field
                label={t("admin.parentEmail")}
                value={draft.parentEmail}
                onChangeText={(parentEmailValue) =>
                  updateDraft(draft.key, { parentEmail: parentEmailValue })
                }
              />
            </View>
          ))}

          <TouchableOpacity
            style={styles.addRowBtn}
            onPress={() => setDrafts((prev) => [...prev, emptyDraft()])}
          >
            <Ionicons name="add-circle-outline" size={18} color={C.primary} />
            <Text style={styles.addRowText}>
              {t("admin.addAnotherStudent")}
            </Text>
          </TouchableOpacity>

          <PrimaryButton
            label={t("admin.saveGroupAndStudents")}
            icon="checkmark-circle-outline"
            onPress={handleCreateGroupWithStudents}
            disabled={false}
          />
        </SoftCard>
      ) : null}

      {/* ---------- Add student to existing group ---------- */}
      {showAddStudent ? (
        <SoftCard style={{ marginBottom: 14 }}>
          <Text style={styles.formTitle}>
            {t("admin.addStudentToExisting")}
          </Text>
          {groups.length === 0 ? (
            <Text style={styles.hint}>{t("admin.noGroupsYet")}</Text>
          ) : (
            <>
              <Text style={styles.label}>{t("admin.chooseGroup")}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 8 }}
              >
                {groups.map((g) => (
                  <Pill
                    key={g.id}
                    label={g.name}
                    active={String(targetGroupId) === String(g.id)}
                    onPress={() => setTargetGroupId(g.id)}
                  />
                ))}
              </ScrollView>
              <Field
                label={t("admin.studentName")}
                value={studentName}
                onChangeText={setStudentName}
              />
              <Field label={t("admin.grade")} value={grade} onChangeText={setGrade} />
              <Field label={t("admin.age")} value={age} onChangeText={setAge} />
              <Field
                label={t("admin.parentName")}
                value={parentName}
                onChangeText={setParentName}
              />
              <Field
                label={t("admin.parentEmail")}
                value={parentEmail}
                onChangeText={setParentEmail}
              />
              <PrimaryButton
                label={t("admin.addStudent")}
                icon="person-add-outline"
                onPress={handleAddStudentToExisting}
                disabled={false}
              />
            </>
          )}
        </SoftCard>
      ) : null}

      <SectionLabel
        title={t("admin.groupsSummary", {
          groups: groups.length,
          students: totalStudents,
        })}
      />

      {isLoading && groups.length === 0 ? (
        <SoftCard>
          <Text style={styles.empty}>{t("common.loading")}</Text>
        </SoftCard>
      ) : null}

      {!isLoading && groups.length === 0 ? (
        <SoftCard>
          <Text style={styles.empty}>{t("admin.noGroupsHint")}</Text>
        </SoftCard>
      ) : null}

      {groups.map((group) => {
        const roster = group.roster ?? [];
        return (
          <SoftCard key={group.id} style={styles.card}>
            <View style={styles.groupHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.groupTitle}>{group.name}</Text>
                <Text style={styles.meta}>
                  {t("admin.groupMeta", {
                    teacher: group.teacherName ?? "",
                    count: roster.length || group.student_count || 0,
                  })}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => {
                  setTargetGroupId(group.id);
                  setShowAddStudent(true);
                  setShowCreate(false);
                }}
              >
                <Ionicons name="person-add-outline" size={18} color={C.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => handleDeleteGroup(group.id, group.name)}
              >
                <Ionicons name="trash-outline" size={18} color={C.danger} />
              </TouchableOpacity>
            </View>

            {roster.map((student) => (
              <View key={student.id} style={styles.studentRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.meta}>
                    {student.grade} · {student.parentName}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeChip}
                  onPress={() =>
                    handleRemoveStudent(group.id, student.id, student.name)
                  }
                >
                  <Text style={styles.removeText}>{t("common.remove")}</Text>
                </TouchableOpacity>
              </View>
            ))}

            {roster.length === 0 ? (
              <Text style={styles.empty}>{t("admin.noStudentsInGroup")}</Text>
            ) : null}
          </SoftCard>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  quickRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  quickBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.primary,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  quickPrimary: { backgroundColor: C.primary, borderColor: C.primary },
  quickText: { color: C.primary, fontWeight: "800", fontSize: 12 },
  quickPrimaryText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  formTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.text,
    marginBottom: 10,
  },
  section: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "800",
    color: C.text,
  },
  hint: { color: C.muted, fontSize: 12, lineHeight: 17, marginBottom: 10 },
  label: {
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
    fontSize: 13,
  },
  draftCard: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  draftHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  draftTitle: { fontWeight: "800", color: C.primary, fontSize: 13 },
  addRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    paddingVertical: 8,
  },
  addRowText: { color: C.primary, fontWeight: "800", fontSize: 13 },
  card: { marginBottom: 12 },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  groupTitle: { fontSize: 17, fontWeight: "800", color: C.text },
  meta: { marginTop: 3, fontSize: 12, color: C.muted },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  studentName: { fontSize: 14, fontWeight: "700", color: C.text },
  removeChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#FCE8E8",
  },
  removeText: { color: C.danger, fontWeight: "700", fontSize: 12 },
  empty: { marginTop: 10, color: C.muted, fontStyle: "italic" },
});