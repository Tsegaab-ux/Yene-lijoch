// app/hooks/useTodayLessonForClass.ts
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import { TeacherLesson } from "../types/lessonTypes";

interface TodayLessonResponse {
  lesson: TeacherLesson | null;
  next: TeacherLesson | null;
}

export function useTodayLessonForClass(classroomId?: number | string) {
  const [lesson, setLesson] = useState<TeacherLesson | null>(null);
  const [nextLesson, setNextLesson] = useState<TeacherLesson | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLesson = useCallback(async () => {
    if (!classroomId) {
      setLesson(null);
      setNextLesson(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.get<TodayLessonResponse>("/lessons/today/", {
        params: { classroom: classroomId },
      });
      setLesson(data.lesson);
      setNextLesson(data.next);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        "Failed to load lesson";
      setError(String(message));
      setLesson(null);
      setNextLesson(null);
    } finally {
      setIsLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  return {
    lesson,
    nextLesson,
    isLoading,
    error,
    refetch: fetchLesson,
  };
}