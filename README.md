# Dew & Go — Production-Ready Beauty Quick-Commerce Platform

> **Beauty Essentials, Delivered in Minutes.**

Dew & Go is a production-grade cosmetics e-commerce and hyperlocal quick-commerce platform built with **React 19**, **TypeScript**, **Tailwind CSS**, **Supabase**, **Three.js**, and **Razorpay**.

---

## 🌟 Key Features

### 1. Customer Storefront & Hyperlocal Experience
- **Hyperlocal 15-Minute Delivery:** Real-time serviceability verification against active delivery micro-hubs (e.g. Indiranagar, Koramangala, Central Bangalore, South Mumbai, Connaught Place Delhi).
- **Interactive 3D Hero Scene:** Three.js procedural cosmetic containers (frosted serum dropper bottle, ivory cream jar, and lip glaze tube) with soft studio lighting, subtle floating animation, mouse/touch parallax, and reduced-motion compliance.
- **Dynamic Product Discovery:** 17 beauty categories, instant search autocomplete, multi-attribute filtering (Brand, Skin Concern, Price slider, In-stock toggle), and multi-criteria sorting.
- **Authentic Product Detail Pages:** Dedicated pages with zoomable galleries, variant/SKU selection, live delivery timers, benefits, ingredients list, how-to-use instructions, and safety information.
- **Persistent Shopping Bag & Drawer:** Free shipping progress bar (threshold ₹499), server-verified pricing, promo codes (`DEWGLOW20`, `FIRSTDEW`, `FREESHIP`), and tax calculations.
- **AI Beauty Advisor:** Personalized 3-question routine consultant matching skin type, barrier concerns, and formulation preferences to genuine database products.

### 2. Payments & Order Reconciliation
- **Server-Verified Razorpay Integration:** Cryptographic HMAC-SHA256 signature verification (`/api/razorpay/verify-payment`) preventing client-side price tampering.
- **Cash on Delivery (COD):** Integrated alongside Razorpay for seamless multi-channel checkout.
- **Idempotent Webhooks:** Webhook endpoint (`/api/razorpay/webhook`) with raw request body verification, deduplication, and automated fulfillment.
- **Live Order Tracking:** Verified 5-stage timeline (*Order Placed → Confirmed → Preparing → Out for Delivery → Delivered*), assigned delivery partner contact, and online cancellation handling.

### 3. Operations & Administration Portal (`/admin` and `/delivery`)
- **Executive KPI Dashboard:** Real-time net collected revenue, average order value (AOV), total orders, awaiting dispatches, and low-stock alerts.
- **Order Management:** Lifecycle status updates, rider dispatch assignments, and payment snapshots.
- **Inventory Control:** Variant-level stock tracking, overselling prevention, and audit logging with recorded reasons.
- **Coupon Manager:** Percentage and fixed discounts, minimum order value, and usage limits.
- **Rider Operations Portal (`/delivery`):** Mobile-optimized interface for delivery personnel to view route destinations, call customers, and mark orders delivered.

---

## 📁 Repository Structure

```
cosmetics/
├── index.html                    # HTML shell with Google Fonts & Razorpay script
├── package.json                  # Dependencies (React 19, Three.js, Lucide, Vitest)
├── tsconfig.json                 # Modern TypeScript ES2022 configuration
├── vite.config.ts                # Vite config + Server API Middleware (/api/*)
├── tailwind.config.js            # Dew & Go brand tokens and color palette
├── supabase/
│   └── migrations/
│       └── 20261020000000_dew_and_go_schema.sql # 34 entities, RLS policies & indexes
├── src/
│   ├── main.tsx                  # React 19 entry point
│   ├── App.tsx                   # Central router & layout shell
│   ├── index.css                 # Brand typography, utilities & CSS variables
│   ├── types/                    # TypeScript interfaces
│   ├── lib/
│   │   ├── store.ts              # Reactive store with local persistence
│   │   └── supabase.ts           # Supabase client with offline fallback
│   ├── context/
│   │   ├── AuthContext.tsx       # Auth & role switcher (Customer, Admin, Delivery)
│   │   ├── CartContext.tsx       # Shopping bag & discount calculations
│   │   ├── LocationContext.tsx   # Hyperlocal PIN code serviceability
│   │   └── WishlistContext.tsx   # Persistent favorites
│   ├── components/
│   │   ├── common/               # Header, Footer, ProductCard, LocationModal
│   │   ├── home/                 # ThreeHeroScene (3D cosmetic containers)
│   │   └── cart/                 # CartDrawer
│   ├── pages/                    # 15+ comprehensive pages (Shop, Admin, Delivery, etc.)
│   └── test/
│       └── ecommerce.test.ts     # Automated unit & integration tests
```

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key variables:
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`: Supabase project configuration
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`: Razorpay API test mode credentials
- `RAZORPAY_WEBHOOK_SECRET`: Razorpay Webhook secret
- `APP_BASE_URL`: Application origin (default: `http://localhost:5173`)

### 3. Run Automated Tests
```bash
npm test
```
All 10 unit and integration tests verify pricing, coupons, tax, delivery fees, serviceability, inventory adjustments, and HMAC signatures.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 🛡️ Security & Privacy
1. **Never Trust the Client:** Order subtotals, taxes, delivery fees, and discount calculations are recomputed on the server.
2. **Secret Isolation:** `RAZORPAY_KEY_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` are strictly server-side and never bundled in client code.
3. **Cryptographic Verification:** Online payment callbacks are verified using HMAC-SHA256 signature calculation against `order_id|payment_id`.
4. **Row Level Security (RLS):** All 34 database entities have strict RLS policies enabled in Supabase PostgreSQL.
