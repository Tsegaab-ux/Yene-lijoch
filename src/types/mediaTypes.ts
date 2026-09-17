// app/types/mediaTypes.ts

export type MediaKind =
  | "video"
  | "song"
  | "bible_story"
  | "course"
  | "picture";

export type MediaSource = "youtube" | "gallery";

export interface MediaItem {
  id: number;

  title: string;
  kind: MediaKind;
  youtubeId?: string;
  duration: string;
  ageGroup: string;
  description: string;

  published: boolean;
  source: MediaSource;

  coverUri?: string | null;
  fileUri?: string | null;
  fileName?: string;
  mimeType?: string;

  // Optional presentation hints the mock used
  color?: string;

  // timestamps
  created_at?: string;
  updated_at?: string;
}

export interface MediaCreateData {
  title: string;
  kind: MediaKind;
  youtubeId?: string;
  duration?: string;
  ageGroup?: string;
  description?: string;
  published?: boolean;
  source?: MediaSource;
  file?: File | null;
  cover?: File | null;
  fileName?: string;
  mimeType?: string;
}

export type MediaUpdateData = Partial<MediaCreateData>;

export interface UseMediaReturn {
  media: MediaItem[];
  item: MediaItem | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchMedia: () => Promise<MediaItem[]>;
  fetchMediaFiltered: (params: {
    kind?: MediaKind;
    source?: MediaSource;
    published?: boolean;
    age_group?: string;
    q?: string;
  }) => Promise<MediaItem[]>;
  fetchMediaItem: (id: number | string) => Promise<MediaItem | null>;

  createMedia: (data: MediaCreateData) => Promise<MediaItem>;
  updateMedia: (id: number | string, data: MediaUpdateData) => Promise<MediaItem | null>;
  deleteMedia: (id: number | string) => Promise<void>;

  toggleMediaPublish: (
    id: number | string
  ) => Promise<{ id: number; published: boolean }>;
}

export interface MediaContextValue {
  media: MediaItem[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refetch: () => Promise<MediaItem[]>;
  createMedia: (data: MediaCreateData) => Promise<MediaItem>;
  updateMedia: (id: number | string, data: MediaUpdateData) => Promise<MediaItem | null>;
  deleteMedia: (id: number | string) => Promise<void>;
  toggleMediaPublish: (
    id: number | string
  ) => Promise<{ id: number; published: boolean }>;
}
