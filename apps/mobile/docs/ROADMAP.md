# LogaShop Mobile — Implementation Roadmap

Phased plan for building the mobile app. MVP (Phase 1) is auth, browse, cart, checkout, account, and orders. Later phases add the rest of the web feature set and mobile-specific improvements.

---

## Phase 1: Foundation and auth

**Goal:** App shell, navigation, and full auth flow so the user can log in and stay logged in.

### Tasks

- [ ] Set up navigation (e.g. React Navigation): stack + tabs or similar structure for unauthenticated vs authenticated areas
- [ ] Auth screens: Login, Sign up, Forgot password (and reset if in-app)
- [ ] Token storage: SecureStore for access + refresh tokens
- [ ] Auth context or state: current user, login/logout, token refresh on 401
- [ ] Use `POST /api/auth/login`, `signup`, `refresh`; send `X-Client: mobile` and persist tokens
- [ ] Optional: deep link or handle reset-password link (e.g. open in-app or browser)
- [ ] Guard: redirect unauthenticated users from protected screens (e.g. account, checkout)

### Deliverables

- User can sign up, log in, and remain logged in across app restarts
- Refresh flow runs on 401; expired session is handled gracefully
- Clear path to “Account” and “Cart” from the shell

---

## Phase 2: Browse (catalog)

**Goal:** User can open the app, see home and categories, list products, and open product detail.

### Tasks

- [ ] Home screen: layout (hero, featured products, categories) using `/api/products`, `/api/categories` as needed
- [ ] Categories: list or tree; navigate to product list by category
- [ ] Product list: grid or list, optional filters/sort; `GET /api/products` with query params
- [ ] Product detail: images, title, price, description, variants; add-to-cart button
- [ ] Use `src/api.ts` for base URL and headers (Bearer when logged in)
- [ ] Typed response shapes aligned with [DATA_MODELS.md](../../web/docs/DATA_MODELS.md) (prices in cents, etc.)
- [ ] Loading and error states for all catalog screens

### Deliverables

- User can browse categories and products and view product detail
- Add to cart from product detail (cart implementation in Phase 3)

---

## Phase 3: Cart

**Goal:** Cart state, guest cart with session, merge on login, and cart UI.

### Tasks

- [ ] Cart context or state: current cart, add/update/remove, sync with backend
- [ ] Guest cart: persist `sessionId` from API (e.g. async storage); send `X-Cart-Session` or body `sessionId` on every cart/checkout request
- [ ] On login: trigger cart merge (backend merges when same user); refetch cart and drop guest session id
- [ ] Cart UI: cart screen or drawer; list items, quantity controls, remove, subtotal
- [ ] Integrate “Add to cart” from product detail with cart context
- [ ] Use `GET/POST/PUT/DELETE /api/cart` and `getApiHeadersWithCart(accessToken, cartSessionId)`

### Deliverables

- User (guest or logged in) can add, update, and remove cart items and see cart
- After login, guest cart is merged and cart reflects combined items

---

## Phase 4: Checkout and payment

**Goal:** From cart to paid order using existing checkout and Stripe.

### Tasks

- [ ] Checkout flow: require login (redirect to login if needed); use merged cart
- [ ] Address: select saved address or add new; use `GET/POST/PUT /api/addresses` and pass chosen address into checkout
- [ ] Shipping: use backend shipping zones/methods; show selected method and cost in summary
- [ ] Call `POST /api/checkout`; handle validation errors and order creation
- [ ] Payment: call `POST /api/payments/create-intent` with `orderId`; receive `clientSecret`
- [ ] Integrate Stripe native SDK (e.g. PaymentSheet); complete payment and handle success/failure
- [ ] Order confirmation screen: show order number and status; link to order detail
- [ ] Clear or update cart after successful payment

### Deliverables

- User can complete checkout with address, shipping method, and Stripe payment
- Order is created and paid; user sees confirmation and can open order detail

---

## Phase 5: Account and orders

**Goal:** Account home, profile, addresses, order history, and guest tracking.

### Tasks

- [ ] Account home: post-login hub with profile, addresses, order history entry points
- [ ] Profile: view/edit name, email; change password; use auth and profile APIs
- [ ] Addresses: list, add, edit, delete, set default; full CRUD with `/api/addresses`
- [ ] Order history: list orders (`GET /api/orders`); pagination if supported
- [ ] Order detail: single order status, items, totals, addresses; `GET /api/orders/[id]`
- [ ] Guest order tracking: screen to enter tracking code; call API to fetch order and show status
- [ ] Handle empty states and errors (e.g. no orders, invalid tracking code)

### Deliverables

- Logged-in user can manage profile and addresses and see order history and detail
- Guest can look up order by tracking code and see status

---

## MVP complete

After Phase 5, the app supports:

- Auth (login, signup, refresh, forgot password)
- Browse (home, categories, product list, product detail)
- Cart (guest + logged-in, merge on login)
- Checkout (address, shipping, Stripe payment)
- Account (profile, addresses)
- Orders (history, detail, guest tracking)

This is the target for the first shippable version.

---

## Phase 6+: Post-MVP (planned)

To be broken down when MVP is stable. Likely areas:

- **Wishlist:** Save products, add to cart from wishlist; use Wishlist API
- **Reviews:** Submit and display product reviews; use Review API
- **Coupons / promo:** Promo code at checkout or dedicated UI; reuse checkout coupon support
- **Digital downloads:** Access purchased digital products; secure download link or in-app flow
- **Push notifications:** Register device (`POST /api/devices/register`), show order and promo notifications
- **Search and discovery:** Search bar, suggestions, filters
- **Notifications center:** In-app list of notifications (if backend exposes it)
- **Polish:** Offline-friendly reads, better errors, a11y, performance

---

## Dependencies

- **Backend:** All MVP features use existing `apps/web` API; no backend feature work required for Phase 1–5.
- **Env:** `EXPO_PUBLIC_API_BASE_URL` must be set for real device (see [logashop-expo-monorepo-dev-setup.md](../../web/docs/logashop-expo-monorepo-dev-setup.md)).
- **Stripe:** Stripe native SDK (e.g. `@stripe/stripe-react-native`) for PaymentSheet; keys and create-intent flow as in [mobile-api.md](../../web/docs/mobile-api.md).
