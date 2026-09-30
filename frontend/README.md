# ProcureAI — Enterprise Frontend Application

[![Frontend Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed%20Live-black?style=for-the-badge&logo=vercel)](https://procure-ai-frontend-seven.vercel.app/login)
[![Backend API Status](https://img.shields.io/badge/Render-Backend%20Live-brightgreen?style=for-the-badge&logo=render)](https://procureai-backend-1.onrender.com/api/health)
[![React 18](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

---

## 🌐 Production Live Deployments

* **Live Frontend Web Application**:  
  👉 **[`https://procure-ai-frontend-seven.vercel.app/login`](https://procure-ai-frontend-seven.vercel.app/login)**
* **Live Backend REST API**:  
  👉 **[`https://procureai-backend-1.onrender.com/api`](https://procureai-backend-1.onrender.com/api)**

---

## 🔑 Demo Login Personas

Default Password for all demonstration accounts: **`Password123!`**

| Persona | Email | Access Scope |
| :--- | :--- | :--- |
| **Company Admin** | `admin@apexglobal.com` | Full enterprise procurement governance & user roles |
| **Procurement Manager** | `manager@apexglobal.com` | Requirement approvals, RFQ publication, PO issuance |
| **Procurement Officer** | `officer@apexglobal.com` | Requisitions, supplier communications, RFQ creation |
| **Finance Manager** | `finance@apexglobal.com` | AI 3-Way match review, invoice clearance & payment approval |
| **Warehouse Manager** | `warehouse@apexglobal.com` | Consignment receiving & Goods Receipt (GRN) QA inspection |
| **Supplier Admin** | `supplier1@titanalloys.com` | Vendor Portal (bidding, PO acknowledgment, shipments) |

> 💡 *The login screen and top navigation bar include a **1-Click Demo Persona Switcher** for instant testing without manual credential entry.*

---

## 📦 Core Features

1. **AI Quotation Evaluation & Comparison Matrix**:
   - Algorithmic multi-criteria weighted scoring (Price, Delivery Speed, Reliability, Quality, Terms).
   - Side-by-side bid comparison with transparent AI recommendation summaries and risk alerts.
2. **Purchase Order Lifecycle & Stamped PDF Generation**:
   - Automatic PO generation from awarded quotation with one-click enterprise PDF download.
3. **Goods Receipt (GRN) Quality Inspection**:
   - Physical parcel intake, acceptance vs defect rejection logging, and automatic vendor KPI updates.
4. **GST Tax Invoice 3-Way Matching**:
   - 3-Pillar cross-check (PO vs GRN vs Tax Invoice) with GSTIN checksum validation and automated debit note recommendations.
5. **Real-time Anomaly Detection & Spend Analytics**:
   - Price spike detection exceeding historical catalog benchmarks, category spend breakdowns, and monthly trends.
6. **Dedicated Self-Service Supplier Portal**:
   - Vendor interface for quotation submission, order acknowledgement, and dispatch tracking.

---

## 🛠️ Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (.env)
cp .env.example .env

# 3. Start local development server
npm run dev
# App starts on http://localhost:5173
```

---

## 🚀 Vercel Deployment

This project includes [`vercel.json`](./vercel.json) configured for Single Page Application (SPA) client-side routing rewrites so all deep links and browser refreshes work smoothly.

In your Vercel Project Settings:
* **Framework Preset**: `Vite`
* **Root Directory**: `frontend` (or `./`)
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Environment Variables**:
  * `VITE_API_URL` = `https://procureai-backend-1.onrender.com/api`
  * `VITE_SUPABASE_URL` = `https://oeunwfqixbfcxlgvfmow.supabase.co`
  * `VITE_SUPABASE_ANON_KEY` = `sb_publishable_lD88AE61Z01nw98TTeFMug_mbrrXs66`
