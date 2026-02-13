# Reusable Components from logatech-en

This document maps what we can reuse from the **logatech-en** admin panel project.

---

## ✅ Fully Reusable (Copy & Adapt)

### 1. Authentication System

| Source                        | Description                          | Adaptation Needed           |
| ----------------------------- | ------------------------------------ | --------------------------- |
| `src/lib/auth.js`             | JWT verification helper              | None                        |
| `src/lib/jwt.js`              | JWT sign/verify                      | None                        |
| `src/lib/cookies.js`          | httpOnly cookie management           | None                        |
| `src/contexts/AuthContext.js` | Auth state management                | Add customer-specific logic |
| `src/app/api/auth/*`          | Login, logout, forgot/reset password | None                        |
| `src/models/User.js`          | User model                           | Add e-commerce fields       |

**Cookie name stays:** `logatech_auth_token` (or rename to `logashop_auth_token`)

---

### 2. Database Connection

| Source               | Description                   | Adaptation Needed |
| -------------------- | ----------------------------- | ----------------- |
| `src/lib/mongodb.js` | Mongoose singleton connection | Update DB name    |

---

### 3. HTTP Client

| Source             | Description            | Adaptation Needed |
| ------------------ | ---------------------- | ----------------- |
| `src/lib/axios.js` | Axios with credentials | None              |

---

### 4. Notification System

| Source                                          | Description          | Adaptation Needed                |
| ----------------------------------------------- | -------------------- | -------------------------------- |
| `src/lib/notifications.js`                      | Create notifications | Add order/shipping notifications |
| `src/lib/firebase/*`                            | FCM admin & client   | None                             |
| `src/models/Notification.js`                    | Notification model   | None                             |
| `src/contexts/NotificationContext.js`           | Notification state   | None                             |
| `src/components/layout/NotificationDropdown.js` | UI component         | None                             |
| `public/firebase-messaging-sw.js`               | Service worker       | None                             |

---

### 5. File Upload / Storage

| Source                        | Description                   | Adaptation Needed          |
| ----------------------------- | ----------------------------- | -------------------------- |
| `src/lib/storage/*`           | Abstracted storage (Local/S3) | None                       |
| `src/app/api/upload/route.js` | Upload endpoint               | Add product image handling |

---

### 6. Email

| Source             | Description       | Adaptation Needed        |
| ------------------ | ----------------- | ------------------------ |
| `src/lib/email.js` | Nodemailer config | Add e-commerce templates |

---

### 7. State Management

| Source                                      | Description       | Adaptation Needed         |
| ------------------------------------------- | ----------------- | ------------------------- |
| `src/lib/store.js`                          | Redux store setup | Add cart, products slices |
| `src/components/providers/StoreProvider.js` | Redux provider    | None                      |

---

### 8. UI Components

All components in `src/components/common`:

| Component        | Reusable | Notes                              |
| ---------------- | -------- | ---------------------------------- |
| `Button.jsx`     | ✅       |                                    |
| `Card.jsx`       | ✅       |                                    |
| `Modal.jsx`      | ✅       |                                    |
| `Badge.jsx`      | ✅       | Add "sale", "new arrival" variants |
| `Avatar.jsx`     | ✅       |                                    |
| `Pagination.jsx` | ✅       |                                    |
| `Tabs.jsx`       | ✅       |                                    |
| `Loader.jsx`     | ✅       |                                    |
| `Skeleton.jsx`   | ✅       |                                    |
| `EmptyState.jsx` | ✅       |                                    |
| `Table.jsx`      | ✅       |                                    |

---

### 9. Layout Components

| Source                                | Description   | Adaptation Needed    |
| ------------------------------------- | ------------- | -------------------- |
| `src/components/layout/Sidebar.js`    | Admin sidebar | Customize menu items |
| `src/components/layout/Header.js`     | Admin header  | Add cart icon        |
| `src/components/layout/PageHeader.js` | Page titles   | None                 |

---

### 10. Form Components

From `src/components/forms`:

