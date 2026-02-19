# LogaShop Mobile (Expo)

## First-time setup

1. **API URL (required for real device)**  
   Copy `.env.example` to `.env` and set your PC's LAN IP:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.XX:7777
   ```
   Get your IP: `ipconfig` → IPv4 Address. Phone and PC must be on the same Wi‑Fi.

2. **Expo Go**  
   Install [Expo Go](https://expo.dev/go) on your phone.

## Run

From repo root:
```bash
npm run dev:mobile
```
Scan the QR code with Expo Go (Android) or Camera (iOS).

## Documentation

- **[docs/](docs/)** — Mobile app guide: [README](docs/README.md), [FEATURES](docs/FEATURES.md), [ROADMAP](docs/ROADMAP.md).
- **Backend / API:** `apps/web/docs/mobile-api.md` for auth, cart, checkout, and Stripe.

## API usage

- Use `getApiBaseUrl()`, `getApiHeaders(accessToken)`, and `getApiHeadersWithCart(accessToken, cartSessionId)` from `src/api.ts`.
- Backend expects **X-Client: mobile** and **Authorization: Bearer &lt;token&gt;** for protected routes.
