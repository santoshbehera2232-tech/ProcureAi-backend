-- ====================================================================
-- SEED DATA FOR ENTERPRISE AI-POWERED PROCUREMENT SYSTEM
-- Default login password for all seed accounts: Password123!
-- (Bcrypt hash: $2a$10$wE99L1Y3uL0vS7WkJL1H1e7tA/9e1eZ5fOqu5W5E6Q4mZk3o7K4x2 or standard test hash)
-- ====================================================================

-- 1. Insert Demo Organization
INSERT INTO organizations (id, name, legal_name, gstin, pan, email, phone, address, currency)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Apex Global Manufacturing Corp',
    'Apex Global Manufacturing Private Limited',
    '27AAACA1234A1Z5',
    'AAACA1234A',
    'procurement@apexglobal.com',
    '+91-22-67890123',
    'Plot 42, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093',
    'INR'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Departments
INSERT INTO departments (id, organization_id, name, code, budget)
VALUES 
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Mechanical & Fabrication', 'MECH-01', 5000000.00),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Electronics & Automation', 'ELEC-02', 3500000.00),
('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Plant Operations & MRO', 'OPS-03', 2000000.00)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Users (Password: Password123!)
-- Hash generated for "Password123!" using bcryptjs
INSERT INTO users (id, organization_id, department_id, email, password_hash, full_name, phone, role)
VALUES 
('u0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'admin@apexglobal.com', '$2a$10$lU72l3F2uH0N5i2LzIeeSu38eTfG9m82E7r4pM9Qp2kE2/ZfX9Z7a', 'Vikram Malhotra', '+91-9820011223', 'Company Admin'),
('u0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'manager@apexglobal.com', '$2a$10$lU72l3F2uH0N5i2LzIeeSu38eTfG9m82E7r4pM9Qp2kE2/ZfX9Z7a', 'Priya Sharma', '+91-9820022334', 'Procurement Manager'),
('u0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'officer@apexglobal.com', '$2a$10$lU72l3F2uH0N5i2LzIeeSu38eTfG9m82E7r4pM9Qp2kE2/ZfX9Z7a', 'Rahul Verma', '+91-9820033445', 'Procurement Officer'),
('u0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'finance@apexglobal.com', '$2a$10$lU72l3F2uH0N5i2LzIeeSu38eTfG9m82E7r4pM9Qp2kE2/ZfX9Z7a', 'Anita Desai', '+91-9820044556', 'Finance Manager'),
('u0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'warehouse@apexglobal.com', '$2a$10$lU72l3F2uH0N5i2LzIeeSu38eTfG9m82E7r4pM9Qp2kE2/ZfX9Z7a', 'Karan Patel', '+91-9820055667', 'Warehouse Manager')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Suppliers
INSERT INTO suppliers (id, organization_id, supplier_code, name, contact_person, email, phone, city, state, gstin, pan, payment_terms, status, on_time_delivery_rate, quality_acceptance_rate, rejection_rate, reliability_score, total_orders_completed)
VALUES 
('s0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'SUP-001', 'Titan Alloys & Steels Ltd', 'Rajesh Kulkarni', 'sales@titanalloys.com', '+91-9833012345', 'Pune', 'Maharashtra', '27AABCT8899C1Z1', 'AABCT8899C', 'Net 30 Days', 'Active', 96.50, 98.20, 1.80, 94.50, 48),
('s0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'SUP-002', 'Vertex Precision Components', 'Sneha Iyer', 'orders@vertexprecision.com', '+91-9844023456', 'Bengaluru', 'Karnataka', '29AADCV7766D1Z2', 'AADCV7766D', 'Net 45 Days', 'Active', 89.20, 93.80, 6.20, 86.00, 32),
('s0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'SUP-003', 'ElectroTech Global Solutions', 'Arun Nair', 'contact@electrotech.com', '+91-9855034567', 'Chennai', 'Tamil Nadu', '33AAECE5544E1Z3', 'AAECE5544E', 'Net 30 Days', 'Active', 98.00, 99.10, 0.90, 97.20, 64),
('s0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'SUP-004', 'Nova Polymers & Lubricants', 'Amit Bansal', 'sales@novapolymers.com', '+91-9866045678', 'Ahmedabad', 'Gujarat', '24AAACN1122N1Z4', 'AAACN1122N', 'Net 15 Days', 'Active', 92.40, 95.50, 4.50, 90.00, 26)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Supplier Users (for Supplier Portal)
INSERT INTO supplier_users (id, supplier_id, email, password_hash, full_name, phone, role)
VALUES 
('su000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000001', 'supplier1@titanalloys.com', '$2a$10$lU72l3F2uH0N5i2LzIeeSu38eTfG9m82E7r4pM9Qp2kE2/ZfX9Z7a', 'Rajesh Kulkarni', '+91-9833012345', 'Supplier Admin'),
('su000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000002', 'supplier2@vertexprecision.com', '$2a$10$lU72l3F2uH0N5i2LzIeeSu38eTfG9m82E7r4pM9Qp2kE2/ZfX9Z7a', 'Sneha Iyer', '+91-9844023456', 'Supplier Admin')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Product Categories
INSERT INTO product_categories (id, organization_id, name, description)
VALUES 
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Raw Steels & Metals', 'Cold rolled, stainless steel rods, sheets and structural alloys'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Electronic Components', 'Microcontrollers, sensors, power modules and PCBs'),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Industrial Hydraulics & Valves', 'Pumps, actuators, high-pressure fittings and valves')
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Products
INSERT INTO products (id, organization_id, category_id, name, sku, unit, hsn_code, standard_price, min_order_qty)
VALUES 
('p0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Stainless Steel 316L Round Rod 25mm', 'RAW-SS-316L-25', 'Kg', '7222', 420.00, 50),
('p0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Aluminum Alloy 6061-T6 Extrusion Plate', 'RAW-AL-6061-T6', 'Kg', '7604', 310.00, 100),
('p0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Industrial Microcontroller Unit Cortex-M7', 'ELEC-MCU-M7-01', 'Nos', '8542', 1250.00, 20),
('p0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'High-Pressure Hydraulic Gear Pump 250 Bar', 'HYD-PUMP-250B', 'Nos', '8413', 18500.00, 2)
ON CONFLICT (id) DO NOTHING;

-- 8. Insert Purchase Requirements
INSERT INTO purchase_requirements (id, organization_id, requirement_number, title, created_by, department_id, priority, required_date, delivery_location, budget, status, notes)
VALUES 
('pr000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'REQ-2026-0001', 'High-Grade SS 316L Rods for Turbine Sub-assemblies', 'u0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'High', CURRENT_DATE + INTERVAL '20 days', 'Apex Plant #2, Andheri East, Mumbai', 650000.00, 'RFQ Created', 'Requires Mill Test Certificate EN 10204 3.1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_requirement_items (id, requirement_id, product_id, product_name, sku, quantity, unit, estimated_unit_price, total_estimated_price)
VALUES 
('pri00000-0000-0000-0000-000000000001', 'pr000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'Stainless Steel 316L Round Rod 25mm', 'RAW-SS-316L-25', 1500.00, 'Kg', 420.00, 630000.00)
ON CONFLICT (id) DO NOTHING;

-- 9. Insert RFQ
INSERT INTO rfqs (id, organization_id, requirement_id, rfq_number, title, target_delivery_date, submission_deadline, delivery_location, payment_terms, status, created_by)
VALUES 
('rfq00000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'pr000000-0000-0000-0000-000000000001', 'RFQ-2026-0001', 'Supply of 1,500 Kg Stainless Steel 316L Rods', CURRENT_DATE + INTERVAL '18 days', NOW() + INTERVAL '3 days', 'Apex Plant #2, Mumbai', 'Net 30 Days', 'Open', 'u0000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rfq_items (id, rfq_id, product_id, product_name, sku, quantity, unit, specifications)
VALUES 
('rfqi0000-0000-0000-0000-000000000001', 'rfq00000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'Stainless Steel 316L Round Rod 25mm', 'RAW-SS-316L-25', 1500.00, 'Kg', 'Diameter 25mm +/- 0.1mm, Length 3m, Annealed & Pickled finish')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rfq_suppliers (id, rfq_id, supplier_id, status)
VALUES 
('rfqs0000-0000-0000-0000-000000000001', 'rfq00000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000001', 'Quoted'),
('rfqs0000-0000-0000-0000-000000000002', 'rfq00000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000002', 'Quoted')
ON CONFLICT (id) DO NOTHING;

-- 10. Insert Quotations
INSERT INTO quotations (id, organization_id, rfq_id, supplier_id, quotation_number, subtotal, discount_amount, taxable_amount, tax_rate, gst_amount, freight_charges, grand_total, lead_time_days, promised_delivery_date, payment_terms, warranty_months, valid_until, status)
VALUES 
('q0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'rfq00000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000001', 'QT-TITAN-8891', 592500.00, 15000.00, 577500.00, 18.00, 103950.00, 8500.00, 689950.00, 7, CURRENT_DATE + INTERVAL '10 days', 'Net 30 Days', 12, CURRENT_DATE + INTERVAL '30 days', 'Under Evaluation'),
('q0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'rfq00000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000002', 'QT-VERTEX-3012', 615000.00, 5000.00, 610000.00, 18.00, 109800.00, 12000.00, 731800.00, 14, CURRENT_DATE + INTERVAL '16 days', 'Net 45 Days', 12, CURRENT_DATE + INTERVAL '25 days', 'Under Evaluation')
ON CONFLICT (id) DO NOTHING;

-- 11. Insert Quotation AI Scores
INSERT INTO quotation_scores (id, quotation_id, price_score, delivery_score, reliability_score, quality_score, commercial_score, weighted_score, ai_recommendation_status, ai_summary, risk_factors, pros, cons)
VALUES 
('qs000000-0000-0000-0000-000000000001', 'q0000000-0000-0000-0000-000000000001', 93.50, 95.00, 94.50, 98.20, 90.00, 94.45, 'Recommended', 'Titan Alloys provides the most competitive total price (₹6,89,950 vs ₹7,31,800), superior lead time of 7 days, and an exceptional historical quality acceptance rate of 98.2%. Lowest overall landed cost and low risk profile.', '["Slight freight charge added", "Strict Net 30 payment term"]'::jsonb, '["5.7% lower landed cost than competitors", "Fastest delivery lead time (7 days)", "High historical reliability (94.5%)", "Zero defects on last 12 consignments"]'::jsonb, '["Requires prompt payment within 30 days"]'::jsonb),
('qs000000-0000-0000-0000-000000000002', 'q0000000-0000-0000-0000-000000000002', 84.00, 78.00, 86.00, 93.80, 95.00, 85.50, 'Competitive', 'Vertex Precision offers extended credit terms (Net 45), but landed price is 6.1% higher and lead time is 14 days with higher historical rejection rate (6.2%).', '["14 days lead time cuts close to scheduled assembly", "Higher past rejection rate (6.2%)"]'::jsonb, '["Favorable Net 45 payment terms"]'::jsonb, '["Higher unit price and freight charges", "Longer lead time"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 12. Insert Purchase Orders
INSERT INTO purchase_orders (id, organization_id, po_number, rfq_id, quotation_id, supplier_id, subtotal, tax_amount, freight_amount, grand_total, delivery_address, expected_delivery_date, payment_terms, status, created_by)
VALUES 
('po000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'rfq00000-0000-0000-0000-000000000001', 'q0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000001', 577500.00, 103950.00, 8500.00, 689950.00, 'Apex Plant #2, MIDC Andheri East, Mumbai 400093', CURRENT_DATE + INTERVAL '8 days', 'Net 30 Days', 'Approved', 'u0000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_order_items (id, po_id, product_id, product_name, sku, quantity_ordered, quantity_shipped, quantity_received, quantity_accepted, unit_price, tax_rate, total_amount)
VALUES 
('poi00000-0000-0000-0000-000000000001', 'po000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'Stainless Steel 316L Round Rod 25mm', 'RAW-SS-316L-25', 1500.00, 1500.00, 1500.00, 1495.00, 385.00, 18.00, 681450.00)
ON CONFLICT (id) DO NOTHING;

-- 13. Insert Price Anomalies & Insights
INSERT INTO price_anomalies (id, organization_id, product_id, supplier_id, current_price, historical_benchmark_price, variance_percentage, severity, alert_message, is_resolved)
VALUES 
('pa000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000002', 395.00, 310.00, 27.42, 'High', 'Significant price variance detected: Quoted ₹395/Kg vs historical benchmark ₹310/Kg (+27.4%). Recommended negotiation or alternative sourcing.', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO ai_insights (id, organization_id, category, title, description, metrics, action_item)
VALUES 
('ai000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Cost', 'Consolidation Savings in Raw Steels', 'Consolidating quarterly SS-316L and AL-6061 requirements can unlock 8.5% tiered volume discounts with Titan Alloys.', '{"potential_savings": 145000, "confidence": 0.92}'::jsonb, 'Group next month requirements across Mechanical and Plant Ops departments before releasing RFQ.'),
('ai000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Supplier', 'Quality Improvement: Titan Alloys', 'Titan Alloys defect rate decreased from 3.2% to 1.8% over the past 6 months following ISO 9001:2015 recertification.', '{"defect_drop": "43.7%", "orders_analyzed": 24}'::jsonb, 'Eligible for Fast-Track GRN inspection.')
ON CONFLICT (id) DO NOTHING;
