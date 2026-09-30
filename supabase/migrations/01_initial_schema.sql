-- ====================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR ENTERPRISE AI-POWERED PROCUREMENT SYSTEM
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean drop if refreshing (optional, disabled by default)
-- DROP SCHEMA public CASCADE; CREATE SCHEMA public;

-- 1. ORGANIZATIONS (Multi-Tenant Root)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    gstin VARCHAR(20),
    pan VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    currency VARCHAR(10) DEFAULT 'INR',
    scoring_weights JSONB DEFAULT '{"price": 40, "delivery": 20, "reliability": 20, "quality": 15, "commercial": 5}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ROLES
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    budget NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'Procurement Officer',
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    supplier_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    contact_person VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    gstin VARCHAR(20),
    pan VARCHAR(20),
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(100),
    ifsc_code VARCHAR(50),
    categories JSONB DEFAULT '[]'::jsonb,
    payment_terms VARCHAR(100) DEFAULT 'Net 30 Days',
    status VARCHAR(50) DEFAULT 'Active', -- Pending, Active, Suspended, Blacklisted, Inactive
    on_time_delivery_rate NUMERIC(5, 2) DEFAULT 95.00,
    quality_acceptance_rate NUMERIC(5, 2) DEFAULT 96.50,
    rejection_rate NUMERIC(5, 2) DEFAULT 3.50,
    reliability_score NUMERIC(5, 2) DEFAULT 92.00,
    total_orders_completed INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, supplier_code)
);

-- 6. SUPPLIER USERS (For Supplier Portal access)
CREATE TABLE IF NOT EXISTS supplier_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'Supplier Admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRODUCT CATEGORIES
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    description TEXT,
    unit VARCHAR(50) DEFAULT 'Nos', -- Nos, Kg, Ton, Meters, Liters
    hsn_code VARCHAR(20),
    standard_price NUMERIC(15, 2) DEFAULT 0.00,
    min_order_qty NUMERIC(10, 2) DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, sku)
);

-- 9. PURCHASE REQUIREMENTS
CREATE TABLE IF NOT EXISTS purchase_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    requirement_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    priority VARCHAR(50) DEFAULT 'Medium', -- Low, Medium, High, Urgent
    required_date DATE NOT NULL,
    delivery_location TEXT,
    budget NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Submitted, Under Review, Approved, Rejected, RFQ Created, Completed, Cancelled
    notes TEXT,
    technical_specs TEXT,
    approval_comments TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, requirement_number)
);

-- 10. PURCHASE REQUIREMENT ITEMS
CREATE TABLE IF NOT EXISTS purchase_requirement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID NOT NULL REFERENCES purchase_requirements(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    description TEXT,
    quantity NUMERIC(12, 2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'Nos',
    estimated_unit_price NUMERIC(15, 2) DEFAULT 0.00,
    total_estimated_price NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. REQUEST FOR QUOTATIONS (RFQs)
CREATE TABLE IF NOT EXISTS rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES purchase_requirements(id) ON DELETE SET NULL,
    rfq_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_delivery_date DATE NOT NULL,
    submission_deadline TIMESTAMPTZ NOT NULL,
    delivery_location TEXT,
    payment_terms VARCHAR(100) DEFAULT 'Net 30 Days',
    status VARCHAR(50) DEFAULT 'Published', -- Draft, Published, Open, Closing Soon, Closed, Under Evaluation, Awarded, Cancelled
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, rfq_number)
);

-- 12. RFQ ITEMS
CREATE TABLE IF NOT EXISTS rfq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    description TEXT,
    quantity NUMERIC(12, 2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'Nos',
    specifications TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. RFQ SUPPLIERS (Invited Suppliers)
CREATE TABLE IF NOT EXISTS rfq_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Invited', -- Invited, Viewed, Quoted, Declined
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    viewed_at TIMESTAMPTZ,
    UNIQUE(rfq_id, supplier_id)
);

-- 14. SUPPLIER QUOTATIONS
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    quotation_number VARCHAR(50) NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(15, 2) DEFAULT 0.00,
    taxable_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    gst_amount NUMERIC(15, 2) DEFAULT 0.00,
    freight_charges NUMERIC(15, 2) DEFAULT 0.00,
    other_charges NUMERIC(15, 2) DEFAULT 0.00,
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    lead_time_days INT NOT NULL DEFAULT 7,
    promised_delivery_date DATE,
    payment_terms VARCHAR(100) DEFAULT 'Net 30 Days',
    warranty_months INT DEFAULT 12,
    valid_until DATE NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Submitted', -- Draft, Submitted, Under Evaluation, Awarded, Rejected, Expired
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, quotation_number)
);

-- 15. QUOTATION ITEMS
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    rfq_item_id UUID REFERENCES rfq_items(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    taxable_amount NUMERIC(15, 2) NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. QUOTATION SCORES & AI COMPARISON
CREATE TABLE IF NOT EXISTS quotation_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    price_score NUMERIC(5, 2) NOT NULL,
    delivery_score NUMERIC(5, 2) NOT NULL,
    reliability_score NUMERIC(5, 2) NOT NULL,
    quality_score NUMERIC(5, 2) NOT NULL,
    commercial_score NUMERIC(5, 2) NOT NULL,
    weighted_score NUMERIC(5, 2) NOT NULL,
    ai_recommendation_status VARCHAR(50), -- Recommended, Competitive, High Risk, Rejected
    ai_summary TEXT,
    scoring_breakdown JSONB,
    risk_factors JSONB DEFAULT '[]'::jsonb,
    pros JSONB DEFAULT '[]'::jsonb,
    cons JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(quotation_id)
);

