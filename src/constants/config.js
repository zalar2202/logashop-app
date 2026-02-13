/**
 * Application Configuration
 * Centralized configuration for environment variables and feature flags
 */

// API Configuration
// In browser, we default to relative paths to avoid CORS/Network errors if env vars are missing
const DEFAULT_API_URL = typeof window !== 'undefined' ? '' : (process.env.DEV_BASE_URL || "http://localhost:3000");

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_URL;
export const API_TIMEOUT = 30000; // 30 seconds

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRY = "7d"; // 7 days

// Feature Flags
export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// Storage Keys (for localStorage - not for JWT token which is in httpOnly cookie)
export const STORAGE_KEYS = {
    USER: "logatech_user", // Optional: store non-sensitive user data for UI
    THEME: "logatech_theme",
};

// Cookie Names (server-side only, httpOnly)
export const COOKIE_NAMES = {
    TOKEN: "logatech_auth_token", // JWT token stored as httpOnly cookie
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// MongoDB
export const MONGO_URI = process.env.MONGO_URI;

// Environment
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export default {
    API_BASE_URL,
    API_TIMEOUT,
    JWT_SECRET,
    JWT_EXPIRY,
    USE_MOCK_API,
    STORAGE_KEYS,
    DEFAULT_PAGE_SIZE,
    PAGE_SIZE_OPTIONS,
    MONGO_URI,
    IS_DEVELOPMENT,
    IS_PRODUCTION,
};
