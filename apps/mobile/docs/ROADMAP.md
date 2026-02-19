# LogaShop Mobile — Implementation Roadmap

Phased plan for building the mobile app. MVP (Phase 1) is auth, browse, cart, checkout, account, and orders. Later phases add the rest of the web feature set and mobile-specific improvements.

---

## Phase 1: Foundation and auth

**Goal:** App shell, navigation, and full auth flow so the user can log in and stay logged in.

### Tasks

- [x] Set up navigation (e.g. React Navigation): stack + tabs; MainTabs (Home, Shop, Cart, Account) for all users; Auth stack for login/signup
- [x] Auth screens: Login, Sign up, Forgot password (and reset if in-app)
- [x] Token storage: SecureStore for access + refresh tokens
- [x] Auth context or state: current user, login/logout, token refresh on 401
- [x] Use `POST /api/auth/login`, `signup`, `refresh`; send `X-Client: mobile` and persist tokens
- [ ] Optional: deep link or handle reset-password link (e.g. open in-app or browser)
- [x] Guest browsing: show Home and Cart to unauthenticated users; Account tab shows Sign In / Sign Up

### Deliverables

- User can sign up, log in, and remain logged in across app restarts
- Refresh flow runs on 401; expired session is handled gracefully
- Clear path to Home, Cart, and Account; guests can browse and add to cart

---

## Phase 2: Browse (catalog)

**Goal:** User can open the app, see home and categories, list products, and open product detail.

### Tasks

- [x] Home screen: layout (hero, featured products, categories) using `/api/products`, `/api/categories` as needed
- [x] Categories: list or tree; navigate to product list by category
- [x] Product list: grid, sort (newest, popular, price, name); `GET /api/products` with query params; filters in Phase 6
- [x] Product detail: images, title, price, description, variants; add-to-cart button
- [x] Use `src/api.ts` for base URL and headers (Bearer when logged in)
- [x] Typed response shapes aligned with [DATA_MODELS.md](../../web/docs/DATA_MODELS.md) (prices in cents, etc.)
- [x] Loading and error states for all catalog screens

### Deliverables

- User can browse categories and products and view product detail
- Add to cart from product detail (cart implementation in Phase 3)

---

## Phase 3: Cart

**Goal:** Cart state, guest cart with session, merge on login, and cart UI.

### Tasks

- [x] Cart context or state: current cart, add/update/remove, sync with backend
- [x] Guest cart: persist `sessionId` from API (e.g. async storage); send `X-Cart-Session` or body `sessionId` on every cart/checkout request
- [x] On login: trigger cart merge (backend merges when same user); refetch cart and drop guest session id
- [x] Cart UI: cart screen or drawer; list items, quantity controls, remove, subtotal
- [x] Integrate "Add to cart" from product detail with cart context
- [x] Use `GET/POST/PUT/DELETE /api/cart` and `getApiHeadersWithCart(accessToken, cartSessionId)`

### Deliverables

- User (guest or logged in) can add, update, and remove cart items and see cart
- After login, guest cart is merged and cart reflects combined items

---

## Phase 4: Checkout and payment

**Goal:** From cart to paid order using existing checkout and Stripe.

### Tasks

- [x] Checkout flow: require login (redirect to login if needed); use merged cart
- [x] Address: select saved address or add new; use `GET/POST /api/addresses` and pass chosen address into checkout
- [x] Shipping: use backend shipping zones/methods; show selected method and cost in summary
- [x] Call `POST /api/checkout`; handle validation errors and order creation
- [x] Payment: call `POST /api/payments/create-intent` with `orderId`; receive `clientSecret`
- [x] Integrate Stripe native SDK (e.g. PaymentSheet); complete payment and handle success/failure
- [x] Order confirmation screen: show order number and status; link to order detail
- [x] Clear or update cart after successful payment

### Deliverables

- User can complete checkout with address, shipping method, and Stripe payment
- Order is created and paid; user sees confirmation and can open order detail

---

## Phase 5: Account and orders

**Goal:** Account home, profile, addresses, order history, and guest tracking.

### Tasks

- [x] Account home: post-login hub with profile, addresses, order history entry points
- [x] Profile: view/edit name, email; change password; use auth and profile APIs
- [x] Addresses: list, add, edit, delete, set default; full CRUD with `/api/addresses`
- [x] Order history: list orders (`GET /api/orders`); pagination if supported
- [x] Order detail: single order status, items, totals, addresses; `GET /api/orders/[id]`
- [x] Guest order tracking: screen to enter tracking code; call API to fetch order and show status
- [x] Handle empty states and errors (e.g. no orders, invalid tracking code)

### Deliverables

- Logged-in user can manage profile and addresses and see order history and detail
- Guest can look up order by tracking code and see status

---

## MVP complete

After Phase 5, the app supports:

- Auth (login, signup, refresh, forgot password)
- Browse (home, categories, shop with search/filters, product detail)
- Cart (guest + logged-in, merge on login)
- Checkout (address, shipping, coupons/promo, Stripe payment)
- Account (profile, addresses)
- Orders (history, detail, guest tracking)
- Search and discovery (Shop tab: search bar, suggestions, filters)

This is the target for the first shippable version.

---

## Phase 6: Search, discovery, and post-MVP ✓

**Goal:** Shop tab with search and filters; post-MVP features as they land.

### Completed

- [x] Shop tab: 4th tab in MainTabs; dedicated products screen with search + filters
- [x] Search bar: debounced product search; suggestions (≥2 chars) from `/api/products?search=...`
- [x] Filters: category, price range (min/max), sale only, sort; FilterSheet bottom modal
- [x] Entry points: Shop Now, See All, category taps → Shop (with optional category pre-filter)
- [x] Product grid with pagination and pull-to-refresh
- [x] Coupons / promo: Promo code at checkout; validate via `POST /api/coupons/validate`, pass `couponCode` in `POST /api/checkout`
- [x] Wishlist: Save products, add to cart from wishlist; `GET/POST /api/wishlist`; My Wishlist in Account; heart toggle on ProductCard and ProductDetail
- [x] Digital downloads: Access purchased digital products; `GET /api/account/downloads`, `GET /api/download/[token]`; My Downloads in Account; in-app download + share
- [x] **Reviews:** Submit and display product reviews; `GET/POST /api/products/[id]/reviews`; Customer Reviews on ProductDetail; star rating on ProductCard
- [x] **Push notifications:** Register device (`POST /api/devices/register`), expo-notifications; device token sent on login
- [x] **Notifications center:** In-app list; `GET /api/notifications`, `GET /api/notifications/count`, `PATCH /api/notifications/[id]`, `PATCH /api/notifications/mark-all-read`; NotificationsScreen in Account

### Planned
- **Polish:** Offline-friendly reads, better errors, a11y, performance

### Deliverables

- User can open Shop tab to browse all products, search, apply filters, and drill by category
- Suggestions appear while typing; tapping suggestion opens product detail
- Promo codes apply at checkout
- User can save products to wishlist and add them to cart from My Wishlist
- User can view and download purchased digital products from My Downloads

---

## Dependencies

- **Backend:** All MVP features use existing `apps/web` API; no backend feature work required for Phase 1–6.
- **Env:** `EXPO_PUBLIC_API_BASE_URL` must be set for real device (see [logashop-expo-monorepo-dev-setup.md](../../web/docs/logashop-expo-monorepo-dev-setup.md)).
- **Stripe:** Stripe native SDK (e.g. `@stripe/stripe-react-native`) for PaymentSheet; keys and create-intent flow as in [mobile-api.md](../../web/docs/mobile-api.md).

