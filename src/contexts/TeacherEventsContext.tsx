import React, { createContext, useContext, useMemo, useState } from "react";
import {
  AUDIENCE_LABELS,
  EVENTS,
  EventAudience,
  SundayEvent,
} from "../data/teacherMock";

type TeacherEventsContextValue = {
  events: SundayEvent[];
  addEvent: (event: Omit<SundayEvent, "id">) => SundayEvent;
  getEvent: (id: string) => SundayEvent;
};

const TeacherEventsContext = createContext<TeacherEventsContextValue | null>(
  null
);

function makeId() {
  return `e-${Date.now()}`;
}

export function TeacherEventsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [events, setEvents] = useState(EVENTS);

  const value = useMemo<TeacherEventsContextValue>(
    () => ({
      events,
      addEvent: (event) => {
        const created = { ...event, id: makeId() };
        setEvents((prev) => [created, ...prev]);
        return created;
      },
      getEvent: (id) => events.find((e) => e.id === id) ?? events[0],
    }),
    [events]
  );

  return (
    <TeacherEventsContext.Provider value={value}>
      {children}
    </TeacherEventsContext.Provider>
  );
}

export function useTeacherEvents() {
  const context = useContext(TeacherEventsContext);
  if (!context) {
    throw new Error("useTeacherEvents must be used within TeacherEventsProvider");
  }
  return context;
}

export { AUDIENCE_LABELS };
export type { EventAudience, SundayEvent };
