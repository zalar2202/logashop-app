/**
 * API base URL and headers for LogaShop backend.
 * Set EXPO_PUBLIC_API_BASE_URL in .env (e.g. http://YOUR_LAN_IP:7777).
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export function getApiBaseUrl(): string {
  return API_BASE_URL.replace(/\/$/, '');
}

/**
 * Headers for API requests. Always sends X-Client: mobile so the backend returns tokens and treats as mobile.
 * Pass accessToken after login for protected routes.
 */
export function getApiHeaders(accessToken?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client': 'mobile',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
}

/**
 * Optional: pass cart session ID for guest cart (from login/merge or initial cart response).
 */
export function getApiHeadersWithCart(
  accessToken?: string | null,
  cartSessionId?: string | null
): Record<string, string> {
  const headers = getApiHeaders(accessToken);
  if (cartSessionId) {
    headers['X-Cart-Session'] = cartSessionId;
  }
  return headers;
}
