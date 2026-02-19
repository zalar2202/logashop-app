/**
 * Auth API helpers for login, signup, refresh, check, and forgot password.
 * Uses getApiBaseUrl and getApiHeaders from api.ts.
 */

import { getApiBaseUrl, getApiHeaders } from '../api';

/** User shape from API (login, signup, check) */
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status?: string;
  phone?: string;
  avatar?: string;
  lastLogin?: string;
}

/** Login response (with X-Client: mobile) */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

/** Api error with optional status for 401 handling */
export class AuthApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error ?? json?.message ?? `Request failed (${res.status})`;
    throw new AuthApiError(typeof msg === 'string' ? msg : msg?.message ?? 'Unknown error', res.status);
  }
  if (json.success === false) {
    const msg = json.error ?? json.message ?? 'Request failed';
    throw new AuthApiError(typeof msg === 'string' ? msg : msg?.message ?? 'Unknown error', res.status);
  }
  return (json.data ?? json) as T;
}

/**
 * Login with email and password. Returns tokens and user when X-Client: mobile is sent.
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const base = getApiBaseUrl();
  if (!base) throw new AuthApiError('API base URL not configured. Set EXPO_PUBLIC_API_BASE_URL in .env');
  let res: Response;
  try {
    res = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error';
    throw new AuthApiError(
      msg.includes('fetch') || msg.includes('Network')
        ? `Cannot reach API at ${base}. Check EXPO_PUBLIC_API_BASE_URL and CORS (ALLOWED_ORIGINS) when using Expo web.`
        : msg
    );
  }
  const data = await parseResponse<{ accessToken: string; refreshToken: string; expiresIn: number; user: User }>(res);
  if (!data.accessToken || !data.refreshToken) {
    throw new AuthApiError('Login response missing tokens');
  }
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
    user: data.user,
  };
}

/**
 * Sign up with name, email, password. Backend does not return tokens for mobile,
 * so we call login immediately after successful signup.
 */
export async function signup(name: string, email: string, password: string): Promise<LoginResponse> {
  const base = getApiBaseUrl();
  if (!base) throw new AuthApiError('API base URL not configured');
  const res = await fetch(`${base}/api/auth/signup`, {
    method: 'POST',
    headers: getApiHeaders(),
    body: JSON.stringify({ name, email, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error ?? json?.message ?? `Signup failed (${res.status})`;
    throw new AuthApiError(typeof msg === 'string' ? msg : msg?.message ?? 'Unknown error', res.status);
  }
  if (json.success === false) {
    const msg = json.error ?? json.message ?? 'Signup failed';
    throw new AuthApiError(typeof msg === 'string' ? msg : msg?.message ?? 'Unknown error');
  }
  return login(email, password);
}

/**
 * Refresh access token. Rotates refresh token.
 */
export async function refresh(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const base = getApiBaseUrl();
  if (!base) throw new AuthApiError('API base URL not configured');
  const res = await fetch(`${base}/api/auth/refresh`, {
    method: 'POST',
    headers: getApiHeaders(),
    body: JSON.stringify({ refreshToken }),
  });
  const data = await parseResponse<{ accessToken: string; refreshToken: string; expiresIn: number }>(res);
  if (!data.accessToken || !data.refreshToken) {
    throw new AuthApiError('Refresh response missing tokens', res.status);
  }
  return data;
}

/**
 * Verify session with access token. Returns user if valid.
 */
export async function check(accessToken: string): Promise<{ authenticated: true; user: User }> {
  const base = getApiBaseUrl();
  if (!base) throw new AuthApiError('API base URL not configured');
  const res = await fetch(`${base}/api/auth/check`, {
    method: 'GET',
    headers: getApiHeaders(accessToken),
  });
  const data = await parseResponse<{ authenticated: boolean; user: User }>(res);
  if (!data.authenticated || !data.user) {
    throw new AuthApiError('Not authenticated', 401);
  }
  return { authenticated: true, user: data.user };
}

/**
 * Get current user profile. Thin wrapper around check.
 */
export async function getProfile(accessToken: string): Promise<User> {
  const result = await check(accessToken);
  return result.user;
}

/** Profile update payload (name required, others optional) */
export interface UpdateProfileInput {
  name: string;
  phone?: string;
  bio?: string;
}

/**
 * Update user profile. PUT /api/auth/profile.
 */
export async function updateProfile(
  accessToken: string,
  data: UpdateProfileInput
): Promise<{ message: string; user: User }> {
  const base = getApiBaseUrl();
  if (!base) throw new AuthApiError('API base URL not configured');
  const res = await fetch(`${base}/api/auth/profile`, {
    method: 'PUT',
    headers: getApiHeaders(accessToken),
    body: JSON.stringify(data),
  });
  const parsed = await parseResponse<{ message: string; user: User }>(res);
  return parsed as { message: string; user: User };
}

/**
 * Change user password. PUT /api/auth/change-password.
 */
export async function changePassword(
  accessToken: string,
  data: { currentPassword: string; newPassword: string }
): Promise<{ message: string }> {
  const base = getApiBaseUrl();
  if (!base) throw new AuthApiError('API base URL not configured');
  const res = await fetch(`${base}/api/auth/change-password`, {
    method: 'PUT',
    headers: getApiHeaders(accessToken),
    body: JSON.stringify(data),
  });
  const parsed = await parseResponse<{ message?: string }>(res);
  return { message: parsed?.message ?? 'Password changed successfully' };
}

/**
 * Request password reset email.
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const base = getApiBaseUrl();
  if (!base) throw new AuthApiError('API base URL not configured');
  const res = await fetch(`${base}/api/auth/forgot-password`, {
    method: 'POST',
    headers: getApiHeaders(),
    body: JSON.stringify({ email }),
  });
  const data = await parseResponse<{ message?: string }>(res);
  return { message: data.message ?? 'If that email is in our system, we have sent a reset link.' };
}
