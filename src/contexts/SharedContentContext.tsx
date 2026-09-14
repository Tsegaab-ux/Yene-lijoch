import React, { createContext, useContext, useMemo, useState } from "react";
import {
  AdminNotice,
  INITIAL_ADMIN_NOTICES,
  INITIAL_ATTENDANCE,
  INITIAL_CURRICULUM,
  INITIAL_EVENTS,
  INITIAL_GROUPS,
  INITIAL_MEDIA,
  INITIAL_PARENT_NOTICES,
  INITIAL_STUDENTS,
  MEDIA_COLORS,
  MEDIA_KIND_LABELS,
  MediaKind,
  ParentNotice,
  SharedAttendanceDay,
  SharedCurriculum,
  SharedEvent,
  SharedGroup,
  SharedMedia,
  SharedStudent,
  initialsFromName,
} from "../data/sharedContent";

type SharedContentValue = {
  media: SharedMedia[];
  curriculum: SharedCurriculum[];
  events: SharedEvent[];
  groups: SharedGroup[];
  students: SharedStudent[];
  attendance: SharedAttendanceDay[];
  adminNotices: AdminNotice[];
  parentNotices: ParentNotice[];

  publishedMedia: SharedMedia[];
  publishedCurriculum: SharedCurriculum[];
  publishedEvents: SharedEvent[];
  todayCourse: SharedCurriculum | null;

  addMedia: (
    input: Omit<SharedMedia, "id" | "color" | "published"> & {
      published?: boolean;
    }
  ) => void;
  removeMedia: (id: string) => void;
  toggleMediaPublished: (id: string) => void;

  addCurriculum: (
    input: Omit<SharedCurriculum, "id" | "published"> & { published?: boolean }
  ) => void;
  removeCurriculum: (id: string) => void;
  setCurriculumDate: (id: string, date: string, status?: SharedCurriculum["status"]) => void;
  toggleCurriculumPublished: (id: string) => void;

  addEvent: (
    input: Omit<SharedEvent, "id" | "published"> & { published?: boolean }
  ) => void;
  removeEvent: (id: string) => void;

  addGroup: (name: string, teacherName: string) => SharedGroup;
  removeGroup: (id: string) => void;
  addStudent: (
    input: Omit<
      SharedStudent,
      "id" | "initials" | "avatarColor" | "attendance" | "overallProgress" | "streak"
    >
  ) => SharedStudent;
  removeStudent: (id: string) => void;

  pushAdminNotice: (
    notice: Omit<AdminNotice, "id" | "unread" | "time"> & {
      time?: string;
      unread?: boolean;
    }
  ) => void;
  markAdminNoticesRead: () => void;
  pushParentNotice: (
    notice: Omit<ParentNotice, "id" | "unread" | "time"> & {
      time?: string;
      unread?: boolean;
    }
  ) => void;

  getStudentsByGroup: (groupId: string) => SharedStudent[];
  getAttendanceForStudent: (studentId: string) => SharedAttendanceDay[];
  getAttendanceSummary: (studentId: string) => {
    present: number;
    absent: number;
    total: number;
  };
  getParentChildren: (parentEmail: string) => SharedStudent[];
  getGroupName: (groupId: string) => string;
  getMediaByKind: (kind: MediaKind) => SharedMedia[];
};

