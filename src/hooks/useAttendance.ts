// app/hooks/useAttendance.ts
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import { Student } from "../types/studentTypes";
import {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSummary,
  UseAttendanceReturn,
} from "../types/attendanceTypes";

export function useAttendance(
  classroomId?: number | string,
  lessonId?: number | string
): UseAttendanceReturn {
  const [students, setStudents] = useState<Student[]>([]);
  const [existing, setExisting] = useState<Record<string, AttendanceStatus>>({});
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const load = useCallback(async () => {
    if (!classroomId) return;
    setIsLoading(true);
    setError(null);
    try {
      const studentsRes = await api.get<Student[]>("/students/", {
        params: { classroom: classroomId, status: "active" },
      });
      setStudents(studentsRes.data);

      if (lessonId) {
        const [attRes, sumRes] = await Promise.all([
          api.get<AttendanceRecord[]>("/attendance/", {
            params: { lesson: lessonId },
          }),
          api.get<AttendanceSummary>("/attendance/summary/", {
            params: { lesson: lessonId },
          }),
        ]);

        const map: Record<string, AttendanceStatus> = {};
        attRes.data.forEach((r) => {
          map[String(r.student)] = r.status;
        });
        setExisting(map);
        setSummary(sumRes.data);
      }
    } catch (err) {
      setError(extractError(err, "Failed to load attendance"));
    } finally {
      setIsLoading(false);
    }
  }, [classroomId, lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveAttendance = useCallback(
    async (marks: Record<string, AttendanceStatus>) => {
      if (!lessonId) throw new Error("No lesson selected");
      setIsSaving(true);
      setError(null);
      try {
        const records = Object.entries(marks).map(([studentId, status]) => ({
          student: Number(studentId),
          status,
        }));

        const { data } = await api.post<AttendanceRecord[]>(
          "/attendance/bulk/",
          { lesson: lessonId, records }
        );

        setExisting(marks);
        await load(); // refresh summary
        return data;
      } catch (err) {
        const message = extractError(err, "Failed to save attendance");
        setError(message);
        throw new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [lessonId, load]
  );

  return {
    students,
    existing,
    summary,
    isLoading,
    isSaving,
    error,
    reload: load,
    saveAttendance,
  };
}
