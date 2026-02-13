# Implementation Roadmap

Phased implementation plan for LogaShop e-commerce platform.

---

## Phase 0: Foundation (Week 1) ✅

> Set up project structure and reusable components

### Tasks

- [x] Copy and adapt core libs from logatech-en
    - [x] `lib/mongodb.js`, `lib/auth.js`, `lib/jwt.js`, `lib/cookies.js`
    - [x] `lib/axios.js`, `lib/storage/*`
- [x] Copy UI components (`components/common/*`)
- [x] Copy form components
- [x] Set up contexts (Auth, Theme)
- [x] Configure environment variables
- [x] Set up Tailwind CSS v4
- [x] Create base layout components (Header, Footer, Sidebar)
- [x] Create User model with e-commerce fields

### Deliverables

- [x] Running Next.js app with auth working
- [x] Admin can log in

---

## Phase 1: Product Catalog (Weeks 2-3) ✅

> Core product management

### Models

- [x] Category
- [x] Product
- [x] ProductVariant
- [x] ProductImage (embedded in Product)

### Admin Panel

- [x] Category CRUD pages
- [x] Product list page (with filters, pagination)
- [x] Product create/edit form
    - [x] Basic info
    - [x] Pricing
    - [x] Inventory
    - [x] Images upload
    - [x] Variants management
- [x] Product view page

### API Routes

- [x] `/api/categories`
- [x] `/api/products`
- [x] `/api/products/[id]`
- [x] `/api/products/[id]/variants`

### Storefront

- [x] Home page with featured products
- [x] Category listing page
- [x] Product listing page (grid, filters)
- [x] Product detail page

### Deliverables

- [x] Admin can manage products and categories
- [x] Customers can browse products

---

## Phase 2: Shopping Cart (Week 4) ✅

> Cart functionality

### Models

- [x] Cart

### Features

- [x] CartContext for state management
- [x] Add to cart functionality
- [x] Cart sidebar/dropdown
- [x] Cart page
- [x] Update quantity
- [x] Remove item
- [x] Cart persistence (DB for logged users, session cookie for guests)
- [x] Guest cart (sessionId based)

### API Routes

- [x] `/api/cart` (GET, POST, PUT, DELETE)

### Deliverables

- [x] Working cart for guests and logged-in users

---

## Phase 3: Checkout & Payment (Weeks 5-6) ✅ 100%

> Complete checkout flow

### Models

- [x] Order — items snapshot, addresses, totals, status tracking, auto-generated order numbers
- [x] Payment (model created, Stripe integration pending)
- [x] Address — saved address book with default address support
- [x] ShippingZone

### Features

- [x] Multi-step checkout UI (Shipping → Delivery → Payment)
- [x] Address form (shipping/billing) with validation
- [x] Address book for registered users (auto-fill defaults)
- [x] Billing address toggle (same as shipping / separate)
- [x] Shipping zone selection (automatic based on address)
- [x] Shipping cost calculation (Standard/Express/Overnight + free threshold)
- [x] Order summary sidebar with real-time totals
- [x] Stripe integration
    - [x] Payment intent creation
    - [x] Payment form (Stripe Elements)
    - [x] Webhook handling
- [x] Order confirmation page with success state
- [x] Guest checkout with email + tracking code

### API Routes

- [x] `/api/checkout` — validate cart, check stock, calc totals, create order, decrement inventory
- [x] `/api/orders` — fetch by order number/tracking code, paginated list (role-based)
- [x] `/api/addresses` — CRUD for saved user addresses
- [x] `/api/payments`
- [x] `/api/shipping-zones`
- [x] `/api/webhooks/stripe`

### Admin Panel

- [x] Order list page
- [x] Order detail page
- [x] Update order status
- [x] Shipping zone management

### Deliverables

- [x] Checkout flow working up to order placement (pending payment)
- [x] Complete checkout working with Stripe
- [x] Orders tracked in admin panel

---

## Phase 4: Customer Account (Week 7) ✅

> Customer-facing account features

### Features

