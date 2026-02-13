# Project Scope & Decisions

This document captures the agreed-upon scope and key decisions for LogaShop.

---

## 1. Store Model

| Decision               | Value        | Notes                                               |
| ---------------------- | ------------ | --------------------------------------------------- |
| **Store Type**         | Single-store | Multi-vendor ready architecture                     |
| **Multi-vendor Ready** | ✅ Yes       | Design models with `vendorId` fields from the start |

### Multi-Vendor Preparation

Even though we start single-store, we will:

-   Include `vendorId` in Product, Order, and relevant models
-   Design APIs to filter by vendor
-   Create a `Vendor` model (can be used later or remain with a single "store owner")

---

## 2. Product Types

| Type                  | Included | Notes                                 |
| --------------------- | -------- | ------------------------------------- |
| **Physical Products** | ✅ Yes   | Shipping required, inventory tracking |
| **Digital Products**  | ✅ Yes   | Downloadable files, license keys      |

### Digital Product Features

-   Secure download links (time-limited, authenticated)
-   Download count limits (e.g., max 3 downloads)
-   Optional: License key generation

### Product Type Field

```
productType: 'physical' | 'digital' | 'bundle'
```

---

## 3. Payment Gateways

| Version         | Gateway  | Status                    |
| --------------- | -------- | ------------------------- |
| **logashop-en** | Stripe   | 🎯 Primary (this project) |
| **logashop-fa** | Zarinpal | Future (separate project) |

### Payment Abstraction

Design a payment service interface so switching gateways is easy:

```
/lib/payment/
  ├── PaymentService.js    # Abstract interface
  ├── stripe.js            # Stripe implementation
  └── zarinpal.js          # For FA version
```

---

## 4. Shipping

| Feature               | Phase 1 | Future  |
| --------------------- | ------- | ------- |
| **Flat Rate**         | ✅      | -       |
| **Regional Rates**    | ✅      | -       |
| **Weight-Based**      | ❌      | Phase 2 |
| **Real-Time Carrier** | ❌      | Phase 3 |

### Phase 1 Shipping Model

```javascript
ShippingZone {
  name: String,           // "North America", "Europe", "Middle East"
  countries: [String],    // ["US", "CA"], ["GB", "DE", "FR"]
  flatRate: Number,       // 9.99
  freeAbove: Number,      // Free shipping if order > $50
  estimatedDays: String   // "3-5 business days"
}
```

---

## 5. Currency & Language

| Aspect       | Phase 1 | Future                     |
| ------------ | ------- | -------------------------- |
| **Language** | English | Persian (FA version)       |
| **Currency** | USD     | EUR support, then IRR (FA) |

### Currency Handling

-   Store prices in cents (integer) to avoid floating-point issues
-   Display currency based on user preference or geo-location
-   Exchange rates: Static for now, dynamic API later

---

## 6. Checkout Flow

| Feature                 | Included | Notes                                   |
| ----------------------- | -------- | --------------------------------------- |
| **Guest Checkout**      | ✅ Yes   | Tracking code for order lookup          |
| **Registered Checkout** | ✅ Yes   | Full account features                   |
| **Cart Persistence**    | ✅ Yes   | localStorage + DB sync for logged users |

### Guest Order Tracking

-   Generate unique tracking code: `LS-XXXXXX` (6 alphanumeric)
-   Guest can check order status at `/track?code=LS-XXXXXX`
-   Optionally convert guest order to account post-purchase

---

## 7. Feature Checklist

### Core (Phase 1)

-   [ ] Product management (CRUD, variants, images)
-   [ ] Category hierarchy
-   [ ] Inventory tracking
-   [ ] Shopping cart
-   [ ] Guest & registered checkout
-   [ ] Stripe payments
-   [ ] Order management
-   [ ] Flat-rate regional shipping
-   [ ] Admin dashboard

### Extended (Phase 2)

-   [ ] Wishlist
-   [ ] Product reviews & ratings
-   [ ] Coupon/promo codes
-   [ ] Email notifications (order confirmation, shipping)
-   [ ] Accounting integration
-   [ ] Digital product delivery

### Advanced (Phase 3)

-   [ ] Multi-vendor support
-   [ ] Weight-based shipping
-   [ ] Real-time carrier rates
-   [ ] Multi-currency with live rates
-   [ ] Analytics & reports

---

## 8. Non-Functional Requirements

| Requirement           | Target                                        |
| --------------------- | --------------------------------------------- |
| **Mobile Responsive** | Yes, mobile-first                             |
| **SEO**               | SSR/SSG for product pages                     |
| **Performance**       | < 3s LCP on 3G                                |
| **Security**          | OWASP guidelines, PCI compliance for payments |
| **Accessibility**     | WCAG 2.1 AA                                   |
