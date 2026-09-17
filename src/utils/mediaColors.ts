// app/utils/mediaColors.ts
import { MediaKind } from "../types/mediaTypes";

const KIND_COLORS: Record<MediaKind, string> = {
  video: "#4FC3F7",
  song: "#BA68C8",
  bible_story: "#FFB74D",
  course: "#64B5F6",
  picture: "#81C784",
};

export function colorForKind(kind: MediaKind): string {
  return KIND_COLORS[kind] ?? "#999";
}