/**
 * Wishlist API for LogaShop.
 * GET /api/wishlist — Fetch wishlist products
 * POST /api/wishlist — Toggle product (add/remove)
 */

import type { Product } from './catalog';
import { apiRequest } from './request';

export interface WishlistToggleResponse {
  success: boolean;
  action?: 'added' | 'removed';
  count?: number;
  sessionId?: string;
}

async function parseJsonResponse<T>(res: Response): Promise<{ success: boolean; data?: T; error?: string } & Record<string, unknown>> {
  const json = await res.json();
  return json as { success: boolean; data?: T; error?: string } & Record<string, unknown>;
}

/**
 * GET /api/wishlist - Fetch wishlist products.
 * Returns populated product list.
 */
export async function fetchWishlist(
  accessToken?: string | null,
  wishlistSessionId?: string | null
): Promise<{ products: Product[]; sessionId?: string }> {
  const res = await apiRequest({
    path: '/api/wishlist',
    method: 'GET',
    accessToken: accessToken ?? undefined,
    wishlistSessionId: wishlistSessionId ?? undefined,
  });

  const parsed = await parseJsonResponse<Product[]>(res);
  if (!res.ok || !parsed.success) {
    throw new Error(parsed.error ?? 'Failed to fetch wishlist');
  }
  const products = Array.isArray(parsed.data) ? parsed.data : [];
  return {
    products,
    sessionId: parsed.sessionId as string | undefined,
  };
}

/**
 * POST /api/wishlist - Toggle product in wishlist.
 * Body: { productId, sessionId? }
 */
export async function toggleWishlist(
  productId: string,
  accessToken?: string | null,
  wishlistSessionId?: string | null
): Promise<{ action: 'added' | 'removed'; count: number; sessionId?: string }> {
  const body: { productId: string; sessionId?: string } = { productId };
  if (wishlistSessionId) {
    body.sessionId = wishlistSessionId;
  }

  const res = await apiRequest({
    path: '/api/wishlist',
    method: 'POST',
    body,
    accessToken: accessToken ?? undefined,
    wishlistSessionId: wishlistSessionId ?? undefined,
  });

  const parsed = await parseJsonResponse<WishlistToggleResponse>(res);
  if (!res.ok || !parsed.success) {
    throw new Error(parsed.error ?? 'Failed to update wishlist');
  }
  return {
    action: parsed.action ?? 'added',
    count: parsed.count ?? 0,
    sessionId: parsed.sessionId as string | undefined,
  };
}
