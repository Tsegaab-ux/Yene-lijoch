export type AdminTeacher = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  status: "active" | "inactive";
  classIds: string[];
};

export type AdminChild = {
  id: string;
  name: string;
  grade: string;
  parentName: string;
  parentEmail: string;
  classId: string;
  progress: number;
  attendance: number;
};

export type AdminClass = {
  id: string;
  name: string;
  grade: string;
  subject: string;
  room: string;
  teacherId: string | null;
  studentCount: number;
};

export type AdminEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  audience: "parents" | "teachers" | "all";
  description: string;
  notifyParents: boolean;
};

export type AdminLesson = {
  id: string;
  title: string;
  subject: string;
  classId: string;
  progress: number;
  status: "draft" | "published" | "completed";
};

export const ADMIN = {
  name: "Dawit Alemu",
  email: "admin@test.com",
  role: "School Administrator",
  school: "Yene Lijoch Academy",
};

export const INITIAL_TEACHERS: AdminTeacher[] = [
  {
    id: "t1",
    name: "Hana Bekele",
    email: "teacher@test.com",
    phone: "+251 91 888 2211",
    subject: "Amharic & Science",
    status: "active",
    classIds: ["g3-amharic", "g3-science"],
  },
  {
    id: "t2",
    name: "Dawit Yonas",
    email: "dawit.yonas@yenelijoch.com",
    phone: "+251 91 777 3344",
    subject: "Math",
    status: "active",
    classIds: ["g1-home"],
  },
  {
    id: "t3",
    name: "Marta Hailu",
    email: "marta.hailu@yenelijoch.com",
    phone: "+251 91 555 8899",
    subject: "Reading",
    status: "inactive",
    classIds: [],
  },
];

export const INITIAL_CHILDREN: AdminChild[] = [
  {
    id: "c1",
    name: "Selam Abebe",
    grade: "Grade 3",
    parentName: "Tsegaab Melat",
    parentEmail: "parent@test.com",
    classId: "g3-amharic",
    progress: 78,
    attendance: 96,
  },
  {
    id: "c2",
    name: "Abel Abebe",
    grade: "Grade 1",
    parentName: "Tsegaab Melat",
    parentEmail: "parent@test.com",
    classId: "g1-home",
    progress: 64,
    attendance: 91,
  },
  {
    id: "c3",
    name: "Liya Mekonnen",
    grade: "Grade 3",
    parentName: "Daniel Mekonnen",
    parentEmail: "daniel@example.com",
    classId: "g3-amharic",
    progress: 91,
    attendance: 100,
  },
];

export const INITIAL_CLASSES: AdminClass[] = [
  {
    id: "g3-amharic",
    name: "Grade 3 Amharic",
    grade: "Grade 3",
    subject: "Amharic",
    room: "Room 12",
    teacherId: "t1",
    studentCount: 24,
  },
  {
    id: "g3-science",
    name: "Grade 3 Science",
    grade: "Grade 3",
    subject: "Science",
    room: "Room 12",
    teacherId: "t1",
    studentCount: 24,
  },
  {
    id: "g1-home",
    name: "Grade 1 Homeroom",
    grade: "Grade 1",
    subject: "Homeroom",
    room: "Room 4",
    teacherId: "t2",
    studentCount: 18,
  },
];

export const INITIAL_EVENTS: AdminEvent[] = [
  {
    id: "e1",
    title: "Parent-Teacher Conference",
    date: "Aug 22, 2026",
    time: "4:00 PM",
    location: "Room 12",
    audience: "parents",
    description: "Meet teachers to review student progress.",
    notifyParents: true,
  },
  {
    id: "e2",
    title: "Science Fair Preview",
    date: "Aug 25, 2026",
    time: "10:00 AM",
    location: "School Hall",
    audience: "all",
    description: "Students present mini experiments.",
    notifyParents: true,
  },
];

export const INITIAL_LESSONS: AdminLesson[] = [
  {
    id: "l1",
    title: "Amharic Letters: ሀ to ነ",
    subject: "Amharic",
    classId: "g3-amharic",
    progress: 62,
    status: "published",
  },
  {
    id: "l2",
    title: "Adding Within 20",
    subject: "Math",
    classId: "g1-home",
    progress: 40,
    status: "published",
  },
  {
    id: "l3",
    title: "Ethiopian Animals",
    subject: "Science",
    classId: "g3-science",
    progress: 0,
    status: "draft",
  },
];
