import { CurriculumMonthBlock } from "@/utils/groupLessonsByMonth";

export type LessonStatus = "this_week" | "upcoming" | "completed";

export interface LessonMaterial {
  id?: number;
  title: string;
  url?: string;
  fileUri?: string;
}

export interface TeacherLesson {
  id: number;
  title: string;
  category?: string;
  week: number;
  year: number;

  // Scheduling
  date: string;
  lesson_date?: string;
  date_label?: string;
  start_time?: string;
  end_time?: string;

  // Content — extended to match CurriculumLesson
  scripture: string;
  memoryVerse: string;
  memory_verse?: string;
  description?: string;
  memoryVerseRef?: string;       // ← new (alias for scripture, if used)
  objective?: string;
  materials?: LessonMaterial[];
  activity?: string;

  // Classroom
  classroom_id?: number;
  classroom_name?: string;

  // Status
  status: LessonStatus;
  published: boolean;

  // Media
  coverUri?: string | null;
  attachmentUri?: string | null;
  attachment_name?: string;
  attachment_type?: string;
}
export interface TodayLessonResponse {
  lesson: TeacherLesson | null;
  next: TeacherLesson | null;
}

export interface UseTeacherCurriculumReturn {
  todayLesson: TeacherLesson | null;
  nextLesson: TeacherLesson | null;
  upcoming: TeacherLesson[];
  isLoading: boolean;
  error: string | null;
  lesson: TeacherLesson;
  months: CurriculumMonthBlock[];
  refetch: () => Promise<void>;
  fetchLesson: (id: string) => Promise<void>;
}
