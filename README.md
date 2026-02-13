# LogaShop

A modern e-commerce platform built with **Next.js** — storefront, checkout with Stripe, and a full admin panel for products, orders, customers, and more.

## What it does

- **Storefront** — Browse products and categories, cart, wishlist, guest or registered checkout
- **Payments** — Stripe (payment intents, webhooks)
- **Digital & physical products** — Inventory, variants, secure downloads for digital goods
- **Customer accounts** — Profile, addresses, order history, order tracking
- **Admin panel** — Dashboard, catalog (products/categories), orders, coupons, reviews, shipping zones, blog, CRM, invoicing, accounting, support tickets, media library, and more

## Tech stack

Next.js 16 · React 19 · MongoDB (Mongoose) · Stripe · Firebase (notifications) · Tailwind CSS v4 · JWT auth (httpOnly cookies)

## Getting started

```bash
npm install
# Create .env.local with MONGO_URI, Stripe keys, etc. (see docs/README.md)
npm run dev
```

The app runs on the port defined in `package.json`. For seed data (admin user, sample categories/products), see the `seed:*` scripts in `package.json`.

**Requirements:** Node.js, MongoDB, Stripe account (for payments). Optional: Firebase and SMTP for notifications and email.

## Documentation

Developers: see **[docs/README.md](docs/README.md)** for the full developer guide — scope, data models, implementation roadmap, and setup details.

## License

Private / see repository settings.
