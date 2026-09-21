export type Child = {
  id: string;
  name: string;
  grade: string;
  school: string;
  age: number;
  group: string;
  avatarColor: string;
  initials: string;
  attendance: number;
  overallProgress: number;
  streak: number;
};

export type MediaKind = "video" | "song" | "bible_story" | "course";

export type MediaItem = {
  id: string;
  title: string;
  kind: MediaKind;
  duration: string;
  description: string;
  /** YouTube video id for embed */
  youtubeId: string;
  ageGroup: string;
  color: string;
};

export type CourseItem = {
  id: string;
  title: string;
  category: string;
  week: number;
  date: string;
  scripture: string;
  memoryVerse: string;
  description: string;
  status: "this_week" | "upcoming" | "completed";
};

export type AttendanceDay = {
  id: string;
  childId: string;
  weekday: string;
  date: string;
  status: "present" | "absent";
  lesson: string;
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  audience: string;
  status: "upcoming" | "registered" | "past";
  description: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  category: "attendance" | "events" | "courses" | "chat" | "system";
  unread: boolean;
};

export const PARENT = {
  name: "Tsegaab Melat",
  email: "parent@test.com",
  phone: "+251 91 234 5678",
  role: "Parent",
};

export const CHILDREN: Child[] = [
  {
    id: "selam",
    name: "Selam Abebe",
    grade: "Grade 3",
    school: "Yene Lijoch Sunday School",
    age: 8,
    group: "Group A",
    avatarColor: "#3D6B5A",
    initials: "SA",
    attendance: 96,
    overallProgress: 78,
    streak: 12,
  },
  {
    id: "abel",
    name: "Abel Abebe",
    grade: "Grade 1",
    school: "Yene Lijoch Sunday School",
    age: 6,
    group: "Group B",
    avatarColor: "#C45C26",
    initials: "AA",
    attendance: 91,
    overallProgress: 64,
    streak: 5,
  },
];

export const MEDIA_ITEMS: MediaItem[] = [
  {
    id: "v1",
    title: "Jesus Loves the Little Children",
    kind: "video",
    duration: "3:12",
    description: "A cheerful kids video about God’s love for every child.",
    youtubeId: "XqZsoesa55w",
    ageGroup: "Ages 4–10",
    color: "#4A6FA5",
  },
  {
    id: "v2",
    title: "Noah’s Ark Adventure",
    kind: "video",
    duration: "5:40",
    description: "Animated Bible adventure for Sunday school kids.",
    youtubeId: "lKc38VPvb9Y",
    ageGroup: "Ages 5–9",
    color: "#3D6B5A",
  },
  {
    id: "s1",
    title: "This Little Light of Mine",
    kind: "song",
    duration: "2:28",
    description: "Sing-along worship song with easy lyrics for children.",
    youtubeId: "cKkbIZxqPyY",
    ageGroup: "All ages",
    color: "#C45C26",
  },
  {
    id: "s2",
    title: "Father Abraham",
    kind: "song",
    duration: "3:05",
    description: "Classic kids worship song with motions and joy.",
    youtubeId: "yX29P5YkUzY",
    ageGroup: "Ages 3–8",
    color: "#D4A017",
  },
  {
    id: "b1",
    title: "David and Goliath",
    kind: "bible_story",
    duration: "6:15",
    description: "A kid-friendly telling of courage and trusting God.",
    youtubeId: "uW0p6qkqYxI",
    ageGroup: "Ages 6–11",
    color: "#7A5C9E",
  },
  {
    id: "b2",
    title: "The Good Samaritan",
    kind: "bible_story",
    duration: "4:50",
    description: "Learn kindness and helping others through this parable.",
    youtubeId: "M3rcGmqOV1k",
    ageGroup: "Ages 5–10",
    color: "#2F9E6B",
  },
  {
    id: "c1",
    title: "Creation Days for Kids",
    kind: "course",
    duration: "8:20",
    description: "Short curriculum video covering the days of creation.",
    youtubeId: "teu7BCZTgDs",
    ageGroup: "Ages 6–12",
    color: "#4A6FA5",
  },
  {
    id: "c2",
    title: "Fruit of the Spirit",
    kind: "course",
    duration: "7:10",
    description: "Simple teaching on love, joy, peace, and more.",
    youtubeId: "YmQAnqtC8kI",
    ageGroup: "Ages 7–12",
    color: "#3D6B5A",
  },
];

export const COURSES: CourseItem[] = [
  {
    id: "course-1",
    title: "God’s Beautiful World",
    category: "Creation",
    week: 2,
    date: "September 14, 2026",
    scripture: "Genesis 1:1–31",
    memoryVerse: "In the beginning God created the heavens and the earth.",
    description:
      "Children explore creation days with pictures, songs, and a short craft.",
    status: "this_week",
  },
  {
    id: "course-2",
    title: "Noah Obeys God",
    category: "Bible Heroes",
    week: 3,
    date: "September 21, 2026",
    scripture: "Genesis 6–9",
    memoryVerse: "Noah did everything just as God commanded him.",
    description: "A lesson on listening to God even when it is hard.",
    status: "upcoming",
  },
  {
    id: "course-3",
    title: "Jesus Welcomes Children",
    category: "Gospels",
    week: 1,
    date: "September 7, 2026",
    scripture: "Mark 10:13–16",
    memoryVerse: "Let the little children come to me.",
    description: "Kids learn that Jesus loves and welcomes every child.",
    status: "completed",
  },
  {
    id: "course-4",
    title: "Be Kind Like the Samaritan",
    category: "Parables",
    week: 4,
    date: "September 28, 2026",
    scripture: "Luke 10:25–37",
    memoryVerse: "Go and do likewise.",
    description: "Practice kindness at home, school, and church.",
    status: "upcoming",
  },
];

