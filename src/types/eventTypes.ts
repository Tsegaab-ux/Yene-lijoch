// app/types/eventTypes.ts

export type EventStatus =
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled";

export type EventType =
  | "service"
  | "bible_study"
  | "conference"
  | "meeting"
  | "youth"
  | "children"
  | "workshop"
  | "other";

export interface Event {
  id: number | string;
  title: string;

  // Frontend-facing (populated from display_date / display_time)
  date: string;
  time: string;

  location: string;
  audience: string;
  description: string;

  status: EventStatus;
  published: boolean;

  // Native
  start_datetime?: string;
  end_datetime?: string | null;
  date_label?: string;
  time_label?: string;

  event_type?: EventType;
  image?: string | null;
  organization?: number | string | null;
  organization_name?: string;

  created_at?: string;
  updated_at?: string;
}

// What the frontend sends — matches the frontend-style serializer input.
export interface EventCreateData {
  title: string;

  // Either the frontend's string pair...
  date?: string;         // "October 12, 2026"
  time?: string;         // "11:00 AM"

  // ...or the native split pair.
  start_date?: string;   // "2026-10-12"
  start_time?: string;   // "11:00"
  end_date?: string;
  end_time?: string;

  location?: string;
  audience?: string;
  description?: string;
  event_type?: EventType;
  status?: EventStatus;
  published?: boolean;

  // Optional file upload.
  image?: File | null;
}

export type EventUpdateData = Partial<EventCreateData>;

export interface UseEventsReturn {
  events: Event[];
  event: Event | null;
  isLoading: boolean;
  error: string | null;

  fetchEvents: () => Promise<Event[]>;
  fetchEventsFiltered: (params: {
    status?: string;
    published?: boolean;
    event_type?: string;
    year?: number | string;
    upcoming?: boolean;
  }) => Promise<Event[]>;
  fetchEvent: (id: number | string) => Promise<Event | null>;

  createEvent: (data: EventCreateData) => Promise<Event>;
  updateEvent: (id: number | string, data: EventUpdateData) => Promise<Event | null>;
  deleteEvent: (id: number | string) => Promise<void>;

  toggleEventPublish: (
    id: number | string
  ) => Promise<{ id: number; published: boolean }>;

  setEventStatus: (
    id: number | string,
    status: EventStatus
  ) => Promise<Event>;
}