| Component           | Reusable | Notes |
| ------------------- | -------- | ----- |
| `InputField.jsx`    | ✅       |       |
| `SelectField.jsx`   | ✅       |       |
| `TextareaField.jsx` | ✅       |       |
| `FileUpload.jsx`    | ✅       |       |
| `FormButton.jsx`    | ✅       |       |

---

### 11. Dark Mode / Theme

| Source                         | Description  | Adaptation Needed |
| ------------------------------ | ------------ | ----------------- |
| `src/contexts/ThemeContext.js` | Theme state  | None              |
| CSS custom properties          | Color tokens | None              |

---

### 12. Accounting (Phase 2)

| Source                             | Description          | Adaptation Needed      |
| ---------------------------------- | -------------------- | ---------------------- |
| `src/models/Invoice.js`            | Invoice model        | Link to Order          |
| `src/models/Expense.js`            | Expense model        | None                   |
| `src/app/api/invoices/*`           | Invoice APIs         | None                   |
| `src/app/panel/admin/accounting/*` | Accounting dashboard | Adapt for shop context |

---

## 🔄 Partially Reusable (Modify Significantly)

### User Management

- **User model**: Keep auth fields, add customer/vendor fields
- **User APIs**: Add customer registration, profile management
- **User list pages**: Adapt for customer management

### Route Guard

- **RouteGuard component**: Keep logic, adjust for customer vs admin routes

---

## 🆕 New for LogaShop (Build from Scratch)

### Models

- Product, ProductVariant, ProductImage
- Category
- Cart, CartItem
- Order, OrderItem
- Payment
- ShippingZone
- Coupon
- Review
- Wishlist
- DigitalDelivery
- Address

### Features

- Product catalog pages
- Category browsing
- Shopping cart
- Checkout flow
- Payment integration (Stripe)
- Order tracking
- Storefront (public pages)

### API Routes

- `/api/products/*`
- `/api/categories/*`
- `/api/cart/*`
- `/api/checkout/*`
- `/api/orders/*`
- `/api/payments/*`
- `/api/reviews/*`
- `/api/shipping/*`

---

## Migration Strategy

### Phase 1: Foundation

1. Copy `src/lib` (auth, db, axios, cookies, jwt)
2. Copy `src/components/common`
3. Copy `src/contexts` (Auth, Theme, Notification)
4. Adapt User model

### Phase 2: Admin Panel

1. Copy admin layout components
2. Copy form components
3. Set up Redux store
4. Create admin routes for product/order management

### Phase 3: Storefront

1. Build public-facing pages
2. Implement cart functionality
3. Build checkout flow

### Phase 4: Integration

1. Connect notifications to order events
2. Integrate accounting/invoicing
3. Add email templates

---

## File Structure Comparison

```
logatech-en/src/              →    logashop-en/src/
├── lib/                      →    ├── lib/           (copy most)
├── models/                   →    ├── models/        (expand for e-commerce)
├── components/               →    ├── components/    (copy common, add shop)
│   ├── common/               →    │   ├── common/    (copy all)
│   ├── layout/               →    │   ├── layout/    (adapt)
│   └── forms/                →    │   ├── forms/     (copy all)
│                                  │   └── shop/      (NEW: cart, product cards)
├── contexts/                 →    ├── contexts/      (copy, add CartContext)
├── features/                 →    ├── features/      (add cart, products slices)
├── app/                      →    ├── app/
│   ├── api/                  →    │   ├── api/       (expand significantly)
│   ├── panel/                →    │   ├── admin/     (shop admin)
│   └── (auth)/               →    │   ├── (auth)/    (copy)
│                                  │   ├── (shop)/    (NEW: storefront)
│                                  │   └── (checkout)/(NEW)
└── constants/                →    └── constants/     (copy, expand)
```

---

## Environment Variables to Carry Over

```env
# Database
MONGO_URI=

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=

# Firebase (Notifications)
NEXT_PUBLIC_FIREBASE_*
FIREBASE_*

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

# Storage
NEXT_PUBLIC_STORAGE_STRATEGY=
```

**New for LogaShop:**

```env
# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Shop
NEXT_PUBLIC_SHOP_NAME=LogaShop
NEXT_PUBLIC_CURRENCY=USD
```
