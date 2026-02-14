import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "30m";

// Module level validation is removed to prevent build-time crashes.
// Validation is performed inside each function that requires the secret.

/**
 * Generate JWT token for a user
 * @param {Object} payload - User data to include in token
 * @param {string} payload.userId - User ID
 * @param {string} payload.email - User email
 * @param {string} payload.role - User role
 * @param {string} [expiresIn] - Override expiry (e.g. "30m", "7d"). Default JWT_EXPIRES_IN.
 * @returns {string} JWT token
 */
export function generateToken(payload, expiresIn = null) {
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is missing. Please define it in environment variables.");
    }
    const expiry = expiresIn ?? JWT_EXPIRES_IN;
    try {
        const token = jwt.sign(
            {
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
            },
            JWT_SECRET,
            {
                expiresIn: expiry,
                issuer: "logashop-admin-panel",
            }
        );

        return token;
    } catch (error) {
        console.error("Error generating JWT token:", error);
        throw new Error("Token generation failed");
    }
}

/** Default expiry for access tokens (short-lived when using refresh). */
export function getAccessTokenExpiry() {
    return JWT_ACCESS_EXPIRES_IN;
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyToken(token) {
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is missing. Please define it in environment variables.");
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: "logashop-admin-panel",
        });

        return decoded;
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new Error("Token has expired");
        } else if (error.name === "JsonWebTokenError") {
            throw new Error("Invalid token");
        } else {
            throw new Error("Token verification failed");
        }
    }
}

/**
 * Decode JWT token without verification (use with caution)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function decodeToken(token) {
    try {
        return jwt.decode(token);
    } catch (error) {
        console.error("Error decoding JWT token:", error);
        return null;
    }
}

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null if not found
 */
export function extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    return authHeader.substring(7); // Remove 'Bearer ' prefix
}
