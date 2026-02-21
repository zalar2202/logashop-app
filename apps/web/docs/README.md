# LogaShop — Developer Guide

This folder contains documentation **for developers** working on the LogaShop e-commerce platform. Use this README as the main entry point to understand the project, its scope, what has been built, and what is planned.

---

## What’s in this folder

| Document | Purpose |
| -------- | ------- |
| **[README.md](README.md)** (this file) | Overview, scope, status, and how to get started |
| **[DATA_MODELS.md](DATA_MODELS.md)** | Database schema: all models, fields, relationships, indexes |
| **[ROADMAP.md](ROADMAP.md)** | Detailed phase-by-phase task breakdown and timeline |

---

## 1. What is LogaShop?

**LogaShop** is a full-stack e-commerce platform (English, USD, Stripe) built with Next.js. It is designed to:

- Sell **physical and digital** products
- Support **guest and registered** checkout
- Process payments via **Stripe** (this repo; a future Persian version may use Zarinpal)
- Provide an **admin panel** for store management, orders, catalog, and supporting modules (blog, CRM, accounting, support tickets, etc.)

The app is **single-store** today but **multi-vendor ready** (e.g. `vendorId` on Product/Order where relevant).

---

## 2. Tech stack

| Layer | Technology |
| ----- | ---------- |
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19 |
| **Database** | MongoDB (Mongoose) |
| **Auth** | JWT in httpOnly cookies |
| **Payments** | Stripe |
| **Notifications** | Firebase (FCM) |
| **State** | Redux Toolkit + React Context |
| **Styling** | Tailwind CSS v4, SASS (variables, mixins) |
| **Forms** | Formik, Yup |
| **Other** | Sonner (toasts), MUI Icons, lucide-react (storefront) |

---

## 3. Scope and key decisions

The following decisions define what LogaShop is and how it behaves. For implementation details (APIs, routes, models), see [DATA_MODELS.md](DATA_MODELS.md) and the codebase.

### 3.1 Store model

| Decision | Value | Notes |
| -------- | ----- | ----- |
| **Store type** | Single-store | One store per deployment |
| **Multi-vendor ready** | Yes | Models use `vendorId` where relevant so multi-vendor can be added later |

### 3.2 Product types

| Type | Included | Notes |
| ---- | -------- | ----- |
| **Physical** | Yes | Shipping, inventory, weight/dimensions |
| **Digital** | Yes | Secure downloads, download limits, optional license keys |
| **Bundle** | In schema | `productType: 'physical' | 'digital' | 'bundle'` |

### 3.3 Payment

- **This project (logashop-en):** Stripe (payment intents, webhooks). Order payment data lives on the Order model (`paymentIntentId`, `paidAt`, `paymentStatus`, `paymentMethod`).
- **Future (logashop-fa):** Zarinpal in a separate codebase.
- Payment logic is structured so that swapping gateways (e.g. under `/lib` or `/lib/payment`) is feasible.

### 3.4 Shipping

- **Current:** Shipping zones with multiple methods per zone (e.g. standard, express, overnight), per-method pricing and free-shipping thresholds. Zones match by country (and optionally state).
- **Future:** Weight-based rules, real-time carrier rates, label generation.

### 3.5 Currency and language

- **Current:** English, USD. Prices stored in **cents** (integer) to avoid float issues.
- **Future:** Multi-currency, exchange rates; Persian (FA) in a separate app.

### 3.6 Checkout and accounts

| Feature | Status |
| ------- | ------ |
| **Guest checkout** | Yes — email + unique tracking code; order lookup at `/track` |
| **Registered checkout** | Yes — full account, address book, order history |
| **Cart persistence** | Yes — DB for logged-in users, session for guests |

### 3.7 Feature checklist (high level)

**Core (MVP — done)**

- [x] Product management (CRUD, variants, images)
- [x] Category hierarchy
- [x] Inventory tracking
- [x] Shopping cart (guests + logged-in)
- [x] Guest and registered checkout
- [x] Stripe payments
- [x] Order management (admin + customer views)
- [x] Shipping zones and methods
- [x] Admin dashboard and reports

**Extended (done)**

- [x] Wishlist
- [x] Product reviews and ratings
- [x] Coupons at checkout
- [x] Email notifications (order confirmation, shipped, etc.)
- [x] Accounting module (expenses, stats, CSV export)
- [x] Digital product delivery (secure download links)

**Advanced / future**

