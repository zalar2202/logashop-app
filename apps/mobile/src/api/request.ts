/**
 * Authenticated API request helper with 401 refresh-and-retry.
 * Use for protected endpoints (cart, checkout, orders, etc.).
 * On 401: attempts refresh, retries once with new token; throws if refresh fails.
 */

import {
  getApiBaseUrl,
  getApiHeaders,
  getApiHeadersWithCart,
  getApiHeadersWithWishlist,
} from '../api';
import * as authStorage from '../lib/authStorage';
import * as authApi from './auth';

export interface ApiRequestOptions {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  accessToken?: string | null;
  cartSessionId?: string | null;
  wishlistSessionId?: string | null;
}

/**
 * Makes an authenticated API request. On 401, attempts token refresh and retries once.
 * Throws if refresh fails or on other errors.
 */
export async function apiRequest(options: ApiRequestOptions): Promise<Response> {
  const {
    path,
    method = 'GET',
    body,
    accessToken,
    cartSessionId,
    wishlistSessionId,
  } = options;

  const base = getApiBaseUrl();
  if (!base) throw new Error('API base URL not configured');

  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const getHeaders = (token?: string | null) => {
    const t = token ?? accessToken;
    if (cartSessionId) return getApiHeadersWithCart(t, cartSessionId);
    if (wishlistSessionId) return getApiHeadersWithWishlist(t, wishlistSessionId);
    return getApiHeaders(t);
  };
  const headers = getHeaders(accessToken);

  const doFetch = (token?: string | null) => {
    const h = getHeaders(token ?? accessToken);
    return fetch(url, {
      method,
      headers: h,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
  };

  let res = await doFetch(accessToken);

  if (res.status === 401 && accessToken) {
    const tokens = await authStorage.getTokens();
    if (tokens?.refreshToken) {
      try {
        const refreshed = await authApi.refresh(tokens.refreshToken);
        await authStorage.storeTokens(refreshed.accessToken, refreshed.refreshToken);
        res = await doFetch(refreshed.accessToken);
      } catch {
        throw new Error('Session expired. Please log in again.');
      }
    }
  }

  return res;
}
