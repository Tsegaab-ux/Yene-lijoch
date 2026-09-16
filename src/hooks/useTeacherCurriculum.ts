// app/hooks/useTeacherCurriculum.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import {
  TeacherLesson,
  TodayLessonResponse,
  UseTeacherCurriculumReturn,
} from "../types/lessonTypes";
import { groupLessonsByMonth } from "@/utils/groupLessonsByMonth";

export function useTeacherCurriculum(): UseTeacherCurriculumReturn {
  const [todayLesson, setTodayLesson] = useState<TeacherLesson | null>(null);
  const [nextLesson, setNextLesson] = useState<TeacherLesson | null>(null);
  const [upcoming, setUpcoming] = useState<TeacherLesson[]>([]);
  const [lesson, setLesson] = useState<TeacherLesson>();
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

  const fetchCurriculum = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [todayRes, upcomingRes] = await Promise.all([
        api.get<TodayLessonResponse>("/lessons/today/"),
        api.get<TeacherLesson[]>("/lessons/upcoming/", { params: { limit: 20 } }),
      ]);

      setTodayLesson(todayRes.data.lesson);
      setNextLesson(todayRes.data.next);
      setUpcoming(upcomingRes.data);
    } catch (err) {
      setError(extractError(err, "Failed to load curriculum"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  
  const fetchLesson = useCallback(async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<TeacherLesson>(`/lessons/${id}/`);
      setLesson(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          err?.message ??
          "Failed to load lesson"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const months = useMemo(
    () => groupLessonsByMonth(upcoming),
    [upcoming]
  );

  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  return {
    lesson: lesson as TeacherLesson,
    todayLesson,
    nextLesson,
    upcoming,
    isLoading,
    months,  
    error,
    refetch: fetchCurriculum,
    fetchLesson,
  };
}