const SharedContentContext = createContext<SharedContentValue | null>(null);

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function SharedContentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [media, setMedia] = useState(INITIAL_MEDIA);
  const [curriculum, setCurriculum] = useState(INITIAL_CURRICULUM);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [adminNotices, setAdminNotices] = useState(INITIAL_ADMIN_NOTICES);
  const [parentNotices, setParentNotices] = useState(INITIAL_PARENT_NOTICES);

  const value = useMemo<SharedContentValue>(() => {
    const publishedMedia = media.filter((m) => m.published);
    const publishedCurriculum = curriculum.filter((c) => c.published);
    const publishedEvents = events.filter((e) => e.published);
    const todayCourse =
      publishedCurriculum.find((c) => c.status === "this_week") ??
      publishedCurriculum[0] ??
      null;

    const pushAdminNotice: SharedContentValue["pushAdminNotice"] = (notice) => {
      setAdminNotices((prev) => [
        {
          id: makeId("an"),
          title: notice.title,
          body: notice.body,
          category: notice.category,
          time: notice.time ?? "Just now",
          unread: notice.unread ?? true,
        },
        ...prev,
      ]);
    };

    const pushParentNotice: SharedContentValue["pushParentNotice"] = (
      notice
    ) => {
      setParentNotices((prev) => [
        {
          id: makeId("pn"),
          title: notice.title,
          body: notice.body,
          category: notice.category,
          time: notice.time ?? "Just now",
          unread: notice.unread ?? true,
        },
        ...prev,
      ]);
    };

    return {
      media,
      curriculum,
      events,
      groups,
      students,
      attendance,
      adminNotices,
      parentNotices,
      publishedMedia,
      publishedCurriculum,
      publishedEvents,
      todayCourse,

      addMedia: (input) => {
        const created: SharedMedia = {
          id: makeId("media"),
          color: MEDIA_COLORS[media.length % MEDIA_COLORS.length],
          published: input.published ?? true,
          source: input.source ?? (input.localUri ? "gallery" : "youtube"),
          youtubeId: input.youtubeId ?? "",
          title: input.title,
          kind: input.kind,
          duration: input.duration,
          description: input.description,
          ageGroup: input.ageGroup,
          localUri: input.localUri,
          coverUri: input.coverUri,
          fileName: input.fileName,
          mimeType: input.mimeType,
        };
        setMedia((prev) => [created, ...prev]);
        pushAdminNotice({
          category: "videos",
          title: "Media uploaded",
          body: `${created.title} added to ${MEDIA_KIND_LABELS[created.kind]}.`,
        });
        if (created.published) {
          pushParentNotice({
            category: "courses",
            title: "New media available",
            body: `${created.title} is ready in Courses.`,
          });
        }
      },

      removeMedia: (id) => setMedia((prev) => prev.filter((m) => m.id !== id)),

      toggleMediaPublished: (id) => {
        setMedia((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, published: !m.published } : m
          )
        );
      },

      addCurriculum: (input) => {
        const created: SharedCurriculum = {
          coverUri: undefined,
          attachmentUri: undefined,
          attachmentName: undefined,
          attachmentType: undefined,
          ...input,
          id: makeId("course"),
          published: input.published ?? true,
        };
        setCurriculum((prev) => {
          if (created.status === "this_week") {
            return [
              created,
              ...prev.map((c) =>
                c.status === "this_week" ? { ...c, status: "completed" as const } : c
              ),
            ];
          }
          return [created, ...prev];
        });
        pushAdminNotice({
          category: "curriculum",
          title: "Curriculum added",
          body: `${created.title} scheduled for ${created.date}.`,
        });
        if (created.published) {
          pushParentNotice({
            category: "courses",
            title: "New curriculum lesson",
            body: `${created.title} · ${created.date}`,
          });
        }
      },

      removeCurriculum: (id) =>
        setCurriculum((prev) => prev.filter((c) => c.id !== id)),

      setCurriculumDate: (id, date, status) => {
        setCurriculum((prev) =>
          prev.map((c) => {
            if (c.id !== id) {
              if (status === "this_week" && c.status === "this_week") {
                return { ...c, status: "completed" as const };
              }
              return c;
            }
            return { ...c, date, ...(status ? { status } : {}) };
          })
        );
        pushAdminNotice({
          category: "curriculum",
          title: "Curriculum date updated",
          body: `Lesson date set to ${date}.`,
        });
      },

      toggleCurriculumPublished: (id) => {
        setCurriculum((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, published: !c.published } : c
          )
        );
      },

      addEvent: (input) => {
        const created: SharedEvent = {
          ...input,
          id: makeId("event"),
          published: input.published ?? true,
        };
        setEvents((prev) => [created, ...prev]);
        pushAdminNotice({
          category: "events",
          title: "Event published",
          body: `${created.title} on ${created.date}.`,
        });
        if (created.published) {
          pushParentNotice({
            category: "events",
            title: "Upcoming event",
            body: `${created.title} is on ${created.date} at ${created.time}.`,
          });
        }
      },

      removeEvent: (id) => setEvents((prev) => prev.filter((e) => e.id !== id)),

      addGroup: (name, teacherName) => {
        const created: SharedGroup = {
          id: makeId("group"),
          name: name.trim(),
          teacherName: teacherName.trim() || "Teacher",
        };
        setGroups((prev) => [...prev, created]);
        pushAdminNotice({
          category: "groups",
          title: "Group created",
          body: `${created.name} assigned to ${created.teacherName}.`,
        });
        return created;
      },

      removeGroup: (id) => {
        setGroups((prev) => prev.filter((g) => g.id !== id));
        setStudents((prev) => prev.filter((s) => s.groupId !== id));
        pushAdminNotice({
          category: "groups",
          title: "Group removed",
          body: "Group and its students were removed from the roster.",
        });
      },

      addStudent: (input) => {
        const created: SharedStudent = {
          ...input,
          id: makeId("stu"),
          initials: initialsFromName(input.name),
          avatarColor: MEDIA_COLORS[students.length % MEDIA_COLORS.length],
          attendance: 100,
          overallProgress: 0,
          streak: 0,
        };
        setStudents((prev) => [...prev, created]);
        pushAdminNotice({
          category: "groups",
          title: "Student added",
          body: `${created.name} added for attendance roster.`,
        });
        return created;
      },

      removeStudent: (id) =>
        setStudents((prev) => prev.filter((s) => s.id !== id)),

      pushAdminNotice,
      markAdminNoticesRead: () =>
        setAdminNotices((prev) => prev.map((n) => ({ ...n, unread: false }))),
      pushParentNotice,

      getStudentsByGroup: (groupId) =>
        students.filter((s) => s.groupId === groupId),
      getAttendanceForStudent: (studentId) =>
        attendance.filter((d) => d.studentId === studentId),
      getAttendanceSummary: (studentId) => {
        const days = attendance.filter((d) => d.studentId === studentId);
        const present = days.filter((d) => d.status === "present").length;
        const absent = days.filter((d) => d.status === "absent").length;
        return { present, absent, total: days.length };
      },
      getParentChildren: (parentEmail) =>
        students.filter(
          (s) => s.parentEmail.toLowerCase() === parentEmail.toLowerCase()
        ),
      getGroupName: (groupId) =>
        groups.find((g) => g.id === groupId)?.name ?? "Group",
      getMediaByKind: (kind) => publishedMedia.filter((m) => m.kind === kind),
    };
  }, [
    media,
    curriculum,
    events,
    groups,
    students,
    attendance,
    adminNotices,
    parentNotices,
  ]);

  return (
    <SharedContentContext.Provider value={value}>
      {children}
    </SharedContentContext.Provider>
  );
}

export function useSharedContent() {
  const context = useContext(SharedContentContext);
  if (!context) {
    throw new Error(
      "useSharedContent must be used within SharedContentProvider"
    );
  }
  return context;
}
