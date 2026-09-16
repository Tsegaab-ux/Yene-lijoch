// app/hooks/useTeacherData.ts
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import {
  Teacher,
  TeacherClass,
  UseTeacherDataReturn,
} from "../types/teacherTypes";

export function useTeacherData(): UseTeacherDataReturn {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractError = (err: unknown, fallback: string): string => {
    const e = err as any;
    const data = e?.response?.data;
    if (data) {
      if (typeof data === "string") return data;
      if (data.detail) return String(data.detail);
      if (data.error) return String(data.error);
      if (typeof data === "object") {
        const messages = Object.values(data).flat().filter(Boolean).join(", ");
        if (messages) return messages;
      }
    }
    return err instanceof Error ? err.message : fallback;
  };

  const fetchTeacher = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Teacher>("/teachers/me/");
      setTeacher(data);
      return data;
    } catch (err) {
      setError(extractError(err, "Failed to load teacher profile"));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeacher();
  }, []);

  // Derived helpers the UI reads directly.
  const primaryClass: TeacherClass | null = teacher?.classes?.[0] ?? null;

  return {
    teacher,
    primaryClass,
    isLoading,
    error,
    refetch: fetchTeacher,
  };
}
