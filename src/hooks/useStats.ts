// app/hooks/useStats.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

// ======================================================================
// Types
// ======================================================================

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
}

export interface PerformanceIndicator {
  label: string;
  value: number;
  target: number;
}

export interface AnalyticsTotals {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  total_lessons: number;
  total_events: number;
  total_media: number;
  attendance_today: number;
  student_growth: number;
  teacher_growth: number;
  attendance_growth: number;
  attendance_stats: AttendanceStats;
}

export interface UseStatsReturn {
  // raw payload
  totals: AnalyticsTotals | null;

  // derived, ready-to-render values
  stats: {
    media: number;
    curriculum: number;
    students: number;
    events: number;
    teachers: number;
    classes: number;
  };
  attendance: {
    today: number;
    growth: number;
    stats: AttendanceStats;
  };
  growth: {
    students: number;
    teachers: number;
  };

  // state
  isLoading: boolean;
  error: string | null;

  // actions
  refetch: () => Promise<AnalyticsTotals | null>;
}

// ======================================================================
// Defaults
// ======================================================================

const EMPTY_ATTENDANCE: AttendanceStats = {
  total: 0,
  present: 0,
  absent: 0,
  late: 0,
};

const EMPTY_TOTALS: AnalyticsTotals = {
  total_students: 0,
  total_teachers: 0,
  total_classes: 0,
  total_lessons: 0,
  total_events: 0,
  total_media: 0,
  attendance_today: 0,
  student_growth: 0,
  teacher_growth: 0,
  attendance_growth: 0,
  attendance_stats: EMPTY_ATTENDANCE,
};

// ======================================================================
// Hook
// ======================================================================

export function useStats(): UseStatsReturn {
  const [totals, setTotals] = useState<AnalyticsTotals | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------------------
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<AnalyticsTotals>("/analytics/");
      setTotals(data);
      return data;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.response?.data?.error ??
        err?.message ??
        "Failed to load dashboard stats";
      setError(message);
      if (__DEV__) {
        console.error("[useStats] fetch failed:", err?.response?.data ?? err);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ------------------------------------------------------------------
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ------------------------------------------------------------------
  // Derived, memoized shapes so consumers don't re-render needlessly.
  // ------------------------------------------------------------------
  const value = useMemo(() => {
    const t = totals ?? EMPTY_TOTALS;

    return {
      media: t.total_media,
      curriculum: t.total_lessons,
      students: t.total_students,
      events: t.total_events,
      teachers: t.total_teachers,
      classes: t.total_classes,
    };
  }, [totals]);

  const attendance = useMemo(() => {
    const t = totals ?? EMPTY_TOTALS;
    return {
      today: t.attendance_today,
      growth: t.attendance_growth,
      stats: t.attendance_stats ?? EMPTY_ATTENDANCE,
    };
  }, [totals]);

  const growth = useMemo(() => {
    const t = totals ?? EMPTY_TOTALS;
    return {
      students: t.student_growth,
      teachers: t.teacher_growth,
    };
  }, [totals]);

  return {
    totals,
    stats: value,
    attendance,
    growth,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
