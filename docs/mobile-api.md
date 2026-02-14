# Mobile API — Phase 1

This document describes how the LogaShop API supports mobile clients (e.g. React Native / Expo) for Phase 1.

## CORS

When the mobile app or a web app on another origin calls the API, set **ALLOWED_ORIGINS** in your environment. CORS headers for `/api/*` are set in **next.config.mjs** (no middleware, to avoid standalone build issues). Example:

```env
# Single origin (recommended for production)
ALLOWED_ORIGINS=https://yourapp.com
# Multiple origins: server will send Access-Control-Allow-Origin: *
ALLOWED_ORIGINS=https://yourapp.com,https://admin.yourapp.com
```

Allowed request headers: `Content-Type`, `Authorization`, `X-Client`, `X-Cart-Session`.

## Auth

- **Login:** `POST /api/auth/login` with body `{ email, password }`. Send header **X-Client: mobile** (or query `?client=mobile`) to receive **accessToken** in the JSON response. Store it (e.g. SecureStore) and send it as **Authorization: Bearer &lt;accessToken&gt;** on protected requests. Web continues to use the httpOnly cookie only (no token in body).
- **Protected routes:** All auth and protected APIs accept either the httpOnly cookie or **Authorization: Bearer &lt;token&gt;**; Bearer takes precedence when both are present.

## Cart (guest without cookies)

- **Session ID:** For guest cart, the server accepts the cart session from: 1) `cart_session` cookie, 2) header **X-Cart-Session**, or 3) body field **sessionId** (POST/PUT). When a new guest cart is created, the response includes **data.sessionId** — store it and send it on every cart/checkout request (header or body).
- **Endpoints:** `GET/POST/PUT/DELETE /api/cart` work as documented; for mobile, send **X-Cart-Session** (or **sessionId** in body for POST/PUT) and persist **data.sessionId** from responses.

## Checkout

- **Mobile:** Checkout **requires login** on mobile. Send **X-Client: mobile**; if the user is not authenticated, the API returns **401** with message "Login required for checkout on mobile". The app should prompt sign-in and then merge the guest cart on login before calling checkout again.
- **Session:** Cart session is resolved the same way (cookie → **X-Cart-Session** → body **sessionId**).

## Stripe (mobile)

Use **POST /api/payments/create-intent** with body `{ orderId }` and **Authorization: Bearer &lt;accessToken&gt;** (or cookie). The response includes **clientSecret** and **id**. Use these with the Stripe native SDK (e.g. **PaymentSheet** on iOS/Android) to complete payment.
