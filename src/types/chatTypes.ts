export type ChatRole = "teacher" | "parent";

export type ChatMessage = {
  id: string;
  conversationId: string;
  sender: ChatRole;
  text: string;
  createdAt: string; // ISO timestamp, from Message.created_at
  timeLabel: string; // derived client-side for display
};

// Mirrors ConversationSerializer's output field-for-field.
export type Conversation = {
  id: string;
  parentName: string;
  childName: string;
  teacherName: string;
  lastMessage: string;
  lastTime: string; // ISO timestamp; format for display where rendered
  unreadForTeacher: number;
  unreadForParent: number;
  parentInitials: string;
  parentColor: string;
  teacherInitials: string;
  teacherColor: string;
};

// Raw shapes returned by the API, before we adapt them to the types above.
export type ApiMessage = {
  id: number;
  conversation: number;
  sender: number;
  sender_role: ChatRole;
  text: string;
  created_at: string;
  read_by_teacher: boolean;
  read_by_parent: boolean;
};

export type ApiConversation = {
  id: number;
  parentName: string;
  childName: string;
  teacherName: string;
  lastMessage: string;
  lastTime: string;
  unreadForTeacher: number;
  unreadForParent: number;
  parentInitials: string;
  parentColor: string;
  teacherInitials: string;
  teacherColor: string;
};