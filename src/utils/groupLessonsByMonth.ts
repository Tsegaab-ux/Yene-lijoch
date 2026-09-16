// app/utils/groupLessonsByMonth.ts
import { TeacherLesson } from "../types/lessonTypes";

export interface CurriculumMonthBlock {
  /** "September 2026" */
  month: string;
  /** Sort key — "2026-09" */
  monthKey: string;
  lessons: TeacherLesson[];
}

export function groupLessonsByMonth(
  lessons: TeacherLesson[]
): CurriculumMonthBlock[] {
  const buckets = new Map<string, TeacherLesson[]>();

  lessons.forEach((lesson) => {
    // Prefer the ISO date when available; fall back to parsing `date`.
    const iso = lesson.lesson_date ?? toIsoFromLabel(lesson.date);
    const key = iso ? iso.slice(0, 7) : "unknown"; // "2026-09"
    const list = buckets.get(key) ?? [];
    list.push(lesson);
    buckets.set(key, list);
  });

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({
      monthKey: key,
      month: formatMonthLabel(key),
      lessons: items
        .slice()
        .sort((a, b) => (a.week ?? 0) - (b.week ?? 0)),
    }));
}

/**
 * Convert "September 21, 2026" → "2026-09-21".
 * Returns "" if it can't be parsed.
 */
function toIsoFromLabel(label?: string): string {
  if (!label) return "";
  const d = new Date(label);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** "2026-09" → "September 2026" */
function formatMonthLabel(key: string): string {
  if (key === "unknown") return "Unscheduled";
  const [year, month] = key.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
