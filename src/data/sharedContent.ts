export type MediaKind = "video" | "song" | "bible_story" | "course" | "picture";

export type MediaSource = "youtube" | "gallery";

export type SharedMedia = {
  id: string;
  title: string;
  kind: MediaKind;
  duration: string;
  description: string;
  youtubeId: string;
  ageGroup: string;
  color: string;
  published: boolean;
  source: MediaSource;
  localUri?: string;
  coverUri?: string;
  fileName?: string;
  mimeType?: string;
};

export type SharedCurriculum = {
  id: string;
  title: string;
  category: string;
  week: number;
  date: string;
  year: string;
  scripture: string;
  memoryVerse: string;
  description: string;
  status: "this_week" | "upcoming" | "completed";
  published: boolean;
  coverUri?: string;
  attachmentUri?: string;
  attachmentName?: string;
  attachmentType?: "image" | "video" | "audio" | "file";
};

export type SharedEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  audience: string;
  status: "upcoming" | "registered" | "past";
  description: string;
  published: boolean;
};

export type SharedGroup = {
  id: string;
  name: string;
  teacherName: string;
};

export type SharedStudent = {
  id: string;
  name: string;
  groupId: string;
  grade: string;
  age: number;
  parentName: string;
  parentEmail: string;
  initials: string;
  avatarColor: string;
  attendance: number;
  overallProgress: number;
  streak: number;
};

export type SharedAttendanceDay = {
  id: string;
  studentId: string;
  weekday: string;
  date: string;
  status: "present" | "absent";
  lesson: string;
};

export type AdminNotice = {
  id: string;
  title: string;
  body: string;
  time: string;
  category: "videos" | "curriculum" | "groups" | "events" | "chat" | "system";
  unread: boolean;
};

export type ParentNotice = {
  id: string;
  title: string;
  body: string;
  time: string;
  category: "attendance" | "events" | "courses" | "chat" | "system";
  unread: boolean;
};

export const ADMIN_PROFILE = {
  name: "Dawit Alemu",
  email: "admin@test.com",
  role: "Administrator",
  school: "Yene Lijoch Sunday School",
};

export const MEDIA_KIND_LABELS: Record<MediaKind, string> = {
  video: "Kids Videos",
  song: "Kids Songs",
  bible_story: "Bible Stories",
  course: "Curriculum Videos",
  picture: "Pictures",
};

export const MEDIA_COLORS = [
  "#4A6FA5",
  "#3D6B5A",
  "#C45C26",
  "#D4A017",
  "#7A5C9E",
  "#2F9E6B",
];

export const INITIAL_MEDIA: SharedMedia[] = [
  {
    id: "v1",
    title: "Jesus Loves the Little Children",
    kind: "video",
    duration: "3:12",
    description: "A cheerful kids video about God’s love for every child.",
    youtubeId: "XqZsoesa55w",
    ageGroup: "Ages 4–10",
    color: "#4A6FA5",
    published: true,
    source: "youtube",
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
    published: true,
    source: "youtube",
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
    published: true,
    source: "youtube",
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
    published: true,
    source: "youtube",
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
    published: true,
    source: "youtube",
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
    published: true,
    source: "youtube",
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
    published: true,
    source: "youtube",
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
    published: true,
    source: "youtube",
  },
];

export const INITIAL_CURRICULUM: SharedCurriculum[] = [
  {
    id: "course-1",
    title: "God’s Beautiful World",
    category: "Creation",
    week: 2,
    date: "September 14, 2026",
    year: "2026",
    scripture: "Genesis 1:1–31",
    memoryVerse: "In the beginning God created the heavens and the earth.",
    description:
      "Children explore creation days with pictures, songs, and a short craft.",
    status: "this_week",
    published: true,
  },
  {
    id: "course-2",
    title: "Noah Obeys God",
    category: "Bible Heroes",
    week: 3,
    date: "September 21, 2026",
    year: "2026",
    scripture: "Genesis 6–9",
    memoryVerse: "Noah did everything just as God commanded him.",
    description: "A lesson on listening to God even when it is hard.",
    status: "upcoming",
    published: true,
  },
  {
    id: "course-3",
    title: "Jesus Welcomes Children",
    category: "Gospels",
    week: 1,
    date: "September 7, 2026",
    year: "2026",
    scripture: "Mark 10:13–16",
    memoryVerse: "Let the little children come to me.",
    description: "Kids learn that Jesus loves and welcomes every child.",
    status: "completed",
    published: true,
  },
  {
    id: "course-4",
    title: "Be Kind Like the Samaritan",
    category: "Parables",
    week: 4,
    date: "September 28, 2026",
    year: "2026",
    scripture: "Luke 10:25–37",
    memoryVerse: "Go and do likewise.",
    description: "Practice kindness at home, school, and church.",
    status: "upcoming",
    published: true,
  },
];

