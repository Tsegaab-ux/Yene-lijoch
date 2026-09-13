import React, { createContext, useContext, useMemo, useState } from "react";
import {
  AdminChild,
  AdminClass,
  AdminEvent,
  AdminLesson,
  AdminTeacher,
  INITIAL_CHILDREN,
  INITIAL_CLASSES,
  INITIAL_EVENTS,
  INITIAL_LESSONS,
  INITIAL_TEACHERS,
} from "../data/adminMock";

type AdminDataContextValue = {
  teachers: AdminTeacher[];
  children: AdminChild[];
  classes: AdminClass[];
  events: AdminEvent[];
  lessons: AdminLesson[];
  addTeacher: (teacher: Omit<AdminTeacher, "id" | "classIds">) => void;
  toggleTeacherStatus: (id: string) => void;
  addChild: (child: Omit<AdminChild, "id">) => void;
  assignTeacherToClass: (classId: string, teacherId: string | null) => void;
  addEvent: (event: Omit<AdminEvent, "id">) => void;
  updateLessonProgress: (id: string, progress: number) => void;
  publishLesson: (id: string) => void;
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);
  const [childList, setChildList] = useState(INITIAL_CHILDREN);
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [lessons, setLessons] = useState(INITIAL_LESSONS);

  const value = useMemo<AdminDataContextValue>(
    () => ({
      teachers,
      children: childList,
      classes,
      events,
      lessons,

      addTeacher: (teacher) => {
        const id = makeId("t");
        setTeachers((prev) => [
          ...prev,
          { ...teacher, id, classIds: [], status: teacher.status ?? "active" },
        ]);
      },

      toggleTeacherStatus: (id) => {
        setTeachers((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, status: t.status === "active" ? "inactive" : "active" }
              : t
          )
        );
      },

      addChild: (child) => {
        setChildList((prev) => [...prev, { ...child, id: makeId("c") }]);
        setClasses((prev) =>
          prev.map((c) =>
            c.id === child.classId
              ? { ...c, studentCount: c.studentCount + 1 }
              : c
          )
        );
      },

      assignTeacherToClass: (classId, teacherId) => {
        setClasses((prev) =>
          prev.map((c) => (c.id === classId ? { ...c, teacherId } : c))
        );
        setTeachers((prev) =>
          prev.map((t) => {
            const hasClass = t.classIds.includes(classId);
            if (teacherId && teacherId === t.id && !hasClass) {
              return { ...t, classIds: [...t.classIds, classId] };
            }
            if ((!teacherId || teacherId !== t.id) && hasClass) {
              return { ...t, classIds: t.classIds.filter((id) => id !== classId) };
            }
            return t;
          })
        );
      },

      addEvent: (event) => {
        setEvents((prev) => [...prev, { ...event, id: makeId("e") }]);
      },

      updateLessonProgress: (id, progress) => {
        setLessons((prev) =>
          prev.map((l) =>
            l.id === id
              ? {
                  ...l,
                  progress: Math.min(100, Math.max(0, progress)),
                  status: progress >= 100 ? "completed" : l.status,
                }
              : l
          )
        );
      },

      publishLesson: (id) => {
        setLessons((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: "published" } : l))
        );
      },
    }),
    [teachers, childList, classes, events, lessons]
  );

  return (
    <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData must be used within AdminDataProvider");
  }
  return context;
}
