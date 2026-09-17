# Trust Health.care

A modern, production-ready Pharmacy Management System and Customer Storefront built with Next.js, Tailwind CSS, and Supabase. 

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=flat&logo=typescript)

## 🏥 Overview

Trust Health.care bridges the gap between physical store operations and online customer sales. It provides a unified database and interface for managing inventory, processing walk-in POS (Point of Sale) billing, and handling online prescription orders.

### Core Modules
1. **Customer Storefront:** Public-facing catalog where users can browse medicines, add them to their cart, and securely check out. Requires prescription file uploads for restricted medications.
2. **Admin POS (Point of Sale):** A fast, keyboard-friendly billing interface for in-store walk-ins, fully integrated with real-time inventory.
3. **Inventory Management:** Dashboard to create, track, and soft-delete pharmaceutical stock.
4. **Order Management:** A unified dashboard for admins to process online orders, verify uploaded prescriptions, and update fulfillment statuses (Pending, Confirmed, Out for Delivery, etc.).

## 🏗️ Tech Stack & Architecture

* **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Base UI (headless components).
* **Backend / Database:** Supabase (PostgreSQL).
* **State Management:** Zustand (for persistent Customer Carts and ephemeral POS Carts).
* **Authentication:** Supabase Auth (Email/Password for Admin).
* **Storage:** Supabase Storage (for secure prescription uploads).

**Key Engineering Decisions:**
* **Atomic Transactions:** Checkout processes (both POS and Online) utilize custom PostgreSQL RPC (Remote Procedure Call) functions to lock rows (`FOR UPDATE`) and deduct stock atomically. This prevents race conditions and overselling.
* **Row Level Security (RLS):** Strict database policies ensure that only authenticated Admins can modify inventory or view sensitive customer orders.
* **Optimized Routing:** The application uses Next.js Server Actions and `proxy.ts` (formerly middleware) to securely route users and protect the `/(admin)` directories.

---

## 🚀 Local Development Setup

### Prerequisites
* Node.js (v18 or higher)
* A [Supabase](https://supabase.com/) account and project.

### 1. Clone the repository
```bash
git clone https://github.com/sohitdev/trust-hc.git
cd trust-hc/web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the `web` directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key
```

### 4. Database Setup (Supabase)
Navigate to the **SQL Editor** in your Supabase Dashboard and run the migration files located in `web/supabase/migrations/` in the following order:
1. `00000000000000_init.sql` *(Creates the products table and RLS)*
2. `00000000000001_orders.sql` *(Creates orders, order_items, and POS checkout RPC)*
3. `00000000000002_phase3_additions.sql` *(Creates storage buckets and online checkout RPC)*

### 5. Create an Admin Account
To access the POS and Inventory systems, you must create a user in your Supabase Dashboard:
1. Go to **Authentication** > **Users** > **Add User**.
2. Enter an email and password.
3. Ensure **Auto Confirm User?** is checked.

### 6. Start the Development Server
```bash
npm run dev --webpack
```
* **Storefront:** [http://localhost:3000](http://localhost:3000)
* **Admin Login:** [http://localhost:3000/login](http://localhost:3000/login)

---

## 🔒 Security & Data Privacy

* **Prescriptions:** Uploaded to a private Supabase Storage bucket. They are strictly inaccessible to the public and can only be fetched securely via signed URLs or directly by authenticated Admin sessions.
* **Soft Deletes:** Products are never permanently deleted from the database to preserve historical order integrity. They are marked as `is_active = false`.

## 📜 License

Copyright © Trust Healthcare Pvt Ltd. All rights reserved.
