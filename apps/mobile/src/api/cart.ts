/**
 * Cart API for LogaShop.
 * Uses apiRequest with optional accessToken and cartSessionId.
 * All prices in cents (see DATA_MODELS.md).
 */

import { apiRequest } from './request';
import * as authStorage from '../lib/authStorage';

export interface CartItem {
  _id: string;
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  originalPrice: number;
  quantity: number;
  maxQuantity: number;
  allowBackorder: boolean;
  variantInfo: Record<string, string> | null;
  lineTotal: number;
}

export interface CartResponse {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  cartId: string;
  sessionId?: string;
}

async function parseJsonResponse<T>(res: Response): Promise<{ success: boolean; data?: T; error?: string }> {
  const json = await res.json();
  return json as { success: boolean; data?: T; error?: string };
}

async function getAccessToken(): Promise<string | null> {
  const tokens = await authStorage.getTokens();
  return tokens?.accessToken ?? null;
}

/**
 * GET /api/cart - Fetch current cart.
 */
export async function fetchCart(
  accessToken?: string | null,
  cartSessionId?: string | null
): Promise<CartResponse> {
  const token = accessToken ?? (await getAccessToken());
  const res = await apiRequest({
    path: '/api/cart',
    method: 'GET',
    accessToken: token ?? undefined,
    cartSessionId: cartSessionId ?? undefined,
  });

  const parsed = await parseJsonResponse<CartResponse>(res);
  if (!res.ok || !parsed.success || !parsed.data) {
    throw new Error(parsed.error ?? `Failed to fetch cart (${res.status})`);
  }
  return parsed.data;
}

/**
 * POST /api/cart - Add item to cart.
 */
export async function addToCart(
  params: { productId: string; variantId?: string | null; quantity?: number },
  accessToken?: string | null,
  cartSessionId?: string | null
): Promise<{ itemCount: number; subtotal: number; sessionId?: string }> {
  const token = accessToken ?? (await getAccessToken());
  const res = await apiRequest({
    path: '/api/cart',
    method: 'POST',
    body: {
      productId: params.productId,
      variantId: params.variantId ?? null,
      quantity: params.quantity ?? 1,
    },
    accessToken: token ?? undefined,
    cartSessionId: cartSessionId ?? undefined,
  });

  const parsed = await parseJsonResponse<{ itemCount: number; subtotal: number; sessionId?: string }>(res);
  if (!res.ok || !parsed.success || !parsed.data) {
    throw new Error(parsed.error ?? `Failed to add to cart (${res.status})`);
  }
  return parsed.data;
}

/**
 * PUT /api/cart - Update item quantity. quantity 0 removes the item.
 */
export async function updateCartItem(
  itemId: string,
  quantity: number,
  accessToken?: string | null,
  cartSessionId?: string | null
): Promise<{ itemCount: number; subtotal: number }> {
  const token = accessToken ?? (await getAccessToken());
  const res = await apiRequest({
    path: '/api/cart',
    method: 'PUT',
    body: {
      itemId,
      quantity,
    },
    accessToken: token ?? undefined,
    cartSessionId: cartSessionId ?? undefined,
  });

  const parsed = await parseJsonResponse<{ itemCount: number; subtotal: number }>(res);
  if (!res.ok || !parsed.success || !parsed.data) {
    throw new Error(parsed.error ?? `Failed to update cart (${res.status})`);
  }
  return parsed.data;
}

/**
 * DELETE /api/cart?itemId=xxx - Remove single item.
 */
export async function removeCartItem(
  itemId: string,
  accessToken?: string | null,
  cartSessionId?: string | null
): Promise<{ itemCount: number; subtotal: number }> {
  const token = accessToken ?? (await getAccessToken());
  const res = await apiRequest({
    path: `/api/cart?itemId=${encodeURIComponent(itemId)}`,
    method: 'DELETE',
    accessToken: token ?? undefined,
    cartSessionId: cartSessionId ?? undefined,
  });

  const parsed = await parseJsonResponse<{ itemCount: number; subtotal: number }>(res);
  if (!res.ok || !parsed.success || !parsed.data) {
    throw new Error(parsed.error ?? `Failed to remove item (${res.status})`);
  }
  return parsed.data;
}

/**
 * DELETE /api/cart?clear=true - Clear entire cart.
 */
export async function clearCart(
  accessToken?: string | null,
  cartSessionId?: string | null
): Promise<{ itemCount: number; subtotal: number }> {
  const token = accessToken ?? (await getAccessToken());
  const res = await apiRequest({
    path: '/api/cart?clear=true',
    method: 'DELETE',
    accessToken: token ?? undefined,
    cartSessionId: cartSessionId ?? undefined,
  });

  const parsed = await parseJsonResponse<{ itemCount: number; subtotal: number }>(res);
  if (!res.ok || !parsed.success || !parsed.data) {
    throw new Error(parsed.error ?? `Failed to clear cart (${res.status})`);
  }
  return parsed.data;
}
