# LogaShop Documentation

Welcome to the **LogaShop** e-commerce platform documentation.

## Quick Links

| Document                                               | Description                               |
| ------------------------------------------------------ | ----------------------------------------- |
| [PROJECT_SCOPE.md](PROJECT_SCOPE.md)                   | Project scope, decisions, and constraints |
| [DATA_MODELS.md](DATA_MODELS.md)                       | Database schema and entity relationships  |
| [REUSABLE_FROM_LOGATECH.md](REUSABLE_FROM_LOGATECH.md) | Components reusable from logatech-en      |
| [ROADMAP.md](ROADMAP.md)                               | Implementation phases and timeline        |

## Project Overview

**LogaShop** is a modern e-commerce platform built with Next.js, designed to:

- Sell physical and digital products
- Support guest and registered checkout
- Process payments via Stripe (EN) / Zarinpal (FA version)
- Provide a robust admin panel for store management

## Tech Stack

| Layer         | Technology                                 |
| ------------- | ------------------------------------------ |
| **Framework** | Next.js 15+ (App Router)                   |
| **Database**  | MongoDB (Mongoose)                         |
| **Auth**      | JWT in httpOnly cookies (from logatech-en) |
| **Payments**  | Stripe                                     |
| **State**     | Redux Toolkit + React Context              |
| **Styling**   | Tailwind CSS v4                            |

## Related Projects

- **logatech-en**: Admin panel reference (auth, notifications, accounting, UI components)
- **logashop-fa**: Future Persian version with Zarinpal payments
