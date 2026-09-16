// app/contexts/TeacherContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useTeacherData } from "../hooks/useTeacherData";
import { Teacher, TeacherClass, TeacherUpdateData } from "../types/teacherTypes";

interface TeacherContextValue {
  teacher: Teacher | null;
  primaryClass: TeacherClass | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refetch: () => Promise<Teacher | null>;
  updateTeacher: (data: TeacherUpdateData) => Promise<Teacher>;
}

const TeacherContext = createContext<TeacherContextValue | undefined>(undefined);

export function TeacherProvider({ children }: { children: ReactNode }) {
  const data = useTeacherData();
  return (
    <TeacherContext.Provider value={data}>{children}</TeacherContext.Provider>
  );
}

export function useTeacher() {
  const ctx = useContext(TeacherContext);
  if (!ctx) throw new Error("useTeacher must be used inside <TeacherProvider>");
  return ctx;
}