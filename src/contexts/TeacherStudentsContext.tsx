import React, { createContext, useContext, useMemo, useState } from "react";
import { STUDENTS, SundayStudent, TEACHER } from "../data/teacherMock";

type NewStudentInput = {
  name: string;
  parent: string;
  group?: string;
  notes?: string;
};

type TeacherStudentsContextValue = {
  students: SundayStudent[];
  addStudent: (input: NewStudentInput) => SundayStudent;
  updateAttendance: (
    marks: Record<string, "present" | "absent" | "unmarked">
  ) => void;
};

const TeacherStudentsContext =
  createContext<TeacherStudentsContextValue | null>(null);

const COLORS = [
  "#C45C26",
  "#3D6B5A",
  "#4A6FA5",
  "#D4A017",
  "#7A5C9E",
  "#2F9E6B",
];

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function TeacherStudentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [students, setStudents] = useState(STUDENTS);

  const value = useMemo<TeacherStudentsContextValue>(
    () => ({
      students,
      addStudent: (input) => {
        const created: SundayStudent = {
          id: `s-${Date.now()}`,
          name: input.name.trim(),
          initials: initialsFromName(input.name),
          color: COLORS[students.length % COLORS.length],
          group: input.group?.trim() || TEACHER.group,
          attendance: "present",
          parent: input.parent.trim() || "Parent",
          notes: input.notes?.trim() || "Newly added student.",
        };
        setStudents((prev) => [...prev, created]);
        return created;
      },
      updateAttendance: (marks) => {
        setStudents((prev) =>
          prev.map((s) => ({
            ...s,
            attendance: marks[s.id] ?? s.attendance,
          }))
        );
      },
    }),
    [students]
  );

  return (
    <TeacherStudentsContext.Provider value={value}>
      {children}
    </TeacherStudentsContext.Provider>
  );
}

export function useTeacherStudents() {
  const context = useContext(TeacherStudentsContext);
  if (!context) {
    throw new Error(
      "useTeacherStudents must be used within TeacherStudentsProvider"
    );
  }
  return context;
}
