/**
 * Cart session storage for guest carts.
 * Uses AsyncStorage (cart session is non-sensitive).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_SESSION_KEY = 'logashop_cart_session';

export async function getCartSessionId(): Promise<string | null> {
  return AsyncStorage.getItem(CART_SESSION_KEY);
}

export async function setCartSessionId(id: string): Promise<void> {
  await AsyncStorage.setItem(CART_SESSION_KEY, id);
}

export async function clearCartSessionId(): Promise<void> {
  await AsyncStorage.removeItem(CART_SESSION_KEY);
}
