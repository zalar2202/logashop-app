/**
 * Push notification registration hook.
 * Requests permission, gets device token, and registers with backend.
 */

import { useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as devicesApi from '../api/devices';

/**
 * Configure how notifications are handled when app is in foreground.
 * Call once at app startup (e.g. in App.tsx).
 */
export function setNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldAnnounce: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Register device for push notifications.
 * Call when user is authenticated.
 * Gracefully skips if permissions denied or on web/simulator.
 */
export async function registerForPushNotifications(
  accessToken: string
): Promise<void> {
  if (!Device.isDevice) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    if (finalStatus !== 'granted') return;
  }

  try {
    const tokenData = await Notifications.getDevicePushTokenAsync();
    const token = tokenData?.data;
    if (!token || typeof token !== 'string') return;

    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    const deviceId = Constants.sessionId ?? undefined;
    const appVersion = Constants.expoConfig?.version ?? Constants.manifest?.version ?? undefined;

    await devicesApi.registerDevice(token, platform, accessToken, {
      deviceId: deviceId ?? null,
      appVersion: appVersion ?? null,
    });
  } catch {
    // Silently fail - do not block app
  }
}

/**
 * Hook to trigger push registration when authenticated.
 * Call from a component inside AuthProvider.
 */
export function usePushNotifications(accessToken: string | null | undefined): {
  register: () => Promise<void>;
} {
  const register = useCallback(async () => {
    if (!accessToken) return;
    await registerForPushNotifications(accessToken);
  }, [accessToken]);

  return { register };
}
