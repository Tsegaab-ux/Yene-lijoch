export type CurriculumStatus = "completed" | "this_week" | "upcoming";

export type CurriculumMaterial = {
  id: string;
  title: string;
  type: "guide" | "activity" | "verse";
};

export type CurriculumLesson = {
  id: string;
  week: number;
  month: string;
  date: string;
  title: string;
  scripture: string;
  memoryVerse: string;
  memoryVerseRef: string;
  objective: string;
  materials: CurriculumMaterial[];
  activity: string;
  summary: string;
  status: CurriculumStatus;
};

export type CurriculumMonth = {
  month: string;
  year: number;
  lessons: CurriculumLesson[];
};

export type SundayStudent = {
  id: string;
  name: string;
  initials: string;
  color: string;
  group: string;
  attendance: "present" | "absent" | "unmarked";
  parent: string;
  notes: string;
};

export type EventAudience = "my_group" | "children_ministry" | "all_parents";

export type SundayEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  audience: EventAudience;
};

export type TeacherMessage = {
  id: string;
  from: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export const TEACHER = {
  name: "Hana Bekele",
  title: "Sunday School Teacher",
  email: "teacher@test.com",
  phone: "+251 91 888 2211",
  group: "Group A",
  program: "Sunday School",
  school: "Yene Lijoch Academy",
};

const DEFAULT_MATERIALS: CurriculumMaterial[] = [
  { id: "m1", title: "Teacher Guide", type: "guide" },
  { id: "m2", title: "Activity Sheet", type: "activity" },
  { id: "m3", title: "Memory Verse", type: "verse" },
];

export const CURRICULUM_TITLE = "2026 Children's Curriculum";

export const CURRICULUM_MONTHS: CurriculumMonth[] = [
  {
    month: "September",
    year: 2026,
    lessons: [
      {
        id: "sep-week-1",
        week: 1,
        month: "September",
        date: "September 6",
        title: "Creation",
        scripture: "Genesis 1:1–31",
        memoryVerse: "In the beginning God created the heavens and the earth.",
        memoryVerseRef: "Genesis 1:1",
        objective:
          "Children will understand that God made the world and everything in it with care and purpose.",
        materials: DEFAULT_MATERIALS,
        activity: "Creation Craft",
        summary: "Explore the story of creation through story, song, and craft.",
        status: "completed",
      },
      {
        id: "sep-week-2",
        week: 2,
        month: "September",
        date: "September 13",
        title: "Noah's Ark",
        scripture: "Genesis 6:9–22; 7–8",
        memoryVerse: "Noah did everything just as God commanded him.",
        memoryVerseRef: "Genesis 6:22",
        objective:
          "Children will learn that God keeps His promises and cares for His people.",
        materials: DEFAULT_MATERIALS,
        activity: "Animal Match Game",
        summary: "Retell Noah's story and talk about trust and obedience.",
        status: "completed",
      },
      {
        id: "sep-week-3",
        week: 3,
        month: "September",
        date: "September 13",
        title: "The Good Samaritan",
        scripture: "Luke 10:25–37",
        memoryVerse: "Love your neighbor as yourself.",
        memoryVerseRef: "Luke 10:27",
        objective:
          "Children will understand what it means to show kindness and help others in need.",
        materials: DEFAULT_MATERIALS,
        activity: "Helping Others",
        summary:
          "Help children understand kindness through the story of the Good Samaritan.",
        status: "this_week",
      },
      {
        id: "sep-week-4",
        week: 4,
        month: "September",
        date: "September 27",
        title: "Joseph",
        scripture: "Genesis 37; 39–45",
        memoryVerse: "You meant it for evil, but God meant it for good.",
        memoryVerseRef: "Genesis 50:20",
        objective:
          "Children will see that God can use hard moments for good purposes.",
        materials: DEFAULT_MATERIALS,
        activity: "Dream Coat Coloring",
        summary: "Follow Joseph's journey and talk about forgiveness and hope.",
        status: "upcoming",
      },
    ],
  },
  {
    month: "October",
    year: 2026,
    lessons: [
      {
        id: "oct-week-1",
        week: 1,
        month: "October",
        date: "October 4",
        title: "The Lost Sheep",
        scripture: "Luke 15:1–7",
        memoryVerse: "Rejoice with me; I have found my lost sheep.",
        memoryVerseRef: "Luke 15:6",
        objective:
          "Children will understand that God cares for every child personally.",
        materials: DEFAULT_MATERIALS,
        activity: "Find the Sheep",
        summary: "A lesson about God's care for every child.",
        status: "upcoming",
      },
      {
        id: "oct-week-2",
        week: 2,
        month: "October",
        date: "October 11",
        title: "Abraham's Faith",
        scripture: "Genesis 12:1–9; 15:1–6",
        memoryVerse: "Abram believed the Lord.",
        memoryVerseRef: "Genesis 15:6",
        objective:
          "Children will learn that faith means trusting God even when the path is unknown.",
        materials: DEFAULT_MATERIALS,
        activity: "Stars Promise Craft",
        summary: "Discover Abraham's journey of trusting God.",
        status: "upcoming",
      },
    ],
  },
];

export const CURRICULUM: CurriculumLesson[] = CURRICULUM_MONTHS.flatMap(
  (m) => m.lessons
);

export const TODAY_CURRICULUM: CurriculumLesson =
  CURRICULUM.find((l) => l.status === "this_week") ?? CURRICULUM[0];

export function getCurriculumLesson(id: string) {
  return CURRICULUM.find((l) => l.id === id) ?? TODAY_CURRICULUM;
}

export const STUDENTS: SundayStudent[] = [
  { id: "s1", name: "Samuel Alemu", initials: "SA", color: "#C45C26", group: "Group A", attendance: "present", parent: "Alemu Kebede", notes: "Engaged and helpful." },
  { id: "s2", name: "Ruth Bekele", initials: "RB", color: "#7A5C9E", group: "Group A", attendance: "absent", parent: "Hanna Bekele", notes: "Usually arrives a bit late." },
  { id: "s3", name: "Daniel Tesfaye", initials: "DT", color: "#3D6B5A", group: "Group A", attendance: "present", parent: "Tesfaye Girma", notes: "Strong memory verses." },
  { id: "s4", name: "Mekdes Abraham", initials: "MA", color: "#4A6FA5", group: "Group A", attendance: "present", parent: "Abraham Hailu", notes: "Loves crafts." },
  { id: "s5", name: "Yonas Tadesse", initials: "YT", color: "#D4A017", group: "Group A", attendance: "present", parent: "Marta Tadesse", notes: "Needs gentle reminders." },
  { id: "s6", name: "Liya Mekonnen", initials: "LM", color: "#2F9E6B", group: "Group A", attendance: "present", parent: "Daniel Mekonnen", notes: "Great participation." },
  { id: "s7", name: "Helen Desta", initials: "HD", color: "#C45C26", group: "Group A", attendance: "present", parent: "Desta Hailu", notes: "Helpful with peers." },
  { id: "s8", name: "Biruk Alemu", initials: "BA", color: "#3D6B5A", group: "Group A", attendance: "present", parent: "Alemu Girma", notes: "Enjoys crafts." },
  { id: "s9", name: "Mariam Yusuf", initials: "MY", color: "#4A6FA5", group: "Group A", attendance: "present", parent: "Yusuf Ahmed", notes: "Quiet but attentive." },
  { id: "s10", name: "Kidus Solomon", initials: "KS", color: "#D4A017", group: "Group A", attendance: "present", parent: "Solomon Getachew", notes: "Energetic and friendly." },
  { id: "s11", name: "Sara Hailu", initials: "SH", color: "#7A5C9E", group: "Group A", attendance: "present", parent: "Bethlehem Hailu", notes: "Curious and kind." },
  { id: "s12", name: "Elias Girma", initials: "EG", color: "#2F9E6B", group: "Group A", attendance: "absent", parent: "Girma Kebede", notes: "Follow up with parent." },
];

export const ATTENDANCE_DATE = "September 13";

export const EVENTS: SundayEvent[] = [
  {
    id: "e1",
    title: "Children's Program",
    date: "September 27",
    time: "10:00 AM",
    location: "Main Church",
    description: "Group A presents songs and a short drama from the semester lessons.",
    audience: "all_parents",
  },
  {
    id: "e2",
    title: "Bible Competition",
    date: "October 4",
    time: "9:00 AM",
    location: "Main Church",
    description: "Children compete in memory verses and Bible knowledge games.",
    audience: "children_ministry",
  },
  {
    id: "e3",
    title: "Family Sunday Picnic",
    date: "October 11",
    time: "12:00 PM",
    location: "School Garden",
    description: "Parents and children celebrate together after class.",
    audience: "all_parents",
  },
];

export const AUDIENCE_LABELS: Record<EventAudience, string> = {
  my_group: "My Group",
  children_ministry: "Children's Ministry",
  all_parents: "All Parents",
};

export const MESSAGES: TeacherMessage[] = [
  {
    id: "m1",
    from: "Tsegaab Melat",
    title: "About Selam",
    body: "Thank you for today's lesson. Selam loved the Good Samaritan story.",
    time: "12 min ago",
    unread: true,
  },
  {
    id: "m2",
    from: "Admin Office",
    title: "Children's Program reminder",
    body: "Please confirm Group A roles by Wednesday.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "m3",
    from: "Marta Tadesse",
    title: "Early pickup",
    body: "Yonas will leave 15 minutes early next Sunday.",
    time: "Yesterday",
    unread: false,
  },
];

export function getAttendanceSummary(students: SundayStudent[]) {
  const present = students.filter((s) => s.attendance === "present").length;
  const absent = students.filter((s) => s.attendance === "absent").length;
  const unmarked = students.filter((s) => s.attendance === "unmarked").length;
  return { total: students.length, present, absent, unmarked };
}
