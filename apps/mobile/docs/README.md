# LogaShop Mobile — Developer Guide

This folder contains documentation **for developers** working on the LogaShop mobile app (Expo / React Native). Use this README as the entry point for scope, stack, and how the app fits into the monorepo.

---

## What’s in this folder

| Document | Purpose |
| -------- | ------- |
| **[README.md](README.md)** (this file) | Overview, stack, MVP scope, and pointers to web docs |
| **[FEATURES.md](FEATURES.md)** | Feature list (MVP vs later), APIs used, and mobile-specific notes |
| **[ROADMAP.md](ROADMAP.md)** | Phased implementation plan and task breakdown |

---

## 1. What is the mobile app?

The **LogaShop mobile app** is the customer-facing storefront for phones and tablets. It uses the **same backend** as the web app (`apps/web`): one API, shared data models, and the same business rules (cart, checkout, Stripe, orders).

- **Stack:** Expo (React Native), TypeScript, strict mode.
- **Auth:** Bearer tokens (stored in SecureStore); refresh flow when token expires. Web uses httpOnly cookies; backend supports both via `X-Client: mobile`.
- **Scope (MVP):** Auth, browse (catalog), cart, checkout, account, and orders. Additional features (wishlist, reviews, push, etc.) are planned for later phases.

---

## 2. Tech stack

| Layer | Technology |
| ----- | ---------- |
| **Framework** | Expo (React Native) |
| **Language** | TypeScript (strict) |
| **Backend** | Next.js API in `apps/web` (shared) |
| **Auth** | JWT Bearer + refresh; SecureStore for tokens |
| **Payments** | Stripe (native SDK, e.g. PaymentSheet) |
| **API client** | `src/api.ts` — base URL, `X-Client: mobile`, Bearer, cart session headers |

---

## 3. MVP scope (first version)

| Area | In scope |
| ---- | -------- |
| **Auth** | Login, signup, refresh, forgot password; token storage |
| **Browse** | Home, categories, product list, product detail |
| **Cart** | Add, update, remove; guest cart + merge on login |
| **Checkout** | Shipping address, shipping method, payment (Stripe), order confirmation |
| **Account** | Profile, addresses, landing after login |
| **Orders** | Order history, order detail, guest order tracking by code |

See [FEATURES.md](FEATURES.md) for per-feature API mapping and [ROADMAP.md](ROADMAP.md) for the implementation order.

---

## 4. Backend and shared docs

- **API base URL:** Set `EXPO_PUBLIC_API_BASE_URL` in `apps/mobile/.env` (e.g. `http://YOUR_LAN_IP:7777` for real-device dev). See root [logashop-expo-monorepo-dev-setup.md](../../web/docs/logashop-expo-monorepo-dev-setup.md).
- **Auth, cart, checkout, Stripe:** [mobile-api.md](../../web/docs/mobile-api.md).
- **Data models (Product, Order, Cart, etc.):** [DATA_MODELS.md](../../web/docs/DATA_MODELS.md).
- **Web app overview and roadmap:** [web docs README](../../web/docs/README.md).

---

## 5. Running the app

From repo root:

```bash
npm run dev:mobile
```

Use Expo Go on a real device; ensure `EXPO_PUBLIC_API_BASE_URL` points to your machine’s LAN IP so the app can reach the backend. See [apps/mobile/README.md](../README.md) for first-time setup.

---

## Quick reference

- **Lint:** `npm run lint:mobile` (from root: `npm run lint:all`)
- **Web backend:** `npm run dev:web` (port 7777)
- **Cursor rules:** `.cursor/rules/` (project and mobile-specific rules)
