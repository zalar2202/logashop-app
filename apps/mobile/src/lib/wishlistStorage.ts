/**
 * Wishlist session storage for guest wishlists.
 * Uses AsyncStorage (wishlist session is non-sensitive).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const WISHLIST_SESSION_KEY = 'logashop_wishlist_session';

export async function getWishlistSessionId(): Promise<string | null> {
  return AsyncStorage.getItem(WISHLIST_SESSION_KEY);
}

export async function setWishlistSessionId(id: string): Promise<void> {
  await AsyncStorage.setItem(WISHLIST_SESSION_KEY, id);
}

export async function clearWishlistSessionId(): Promise<void> {
  await AsyncStorage.removeItem(WISHLIST_SESSION_KEY);
}
