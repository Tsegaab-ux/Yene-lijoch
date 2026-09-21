import { ApiConversation, ApiMessage, ChatMessage, ChatRole, Conversation } from "../types/chatTypes";
import { clientApi, API_BASE } from "./api";

const WS_BASE_URL = API_BASE.replace(/^http/, "ws");

function timeLabel(iso: string) {
  const d = new Date(iso);
  let hours = d.getHours();
  const minutes = `${d.getMinutes()}`.padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

async function request<T>(
  path: string,
  token: string,
  options: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown } = {}
): Promise<T> {
  try {
    const res = await clientApi.request<T>({
      url: path,
      method: options.method ?? "GET",
      data: options.body,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    const body = err?.response?.data;
    throw new Error(`Request to ${path} failed (${status}): ${JSON.stringify(body)}`);
  }
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
  const data = await request<ApiConversation[]>("/conversations/", token);
  return data.map(adaptConversation);
}

export async function fetchConversation(token: string, id: string): Promise<Conversation> {
  const data = await request<ApiConversation>(`/conversations/${id}/`, token);
  return adaptConversation(data);
}

export async function fetchMessages(token: string, conversationId: string): Promise<ChatMessage[]> {
  const data = await request<ApiMessage[]>(`/conversations/${conversationId}/messages/`, token);
  return data.map(adaptMessage);
}

export async function postMessage(
  token: string,
  conversationId: string,
  text: string
): Promise<ChatMessage> {
  const data = await request<ApiMessage>(`/conversations/${conversationId}/messages/`, token, {
    method: "POST",
    body: { text },
  });
  return adaptMessage(data);
}

export async function postMarkRead(
  token: string,
  conversationId: string,
  role: ChatRole
): Promise<void> {
  await request(`/conversations/${conversationId}/mark_read/`, token, {
    method: "POST",
    body: { role },
  });
}

export function openConversationSocket(
  token: string,
  conversationId: string,
  onMessage: (message: ChatMessage) => void
): () => void {
  const ws = new WebSocket(`${WS_BASE_URL}/ws/${conversationId}/?token=${token}`);

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

export async function createConversation(
  token: string,
  studentId: number | string
): Promise<Conversation> {
  const data = await request<ApiConversation>("/conversations/", token, {
    method: "POST",
    body: { student: studentId },
  });
  return adaptConversation(data);
}