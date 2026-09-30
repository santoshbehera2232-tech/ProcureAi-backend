# ProcureAI — Enterprise AI-Powered Procurement & Supplier Management Platform

[![Frontend Live Web App](https://img.shields.io/badge/Vercel-Frontend%20Live-black?style=for-the-badge&logo=vercel)](https://procure-ai-frontend-seven.vercel.app/login)
[![Backend Live API](https://img.shields.io/badge/Render-Backend%20Live-brightgreen?style=for-the-badge&logo=render)](https://procureai-backend-1.onrender.com/api/health)
[![API Health Check](https://img.shields.io/badge/Health%20Check-HTTP%20200%20OK-blue?style=for-the-badge)](https://procureai-backend-1.onrender.com/api/health)
[![Supabase Database](https://img.shields.io/badge/Database-Supabase%20Connected-3ECF8E?style=for-the-badge&logo=supabase)](https://oeunwfqixbfcxlgvfmow.supabase.co)

> 🌐 **Live Production Deployments**:  
> * **Frontend Application**: [`https://procure-ai-frontend-seven.vercel.app/login`](https://procure-ai-frontend-seven.vercel.app/login)  
> * **Backend REST API**: [`https://procureai-backend-1.onrender.com/api`](https://procureai-backend-1.onrender.com/api)  
> * **API Health Probe**: [`https://procureai-backend-1.onrender.com/api/health`](https://procureai-backend-1.onrender.com/api/health)

ProcureAI is a production-grade, multi-tenant enterprise SaaS platform engineered for companies that purchase raw materials, industrial components, equipment, and services across global supply chains.

It features complete multi-criteria algorithmic quotation evaluation, transparent AI recommendation synthesis, automated Purchase Order lifecycles with PDF generation, live carrier shipment tracking, Goods Receipt (GRN) quality inspection, GST invoice 3-way matching, price spike anomaly alerts, and immutable audit logs.

---

## 🌟 Key Capabilities & Architectural Highlights

1. **Multi-Tenant Architecture & Governance**
   - Full data isolation across organizations with schema foreign-key constraints.
   - Fine-grained Role-Based Access Control (RBAC): Super Admin, Company Admin, Procurement Manager, Procurement Officer, Finance Manager, Warehouse Manager, and Supplier Admin.

2. **AI & Deterministic Quotation Scoring Engine**
   - Eliminates black-box AI by combining deterministic multi-factor formulas with transparent AI narrative synthesis.
   - Weighted breakdown: **Price (40%)**, **Delivery Speed (20%)**, **Supplier Reliability (20%)**, **Quality/Low-Defect Rate (15%)**, and **Commercial Terms (5%)** (fully configurable in Settings).
   - Generates transparent Pros, Cons, and Risk Indicators (e.g. delivery date proximity, past rejection rates).

3. **Complete Procure-to-Pay (P2P) Lifecycle**
   - **Purchase Requirement**: Requisitions with bill of materials, department budgeting, and approval gates.
   - **RFQ Solicitations**: Competitive bidding with deadlines and multi-vendor invitations.
   - **Quotation Matrix**: Side-by-side comparison with instant AI analysis.
   - **Purchase Order (PO)**: Sequential numbering (`PO-2026-XXXX`), dynamic stamped PDF generation (`PDFKit`), and vendor acknowledgement.
   - **Shipment Tracking**: Carrier integration, tracking IDs, waypoint location updates.
   - **Goods Receipt Note (GRN)**: Receiving inspection, acceptance vs defect rejection logging, and automatic supplier score recalculation.
   - **GST Invoices & AI 3-Way Matching**: Compares PO Amount vs GRN Received Qty vs Invoice Taxable Amount, validates 15-character GSTIN format, and verifies 18% GST math.
   - **Price Spike Anomaly Detection**: Flags price variances (+27.4% on Aluminum 6061) against historical cost benchmarks.
   - **Immutable Audit Logging**: Immutable logs recording user, action, entity, IP address, and timestamps.
   - **Dedicated Vendor Portal**: Self-service interface for suppliers to quote, acknowledge POs, dispatch consignments, and upload tax invoices.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite, React Router 7, Tailwind CSS, Lucide Icons, Modern Glassmorphism Design System.
- **Backend**: Node.js, Express.js (MVC + Service Layer Architecture), JWT (Access & Refresh tokens), BcryptJS, PDFKit, Helmet, CORS, Rate Limiting.
- **Database / Supabase**: PostgreSQL, UUID keys, `@supabase/supabase-js`, full SQL migration scripts with zero-error local persistence adapter fallback for immediate local testing and deployment resilience.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+ or v24+)
- npm

### 2. Installation

```bash
# Clone the repository
git clone <repo-url>
cd Tiitans

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

Backend configuration (`backend/.env`):
```env
PORT=5000
NODE_ENV=development

# SUPABASE CONFIGURATION
# Set your Supabase URL & service role key. If left blank, the app will run seamlessly
# using its resilient built-in local persistence engine with full seed dataset!
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# JWT SECRETS
JWT_SECRET=procureai_enterprise_super_secret_jwt_key_2026_x99!
JWT_REFRESH_SECRET=procureai_enterprise_refresh_token_secret_key_2026_z88!
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

Frontend configuration (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Running the Application

### Development Mode

In terminal 1 (Backend):
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Client starts on http://localhost:5173
```

### Production Build & Verification

```bash
# Run backend test suite
cd backend
npm test

# Build frontend production bundle
cd ../frontend
npm run build
```

---

## 🗄️ Supabase Database Setup & Migrations

The database schema is fully defined in the `supabase/` folder:

1. **`supabase/migrations/01_initial_schema.sql`**:
   - Creates all tables: `organizations`, `users`, `departments`, `suppliers`, `supplier_users`, `products`, `product_categories`, `purchase_requirements`, `rfqs`, `quotations`, `quotation_scores`, `purchase_orders`, `shipments`, `goods_receipts`, `invoices`, `documents`, `notifications`, `audit_logs`, `price_anomalies`, `ai_insights`.
   - Adds indexes, foreign key cascades, and check constraints.

2. **`supabase/migrations/02_seed_data.sql`**:
   - Seeds realistic data for demonstration: Apex Global Manufacturing Corp, departments, suppliers (Titan Alloys, Vertex Precision, ElectroTech), products, requirements, open RFQs, competing quotations, POs, shipments, GRNs, and invoices.

To execute on your Supabase project:
1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Run `01_initial_schema.sql`, then run `02_seed_data.sql`.
3. Add your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `backend/.env`.

---

## 🔑 Demo Login Accounts

All seed accounts use the default password: **`Password123!`**

| Persona | Email | Portal | Responsibilities |
|---|---|---|---|
| **Company Admin** | `admin@apexglobal.com` | Enterprise | Full organization governance, settings, user management |
| **Procurement Manager** | `manager@apexglobal.com` | Enterprise | Approves requirements, creates RFQs, awards quotes, generates POs |
| **Procurement Officer** | `officer@apexglobal.com` | Enterprise | Creates purchase requirements, monitors RFQs |
| **Finance Manager** | `finance@apexglobal.com` | Enterprise | Reviews invoices, checks AI 3-way matches, executes payment approvals |
| **Warehouse Manager** | `warehouse@apexglobal.com` | Enterprise | Quality inspection, creates Goods Receipt Notes (GRN) |
| **Supplier Admin** | `supplier1@titanalloys.com` | Supplier Portal | Submits binding quotes, acknowledges POs, dispatches shipments |

*Tip: The login page and dashboard top navigation bar both feature a **1-Click Demo Persona Switcher** for instant testing without manual typing!*

---

## 📡 RESTful API Reference

All endpoints return standardized JSON:
```json
{
  "success": true,
  "message": "Quotation submitted successfully",
  "data": {}
}
```

### Core API Endpoints

- **Auth**:
  - `POST /api/auth/register` - Create organization & initial admin account
  - `POST /api/auth/login` - Secure login (supports enterprise users & supplier accounts)
  - `POST /api/auth/refresh` - Refresh JWT access token
  - `GET /api/auth/me` - Current session profile

- **Requirements & RFQs**:
  - `GET /api/purchase-requirements` - List purchase requirements
  - `POST /api/purchase-requirements` - Create new requirement with bill of materials
  - `PATCH /api/purchase-requirements/:id/status` - Approve or reject requirement
  - `GET /api/rfqs` - List RFQs
  - `POST /api/rfqs` - Create RFQ and invite multiple suppliers

- **Quotations & AI Engine**:
  - `GET /api/quotations` - List submitted quotations
  - `POST /api/quotations` - Submit quotation with auto tax/total computation
  - `GET /api/quotations/compare/:rfqId` - AI Multi-Factor analysis & ranking
  - `POST /api/quotations/:id/award` - Award quotation

- **Purchase Orders & Logistics**:
  - `GET /api/purchase-orders` - List purchase orders
  - `POST /api/purchase-orders/create-from-quotation` - Automatically generate PO from awarded quote
  - `GET /api/purchase-orders/:id/pdf` - Download stamped PDF
  - `POST /api/purchase-orders/:id/acknowledge` - Vendor PO acknowledgement
  - `POST /api/shipments` - Dispatch shipment with carrier tracking
  - `POST /api/deliveries` - Register GRN & quality inspection

- **Finance & Compliance**:
  - `POST /api/invoices` - Upload GST invoice and run AI 3-Way Parity Match
  - `POST /api/invoices/:id/approve` - Finance approval
  - `GET /api/anomalies` - Price variance alerts
  - `GET /api/analytics` - Sourcing and savings metrics
  - `GET /api/audit-logs` - Immutable governance trail