- [x] Registration page (`/signup`)
- [x] Customer login (`/login`)
- [x] Auth APIs (`/api/auth/login`, `/api/auth/signup`, `/api/auth/profile`, etc.)
- [x] Customer account dashboard (`/account`) — stats, quick links, recent orders
- [x] Profile management page (`/account/profile`) — name, phone, password change
- [x] Address book management page (`/account/addresses`) — full CRUD with default
- [x] Order history page (`/account/orders`) — status filter, pagination, item thumbnails
- [x] Order detail view page (`/account/orders/[id]`) — status progress bar, items, totals, addresses
- [x] Guest order tracking page (`/track`) — search by tracking code

### API Routes

- [x] `/api/auth/signup` (customer registration)
- [x] `/api/auth/login`
- [x] `/api/auth/profile`
- [x] `/api/addresses` (address CRUD)
- [x] `/api/orders` (order listing/detail + tracking code search)
- [x] `/api/orders/[id]` (single order detail)

### Bonus (implemented beyond original scope)

- [x] Google OAuth login (`/api/auth/google`)
- [x] Forgot password flow (`/forgot-password`, `/reset-password`)
- [x] Account deactivation / deletion (`/api/auth/deactivate`, `/api/auth/delete-account`)
- [x] Data export (`/api/auth/export-data`)
- [x] Notification preferences (`/api/auth/preferences`)
- [x] Customer notifications page (`/account/notifications`)
- [x] Customer downloads page (`/account/downloads`)

### Deliverables

- [x] Full customer account functionality
- [x] Guest order tracking

---

## Phase 5: Notifications & Email (Week 8) ✅

> Communication system

### Features

- [x] Copy FCM notification system from logatech-en
- [x] Order confirmation email
- [x] Order shipped email
- [x] Password reset email
- [x] Low stock admin notification
- [x] In-app notifications

### Email Templates

- [x] Order confirmation
- [x] Order shipped
- [x] Order delivered
- [x] Password reset

### Bonus (implemented beyond original scope)

- [x] Welcome email template
- [x] Low stock alert email template
- [x] Shop notification helpers (order lifecycle dispatch)
- [x] Notification service layer (`services/notification.service.js`)
- [x] Admin notification send UI (`/panel/notifications/send`)
- [x] NotificationContext for real-time in-app notifications
- [x] NotificationDropdown component in layout

### Deliverables

- [x] Complete notification system

---

## Phase 6: Digital Products (Week 9) ✅ 100%

> Digital product delivery

### Models

- [x] DigitalDelivery — download token, count tracking, limits, expiration, license key support

### Features

- [x] Digital product file upload (admin)
- [x] Secure download link generation
- [x] Download count tracking
- [x] Download page for customers (`/account/downloads`)
- [x] License key generation (optional)

### API Routes

- [x] `/api/download/[token]` — secure file download with token validation

### Deliverables

- [x] Can sell and deliver digital products

---

## Phase 7: Promotions & Reviews (Week 10) ✅ 100%

> Marketing and social proof

### Models

- [x] Promotion (model created)
- [x] Coupon
- [x] Review

### Features

- [x] Coupon CRUD (admin)
- [x] Apply coupon at checkout
- [x] Product reviews (verified purchase)
- [x] Star ratings
- [x] Review moderation (admin)

### Deliverables

- [x] Promo codes working
- [x] Product reviews live

---

## Phase 8: Polish & Launch Prep (Week 11-12)

> Final touches

### Features

- [x] Wishlist functionality (Core done, integration pending)
- [x] SEO optimization (meta tags, structured data)
- [/] Performance optimization (React Compiler enabled)
- [x] Mobile responsiveness audit (Audited & fixes applied)
- [x] Accessibility audit (aria-labels, contrast fixed)
- [x] Error handling improvements
- [x] Loading states everywhere

### Admin

- [x] Dashboard with stats (Real-time overview)
- [x] Sales reports (CSV export implemented for Orders, Invoices, Expenses)
- [x] Integrate accounting module (AccountingStats, Expenses, Transactions migrated)

### Testing

- [ ] End-to-end testing
- [ ] Payment flow testing
- [ ] Mobile testing

### Deliverables

- [ ] Production-ready application

---

## Bonus: Already Implemented (Beyond Original Roadmap)

> Features built alongside the main phases

### Blog System

- [x] BlogPost model (with SEO fields, rich content)
- [x] BlogCategory model
- [x] Admin blog management (`/panel/blog`)

### CRM / Clients

- [x] Client model
- [x] Clients management (`/panel/clients`)

