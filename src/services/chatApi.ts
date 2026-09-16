import { ApiConversation, ApiMessage, ChatMessage, ChatRole, Conversation } from "../types/chatTypes";

// Adjust to wherever your app centralizes this.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";
const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");

function timeLabel(iso: string) {
  const d = new Date(iso);
  let hours = d.getHours();
  const minutes = `${d.getMinutes()}`.padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

async function request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Request to ${path} failed (${res.status}): ${body}`);
  }
  return res.json();
}

function adaptConversation(c: ApiConversation): Conversation {
  return { ...c, id: String(c.id) };
}

function adaptMessage(m: ApiMessage): ChatMessage {
  return {
    id: String(m.id),
    conversationId: String(m.conversation),
    sender: m.sender_role,
    text: m.text,
    createdAt: m.created_at,
    timeLabel: timeLabel(m.created_at),
  };
}

export async function fetchConversations(token: string): Promise<Conversation[]> {
  const data = await request<ApiConversation[]>("/chat/conversations/", token);
  return data.map(adaptConversation);
}

export async function fetchConversation(token: string, id: string): Promise<Conversation> {
  const data = await request<ApiConversation>(`/chat/conversations/${id}/`, token);
  return adaptConversation(data);
}

export async function fetchMessages(token: string, conversationId: string): Promise<ChatMessage[]> {
  const data = await request<ApiMessage[]>(`/chat/conversations/${conversationId}/messages/`, token);
  return data.map(adaptMessage);
}

export async function postMessage(
  token: string,
  conversationId: string,
  text: string
): Promise<ChatMessage> {
  const data = await request<ApiMessage>(`/chat/conversations/${conversationId}/messages/`, token, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  return adaptMessage(data);
}

export async function postMarkRead(
  token: string,
  conversationId: string,
  role: ChatRole
): Promise<void> {
  await request(`/chat/conversations/${conversationId}/mark_read/`, token, {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}

export function openConversationSocket(
  token: string,
  conversationId: string,
  onMessage: (message: ChatMessage) => void
): () => void {
  const ws = new WebSocket(`${WS_BASE_URL}/ws/chat/${conversationId}/?token=${token}`);

  ws.onmessage = (event) => {
    try {
      const raw: ApiMessage = JSON.parse(event.data);
      onMessage(adaptMessage(raw));
    } catch {
      // Ignore malformed frames rather than crashing the socket handler.
    }
  };

  return () => ws.close();
}
