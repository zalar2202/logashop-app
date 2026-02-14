/**
 * In-memory rate limiter for auth endpoints.
 * Keyed by identifier (e.g. IP). Not distributed — use Redis etc. in multi-instance deployments.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 10;

const store = new Map();

function getClientId(request) {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Check rate limit for a given key (e.g. "login:ip" or "forgot-password:ip").
 * Returns { allowed: boolean, remaining: number }. If !allowed, return 429.
 */
export function checkRateLimit(request, keyPrefix = "auth") {
    const id = getClientId(request);
    const key = `${keyPrefix}:${id}`;
    const now = Date.now();
    let entry = store.get(key);

    if (!entry) {
        entry = { count: 1, resetAt: now + WINDOW_MS };
        store.set(key, entry);
        return { allowed: true, remaining: MAX_REQUESTS - 1 };
    }

    if (now >= entry.resetAt) {
        entry.count = 1;
        entry.resetAt = now + WINDOW_MS;
        return { allowed: true, remaining: MAX_REQUESTS - 1 };
    }

    entry.count += 1;
    const remaining = Math.max(0, MAX_REQUESTS - entry.count);
    return {
        allowed: entry.count <= MAX_REQUESTS,
        remaining,
    };
}
