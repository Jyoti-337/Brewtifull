# ☕ Brew-tiful Coffee

> A fullstack coffee shop ordering platform with real payments, promo code discounts, order cancellation workflows, and admin analytics.

---

## 🌐 Live Demo

* **Live Demo**: [https://brewtiful-coffee.example.com](https://brewtiful-coffee.example.com) *(Deployment link placeholder)*

![Brew-tiful Coffee App Banner](https://via.placeholder.com/1200x630.png?text=Brew-tiful+Coffee+Fullstack+App+Preview)

---

## ✨ Features

### 🛍️ Customer Experience
* **Interactive Menu**: Browse, search, and filter artisanal coffees and pastries by category, rating, or popularity.
* **Shopping Cart & Wishlist**: Persistent cart supporting size selections (`Small`, `Medium`, `Large`), quantity updates, and one-click wishlist toggling.
* **Dual Payment Options**:
  * **Stripe Online Payment**: Card payments via Stripe Checkout with automated webhook signature verification.
  * **Cash on Delivery (COD)**: Pay upon pickup/delivery with direct order confirmation.
* **Promo & Coupon System**: Apply validated discount codes (`WELCOME10`, `BREW20`) with instant itemized order total breakdown (Subtotal, Discount, Taxes, Delivery Fee).
* **Order Tracking & Cancellation**: View full order history on `/orders` with real-time status progression (`PENDING`, `CONFIRMED`, `PAID`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `COMPLETED`, `CANCELLED`). Customers can cancel orders in `PENDING` or `CONFIRMED` status.
* **Verified Reviews**: Submit 1–5 star ratings and reviews restricted to verified buyers who ordered the product.

### 🔐 Authentication & Security
* **Session Management**: NextAuth.js credentials provider with bcrypt password hashing and persistent JWT sessions.
* **Protected Checkout**: Unauthenticated guest users attempting checkout are automatically redirected to login with return callback state.
* **Role-Based Authorization**: Strict boundary checks enforcing `CUSTOMER` vs `ADMIN` permissions across API routes and client pages.

### 📊 Admin Control Panel (`/admin`)
* **Product Catalog CRUD**: Add, edit, or toggle availability/stock for menu items in real time.
* **Order Management & Workflow**: Filter orders by status, update delivery progress manually, and perform admin order cancellations with reason tracking.
* **Coupon Management Dashboard**: Create promo codes, configure minimum order thresholds and usage caps (`max_uses`), and toggle code activity (`ACTIVE` / `INACTIVE`).
* **Sales Analytics**: Visual dashboard tracking revenue performance, order volume metrics, and top-selling products.

### 📧 Notifications & Testing
* **Transactional Email Alerts**: HTML email notifications sent via Nodemailer for order confirmations and status updates.
* **Automated Test Suite & CI**: Unit testing for calculation engines and end-to-end user workflow testing running automatically via GitHub Actions.

---

## 🚀 Tech Stack

* **Framework & Core**: [Next.js 16 (App Router)](https://nextjs.org/), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
* **Styling & Animation**: [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
* **Database & ORM**: [PostgreSQL (Neon Serverless)](https://neon.tech/), [Prisma ORM 6](https://www.prisma.io/)
* **Authentication**: [NextAuth.js v4](https://next-auth.js.org/), [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
* **Payment Processing**: [Stripe API](https://stripe.com/) (Checkout & Webhooks)
* **Email Service**: [Nodemailer](https://nodemailer.com/) (SMTP)
* **Validation**: [Zod](https://zod.dev/)
* **Testing & CI**: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/), [GitHub Actions](https://github.com/features/actions)

---

## 📐 Architecture & Database Schema

The database model is built on Prisma ORM connecting to a Neon PostgreSQL instance.

```
+------------------+         +-------------------+         +-------------------+
|       User       | 1 --- * |       Order       | * --- 1 |      Coupon       |
+------------------+         +-------------------+         +-------------------+
| id               |         | id                |         | id                |
| email            |         | order_number      |         | code              |
| password_hash    |         | status            |         | discount_type     |
| role             |         | payment_method    |         | discount_value    |
+------------------+         | subtotal          |         | min_order_value   |
  |       |                  | total             |         +-------------------+
  |       |                  +-------------------+
  |       |                            | 1
  |       |                            |
  |       |                            *
  |       |                  +-------------------+
  |       |                  |     OrderItem     |
  |       |                  +-------------------+
  |       |                  | quantity          |
  |       |                  | price_at_purchase |
  |       |                  +-------------------+
  |       |                            | *
  |       |                            |
  |       |                            1
  |       +------------------> +-------------------+
  |                            |      Product      |
  |                            +-------------------+
  |                            | id, name, price   |
  |                            | category, stock   |
  |                            +-------------------+
  |                                      ^
  *                                      |
+-------------------+                    |
| Review / DbCart   | -------------------+
+-------------------+
```

### Data Models & Relationships:
- **`User`**: System accounts (`CUSTOMER` or `ADMIN`). Has many `Orders`, `Reviews`, `CartItems`, and `WishlistItems`.
- **`Product`**: Menu items. Has many `OrderItems`, `Reviews`, `CartItems`, and `WishlistItems`.
- **`Order`**: Order header tracking status, payment method (`stripe` or `COD`), items, customer details, optional `Coupon` association, and `cancellation_reason`.
- **`OrderItem`**: Line items snapshot linking an `Order` to a `Product` with historical price tracking.
- **`Coupon`**: Promotional discount rules (`percentage` vs `fixed_amount`) with usage tracking (`times_used` / `max_uses`).
- **`Review`**: Product rating and feedback linked to verified customer accounts.
- **`DbCartItem`**: Persistent database cart items synced per user account.
- **`WishlistItem`**: Saved user favorite products.

---

## 🛠️ Getting Started (Local Setup)

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/coffee-app.git
cd coffee-app
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root and add the following configuration variables:

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

# Email SMTP
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=
```

### 3. Database Migration & Seeding
Push the Prisma schema to your PostgreSQL database and seed sample products, admin/customer accounts, and promo codes:

```bash
# Push database schema
npm run db:push

# Seed initial database records
npm run db:seed
```

#### Default Test Accounts:
- **Admin Account**: `admin@brewtiful.com` / Password: `admin123`
- **Customer Account**: `customer@brewtiful.com` / Password: `customer123`

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests

### Unit Tests (Vitest)
Executes unit tests for coupon validation logic and order total calculations:
```bash
npm run test
```

### End-to-End Tests (Playwright)
Executes automated browser tests covering menu navigation, cart manipulation, auth redirection, and Cash on Delivery order checkout:
```bash
npm run test:e2e
```

---

## 📁 Project Structure

```
coffee-app/
├── .github/workflows/     # GitHub Actions CI workflow (test.yml)
├── app/                   # Next.js App Router (Pages, Layouts, API Routes)
│   ├── admin/             # Admin Dashboard page & components
│   ├── api/               # API Routes (auth, cart, checkout, coupons, orders, reviews)
│   ├── checkout/          # Checkout page & form steps
│   ├── menu/              # Product catalog page
│   ├── orders/            # Customer order history & cancellation page
│   └── order-success/     # Order placement confirmation screen
├── components/            # Reusable UI components (CartDrawer, Navbar, Footer, Modals)
├── context/               # React Context Providers (CartContext, SessionProvider)
├── lib/                   # Utility modules (prisma, coupons, email, stripe)
├── prisma/                # Database schema (schema.prisma) & seed script (seed.ts)
├── tests/                 # Test suites
│   ├── e2e/               # Playwright E2E tests (checkout-cod.spec.ts)
│   └── unit/              # Vitest unit tests (coupons.test.ts)
├── vitest.config.ts       # Vitest setup configuration
└── playwright.config.ts   # Playwright setup configuration
```

---

## 🔮 Future Improvements

- **Real-Time Order Tracking**: Integrate WebSockets / Server-Sent Events (SSE) for live order status updates without page refreshes.
- **Automated Refund API Integration**: Trigger automatic Stripe API refund requests upon order cancellation for online paid orders.

---

## 🧑‍💻 Author

**Tushar**
- **GitHub**: [https://github.com/your-username](https://github.com/your-username)
- **LinkedIn**: [https://linkedin.com/in/your-profile](https://linkedin.com/in/your-profile)