-- 17. PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    po_number VARCHAR(50) NOT NULL,
    rfq_id UUID REFERENCES rfqs(id) ON DELETE SET NULL,
    quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    freight_amount NUMERIC(15, 2) DEFAULT 0.00,
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    delivery_address TEXT NOT NULL,
    expected_delivery_date DATE NOT NULL,
    payment_terms VARCHAR(100) DEFAULT 'Net 30 Days',
    warranty_terms TEXT,
    terms_conditions TEXT,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Pending Approval, Approved, Sent, Acknowledged, In Transit, Partially Delivered, Delivered, Completed, Cancelled
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, po_number)
);

-- 18. PURCHASE ORDER ITEMS
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    quantity_ordered NUMERIC(12, 2) NOT NULL,
    quantity_shipped NUMERIC(12, 2) DEFAULT 0.00,
    quantity_received NUMERIC(12, 2) DEFAULT 0.00,
    quantity_accepted NUMERIC(12, 2) DEFAULT 0.00,
    quantity_rejected NUMERIC(12, 2) DEFAULT 0.00,
    unit_price NUMERIC(15, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    total_amount NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. SHIPMENTS (Logistics Tracking)
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    shipment_number VARCHAR(50) NOT NULL,
    carrier_name VARCHAR(100) NOT NULL,
    tracking_number VARCHAR(100),
    dispatch_date DATE NOT NULL,
    expected_delivery_date DATE NOT NULL,
    actual_delivery_date DATE,
    current_location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Preparing', -- Preparing, Dispatched, In Transit, Out for Delivery, Delivered, Delayed, Cancelled
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, shipment_number)
);

-- 20. GOODS RECEIPTS (GRN - Delivery Receiving & Inspection)
CREATE TABLE IF NOT EXISTS goods_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    grn_number VARCHAR(50) NOT NULL,
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    received_date DATE NOT NULL,
    received_by UUID REFERENCES users(id) ON DELETE SET NULL,
    total_received_qty NUMERIC(12, 2) NOT NULL,
    total_accepted_qty NUMERIC(12, 2) NOT NULL,
    total_rejected_qty NUMERIC(12, 2) DEFAULT 0.00,
    total_damaged_qty NUMERIC(12, 2) DEFAULT 0.00,
    quality_result VARCHAR(50) DEFAULT 'Passed', -- Passed, Conditionally Passed, Rejected
    inspection_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, grn_number)
);

-- 21. GST INVOICES & AI VERIFICATION
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    grn_id UUID REFERENCES goods_receipts(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL,
    supplier_gstin VARCHAR(20) NOT NULL,
    buyer_gstin VARCHAR(20) NOT NULL,
    taxable_amount NUMERIC(15, 2) NOT NULL,
    cgst_amount NUMERIC(15, 2) DEFAULT 0.00,
    sgst_amount NUMERIC(15, 2) DEFAULT 0.00,
    igst_amount NUMERIC(15, 2) DEFAULT 0.00,
    total_gst NUMERIC(15, 2) NOT NULL,
    grand_total NUMERIC(15, 2) NOT NULL,
    file_url TEXT,
    verification_status VARCHAR(50) DEFAULT 'Pending Review', -- Verified, Needs Review, Mismatch, Rejected
    verification_details JSONB DEFAULT '{}'::jsonb, -- 3-way matching check results
    finance_approved BOOLEAN DEFAULT FALSE,
    finance_approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    finance_approved_at TIMESTAMPTZ,
    payment_status VARCHAR(50) DEFAULT 'Unpaid', -- Unpaid, Processing, Paid
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, invoice_number)
);

-- 22. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Quotation, Purchase Order, Invoice, Contract, Quality Report, Certificate
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INT,
    file_type VARCHAR(100),
    related_entity_type VARCHAR(50), -- PO, RFQ, Supplier, Invoice
    related_entity_id UUID,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- RFQ, Quotation, PO, Delivery, Anomaly, Invoice
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. AUDIT LOGS (Immutable Actions)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, APPROVE, REJECT, VERIFY, DOWNLOAD
    entity VARCHAR(100) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. PRICE HISTORY & ANOMALIES
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    po_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    current_price NUMERIC(15, 2) NOT NULL,
    historical_benchmark_price NUMERIC(15, 2) NOT NULL,
    variance_percentage NUMERIC(6, 2) NOT NULL,
    severity VARCHAR(20) DEFAULT 'Medium', -- Low, Medium, High, Critical
    alert_message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. AI INSIGHTS
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- Supplier, Cost, Risk, Inventory
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    metrics JSONB DEFAULT '{}'::jsonb,
    action_item TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast queries and isolation
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_org ON suppliers(organization_id);
CREATE INDEX IF NOT EXISTS idx_req_org ON purchase_requirements(organization_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_org ON rfqs(organization_id);
CREATE INDEX IF NOT EXISTS idx_quotations_rfq ON quotations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_pos_org ON purchase_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_po ON invoices(po_id);
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
