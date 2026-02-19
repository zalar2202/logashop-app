/**
 * Device registration for push notifications.
 * POST /api/devices/register — Register FCM token.
 */

import { apiRequest } from './request';

/**
 * Register device token for push notifications.
 * Requires auth (Bearer).
 */
export async function registerDevice(
  deviceToken: string,
  platform: 'ios' | 'android',
  accessToken: string,
  options?: { deviceId?: string | null; appVersion?: string | null }
): Promise<void> {
  const body: Record<string, unknown> = {
    deviceToken,
    platform,
  };
  if (options?.deviceId != null) body.deviceId = options.deviceId;
  if (options?.appVersion != null) body.appVersion = options.appVersion;

  const res = await apiRequest({
    path: '/api/devices/register',
    method: 'POST',
    body,
    accessToken,
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? 'Failed to register device');
  }
}
