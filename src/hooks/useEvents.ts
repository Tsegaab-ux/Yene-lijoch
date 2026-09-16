// app/hooks/useEvents.ts
import { useState, useCallback } from "react";
import { api } from "../services/api";
import {
  Event,
  EventCreateData,
  EventUpdateData,
  UseEventsReturn,
} from "../types/eventTypes";

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------------------
  // Error extraction
  // ------------------------------------------------------------------
  const extractError = (err: unknown, fallback: string): string => {
    const axiosErr = err as any;
    const data = axiosErr?.response?.data;

    if (data) {
      if (typeof data === "string") return data;
      if (data.detail) return String(data.detail);
      if (data.error) return String(data.error);
      if (typeof data === "object") {
        const messages = Object.values(data)
          .flat()
          .filter(Boolean)
          .join(", ");
        if (messages) return messages;
      }
    }

    return err instanceof Error ? err.message : fallback;
  };

  // ------------------------------------------------------------------
  // Payload builder — only uses FormData when there's an actual file
  // ------------------------------------------------------------------
  const buildPayload = (
    data: EventCreateData | EventUpdateData
  ): FormData | Record<string, any> => {
    const hasFile =
      typeof File !== "undefined" &&
      typeof data.image === "object" &&
      data.image !== null &&
      data.image instanceof File;

    if (!hasFile) {
      // Plain JSON is easier to debug and avoids string coercion issues.
      return stripEmpty(data);
    }

    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
      if (value instanceof File) {
        form.append(key, value);
      } else if (typeof value === "boolean") {
        form.append(key, value ? "true" : "false");
      } else {
        form.append(key, String(value));
      }
    });
    return form;
  };

  const stripEmpty = <T extends Record<string, any>>(obj: T): Partial<T> => {
    const out: Partial<T> = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      (out as any)[k] = v;
    });
    return out;
  };

  // ------------------------------------------------------------------
  // Read
  // ------------------------------------------------------------------

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Event[]>("/events/");
      setEvents(data);
      return data;
    } catch (err) {
      setError(extractError(err, "Failed to fetch events"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEventsFiltered = useCallback(
    async (params: {
      status?: string;
      published?: boolean;
      event_type?: string;
      year?: number | string;
      upcoming?: boolean;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.get<Event[]>("/events/", { params });
        setEvents(data);
        return data;
      } catch (err) {
        setError(extractError(err, "Failed to fetch events"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchEvent = useCallback(async (id: number | string) => {
    if (!id) return null;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Event>(`/events/${id}/`);
      setEvent(data);
      return data;
    } catch (err) {
      setError(extractError(err, "Failed to fetch event"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ------------------------------------------------------------------
  // Write
  // ------------------------------------------------------------------

  const createEvent = useCallback(async (data: EventCreateData) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = buildPayload(data);
      const response = await api.post<Event>("/events/", payload,);
      const created = response.data;
      setEvents((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const message = extractError(err, "Failed to create event");
      if (__DEV__) {
        console.error("[useEvents] createEvent error:", (err as any)?.response?.data);
      }
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateEvent = useCallback(
    async (id: number | string, data: EventUpdateData) => {
      if (!id) return null;
      setIsLoading(true);
      setError(null);
      try {
        const payload = buildPayload(data);
        const response = await api.patch<Event>(`/events/${id}/`, payload, {
          headers:
            payload instanceof FormData
              ? { "Content-Type": "multipart/form-data" }
              : { "Content-Type": "application/json" },
        });
        const updated = response.data;
        setEvents((prev) =>
          prev.map((e) => (String(e.id) === String(id) ? { ...e, ...updated } : e))
        );
        if (event && String(event.id) === String(id)) {
          setEvent(updated);
        }
        return updated;
      } catch (err) {
        setError(extractError(err, "Failed to update event"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [event]
  );

  const deleteEvent = useCallback(
    async (id: number | string) => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        await api.delete(`/events/${id}/`);
        setEvents((prev) => prev.filter((e) => String(e.id) !== String(id)));
        if (event && String(event.id) === String(id)) {
          setEvent(null);
        }
      } catch (err) {
        setError(extractError(err, "Failed to delete event"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [event]
  );

  // ------------------------------------------------------------------
  // Actions matching the UI chips
  // ------------------------------------------------------------------

  // Publish / hide — what the frontend's "Publish"/"Hide" chip does.
  const toggleEventPublish = useCallback(
    async (id: number | string) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.post<{ id: number; published: boolean }>(
          `/events/${id}/toggle-publish/`
        );
        setEvents((prev) =>
          prev.map((e) =>
            String(e.id) === String(id) ? { ...e, published: data.published } : e
          )
        );
        if (event && String(event.id) === String(id)) {
          setEvent({ ...event, published: data.published });
        }
        return data;
      } catch (err) {
        setError(extractError(err, "Failed to toggle publish"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [event]
  );

  // Change lifecycle status explicitly (upcoming/ongoing/completed/cancelled).
  const setEventStatus = useCallback(
    async (id: number | string, status: Event["status"]) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.patch<Event>(`/events/${id}/`, { status });
        setEvents((prev) =>
          prev.map((e) => (String(e.id) === String(id) ? { ...e, ...data } : e))
        );
        if (event && String(event.id) === String(id)) {
          setEvent(data);
        }
        return data;
      } catch (err) {
        setError(extractError(err, "Failed to update event status"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [event]
  );

  return {
    events,
    event,
    isLoading,
    error,

    fetchEvents,
    fetchEventsFiltered,
    fetchEvent,

    createEvent,
    updateEvent,
    deleteEvent,

    toggleEventPublish,
    setEventStatus,
  };
}
