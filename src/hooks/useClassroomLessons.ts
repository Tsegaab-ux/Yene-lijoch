// app/hooks/useClassroomLessons.ts
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import { TeacherLesson } from "../types/lessonTypes";

/**
 * Fetch all lessons for a given classroom.
 * Used by the parent courses screen — scoped to the selected child's class.
 */
export function useClassroomLessons(classroomId?: number | string) {
  const [lessons, setLessons] = useState<TeacherLesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!classroomId) {
      setLessons([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.get<TeacherLesson[]>("/lessons/", {
        params: { classroom: classroomId, published: true },
      });
      setLessons(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        "Failed to load curriculum";
      setError(String(message));
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return { lessons, isLoading, error, refetch: fetchLessons };
}