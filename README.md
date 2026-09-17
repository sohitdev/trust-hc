# Trust Health.care – Pharmacy Management & E-Commerce Platform

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)

A full-stack, unified pharmacy management system. This repository contains the complete source code for both the **Internal Store Operations (POS & Inventory)** and the **Public Customer Storefront (E-commerce & Prescription Uploads)**.

---

## 📑 Table of Contents
1. [System Architecture](#system-architecture)
2. [Folder Structure](#folder-structure)
3. [Database Schema & RPCs](#database-schema--rpcs)
4. [State Management](#state-management)
5. [Local Development Guide](#local-development-guide)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ System Architecture

The application is built on the **Next.js 16 App Router** and utilizes **Supabase** as a fully managed Backend-as-a-Service (BaaS).

### Core Design Principles:
- **Route Groups for Separation of Concerns:** The Next.js app directory is split into `(admin)` and `(customer)`. This allows distinct layouts, metadata, and authentication boundaries without polluting the URL structure.
- **Atomic Database Transactions:** E-commerce carts often suffer from race conditions (overselling out-of-stock items). This project uses Supabase Postgres RPCs (Remote Procedure Calls) with `FOR UPDATE` row-level locks to deduct stock and create orders in a single, atomic transaction.
- **Secure File Handling:** Prescriptions are uploaded directly from the client to a private Supabase Storage bucket. The database only stores the secure reference URL.
- **Edge Security:** `src/proxy.ts` (Next.js Middleware) intercepts traffic to `/(admin)` routes, verifying the user's Supabase JWT before rendering the page.

---

## 📂 Folder Structure

The project is contained entirely within the `web/` directory. Here is the breakdown of the codebase to help you navigate:

```text
trust-hc/
└── web/
    ├── src/
    │   ├── app/
    │   │   ├── (admin)/             # PROTECTED: Staff Operations
    │   │   │   ├── inventory/       # Stock management & Add Product modal
    │   │   │   ├── orders/          # Online order fulfillment dashboard
    │   │   │   ├── pos/             # Point of Sale billing terminal
    │   │   │   └── layout.tsx       # Admin Sidebar & Auth wrapper
    │   │   │
    │   │   ├── (customer)/          # PUBLIC: E-Commerce Storefront
    │   │   │   ├── cart/            # Customer shopping cart
    │   │   │   ├── checkout/        # Checkout & Prescription upload flow
    │   │   │   ├── cart-store.ts    # Zustand logic for customer cart
    │   │   │   ├── page.tsx         # Product catalog
    │   │   │   └── layout.tsx       # Storefront Header/Footer
    │   │   │
    │   │   ├── login/               # Admin authentication page
    │   │   ├── layout.tsx           # Global Root Layout (Fonts & Globals)
    │   │   └── globals.css          # Tailwind CSS v4 variables
    │   │
    │   ├── components/              # Reusable UI Components
    │   │   └── ui/                  # Shadcn / Base UI generic elements (Buttons, Dialogs)
    │   │
    │   ├── lib/                     
    │   │   ├── supabase/            # Supabase Server & Client initialization
    │   │   └── utils.ts             # Tailwind class merging (cn)
    │   │
    │   ├── types/
    │   │   └── database.types.ts    # Auto-generated TypeScript types matching Postgres
    │   │
    │   └── proxy.ts                 # Next.js Middleware handling Route Protection
    │
    ├── supabase/
    │   └── migrations/              # SQL files for initializing tables & policies
    │
    ├── package.json                 # Project dependencies & scripts
    └── next.config.ts               # Next.js configuration
```

---

## 🗄️ Database Schema & RPCs

The PostgreSQL database is fully strictly typed. Below are the primary entities:

### 1. `products`
Stores the pharmacy's inventory.
- `id` (UUID, Primary Key)
- `name` (TEXT) - Name of the medicine
- `description` (TEXT)
- `price` (NUMERIC)
- `stock_quantity` (INTEGER)
- `requires_prescription` (BOOLEAN) - Flags if checkout requires an upload
- `is_active` (BOOLEAN) - Used for soft-deletes

### 2. `orders`
Represents a completed POS transaction or an online customer order.
- `id` (UUID, Primary Key)
- `customer_phone` (TEXT) - Used to track guest users
- `fulfillment_type` (ENUM: `delivery`, `pickup`, `in_store`)
- `status` (ENUM: `pending_review`, `confirmed`, `out_for_delivery`, `delivered`, `cancelled`)
- `delivery_address` (TEXT)
- `prescription_url` (TEXT) - Link to Supabase Storage

### 3. `order_items`
Line items for a specific order. Linked via `order_id` and `product_id`.

### Security (Row Level Security)
- **Products:** Viewable by everyone (`SELECT`). Modifiable only by Authenticated Admins.
- **Orders/Order Items:** Strictly viewable and modifiable only by Authenticated Admins. Customers do not query orders directly; they are handled securely via the backend.

---

## 🧠 State Management

We use **Zustand** for lightweight, fast state management. 

Because the Admin POS and the Customer Storefront serve entirely different purposes, **state is deliberately separated**:

1. **POS Cart (`src/app/(admin)/pos/cart-store.ts`)**
   - *Ephemeral:* This state is intentionally **not** persisted to `localStorage`. If the browser refreshes, the POS cart clears. This prevents accidentally billing the wrong customer during fast in-store operations.
2. **Customer Cart (`src/app/(customer)/cart-store.ts`)**
   - *Persistent:* This state uses Zustand's `persist` middleware to save the cart to the user's `localStorage`. Customers can leave the site and return days later to find their medicines still in the cart.

---

## 🛠️ Local Development Guide

### Prerequisites
- Node.js (v18+)
- A [Supabase](https://supabase.com/) Account

### 1. Clone & Install
```bash
git clone https://github.com/sohitdev/trust-hc.git
cd trust-hc/web
npm install
```

### 2. Supabase Setup
1. Create a new project on Supabase.
2. Go to the **SQL Editor** and execute the 3 migration files located in `web/supabase/migrations/` in sequential order:
   - `00000000000000_init.sql`
   - `00000000000001_orders.sql`
   - `00000000000002_phase3_additions.sql`
3. Go to **Authentication > Users** and create an Admin User (Ensure "Auto Confirm User?" is checked).

### 3. Environment Variables
Create a `web/.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<YOUR_PROJECT_ID>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_PUBLISHABLE_ANON_KEY>
```

### 4. Run the App
```bash
npm run dev --webpack
```
> **Note:** We explicitly use `--webpack` as Next.js 16's Turbopack is currently unstable with Tailwind CSS v4 in certain Node environments.

- **Customer Store:** [http://localhost:3000](http://localhost:3000)
- **Admin POS:** [http://localhost:3000/login](http://localhost:3000/login)

---

## 🐛 Troubleshooting

- **Login Button Doesn't Do Anything:** Ensure you are using the correct Node.js version. React 19 forms require `<form action={login}>` and `<button type="submit">`.
- **Database Error on Checkout:** Ensure you ran the RPC SQL files in Supabase. The Next.js app does not insert into `orders` directly; it calls the `process_customer_checkout` Postgres function.
- **Fonts look strange:** If `next/font/google` fails in your environment, the app gracefully falls back to native system fonts (`font-sans`).

---

## 🚀 Deployment

This project is optimized for deployment on **Vercel**.

1. Push your code to GitHub.
2. Import the repository in Vercel.
3. Set the **Framework Preset** to `Next.js`.
4. Set the **Root Directory** to `web`.
5. Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the Vercel Environment Variables.
6. Deploy!