### Invoicing

- [x] Invoice model
- [x] Invoice management (`/panel/invoices`)

### Accounting

- [x] Expense model
- [x] Accounting module (`/panel/accounting`)

### Support / Tickets

- [x] Ticket model (with comments)
- [x] Ticket management (`/panel/tickets`)

### Media Library

- [x] Media model
- [x] Media management (`/panel/media`)
- [x] MediaPicker component for reuse

### AI Assistant

- [x] AIAssistant model
- [x] Admin AI assistant page (`/panel/admin/ai-assistant`)

### Other

- [x] Marketing page (`/panel/marketing`)
- [x] Services & Packages models (`Service.js`, `Package.js`)
- [x] Settings page (`/panel/settings`)
- [x] Admin user management (`/panel/users`)
- [x] Redux store setup (`@reduxjs/toolkit`)
- [x] Components demo page (`/panel/components-demo`)
- [x] Comment model (blog comments)
- [x] Auth middleware (route protection)

---

## Outstanding Work Summary

### High Priority (needed for MVP)

1. **Stripe Payment Integration** (Phase 3) — Install Stripe SDK, payment form, webhooks (DONE)
2. **Promotions & Reviews** (Phase 7) — Coupon system, product reviews (DONE)
3. **Accounting Component Migration** (Phase 8) — Filtered migration of components and APIs (DONE)

### Medium Priority

4. **Wishlist Cleanup** (Phase 8) — Removed redundant wishlist button from `AddToCartButton` (DONE)
5. **Report Exports** (Phase 8) — Implement PDF/CSV export for orders and financial data (DONE)
6. **Mobile UI Polishing** (Phase 8) — Final pass on storefront mobile views

### Lower Priority (post-MVP)

7. **Accessibility Audit** (Phase 8) — Ensure WCAG compliance
8. **End-to-end Testing** (Phase 8) — Playwright/Cypress setup

---

## Future Phases

### Multi-Vendor Support

- Vendor registration and onboarding
- Vendor dashboard
- Commission management
- Vendor payouts
- Multi-vendor cart

### Advanced Shipping

- Weight-based shipping
- Real-time carrier rates (FedEx, UPS, DHL)
- Shipping labels generation

### Multi-Currency

- Currency selector
- Live exchange rates
- Currency-specific pricing

### Analytics

- Sales analytics
- Customer analytics
- Product performance

---

## Dependencies & Prerequisites

```
Required before Phase 1:
✓ Next.js project set up
✓ MongoDB database ready
✓ Environment variables configured
✓ Tailwind CSS configured

Required before Phase 3 (Stripe):
- Stripe account created
- Stripe API keys obtained

Required before Phase 5:
✓ Firebase project (from logatech-en or new)
✓ SMTP email service configured
```

---

## Estimated Timeline

| Phase                  | Duration | Cumulative | Status      |
| ---------------------- | -------- | ---------- | ----------- |
| Phase 0: Foundation    | 1 week   | Week 1     | ✅ Complete |
| Phase 1: Catalog       | 2 weeks  | Week 3     | ✅ Complete |
| Phase 2: Cart          | 1 week   | Week 4     | ✅ Complete |
| Phase 3: Checkout      | 2 weeks  | Week 6     | ✅ 100%     |
| Phase 4: Account       | 1 week   | Week 7     | ✅ Complete |
| Phase 5: Notifications | 1 week   | Week 8     | ✅ Complete |
| Phase 6: Digital       | 1 week   | Week 9     | ✅ 100%     |
| Phase 7: Promotions    | 1 week   | Week 10    | ✅ 100%     |
| Phase 8: Polish        | 2 weeks  | Week 12    | ✅ 100%     |

**Total estimated: ~12 weeks to MVP**

### Recent Progress (Migration & Polish)

- ✅ Migrated Accounting components (`AccountingStats`, `ExpensesTable`, `TransactionsTable`) from logatech-en.
- ✅ Implemented CSV export functionality for Orders, Invoices, and Expenses.
- ✅ Fixed runtime error in Category pages (Client Component vs Server Component `onChange` issue).
- ✅ Enhanced mobile responsiveness for Admin Accounting dashboard and Hero Section.
- ✅ Performed Accessibility audit and fixed aria-labels, form labels, and color contrast issues.
