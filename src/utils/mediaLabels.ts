// app/utils/mediaLabels.ts
import { MediaKind } from "../types/mediaTypes";

export const MEDIA_KIND_KEYS: Record<MediaKind, string> = {
  video: "parent.kidsVideos",
  song: "parent.kidsSongs",
  bible_story: "parent.bibleStories",
  course: "parent.curriculumVideos",
  picture: "parent.pictures",
};

// If you ever need a fallback English label (e.g. for a param outside i18n):
export const MEDIA_KIND_FALLBACK: Record<MediaKind, string> = {
  video: "Videos",
  song: "Songs",
  bible_story: "Bible Stories",
  course: "Curriculum Videos",
  picture: "Pictures",
};