export const INITIAL_EVENTS: SharedEvent[] = [
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
    published: true,
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
    published: true,
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
    published: true,
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
    published: true,
  },
];

export const INITIAL_GROUPS: SharedGroup[] = [
  { id: "group-a", name: "Group A", teacherName: "Hana Bekele" },
  { id: "group-b", name: "Group B", teacherName: "Dawit Yonas" },
];

export const INITIAL_STUDENTS: SharedStudent[] = [
  {
    id: "selam",
    name: "Selam Abebe",
    groupId: "group-a",
    grade: "Grade 3",
    age: 8,
    parentName: "Tsegaab Melat",
    parentEmail: "parent@test.com",
    initials: "SA",
    avatarColor: "#3D6B5A",
    attendance: 96,
    overallProgress: 78,
    streak: 12,
  },
  {
    id: "abel",
    name: "Abel Abebe",
    groupId: "group-b",
    grade: "Grade 1",
    age: 6,
    parentName: "Tsegaab Melat",
    parentEmail: "parent@test.com",
    initials: "AA",
    avatarColor: "#C45C26",
    attendance: 91,
    overallProgress: 64,
    streak: 5,
  },
  {
    id: "liya",
    name: "Liya Mekonnen",
    groupId: "group-a",
    grade: "Grade 3",
    age: 8,
    parentName: "Daniel Mekonnen",
    parentEmail: "daniel@example.com",
    initials: "LM",
    avatarColor: "#4A6FA5",
    attendance: 100,
    overallProgress: 91,
    streak: 8,
  },
  {
    id: "yonas",
    name: "Yonas Tadesse",
    groupId: "group-b",
    grade: "Grade 2",
    age: 7,
    parentName: "Marta Tadesse",
    parentEmail: "marta@example.com",
    initials: "YT",
    avatarColor: "#D4A017",
    attendance: 88,
    overallProgress: 70,
    streak: 3,
  },
];

export const INITIAL_ATTENDANCE: SharedAttendanceDay[] = [
  {
    id: "a1",
    studentId: "selam",
    weekday: "Sunday",
    date: "September 14, 2026",
    status: "present",
    lesson: "God’s Beautiful World",
  },
  {
    id: "a2",
    studentId: "selam",
    weekday: "Sunday",
    date: "September 7, 2026",
    status: "present",
    lesson: "Jesus Welcomes Children",
  },
  {
    id: "a3",
    studentId: "selam",
    weekday: "Sunday",
    date: "August 31, 2026",
    status: "absent",
    lesson: "Sharing God’s Love",
  },
  {
    id: "a4",
    studentId: "abel",
    weekday: "Sunday",
    date: "September 14, 2026",
    status: "present",
    lesson: "God’s Beautiful World",
  },
  {
    id: "a5",
    studentId: "abel",
    weekday: "Sunday",
    date: "September 7, 2026",
    status: "absent",
    lesson: "Jesus Welcomes Children",
  },
  {
    id: "a6",
    studentId: "liya",
    weekday: "Sunday",
    date: "September 14, 2026",
    status: "present",
    lesson: "God’s Beautiful World",
  },
  {
    id: "a7",
    studentId: "yonas",
    weekday: "Sunday",
    date: "September 14, 2026",
    status: "present",
    lesson: "God’s Beautiful World",
  },
];

export const INITIAL_ADMIN_NOTICES: AdminNotice[] = [
  {
    id: "an1",
    title: "Curriculum published",
    body: "God’s Beautiful World is live for parents this week.",
    time: "Today",
    category: "curriculum",
    unread: true,
  },
  {
    id: "an2",
    title: "Video uploaded",
    body: "Jesus Loves the Little Children was added to Kids Videos.",
    time: "Yesterday",
    category: "videos",
    unread: false,
  },
];

export const INITIAL_PARENT_NOTICES: ParentNotice[] = [
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
    title: "Upcoming event",
    body: "Children’s Sunday Picnic is on September 21 at 11:30 AM.",
    time: "Yesterday",
    category: "events",
    unread: true,
  },
  {
    id: "n3",
    title: "This week’s course",
    body: "God’s Beautiful World is ready to review at home.",
    time: "2 days ago",
    category: "courses",
    unread: false,
  },
];

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
