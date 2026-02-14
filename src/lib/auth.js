import { cookies } from 'next/headers';
import { verifyToken, extractTokenFromHeader, generateToken, getAccessTokenExpiry } from '@/lib/jwt';
import { setAuthToken, clearAuthToken } from '@/lib/cookies';
import { COOKIE_NAMES } from '@/constants/config';
import User from '@/models/User';
import RefreshToken from '@/models/RefreshToken';

/**
 * Extract JWT from request: prefer Authorization Bearer, then cookie.
 * @param {Request} req - Next.js request
 * @returns {Promise<string|null>} Token or null
 */
export async function extractTokenFromRequest(req) {
    if (!req) return null;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader ? extractTokenFromHeader(authHeader) : null;
    if (bearerToken) return bearerToken;
    const cookieStore = await cookies();
    const cookieToken =
        cookieStore.get(COOKIE_NAMES.TOKEN)?.value ||
        cookieStore.get('token')?.value ||
        cookieStore.get('om_token')?.value;
    return cookieToken || null;
}

/**
 * Get authenticated user from request (cookie or Bearer). Returns null on any failure.
 * @param {Request} req - Next.js request
 * @returns {Promise<import('mongoose').Document|null>} User doc without password, or null
 */
export async function getAuthenticatedUser(req) {
    try {
        const token = await extractTokenFromRequest(req);
        if (!token) return null;
        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) return null;
        const user = await User.findById(decoded.userId).select('-password');
        return user || null;
    } catch (error) {
        console.error('Auth verification error:', error);
        return null;
    }
}

/** @deprecated Use getAuthenticatedUser. Kept as alias for existing callers. */
export const verifyAuth = getAuthenticatedUser;

/**
 * Sign an access token for a user (for login / refresh).
 * @param {Object} user - User doc with _id, email, role
 * @param {string} [expiresIn] - JWT expiry (e.g. "30m"). Omit for default long-lived (web).
 * @returns {string} JWT
 */
export function signAccessToken(user, expiresIn = null) {
    return generateToken(
        {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        },
        expiresIn ?? undefined
    );
}

/**
 * Create a refresh token for user (mobile). Returns opaque token string.
 * @param {Object} user - User doc with _id
 * @param {string} [deviceId] - Optional device id for rotation
 * @returns {Promise<string>} Refresh token (opaque)
 */
export async function createRefreshToken(user, deviceId = null) {
    const { token } = await RefreshToken.createForUser(user._id, deviceId);
    return token;
}

/** Short expiry for access token when using refresh (mobile). */
export { getAccessTokenExpiry };

/**
 * Set auth token in httpOnly cookie (uses Next.js cookies() for current response).
 * @param {string} token - JWT
 * @param {Object} [options] - Cookie options (e.g. maxAge)
 */
export async function setAuthCookie(token, options = {}) {
    await setAuthToken(token, options);
}

/**
 * Clear auth cookie (logout).
 */
export async function clearAuthCookie() {
    await clearAuthToken();
}
