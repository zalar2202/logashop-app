# LogaTech Shop — Mobile Readiness Specification (Refined)

## Purpose

This document defines the **backend + authentication** changes required to make the current Next.js-based e-commerce platform compatible with a future **React Native / Expo** mobile app.

Scope:
- Backend/API behavior
- Authentication/session strategy (Web + Mobile)
- Mobile-critical API conventions

Out of scope:
- Mobile UI implementation
- Web UI refactors (unless required for auth compatibility)

---

## 0. Guiding Principles

1. **Do not break the web app.** Web stays cookie-based (httpOnly) by default.
2. **Mobile must work without cookies.** Mobile uses Bearer tokens by default.
3. **One backend, two client modes.** Same endpoints can serve both, but behavior can vary *explicitly* per client.
4. **Incremental migration.** Do not refactor the entire API at once—prioritize mobile-critical endpoints first.

---

# 1. Authentication Adjustments

## 1.1 Hybrid Token Strategy (Web + Mobile Support)

**Current behavior (Web):**
- JWT stored in **httpOnly cookie**.
- Browser automatically attaches cookies.

**Required adjustment (Mobile):**
- Keep httpOnly cookies for Web.
- Also support **Bearer token auth** for Mobile.
- Return `accessToken` in the login response **only for mobile clients**.

### Client Identification (Required)

Mobile clients must identify themselves via one of:
- Header: `X-Client: mobile` *(recommended)*
- OR query param: `?client=mobile`
- OR a distinct API base URL for mobile (optional)

**Rule:** Return `accessToken` in JSON when `client=mobile` (or `X-Client: mobile`) is present.

### Updated Login Response Format (Mobile)

```json
{
  "success": true,
  "accessToken": "<jwt-access-token>",
  "refreshToken": "<jwt-refresh-token-optional>",
  "user": { "...safeUserObject" }
}
```

### Web Login Response

- Web can continue returning only `{ success, user }` (no token in body), **or** return token but ignore it on web.
- **Cookie must always be set** for web clients.

> Security note: Avoid returning tokens to standard web logins unless there is a clear reason.

---

## 1.2 Authorization Header Support (Bearer + Cookie)

All protected routes must:
1. Check `Authorization` header first.
2. Fallback to cookie if header is absent.
3. Verify token, load user, attach user context.

### Required Logic

- If `Authorization` exists and starts with `Bearer ` → extract token.
- Else → read token from httpOnly cookie.
- Verify token.
- Attach user to request context / handler locals.

### Conflict Handling (Recommended)

If **both** header and cookie exist:
- Prefer **header** (mobile explicit)
- Log a warning for debugging (possible client misconfiguration)

---

## 1.3 Centralized Auth Utilities (Required)

Create:

```
/src/lib/auth.ts
```

All routes must use shared helpers to avoid duplicated, inconsistent logic.

### Required Exports

- `signAccessToken(user)`
- `verifyAccessToken(token)`
- `extractTokenFromRequest(req)` *(supports Bearer + cookie + client identification)*
- `getAuthenticatedUser(req)`
- `setAuthCookie(res, accessToken)` *(centralize cookie options)*
- `clearAuthCookie(res)`

---

## 1.4 Refresh Token Strategy (Recommended for Mobile)

### Token Lifetimes

- **Access token:** 15–30 minutes
- **Refresh token:** 7–30 days

### Refresh Endpoint

```
POST /api/auth/refresh
```

### Storage Strategy

- Web: refresh token stored as **httpOnly cookie**
- Mobile: refresh token stored in **secure storage**
  - Expo: SecureStore (Keychain/Keystore)

### Rotation (Strongly Recommended)

Implement **refresh token rotation**:
- When refreshing, issue **new refresh token**
- Invalidate old refresh token
- Store refresh token hash in DB (per device/session)

This reduces risk if a refresh token leaks.

---

# 2. API Response Standardization (Incremental)

Goal: Predictable response parsing across web + mobile.

### Standard Envelope (Target)

Success:

```json
{
  "success": true,
  "data": { },
  "error": null
}
```

Failure:

```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Error message",
    "code": "SOME_CODE",
    "details": { }
  }
}
```

### Migration Plan (Required)

Do **not** refactor every endpoint immediately.

Phase order:
1. **Auth** (`/api/auth/*`)
2. **Cart + Wishlist**
3. **Orders**
4. **Payments (Stripe)**
5. **Products/Categories**
6. Remaining endpoints

During migration, keep **correct HTTP status codes** (Section 3).

---

# 3. HTTP Status Code Consistency (Required)

Use status codes properly:

- 200 — Success
- 201 — Created
- 400 — Validation error
- 401 — Unauthorized
- 403 — Forbidden
- 404 — Not found
- 409 — Conflict
- 422 — Unprocessable (optional for validation)
- 429 — Rate limited
- 500 — Server error

Avoid returning 200 with embedded error messages.

---

# 4. Avoid Browser-Dependent Assumptions (Required)

Backend must behave as a pure JSON API:
- Do not assume cookies exist
- Do not rely on browser storage, window/session artifacts
- Do not rely on redirect-only payment flows for mobile

---

# 5. Cart Handling Compatibility (Required)

Mobile apps do not reliably use anonymous cookie session carts.

### Requirements

- Cart must attach to authenticated userId
- Guest cart must be supported without cookies (client-side storage)
- On login, support **merge guest cart → user cart**

### Recommended Merge Rules

- Identify items by: `productId + variantId/options`
- If same item exists: sum quantities (respect max stock)
- Return canonical server cart after merge

---

# 6. Stripe / Payment Preparation (Required)

Mobile requires SDK-based confirmation (PaymentSheet / native flow).

### Backend Requirements

- Payment Intent created server-side
- Return `clientSecret` in JSON
- Avoid relying only on Stripe Checkout redirects

### Recommended Mobile-Friendly Endpoint Output

Return:
- `clientSecret`
- (optional) `customerId`
- (optional) `ephemeralKey` (for saved payment methods)

---

# 7. Push Notification Preparation (Recommended)

Create endpoint:

```
POST /api/devices/register
```

### Required Payload

- `deviceToken`
- `platform` (`ios` | `android`)
- `deviceId` (unique per install)
- `appVersion` (optional but useful)

### Rules

- Must be authenticated (token-based)
- Store tokens per user and device
- Allow updating/replacing token for a deviceId

---

# 8. API Versioning (Optional)

Only introduce versioning if you expect breaking changes soon.

Options:
- Full versioning: `/api/v1/...`
- Partial versioning: version only **new mobile-critical endpoints** first

---

# 9. Rate Limiting & Security (Required)

- Rate limit auth endpoints (login, refresh, forgot-password)
- Strong password hashing (bcrypt/argon2)
- Never return sensitive fields (password hash, tokens, internal IDs unless needed)
- Add CORS rules if exposing APIs cross-origin (especially if using Bearer tokens)

---

# 10. Logging & Monitoring (Recommended)

Add structured logging for:
- Failed login attempts
- Refresh failures / token rotation events
- Token verification failures
- Payment intent creation + webhook failures
- Device token registration changes

---

# Summary (Implementation Priorities)

**Must-have for Mobile v1:**
1. Authorization: Bearer + cookie support (1.2)
2. Centralized auth helpers (1.3)
3. Mobile login returning accessToken (1.1)
4. Cart merge plan (5)
5. Stripe PaymentIntent output (6)

**Recommended next:**
6. Refresh token rotation (1.4)
7. Standard response envelope (2) for mobile-critical endpoints
8. Device token registration (7)

