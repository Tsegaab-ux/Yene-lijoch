import { Student } from "./studentTypes";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  id: number;
  lesson: number;
  lesson_title: string;
  lesson_date: string;    
  weekday?: string;   
  class_name: string;
  student: number;
  student_name: string;
  status: AttendanceStatus;
  status_display: string;
  note: string;
  recorded_by?: number | null;
  recorded_by_name?: string | null;
  recorded_at: string;
  updated_at: string;
}

export interface AttendanceSummary {
  total: number;
  recorded: number;
  unrecorded: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export interface UseAttendanceReturn {
  students: Student[];
  existing: Record<string, AttendanceStatus>;
  summary: AttendanceSummary | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  reload: () => Promise<void>;
  saveAttendance: (
    marks: Record<string, AttendanceStatus>
  ) => Promise<AttendanceRecord[]>;
}