export const ATTENDANCE_HISTORY: AttendanceDay[] = [
  {
    id: "a1",
    childId: "selam",
    weekday: "Sunday",
    date: "September 14, 2026",
    status: "present",
    lesson: "God’s Beautiful World",
  },
  {
    id: "a2",
    childId: "selam",
    weekday: "Sunday",
    date: "September 7, 2026",
    status: "present",
    lesson: "Jesus Welcomes Children",
  },
  {
    id: "a3",
    childId: "selam",
    weekday: "Sunday",
    date: "August 31, 2026",
    status: "absent",
    lesson: "Sharing God’s Love",
  },
  {
    id: "a4",
    childId: "selam",
    weekday: "Sunday",
    date: "August 24, 2026",
    status: "present",
    lesson: "Prayer Time",
  },
  {
    id: "a5",
    childId: "abel",
    weekday: "Sunday",
    date: "September 14, 2026",
    status: "present",
    lesson: "God’s Beautiful World",
  },
  {
    id: "a6",
    childId: "abel",
    weekday: "Sunday",
    date: "September 7, 2026",
    status: "absent",
    lesson: "Jesus Welcomes Children",
  },
  {
    id: "a7",
    childId: "abel",
    weekday: "Sunday",
    date: "August 31, 2026",
    status: "present",
    lesson: "Sharing God’s Love",
  },
  {
    id: "a8",
    childId: "abel",
    weekday: "Sunday",
    date: "August 24, 2026",
    status: "present",
    lesson: "Prayer Time",
  },
];

export const EVENTS: EventItem[] = [
  {
    id: "e1",
    title: "Children’s Sunday Picnic",
    date: "September 21, 2026",
    time: "11:30 AM",
    location: "Church Garden",
    audience: "Kids & Parents",
    status: "upcoming",
    description:
      "Games, songs, and a shared lunch after Sunday school. Families welcome.",
  },
  {
    id: "e2",
    title: "Memory Verse Night",
    date: "September 28, 2026",
    time: "5:00 PM",
    location: "Fellowship Hall",
    audience: "Group A & B",
    status: "upcoming",
    description:
      "Kids share memory verses with parents. Small prizes for participation.",
  },
  {
    id: "e3",
    title: "Parent Orientation",
    date: "October 5, 2026",
    time: "4:00 PM",
    location: "Room 3",
    audience: "Parents",
    status: "registered",
    description:
      "Meet teachers, review the term curriculum, and ask questions.",
  },
  {
    id: "e4",
    title: "Kids Choir Practice",
    date: "August 31, 2026",
    time: "10:00 AM",
    location: "Main Sanctuary",
    audience: "Choir Kids",
    status: "past",
    description: "Practice session for the harvest celebration songs.",
  },
];

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "Attendance marked",
    body: "Selam was marked present on Sunday, September 14.",
    time: "30 min ago",
    category: "attendance",
    unread: true,
  },
  {
    id: "n2",
    title: "New message from Teacher Hana",
    body: "Great to see Selam participating in today’s lesson!",
    time: "1 hour ago",
    category: "chat",
    unread: true,
  },
  {
    id: "n3",
    title: "Upcoming event",
    body: "Children’s Sunday Picnic is on September 21 at 11:30 AM.",
    time: "Yesterday",
    category: "events",
    unread: true,
  },
  {
    id: "n4",
    title: "This week’s course",
    body: "God’s Beautiful World is ready to review at home.",
    time: "2 days ago",
    category: "courses",
    unread: false,
  },
  {
    id: "n5",
    title: "Attendance reminder",
    body: "Abel was absent on September 7. Contact teacher if needed.",
    time: "1 week ago",
    category: "attendance",
    unread: false,
  },
  {
    id: "n6",
    title: "Chat reply",
    body: "Teacher replied to your message about pickup time.",
    time: "1 week ago",
    category: "chat",
    unread: false,
  },
];

export const TODAY_COURSE =
  COURSES.find((c) => c.status === "this_week") ?? COURSES[0];

export function getMediaByKind(kind: MediaKind) {
  return MEDIA_ITEMS.filter((item) => item.kind === kind);
}

export function getAttendanceForChild(childId: string) {
  return ATTENDANCE_HISTORY.filter((day) => day.childId === childId);
}

export function getAttendanceSummaryForChild(childId: string) {
  const days = getAttendanceForChild(childId);
  const present = days.filter((d) => d.status === "present").length;
  const absent = days.filter((d) => d.status === "absent").length;
  return { present, absent, total: days.length };
}

export function getMediaItem(id: string) {
  return MEDIA_ITEMS.find((item) => item.id === id);
}

export function getCourse(id: string) {
  return COURSES.find((item) => item.id === id);
}

export function getEvent(id: string) {
  return EVENTS.find((item) => item.id === id);
}

export const MEDIA_KIND_LABELS: Record<MediaKind, string> = {
  video: "Kids Videos",
  song: "Kids Songs",
  bible_story: "Bible Stories",
  course: "Curriculum Videos",
};
