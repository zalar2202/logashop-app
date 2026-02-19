/**
 * Secure token storage for auth.
 * Uses Expo SecureStore on native (iOS/Android); AsyncStorage fallback on web.
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'logashop_access_token';
const REFRESH_TOKEN_KEY = 'logashop_refresh_token';

const IS_WEB = Platform.OS === 'web';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export async function storeTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  if (IS_WEB) {
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, accessToken],
      [REFRESH_TOKEN_KEY, refreshToken],
    ]);
  } else {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function getTokens(): Promise<StoredTokens | null> {
  if (IS_WEB) {
    const values = await AsyncStorage.multiGet([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
    const accessToken = values[0][1];
    const refreshToken = values[1][1];
    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }
    return null;
  }
  const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }
  return null;
}

export async function clearTokens(): Promise<void> {
  if (IS_WEB) {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  } else {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}
