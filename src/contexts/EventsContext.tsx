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
  event: Event | null;
  events: Event[];
  isLoading: boolean;
  error: string | null;

  // Actions — gated by the backend; the UI decides whether to show them.
  fetchEvent: (id: number | string)=> Promise<Event | null>;
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
    event,
    events,
    isLoading,
    error,
    fetchEvent,
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
      event,
      events,
      isLoading,
      error,

      refetch: fetchEvents,
      fetchEvent,
      createEvent,
      updateEvent,
      deleteEvent,
      toggleEventPublish,
      setEventStatus,
    }),
    [
      event,
      events,
      isLoading,
      error,
      fetchEvent,
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