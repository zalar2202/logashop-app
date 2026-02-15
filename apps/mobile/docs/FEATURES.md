# Mobile App — Features and API Mapping

Feature list for the LogaShop mobile app: MVP (v1) and what’s planned for later. Each feature notes the backend APIs used; the backend lives in `apps/web` and is shared with the web client.

---

## MVP (first version)

### Auth

| Capability | Description | APIs / notes |
| ---------- | ---------- | ------------- |
| Login | Email + password; receive access + refresh tokens | `POST /api/auth/login` with `X-Client: mobile`; store tokens in SecureStore |
| Sign up | Customer registration | `POST /api/auth/signup` |
| Refresh | Get new access token when expired | `POST /api/auth/refresh` with `refreshToken`; rotate and store new tokens |
| Forgot password | Request reset email | `POST /api/auth/forgot-password` (or equivalent); reset flow via link |
| Profile | Load current user | `GET /api/auth/profile` with `Authorization: Bearer <token>` |

All requests must send **X-Client: mobile** and **Authorization: Bearer &lt;accessToken&gt;** for protected routes. Use helpers from `src/api.ts`.

---

### Browse (catalog)

| Capability | Description | APIs / notes |
| ---------- | ---------- | ------------- |
| Home | Featured products, categories, or hero | Reuse `/api/products` (e.g. featured), `/api/categories` |
| Categories | List categories (flat or tree) | `GET /api/categories` |
| Product list | Grid/list with optional filters, sort | `GET /api/products` (query params as on web) |
| Product detail | Single product, variants, images, add to cart | `GET /api/products/[id]`, variants if needed |

Data shapes follow [DATA_MODELS.md](../../web/docs/DATA_MODELS.md). Prices are in cents.

---

### Cart

| Capability | Description | APIs / notes |
| ---------- | ---------- | ------------- |
| Get cart | Load current cart | `GET /api/cart`; send `X-Cart-Session` for guest |
| Add item | Add product/variant with quantity | `POST /api/cart` with body; include `sessionId` for guest |
| Update quantity | Change quantity or remove line | `PUT /api/cart` |
| Remove item | Remove line from cart | `PUT /api/cart` or `DELETE` as implemented |
| Guest cart | Cart without account | Persist `data.sessionId` from response; send `X-Cart-Session` or body `sessionId` on every request |
| Merge on login | After login, merge guest cart into user cart | Backend merge; then use user cart from subsequent `GET /api/cart` |

Use `getApiHeadersWithCart(accessToken, cartSessionId)` from `src/api.ts` when calling cart/checkout.

---

### Checkout

| Capability | Description | APIs / notes |
| ---------- | ---------- | ------------- |
| Checkout | Validate cart, create order, get payment intent | `POST /api/checkout` (requires auth on mobile); then payment intent |
| Addresses | Saved addresses for shipping/billing | `GET/POST/PUT/DELETE /api/addresses` |
| Shipping zones | Methods and costs by address | `GET /api/shipping-zones` or as used by checkout flow |
| Payment | Pay with Stripe | `POST /api/payments/create-intent` with `{ orderId }`; use returned `clientSecret` with Stripe native SDK (e.g. PaymentSheet) |
| Order confirmation | Success screen after payment | Use order id/number from checkout + payment flow |

Checkout on mobile **requires login**; backend returns 401 otherwise. Merge guest cart before calling checkout.

---

### Account

| Capability | Description | APIs / notes |
| ---------- | ---------- | ------------- |
| Profile | Name, email, password change | `GET /api/auth/profile`, update profile endpoint |
| Addresses | List, add, edit, set default | `GET /api/addresses`, `POST/PUT/DELETE /api/addresses` |

Account is the post-login home: profile and addresses feed into checkout and order history.

---

### Orders

| Capability | Description | APIs / notes |
| ---------- | ---------- | ------------- |
| Order history | List orders for logged-in user | `GET /api/orders` (paginated, role-based) |
| Order detail | Single order status, items, totals, address | `GET /api/orders/[id]` |
| Guest tracking | Look up order by tracking code | `GET /api/orders` with tracking code (or dedicated tracking endpoint as on web) |

Order model and fields: see [DATA_MODELS.md](../../web/docs/DATA_MODELS.md).

---

## Planned for later (post-MVP)

| Feature | Description | APIs (existing on web) |
| ------- | ---------- | ----------------------- |
| Wishlist | Save products, add to cart from wishlist | Wishlist API |
| Reviews | Product reviews and ratings | Review submit + list per product |
| Coupons / promo | Apply at checkout or dedicated UI | Coupon applied in checkout payload |
| Digital downloads | Access purchased digital products | Secure download by token; `/api/download/[token]` |
| Push notifications | Order updates, promos | `POST /api/devices/register`; FCM already in backend |
| Search | In-app search with suggestions | Search or products API with query |
| Notifications center | In-app list of notifications | Notifications API if exposed |

These will be scheduled in [ROADMAP.md](ROADMAP.md) once MVP is stable.

---

## Response envelope

All API responses use a consistent shape:

- **Success:** `{ success: true, data: { ... } }`
- **Error:** `{ success: false, error: "message" }`

Always read payload from `data` and errors from `error`; use proper HTTP status codes (401, 404, etc.) for client handling.
