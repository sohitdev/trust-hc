# Trust Health.care — Pharmacy Management System
### Project Documentation

**Business:** Trust Health.care (Trust Healthcare Pvt Ltd)
**Type:** Single-location licensed pharmacy
**Audience:** Local society, up to ~5,000 people expected in the first 2–3 months
**Purpose of this document:** Single source of truth for scope, features, and phased build plan.

---

## 1. Project Summary

Trust Health.care currently runs on **Marg ERP** (paid software) for inventory and billing. This project replaces Marg entirely with a custom-built system that handles:

1. **Store operations** — inventory, batch/expiry tracking, in-store POS billing
2. **Customer-facing storefront** — online ordering, prescriptions, delivery/pickup

Both sides share the same product and stock data, so there is no double entry between an online system and an offline one.

**Explicit non-goals for now:**
- No GST-compliant invoicing (may be added later)
- No supplier/vendor dues tracking
- No multi-branch support (single location only)
- No native iOS/Android app (may be added later — web app built to support this eventually)
- No Marg data migration (starting fresh)
- No fixed cutover deadline or hosting/SMS budget ceiling has been set

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (TypeScript) |
| Frontend | Responsive web app — works on laptop and phone, website only (no native app) |
| Database | PostgreSQL (e.g. via Supabase) or similar relational DB |
| Auth (customers) | Phone number + OTP login |
| Auth (admin/staff) | Single shared admin login (no per-staff permission levels) |
| File storage | Prescription image/PDF uploads, access-controlled (not public URLs) |
| Payments (online) | Hosted payment gateway (e.g. Razorpay) for UPI, + Cash on Delivery option |
| Payments (in-store) | Cash, UPI, Card — card processed via external card machine, logged in system |
| Hosting | Vercel-class platform, sized for ~5k users over 2–3 months (no special scaling needed) |
| Notifications | Admin contacts customers directly via WhatsApp or phone call — no in-app messaging system |

**Design direction:** Simple, clean, minimal UI. Restrained color palette, clear typography, generous whitespace, no unnecessary decoration. Fast to scan — important for order status, stock, and billing screens.

**Security requirements (apply throughout):**
- HTTPS everywhere
- Secrets/API keys in environment variables only
- OTP rate-limiting (prevent SMS spam and brute-force)
- Session tokens with reasonable expiry
- Admin routes protected server-side, not just hidden in UI
- Server-side validation on all forms (not just client-side)
- File upload validation (type/size, not just trusting file extension)
- No raw card handling — hosted checkout only
- Payment webhook signature verification (never trust client-side "payment successful")
- Regular database backups
- Dependencies kept up to date

---

## 3. Business Details

- **Store hours:** 10:00–14:00, then 16:00–23:00 (split shift)
- **License number / registered address:** placeholder for now, to be added later
- **Delivery:** free (no delivery charge)
- **Minimum order amount:** ₹200
- **Fulfillment options:** delivery (by admin/pharmacy staff, no courier service) and in-store pickup
- **Payment methods (online):** UPI/online payment + Cash on Delivery
- **Payment methods (in-store):** Cash, UPI, Card
- **Staff:** max 4 people using the admin/POS side day-to-day, always present when billing/updating stock
- **Domain name:** not chosen yet

---

## 4. Data Model (Phase 1 core)

### Product
- Name
- Category (e.g. tablets, syrups, supplements, personal care)
- Price
- MRP
- Batch number
- Expiry date
- Stock quantity
- Low-stock alert threshold (**set per product**, not a global default)
- Prescription-required flag (Rx / OTC)
- Active / inactive (soft-delete — inactive items keep historical order references intact)

**Out-of-stock rule:** A product with 0 stock is still shown in the catalog, marked "Out of stock," with ordering disabled. It automatically becomes orderable again the moment stock is updated — no separate manual toggle.

### Order
- Customer (linked via phone/OTP account)
- Items + quantities
- Fulfillment type: Delivery or Pickup
- Payment method: UPI / COD / (in-store: Cash, UPI, Card)
- Status (see flows below)
- Prescription attachment(s), if applicable
- Delivery address (if delivery) or left blank (if pickup)

