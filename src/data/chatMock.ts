export type ChatRole = "teacher" | "parent";

export type ChatMessage = {
  id: string;
  conversationId: string;
  sender: ChatRole;
  text: string;
  createdAt: string;
  timeLabel: string;
};

export type Conversation = {
  id: string;
  parentName: string;
  teacherName: string;
  childName: string;
  parentInitials: string;
  teacherInitials: string;
  parentColor: string;
  teacherColor: string;
  lastMessage: string;
  lastTime: string;
  unreadForTeacher: number;
  unreadForParent: number;
};

export const CHAT_TEACHER = {
  name: "Hana Bekele",
  initials: "HB",
  color: "#C45C26",
};

export const CHAT_PARENT = {
  name: "Tsegaab Melat",
  initials: "TM",
  color: "#6C63FF",
};

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    parentName: "Tsegaab Melat",
    teacherName: "Hana Bekele",
    childName: "Samuel Alemu",
    parentInitials: "TM",
    teacherInitials: "HB",
    parentColor: "#6C63FF",
    teacherColor: "#C45C26",
    lastMessage: "Thank you for today's lesson update.",
    lastTime: "12 min",
    unreadForTeacher: 2,
    unreadForParent: 0,
  },
  {
    id: "c2",
    parentName: "Marta Tadesse",
    teacherName: "Hana Bekele",
    childName: "Yonas Tadesse",
    parentInitials: "MT",
    teacherInitials: "HB",
    parentColor: "#3D6B5A",
    teacherColor: "#C45C26",
    lastMessage: "Yonas will arrive a little late this Sunday.",
    lastTime: "1h",
    unreadForTeacher: 1,
    unreadForParent: 0,
  },
  {
    id: "c3",
    parentName: "Daniel Mekonnen",
    teacherName: "Hana Bekele",
    childName: "Liya Mekonnen",
    parentInitials: "DM",
    teacherInitials: "HB",
    parentColor: "#4A6FA5",
    teacherColor: "#C45C26",
    lastMessage: "Could you share this week's memory verse?",
    lastTime: "Yesterday",
    unreadForTeacher: 0,
    unreadForParent: 1,
  },
  {
    id: "c4",
    parentName: "Bethlehem Hailu",
    teacherName: "Hana Bekele",
    childName: "Sara Hailu",
    parentInitials: "BH",
    teacherInitials: "HB",
    parentColor: "#D4A017",
    teacherColor: "#C45C26",
    lastMessage: "Sara loved the Good Samaritan activity!",
    lastTime: "Mon",
    unreadForTeacher: 0,
    unreadForParent: 0,
  },
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    conversationId: "c1",
    sender: "teacher",
    text: "Good morning! Samuel did very well in today's lesson on The Good Samaritan.",
    createdAt: "2026-09-13T08:40:00",
    timeLabel: "8:40 AM",
  },
  {
    id: "m2",
    conversationId: "c1",
    sender: "teacher",
    text: "He also helped another child during the activity. Please encourage him at home.",
    createdAt: "2026-09-13T08:41:00",
    timeLabel: "8:41 AM",
  },
  {
    id: "m3",
    conversationId: "c1",
    sender: "parent",
    text: "Thank you for today's lesson update. That means a lot to us.",
    createdAt: "2026-09-13T09:05:00",
    timeLabel: "9:05 AM",
  },
  {
    id: "m4",
    conversationId: "c2",
    sender: "parent",
    text: "Yonas will arrive a little late this Sunday. Thank you.",
    createdAt: "2026-09-13T07:20:00",
    timeLabel: "7:20 AM",
  },
  {
    id: "m5",
    conversationId: "c2",
    sender: "teacher",
    text: "No problem, Marta. We'll welcome him when he arrives.",
    createdAt: "2026-09-13T07:35:00",
    timeLabel: "7:35 AM",
  },
  {
    id: "m6",
    conversationId: "c3",
    sender: "parent",
    text: "Could you share this week's memory verse?",
    createdAt: "2026-09-12T18:10:00",
    timeLabel: "Yesterday",
  },
  {
    id: "m7",
    conversationId: "c3",
    sender: "teacher",
    text: "Of course! Luke 10:27 — Love your neighbor as yourself.",
    createdAt: "2026-09-12T18:22:00",
    timeLabel: "Yesterday",
  },
  {
    id: "m8",
    conversationId: "c4",
    sender: "parent",
    text: "Sara loved the Good Samaritan activity!",
    createdAt: "2026-09-08T16:00:00",
    timeLabel: "Mon",
  },
  {
    id: "m9",
    conversationId: "c4",
    sender: "teacher",
    text: "Wonderful to hear. She participated beautifully.",
    createdAt: "2026-09-08T16:12:00",
    timeLabel: "Mon",
  },
];
