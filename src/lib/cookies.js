import { cookies } from 'next/headers';
import { COOKIE_NAMES, JWT_EXPIRY } from '@/constants/config';

/**
 * Server-side Cookie Utilities
 * For managing httpOnly cookies in Next.js API routes and Server Components
 */

/**
 * Set JWT token as httpOnly cookie
 * @param {string} token - JWT token to store
 * @param {object} options - Additional cookie options
 */
export async function setAuthToken(token, options = {}) {
    const cookieStore = await cookies();
    
    // Calculate expiry (default 7 days)
    const maxAge = options.maxAge || 7 * 24 * 60 * 60; // 7 days in seconds

    cookieStore.set(COOKIE_NAMES.TOKEN, token, {
        httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
        secure: process.env.SECURE_AUTH_COOKIE === 'true' || (process.env.NODE_ENV === 'production' && process.env.SECURE_AUTH_COOKIE !== 'false'),
        sameSite: 'lax', // CSRF protection
        maxAge: maxAge,
        path: '/', // Available across entire site
        ...options,
    });

    console.log('✅ Auth token set in httpOnly cookie');
}

/**
 * Get JWT token from httpOnly cookie
 * @returns {string|null} JWT token or null if not found
 */
export async function getAuthToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.TOKEN);
    return token?.value || null;
}

/**
 * Clear JWT token cookie (logout)
 */
export async function clearAuthToken() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAMES.TOKEN);
    console.log('✅ Auth token cleared from cookie');
}

/**
 * Check if user is authenticated (has valid token cookie)
 * @returns {boolean} True if token exists
 */
export async function isAuthenticated() {
    const token = await getAuthToken();
    return !!token;
}

/**
 * Set custom cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {object} options - Cookie options
 */
export async function setCookie(name, value, options = {}) {
    const cookieStore = await cookies();
    cookieStore.set(name, value, {
        httpOnly: true,
        secure: process.env.SECURE_AUTH_COOKIE === 'true' || (process.env.NODE_ENV === 'production' && process.env.SECURE_AUTH_COOKIE !== 'false'),
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days default
        path: '/',
        ...options,
    });
}

/**
 * Get custom cookie
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
export async function getCookie(name) {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(name);
    return cookie?.value || null;
}

/**
 * Delete custom cookie
 * @param {string} name - Cookie name
 */
export async function deleteCookie(name) {
    const cookieStore = await cookies();
    cookieStore.delete(name);
}

/**
 * Get all cookies
 * @returns {Map} Map of all cookies
 */
export async function getAllCookies() {
    const cookieStore = await cookies();
    return cookieStore.getAll();
}

