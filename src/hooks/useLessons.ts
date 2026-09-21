// app/hooks/useLessons.ts
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import { TeacherLesson, LessonStatus } from "../types/lessonTypes";

export interface LessonCreatePayload {
  classroom: number | string;
  title: string;
  category?: string;
  week?: number;
  lesson_date: string;
  date_label?: string;
  year?: number;
  scripture?: string;
  memory_verse?: string;
  description?: string;
  status?: LessonStatus;
  published?: boolean;
  cover?: File | null;
  attachment?: File | null;
  attachment_name?: string;
  attachment_type?: string;
}

export function useLessons(params?: { classroom?: number | string; status?: string }) {
  const [lessons, setLessons] = useState<TeacherLesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractError = (err: unknown, fallback: string): string => {
    const e = err as any;
    const data = e?.response?.data;
    if (data) {
      if (typeof data === "string") return data;
      if (data.detail) return String(data.detail);
      if (typeof data === "object") {
        const messages = Object.values(data).flat().filter(Boolean).join(", ");
        if (messages) return messages;
      }
    }
    return err instanceof Error ? err.message : fallback;
  };

  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<TeacherLesson[]>("/lessons/", { params });
      setLessons(data);
      return data;
    } catch (err) {
      setError(extractError(err, "Failed to fetch lessons"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [params?.classroom, params?.status]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // ------------------------------------------------------------------
  const createLesson = useCallback(
    async (payload: LessonCreatePayload) => {
      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") return;
        if (typeof File !== "undefined" && value instanceof File) {
          form.append(key, value);
        } else if (typeof value === "boolean") {
          form.append(key, value ? "true" : "false");
        } else {
          form.append(key, String(value));
        }
      });

      const response = await api.post<TeacherLesson>("/lessons/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLessons((prev) => [response.data, ...prev]);
      return response.data;
    },
    []
  );

  const updateLesson = useCallback(
    async (id: number | string, payload: Partial<LessonCreatePayload>) => {
      const response = await api.patch<TeacherLesson>(`/lessons/${id}/`, payload);
      setLessons((prev) =>
        prev.map((l) => (String(l.id) === String(id) ? { ...l, ...response.data } : l))
      );
      return response.data;
    },
    []
  );

  const deleteLesson = useCallback(async (id: number | string) => {
    await api.delete(`/lessons/${id}/`);
    setLessons((prev) => prev.filter((l) => String(l.id) !== String(id)));
  }, []);

  const makeThisWeek = useCallback(async (id: number | string) => {
    const { data } = await api.post<TeacherLesson>(`/lessons/${id}/make-this-week/`);
    setLessons((prev) =>
      prev.map((l) =>
        String(l.id) === String(id)
          ? { ...l, status: "this_week" }
          : l.status === "this_week"
            ? { ...l, status: "upcoming" }
            : l
      )
    );
    return data;
  }, []);

  const togglePublish = useCallback(async (id: number | string) => {
    const { data } = await api.post<{ id: number; published: boolean }>(
      `/lessons/${id}/toggle-publish/`
    );
    setLessons((prev) =>
      prev.map((l) =>
        String(l.id) === String(id) ? { ...l, published: data.published } : l
      )
    );
    return data;
  }, []);

  const setDate = useCallback(
    async (id: number | string, lesson_date: string, date_label?: string) => {
      const { data } = await api.post<TeacherLesson>(`/lessons/${id}/set-date/`, {
        lesson_date,
        date_label: date_label ?? "",
      });
      setLessons((prev) =>
        prev.map((l) => (String(l.id) === String(id) ? { ...l, ...data } : l))
      );
      return data;
    },
    []
  );

  return {
    lessons,
    isLoading,
    error,
    refetch: fetchLessons,
    createLesson,
    updateLesson,
    deleteLesson,
    makeThisWeek,
    togglePublish,
    setDate,
  };
}