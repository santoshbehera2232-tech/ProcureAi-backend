# ProcureAI Enterprise Backend API

[![Render Service](https://img.shields.io/badge/Render-Live%20Production-brightgreen?style=for-the-badge&logo=render)](https://procureai-backend-1.onrender.com/api/health)
[![Health Status](https://img.shields.io/badge/Health%20Check-HTTP%20200%20OK-blue?style=for-the-badge)](https://procureai-backend-1.onrender.com/api/health)
[![Supabase Database](https://img.shields.io/badge/Database-Supabase%20Connected-3ECF8E?style=for-the-badge&logo=supabase)](https://oeunwfqixbfcxlgvfmow.supabase.co)

## 🌐 Production Deployed API

* **Live Base URL**: [`https://procureai-backend-1.onrender.com/api`](https://procureai-backend-1.onrender.com/api)
* **Health Check**: [`https://procureai-backend-1.onrender.com/api/health`](https://procureai-backend-1.onrender.com/api/health)

---

## ⚡ Quick Test (cURL)

```bash
# 1. Health Probe
curl -X GET https://procureai-backend-1.onrender.com/api/health

# 2. Login as Company Admin
curl -X POST https://procureai-backend-1.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@apexglobal.com", "password": "Password123!"}'

# 3. Login as Supplier Rep
curl -X POST https://procureai-backend-1.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "supplier1@titanalloys.com", "password": "Password123!", "is_supplier": true}'
```

---

## 🏗️ Architecture & Modules

* **Framework**: Node.js & Express (ES Modules)
* **Database**: PostgreSQL on Supabase (`@supabase/supabase-js`) with dual-mode fallback
* **Authentication**: JWT Access (24h) & Refresh Tokens (7d), Bcrypt password hashing
* **Document Generation**: PDFKit dynamic Purchase Order & Compliance Certificate stamping
* **AI Engine**: Multi-factor deterministic weighted quotation scoring with NLP explanation synthesis
* **Financial Verification**: AI 3-Way GST Matching (PO vs GRN vs Tax Invoice) with GSTIN validation

---

## 🔑 Demo Credentials

Default Password for all seed accounts: **`Password123!`**

| Role | Email |
| :--- | :--- |
| **Company Admin** | `admin@apexglobal.com` |
| **Procurement Manager** | `manager@apexglobal.com` |
| **Procurement Officer** | `officer@apexglobal.com` |
| **Finance Manager** | `finance@apexglobal.com` |
| **Warehouse Manager** | `warehouse@apexglobal.com` |
| **Supplier Admin** | `supplier1@titanalloys.com` |
