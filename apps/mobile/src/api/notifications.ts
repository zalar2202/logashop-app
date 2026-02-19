/**
 * Notifications API for LogaShop.
 * GET /api/notifications — List notifications
 * GET /api/notifications/count — Unread count
 * PATCH /api/notifications/[id] — Mark read/unread
 * PATCH /api/notifications/mark-all-read — Mark all read
 */

import { apiRequest } from './request';

export interface Notification {
  _id: string;
  recipient: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  actionLabel?: string | null;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface FetchNotificationsResponse {
  success: boolean;
  data?: Notification[];
  pagination?: { page: number; limit: number; total: number; pages: number };
  error?: string;
}

async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json();
  return json as T;
}

export async function fetchNotifications(
  accessToken: string,
  page = 1,
  limit = 20,
  read?: boolean | null
): Promise<{ notifications: Notification[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (read !== undefined && read !== null) params.set('read', String(read));

  const res = await apiRequest({
    path: `/api/notifications?${params.toString()}`,
    method: 'GET',
    accessToken,
  });

  const parsed = await parseJson<FetchNotificationsResponse>(res);
  if (!res.ok) throw new Error(parsed.error ?? 'Failed to fetch notifications');

  const notifications = Array.isArray(parsed.data) ? parsed.data : [];
  const pagination = parsed.pagination ?? { page: 1, limit, total: 0, pages: 0 };
  return { notifications, pagination };
}

export async function fetchUnreadCount(accessToken: string): Promise<number> {
  const res = await apiRequest({
    path: '/api/notifications/count',
    method: 'GET',
    accessToken,
  });

  const parsed = await res.json().catch(() => ({})) as { success?: boolean; data?: { count?: number }; error?: string };
  if (!res.ok) throw new Error(parsed.error ?? 'Failed to fetch count');

  const count = parsed.data?.count ?? 0;
  return typeof count === 'number' ? count : 0;
}

export async function markAsRead(
  notificationId: string,
  accessToken: string
): Promise<void> {
  const res = await apiRequest({
    path: `/api/notifications/${notificationId}`,
    method: 'PATCH',
    body: { read: true },
    accessToken,
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? 'Failed to mark as read');
  }
}

export async function markAllAsRead(accessToken: string): Promise<void> {
  const res = await apiRequest({
    path: '/api/notifications/mark-all-read',
    method: 'PATCH',
    accessToken,
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? 'Failed to mark all as read');
  }
}
