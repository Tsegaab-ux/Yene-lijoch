// app/hooks/useChildAttendance.ts
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import { AttendanceSummary, AttendanceRecord } from "../types/attendanceTypes";

export function useChildAttendance(studentId?: number | string) {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!studentId) {
      setSummary(null);
      setRecords([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [summaryRes, recordsRes] = await Promise.all([
        api.get<AttendanceSummary>("/attendance/summary/", {
          params: { student: studentId },
        }),
        api.get<AttendanceRecord[]>("/attendance/", {
          params: { student: studentId },
        }),
      ]);

      setSummary(summaryRes.data);

      // Sort records newest-first so the "recent sundays" list reads top-down.
      const sorted = [...recordsRes.data].sort((a, b) =>
        (b.lesson_date ?? "").localeCompare(a.lesson_date ?? "")
      );
      setRecords(sorted);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        "Failed to load attendance";
      setError(String(message));
      setSummary(null);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    summary,
    records,
    isLoading,
    error,
    refetch: fetchAll,
  };
}