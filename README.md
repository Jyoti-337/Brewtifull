# ☕ Brew-tiful Coffee

A fullstack coffee shop ordering platform with real payments, promo code discounts, order cancellation workflows, and admin analytics.

## 🌐 Live Demo

**Live App:** [https://brewtifull-337.vercel.app](https://brewtifull-337.vercel.app)

Test accounts are available below under [Default Test Accounts](#default-test-accounts) if you'd like to explore the admin dashboard.

---

## ✨ Features

### 🛍️ Customer Experience
- **Interactive Menu** — Browse, search, and filter artisanal coffees and pastries by category, rating, or popularity.
- **Shopping Cart & Wishlist** — Persistent cart with quantity updates and one-click wishlist toggling.
- **Dual Payment Options**
  - **Stripe Online Payment** — Card payments via Stripe Checkout with webhook signature verification.
  - **Cash on Delivery (COD)** — Pay upon pickup/delivery with direct order confirmation.
- **Promo & Coupon System** — Apply validated discount codes (`WELCOME10`, `BREW20`) with an itemized order total breakdown (subtotal, discount, tax, delivery fee).
- **Order Tracking & Cancellation** — Full order history on `/orders` with status progression (`PENDING` → `CONFIRMED` → `PREPARING` → `OUT_FOR_DELIVERY` → `DELIVERED`, or `CANCELLED`). Customers can cancel orders while still `PENDING` or `CONFIRMED`.
- **Verified Reviews** — Submit 1–5 star ratings and reviews, restricted to customers who've actually ordered the product.

### 🔐 Authentication & Security
- **Session Management** — NextAuth.js credentials provider with bcrypt password hashing and persistent JWT sessions.
- **Protected Checkout** — Unauthenticated users attempting checkout are redirected to login, then returned to complete their order.
- **Role-Based Authorization** — Enforced `CUSTOMER` vs `ADMIN` boundaries across API routes and pages.

### 📊 Admin Control Panel (`/admin`)
- **Product Catalog CRUD** — Add, edit, or toggle availability/stock for menu items.
- **Order Management** — Filter by status, update delivery progress, cancel orders with a reason.
- **Coupon Management** — Create promo codes, set minimum order thresholds and usage caps, toggle active/inactive.
- **Sales Analytics** — Revenue trends, order volume, and top-selling products.

### 📧 Notifications & Testing
- **Transactional Emails** — Order confirmation and status update emails via Nodemailer.
- **Automated Test Suite & CI** — Unit tests for calculation logic and an end-to-end checkout flow test, run automatically on every push via GitHub Actions.

---

## 🚀 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework & Core** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling & Animation** | Tailwind CSS v4, Framer Motion |
| **Database & ORM** | PostgreSQL (Neon Serverless), Prisma ORM 6 |
| **Authentication** | NextAuth.js v4, bcryptjs |
| **Payments** | Stripe API (Checkout & Webhooks) |
| **Email** | Nodemailer (SMTP) |
| **Validation** | Zod |
| **Testing & CI** | Vitest, Playwright, GitHub Actions |

---

## 📐 Architecture & Database Schema

Built on Prisma ORM connecting to a Neon PostgreSQL instance.

```text
User ─┬─< Order >─┬─ Coupon
      │           │
      │           └─< OrderItem >─ Product
      │
      ├─< Review >─ Product
      ├─< DbCartItem >─ Product
      └─< WishlistItem >─ Product
```

### Data Models
- **User** — `CUSTOMER` or `ADMIN` accounts. Has many Orders, Reviews, CartItems, WishlistItems.
- **Product** — Menu items with price, category, stock, and availability.
- **Order** — Order header: status, payment method (stripe / COD), totals, optional Coupon, cancellation reason.
- **OrderItem** — Line items linking an Order to a Product, with price captured at time of purchase.
- **Coupon** — Discount rules (percentage or fixed_amount) with usage tracking (`times_used` / `max_uses`).
- **Review** — Rating + comment linked to a verified purchase.
- **DbCartItem** — Persistent per-user cart, synced across sessions.
- **WishlistItem** — Saved favorite products per user.

---

## 🛠️ Getting Started (Local Setup)

### 1. Clone & Install
```bash
git clone https://github.com/Jyoti-337/Brewtifull.git
cd Brewtifull
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=
DATABASE_URL_UNPOOLED=

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email (SMTP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=
```

### 3. Database Setup
```bash
npm run db:push    # Push Prisma schema to your database
npm run db:seed    # Seed sample products, accounts, and promo codes
```

<a id="default-test-accounts"></a>

#### Default Test Accounts (created by the seed script):

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@brewtiful.com` | `admin123` |
| **Customer** | `customer@brewtiful.com` | `customer123` |

### 4. Run the Dev Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🧪 Running Tests

```bash
npm run test        # Vitest unit tests (coupon logic, order totals)
npm run test:e2e     # Playwright E2E tests (menu → cart → checkout)
```

Tests also run automatically on every push via GitHub Actions (`.github/workflows/test.yml`).

---

## 📁 Project Structure

```text
coffee-app/
├── .github/workflows/     # CI workflow (test.yml)
├── app/
│   ├── admin/              # Admin dashboard
│   ├── api/                 # API routes (auth, cart, checkout, coupons, orders, reviews)
│   ├── checkout/            # Checkout flow
│   ├── menu/                 # Product catalog
│   ├── orders/                # Order history & cancellation
│   └── order-success/          # Order confirmation
├── components/             # Reusable UI (CartDrawer, Navbar, Footer, Modals)
├── context/                # React Context (CartContext, SessionProvider)
├── lib/                    # Utilities (prisma, coupons, email, stripe)
├── prisma/                 # schema.prisma & seed.ts
├── tests/
│   ├── e2e/                 # Playwright tests
│   └── unit/                 # Vitest tests
├── vitest.config.ts
└── playwright.config.ts
```

---

## 🔮 Future Improvements
- Real-time order tracking via WebSockets/SSE instead of manual refresh.
- Automated Stripe refunds triggered on cancellation of paid orders (currently a manual/admin process).

---

## 🧑‍💻 Author

**Jyoti**

- **GitHub:** [github.com/Jyoti-337](https://github.com/Jyoti-337)
