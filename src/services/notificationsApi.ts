import { clientApi } from "./api";

export type AppNotification = {
  id: number;
  notification_type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
  category: string;
  actor_id: number | null;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export async function registerPushToken(token: string, platform: "ios" | "android" | "web") {
  await clientApi.post("/notifications/push-token/", { token, platform });
}

export async function unregisterPushToken(token: string) {
  await clientApi.delete("/notifications/push-token/", { data: { token } });
}

export async function fetchNotifications(page = 1): Promise<Paginated<AppNotification>> {
  const { data } = await clientApi.get(`/notifications/`, { params: { page } });
  return data;
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await clientApi.get(`/notifications/unread-count/`);
  return data.count;
}

export async function markNotificationRead(id: number): Promise<void> {
  await clientApi.post(`/notifications/${id}/mark-read/`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await clientApi.post(`/notifications/mark-all-read/`);
}