### Customer
- Phone number (OTP-verified identity)
- Order history
- Saved prescriptions (for refill convenience)

---

## 5. Order Status Flows

**Every order** (Rx or not) goes through a review step before confirmation, since prescription review happens after ordering, not before checkout:

```
Placed → Pending Review (staff checks any attached prescription) → Confirmed
```

**Then, depending on fulfillment type:**

**Delivery:**
```
Confirmed → Assigned to [staff] → Out for delivery → Delivered
```

**Pickup:**
```
Confirmed → Ready for pickup → Picked up
```

If a prescription is rejected or needs re-upload, the order stays in Pending Review until resolved — admin contacts the customer directly via WhatsApp/call to sort it out.

---

## 6. Feature Scope by Phase

### Phase 1 — Store Operations (replace Marg)
- Product/inventory management: add, update, remove (soft-delete) medicines
- Batch number and expiry date tracking per product
- Per-product low-stock threshold + alert for admin
- In-store POS billing:
  - Manual product search/select (no barcode scanner)
  - Accepts Cash, UPI, Card (card handled by external machine, just logged here)
  - Simple on-screen/printable receipt (no dedicated printer integration)
- Works as a responsive website on laptop and phone
- Single shared admin login

### Phase 2 — Customer-Facing Storefront
- Product catalog with categories, search, and out-of-stock handling
- Cart and checkout
  - Fulfillment choice: delivery or pickup
  - Minimum order ₹200, free delivery
  - Payment: UPI/online or Cash on Delivery
- Phone/OTP customer login and accounts
- Order history and status tracking for customers

### Phase 3 — Prescription Workflow & Order Management Refinement
- Prescription upload during checkout (image/PDF)
- Admin review/approval screen for prescriptions, post-order, pre-dispatch
- Order assignment to staff for delivery, or marking ready for pickup
- Admin dashboard: unified view of orders, filterable by status and fulfillment type
- Direct contact shortcuts (tap-to-call / tap-to-WhatsApp) on each order for admin

---

## 7. Marg ERP — Integration Notes (for future reference)

Not needed for Phase 1 (starting fresh), but documented in case data migration becomes relevant later:

- **Marg API Gateway** (paid add-on): live access to stock, orders, invoices, outstandings. Roughly ₹11,000 one-time setup + per-branch fees — not needed since this is a single location, but pricing should be reconfirmed directly with Marg if pursued later.
- **Product Export** (free, built-in): `Reports → Management Report → Utilities → Data Import/Export → Product Export` — generates a product/stock file for manual/periodic import.
- **ERP Bridger** (free, built-in): import/export in XLS, CSV, DBF, or XML formats.

---

## 8. Open Items (not blocking, to revisit)

- Whether basic tax calculation on sales is needed for internal records
- Supplier/vendor dues tracking — currently out of scope
- Timeline for full cutover from Marg — none fixed
- Hosting/SMS/payment gateway budget — no ceiling set
- Domain name selection
- License number and registered address (currently placeholders)
- Whether Marg ERP API/export access is actually enabled on the pharmacy's current plan

---

## 9. Explicit Decisions Log

Quick-reference list of firm decisions made during planning, in case any of the above sections are revised later:

- Single pharmacy, single location, no multi-branch logic
- Full replacement of Marg ERP, not a bolt-on website
- Fresh start, no data migration for now
- No GST invoicing for now
- No supplier/dues tracking
- Staff always present for billing/stock updates; no barcode scanner
- Simple printable receipts, no printer hardware integration
- Max 4 staff, single shared admin login, no role-based permissions
- Admin contacts customers directly (WhatsApp/call), no in-app messaging
- Free delivery, ₹200 minimum order
- Web-only for now, responsive on laptop and phone; native app is a possible future phase
- TypeScript + Next.js, simple/clean/minimal UI, security treated as a first-class requirement