- [ ] Multi-vendor support
- [ ] Weight-based shipping
- [ ] Real-time carrier rates
- [ ] Multi-currency and live rates
- [ ] Analytics and reporting

### 3.8 Non-functional targets

| Area | Target |
| ---- | ------ |
| **Mobile** | Mobile-first, responsive |
| **SEO** | SSR/SSG for product and key pages |
| **Performance** | e.g. &lt; 3s LCP on 3G |
| **Security** | OWASP-oriented; PCI-aware for payment data |
| **Accessibility** | WCAG 2.1 AA (audit done; ongoing fixes) |

---

## 4. What has been done (implementation status)

All planned MVP phases (0–8) are **complete**. The app is in polish / pre-launch state.

### Phase summary

| Phase | Name | Status | Notes |
| ----- | ---- | ------ | ----- |
| 0 | Foundation | Done | Auth, DB, libs, layout, User model |
| 1 | Product catalog | Done | Categories, products, variants, images; admin + storefront |
| 2 | Shopping cart | Done | CartContext, guest + user carts, `/api/cart` |
| 3 | Checkout & payment | Done | Multi-step checkout, Stripe, orders, addresses, shipping zones |
| 4 | Customer account | Done | Signup, login, profile, addresses, orders, tracking; Google OAuth, forgot password, deactivation |
| 5 | Notifications & email | Done | FCM, order emails, password reset, in-app notifications |
| 6 | Digital products | Done | DigitalDelivery, secure downloads, `/account/downloads` |
| 7 | Promotions & reviews | Done | Coupons, product reviews, moderation |
| 8 | Polish & launch prep | Done | Wishlist, SEO, mobile and a11y audits, dashboard, CSV exports, accounting UI |

### Bonus / extra modules (already in the app)

Beyond the original roadmap, the codebase also includes:

- **Tags:** Tag collection for products (and future: posts, portfolio). Autocomplete, normalization, unification of related items. `GET /api/tags`, `TagsInputField`, `npm run seed:tags`.
- **Accounting:** Order-based sales, expenses, AccountingStats, CSV export (orders, expenses)
- **Support:** Ticket model, ticket management
- **Newsletter & Email Marketing:** Subscriber model, homepage/footer signup, Email Marketing ("All Subscribers"), unsubscribe
- **Other:** Settings, User management, Auth middleware, Components demo, AI Assistant (admin)

For the **full task-level breakdown** (every checkbox and deliverable), see **[ROADMAP.md](ROADMAP.md)**.

---

## 5. What’s next (scheduled and future)

### 5.1 Outstanding / optional before launch

- **Testing:** E2E tests (e.g. Playwright/Cypress), payment flow tests, mobile testing
- **Polish:** Final pass on storefront mobile UI if needed; keep improving a11y (WCAG)

### 5.2 Future phases (not in current MVP)

- **Multi-vendor:** Vendor registration, dashboard, commissions, payouts
- **Shipping:** Weight-based rules, real-time carrier rates, shipping labels
- **Multi-currency:** Currency selector, live rates, currency-specific pricing
- **Analytics:** Sales, customer, and product performance analytics

These are not committed in the current roadmap; they are direction for later iterations.

---

## 6. Prerequisites and getting started

- **Node.js** and **npm** (or yarn/pnpm) for the Next.js app
- **MongoDB** — connection string in env (e.g. `MONGO_URI`)
- **Stripe** — for payments: Stripe account, API keys, webhook secret (see `.env.example` or env docs)
- **Firebase** — for FCM push notifications (optional but used for in-app notifications)
- **SMTP** — for transactional email (order confirmation, password reset, etc.)

After cloning the repo:

1. Install dependencies: `npm install`
2. Copy env example to `.env.local` and fill in MongoDB, Stripe, Firebase, SMTP as needed
3. Run dev server: `npm run dev` (see `package.json` for port)
4. Optional: run seed scripts for admin user, categories, products (see `package.json` scripts)

The **root README.md** (repository root) is intended for a short, public-facing summary (e.g. for GitHub). This **docs/** README is the developer-facing entry point.

---

## 7. Related projects

- **logashop-fa** — Planned Persian version with Zarinpal payments (separate repo/codebase).

---

## Quick reference

- **Data layer:** [DATA_MODELS.md](DATA_MODELS.md) — schemas, relationships, indexes, “other” models (Subscriber, Payment, Blog, etc.)
- **Full phase breakdown:** [ROADMAP.md](ROADMAP.md) — every phase, task list, and deliverable in detail.
