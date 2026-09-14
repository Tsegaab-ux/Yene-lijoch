import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { useSharedContent } from "../../../contexts/SharedContentContext";
import { confirmAction, notify } from "../../../utils/mediaPicker";

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

export default function AdminGroupsScreen() {
  const {
    groups,
    students,
    addGroup,
    removeGroup,
    addStudent,
    removeStudent,
    getStudentsByGroup,
  } = useSharedContent();

  const [showCreate, setShowCreate] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [teacherName, setTeacherName] = useState("Hana Bekele");
  const [drafts, setDrafts] = useState<DraftStudent[]>([emptyDraft()]);

  const [targetGroupId, setTargetGroupId] = useState(groups[0]?.id ?? "");
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("Grade 3");
  const [age, setAge] = useState("8");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("parent@test.com");

  useEffect(() => {
    if (!groups.find((g) => g.id === targetGroupId) && groups[0]) {
      setTargetGroupId(groups[0].id);
    }
  }, [groups, targetGroupId]);

  const updateDraft = (key: string, patch: Partial<DraftStudent>) => {
    setDrafts((prev) =>
      prev.map((d) => (d.key === key ? { ...d, ...patch } : d))
    );
  };

  const handleCreateGroupWithStudents = () => {
    if (!groupName.trim()) {
      notify("Missing group name", "Enter a name for the new group.");
      return;
    }

    const validStudents = drafts.filter((d) => d.name.trim());
    const created = addGroup(groupName, teacherName);

    validStudents.forEach((d) => {
      addStudent({
        name: d.name.trim(),
        groupId: created.id,
        grade: d.grade.trim() || "Grade 1",
        age: Number(d.age) || 6,
        parentName: d.parentName.trim() || "Parent",
        parentEmail: d.parentEmail.trim() || "parent@test.com",
      });
    });

    setTargetGroupId(created.id);
    setGroupName("");
    setTeacherName("Hana Bekele");
    setDrafts([emptyDraft()]);
    setShowCreate(false);
    notify(
      "Group saved",
      `${created.name} created with ${validStudents.length} student${
        validStudents.length === 1 ? "" : "s"
      }.`
    );
  };

  const handleAddStudentToExisting = () => {
    if (!studentName.trim()) {
      notify("Missing name", "Enter the student name.");
      return;
    }
    if (!targetGroupId) {
      notify("No group", "Create a group first, then add students.");
      return;
    }

    addStudent({
      name: studentName.trim(),
      groupId: targetGroupId,
      grade: grade.trim() || "Grade 1",
      age: Number(age) || 6,
      parentName: parentName.trim() || "Parent",
      parentEmail: parentEmail.trim() || "parent@test.com",
    });

    setStudentName("");
    setParentName("");
    setShowAddStudent(false);
    notify("Student added", "Added to the selected group.");
  };

  return (
    <Screen>
      <TopBar
        title="Groups"
        subtitle="Create a group and add students together"
        actionLabel={showCreate ? "Close" : "+ Group"}
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
          <Text style={styles.quickPrimaryText}>New group + students</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => {
            setShowAddStudent((v) => !v);
            setShowCreate(false);
          }}
        >
          <Ionicons name="person-add-outline" size={16} color={C.primary} />
          <Text style={styles.quickText}>Add student</Text>
        </TouchableOpacity>
      </View>

      {showCreate ? (
        <SoftCard style={{ marginBottom: 14 }}>
          <Text style={styles.formTitle}>Create group</Text>
          <Field
            label="Group name"
            value={groupName}
            onChangeText={setGroupName}
            placeholder="e.g. Group C"
          />
          <Field
            label="Teacher name"
            value={teacherName}
            onChangeText={setTeacherName}
            placeholder="Teacher for this group"
          />

          <Text style={styles.section}>Students in this group</Text>
          <Text style={styles.hint}>
            Add one or more students now. You can leave rows empty if you only
            want the group.
          </Text>

          {drafts.map((draft, index) => (
            <View key={draft.key} style={styles.draftCard}>
              <View style={styles.draftHeader}>
                <Text style={styles.draftTitle}>Student {index + 1}</Text>
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
                label="Student name"
                value={draft.name}
                onChangeText={(name) => updateDraft(draft.key, { name })}
                placeholder="e.g. Ruth Bekele"
              />
              <Field
                label="Grade"
                value={draft.grade}
                onChangeText={(gradeValue) =>
                  updateDraft(draft.key, { grade: gradeValue })
                }
              />
              <Field
                label="Age"
                value={draft.age}
                onChangeText={(ageValue) =>
                  updateDraft(draft.key, { age: ageValue })
                }
              />
              <Field
                label="Parent name"
                value={draft.parentName}
                onChangeText={(parentNameValue) =>
                  updateDraft(draft.key, { parentName: parentNameValue })
                }
              />
              <Field
                label="Parent email"
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
            <Text style={styles.addRowText}>Add another student</Text>
          </TouchableOpacity>

          <PrimaryButton
            label="Save group & students"
            icon="checkmark-circle-outline"
            onPress={handleCreateGroupWithStudents}
          />
        </SoftCard>
      ) : null}

      {showAddStudent ? (
        <SoftCard style={{ marginBottom: 14 }}>
          <Text style={styles.formTitle}>Add student to existing group</Text>
          {groups.length === 0 ? (
            <Text style={styles.hint}>
              No groups yet. Create a group first.
            </Text>
          ) : (
            <>
              <Text style={styles.label}>Choose group</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 8 }}
              >
                {groups.map((g) => (
                  <Pill
                    key={g.id}
                    label={g.name}
                    active={targetGroupId === g.id}
                    onPress={() => setTargetGroupId(g.id)}
                  />
                ))}
              </ScrollView>
              <Field
                label="Student name"
                value={studentName}
                onChangeText={setStudentName}
              />
              <Field label="Grade" value={grade} onChangeText={setGrade} />
              <Field label="Age" value={age} onChangeText={setAge} />
              <Field
                label="Parent name"
                value={parentName}
                onChangeText={setParentName}
              />
              <Field
                label="Parent email"
                value={parentEmail}
                onChangeText={setParentEmail}
              />
              <PrimaryButton
                label="Add student"
                icon="person-add-outline"
                onPress={handleAddStudentToExisting}
              />
            </>
          )}
        </SoftCard>
      ) : null}

      <SectionLabel
        title={`${groups.length} groups · ${students.length} students`}
      />

      {groups.length === 0 ? (
        <SoftCard>
          <Text style={styles.empty}>
            No groups yet. Tap “+ Group” to create one and add students.
          </Text>
        </SoftCard>
      ) : null}

      {groups.map((group) => {
        const roster = getStudentsByGroup(group.id);
        return (
          <SoftCard key={group.id} style={styles.card}>
            <View style={styles.groupHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.groupTitle}>{group.name}</Text>
                <Text style={styles.meta}>
                  Teacher: {group.teacherName} · {roster.length} students
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
                onPress={() =>
                  confirmAction(
                    "Delete group?",
                    `${group.name} and its students will be removed.`,
                    () => {
                      removeGroup(group.id);
                      notify("Group deleted", group.name);
                    }
                  )
                }
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
                    confirmAction("Remove student?", student.name, () => {
                      removeStudent(student.id);
                      notify("Removed", student.name);
                    })
                  }
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            {roster.length === 0 ? (
              <Text style={styles.empty}>No students in this group yet</Text>
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
  quickPrimary: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
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
  hint: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
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
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
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
