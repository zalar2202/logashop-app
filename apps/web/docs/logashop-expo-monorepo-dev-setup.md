# LogaShop — Monorepo + Expo (Windows, Real-Device-First) Dev Setup

This document is the **reference setup guide** for running:
- **Web** (Next.js) and
- **Mobile** (Expo / React Native)

…in a single repo (monorepo-style), with one set of root scripts:
- `dev:web`
- `dev:mobile`
- `dev:all`

> Goal: keep the workflow simple on Windows, **avoid emulators for now**, use **Expo Go** on a real device, and keep the backend API reachable from your phone.

---

## 1) Recommended Folder Structure (Minimal pain, scalable later)

### ✅ Recommended (clean monorepo)
```
logashop/
  apps/
    web/            # your current Next.js app (moved here)
    mobile/         # your Expo app
  package.json      # root scripts (dev:web, dev:mobile, dev:all)
  README.md
  .gitignore
```

### Why this structure
- Keeps both apps clearly separated.
- Makes scripts + CI cleaner.
- Lets you add a future `packages/shared` later (types, validators, API client).

---

## 2) Migration Steps (from your current web repo)

### Step A — Create `apps/` and move web
1. Create folders:
   - `apps/web`
   - `apps/mobile`
2. Move **everything** from your current repo into `apps/web/` *except*:
   - `.git/`
   - root `package.json` (we’ll recreate it)
   - root `README.md` (optional)
   - any future root tooling files

> If you already have a git repo, the move is safe: Git will track renames/moves.

### Step B — Ensure the web app still runs
From repo root:
```bash
npm install
npm run dev:web
```
(Web runs on port **7777**.)

---

## 3) Create the Expo App (Mobile)

From repo root:
```bash
cd apps
npx create-expo-app@latest mobile
```

Then:
```bash
cd mobile
npx expo start
```

Install **Expo Go** on your phone and scan the QR code.

---

## 4) Root `package.json` with Workspaces + Scripts

This setup uses **npm workspaces** (works fine on Windows and keeps commands simple).

Create/replace **root** `package.json`:

```json
{
  "name": "logashop",
  "private": true,
  "workspaces": [
    "apps/web",
    "apps/mobile"
  ],
  "scripts": {
    "dev:web": "npm --workspace apps/web run dev",
    "dev:mobile": "npm --workspace apps/mobile run start",
    "dev:all": "concurrently -n WEB,MOBILE -c auto "npm run dev:web" "npm run dev:mobile"",

    "install:all": "npm install",

    "lint:web": "npm --workspace apps/web run lint",
    "lint:mobile": "npm --workspace apps/mobile run lint",
    "lint:all": "npm run lint:web && npm run lint:mobile",

    "build:web": "npm --workspace apps/web run build",

    "start:web": "npm --workspace apps/web run start"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

### Install root tooling
From repo root:
```bash
npm install
```

Now you can run:
- Web only: `npm run dev:web`
- Mobile only: `npm run dev:mobile`
- Both: `npm run dev:all`

---

## 5) Mobile → Backend API URL (Critical on Real Devices)

### The rule
**Your phone cannot call `localhost` on your PC.**

This project runs the web/API on port **7777**. If the backend runs on your PC at:
- `http://localhost:7777`

Your phone must use:
- `http://<YOUR_PC_LAN_IP>:7777`

Example:
- `http://192.168.1.25:7777`

### How to find your PC LAN IP (Windows)
Open PowerShell:
```powershell
ipconfig
```
Look for **IPv4 Address** under your active network adapter (Wi‑Fi/Ethernet).

---

## 6) Environment Variables for Mobile (Recommended pattern)

### Create `apps/mobile/.env`
Example:
```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.25:7777
```

In Expo (SDK 49+), variables prefixed with `EXPO_PUBLIC_` are available in the app.

### Using it in the mobile code
```ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
```

> Keep a separate `.env.production` later with your real domain, e.g. `https://yourdomain.com`.

---

## 7) CORS & Cookies Notes (Because your web uses httpOnly cookies today)

For **mobile**, you’ll likely use:
- `Authorization: Bearer <accessToken>`

So you typically **avoid cookie/cors complexity** for mobile requests.

For **web**, cookies stay as-is.

This matches the “Mobile Readiness Spec” approach you already adopted:
- Web: httpOnly cookie
- Mobile: Bearer tokens

---

## 8) Expo Go Development Loop (What you remembered)

When you run:
```bash
npm run dev:mobile
```

- Expo starts a dev server (Metro bundler)
- It shows a QR code
- Expo Go on your phone loads your JS bundle
- Changes reflect instantly (Fast Refresh)

### Requirements
- Phone + PC must be on the **same Wi‑Fi**
- Firewall must allow the Expo dev server

If QR connection fails:
- In the Expo terminal UI, switch from **LAN** to **Tunnel** (slower but works through restrictive networks).

---

## 9) Firewall Note (Windows)

If Expo or your phone can’t connect to your PC:
- Allow Node.js / Expo through Windows Defender Firewall
- Ensure your backend port (**7777** for this project) is reachable from LAN

A quick test:
Open on your phone’s browser:
- `http://<PC_LAN_IP>:7777`

If your phone can’t open that URL, the mobile app won’t be able to call your API either.

---

## 10) What You Do NOT Need Yet (for real-device-first)

- ❌ Android Studio (unless you want emulator / advanced debugging)
- ❌ Xcode (not on Windows)
- ❌ Ejecting to bare workflow

Later, for production builds:
- ✅ Use **EAS Build** (cloud) for Android/iOS

---

## 11) Optional Next Improvements (Later)

When the mobile app grows, you can add:
```
packages/
  shared/  # shared TS types, zod/yup schemas, API client, constants
```

But it’s optional—don’t add it until you actually need shared code.

---

## 12) Quick Commands Summary

From repo root:

- Install everything:
```bash
npm run install:all
```

- Run web:
```bash
npm run dev:web
```

- Run mobile:
```bash
npm run dev:mobile
```

- Run both:
```bash
npm run dev:all
```

---

## Appendix — If you prefer NOT moving the web app

You *can* keep your current Next.js app at repo root and add `mobile/` beside it:

```
logashop/
  mobile/
  (existing Next.js files...)
```

But you lose the clean workspace separation, and root scripts become less consistent long-term.

If you want this simpler layout anyway, say so and I’ll give you the “no-move” version of scripts.

