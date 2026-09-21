// app/contexts/TeacherCurriculumContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useTeacherCurriculum } from "../hooks/useTeacherCurriculum";
import {
  TeacherLesson,
  UseTeacherCurriculumReturn,
} from "../types/lessonTypes";

const TeacherCurriculumContext = createContext<UseTeacherCurriculumReturn | undefined>(
  undefined
);

export function TeacherCurriculumProvider({ children }: { children: ReactNode }) {
  const value = useTeacherCurriculum();
  return (
    <TeacherCurriculumContext.Provider value={value}>
      {children}
    </TeacherCurriculumContext.Provider>
  );
}

export function useTeacherCurriculumContext(): UseTeacherCurriculumReturn {
  const ctx = useContext(TeacherCurriculumContext);
  if (!ctx) {
    throw new Error(
      "useTeacherCurriculumContext must be used inside <TeacherCurriculumProvider>"
    );
  }
  return ctx;
}

export type { TeacherLesson };
