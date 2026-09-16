// app/contexts/EventsContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useEvents } from "../hooks/useEvents";
import { Event, EventCreateData, EventUpdateData } from "../types/eventTypes";

interface EventsContextValue {
  events: Event[];
  isLoading: boolean;
  error: string | null;

  // Actions — gated by the backend; the UI decides whether to show them.
  refetch: () => Promise<Event[]>;
  createEvent: (data: EventCreateData) => Promise<Event>;
  updateEvent: (id: number | string, data: EventUpdateData) => Promise<Event | null>;
  deleteEvent: (id: number | string) => Promise<void>;
  toggleEventPublish: (id: number | string) => Promise<{ id: number; published: boolean }>;
  setEventStatus: (id: number | string, status: Event["status"]) => Promise<Event>;
}

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const {
    events,
    isLoading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventPublish,
    setEventStatus,
  } = useEvents();

  // Fetch once when the provider mounts.
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Expose the same `events` array already tracked by the hook.
  const value = useMemo<EventsContextValue>(
    () => ({
      events,
      isLoading,
      error,

      refetch: fetchEvents,
      createEvent,
      updateEvent,
      deleteEvent,
      toggleEventPublish,
      setEventStatus,
    }),
    [
      events,
      isLoading,
      error,
      fetchEvents,
      createEvent,
      updateEvent,
      deleteEvent,
      toggleEventPublish,
      setEventStatus,
    ]
  );

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
}

export function useEventsContext(): EventsContextValue {
  const ctx = useContext(EventsContext);
  if (!ctx) {
    throw new Error(
      "useEventsContext must be used inside <EventsProvider>"
    );
  }
  return ctx;
}