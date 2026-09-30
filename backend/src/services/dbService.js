import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

// Pre-seeded in-memory store for instant zero-dependency deployment & resilience
let localStore = {
  organizations: [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Apex Global Manufacturing Corp',
      legal_name: 'Apex Global Manufacturing Private Limited',
      gstin: '27AAACA1234A1Z5',
      pan: 'AAACA1234A',
      email: 'procurement@apexglobal.com',
      phone: '+91-22-67890123',
      address: 'Plot 42, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093',
      currency: 'INR',
      scoring_weights: { price: 40, delivery: 20, reliability: 20, quality: 15, commercial: 5 },
      created_at: new Date().toISOString()
    }
  ],
  departments: [
    { id: 'd0000000-0000-0000-0000-000000000001', organization_id: 'a0000000-0000-0000-0000-000000000001', name: 'Mechanical & Fabrication', code: 'MECH-01', budget: 5000000.00 },
    { id: 'd0000000-0000-0000-0000-000000000002', organization_id: 'a0000000-0000-0000-0000-000000000001', name: 'Electronics & Automation', code: 'ELEC-02', budget: 3500000.00 },
    { id: 'd0000000-0000-0000-0000-000000000003', organization_id: 'a0000000-0000-0000-0000-000000000001', name: 'Plant Operations & MRO', code: 'OPS-03', budget: 2000000.00 }
  ],
  users: [
    {
      id: 'u0000000-0000-0000-0000-000000000001',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      email: 'admin@apexglobal.com',
      password_hash: '$2a$10$wE99L1Y3uL0vS7WkJL1H1e7tA/9e1eZ5fOqu5W5E6Q4mZk3o7K4x2', // Password123!
      full_name: 'Vikram Malhotra',
      phone: '+91-9820011223',
      role: 'Company Admin',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'u0000000-0000-0000-0000-000000000002',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      email: 'manager@apexglobal.com',
      password_hash: '$2a$10$wE99L1Y3uL0vS7WkJL1H1e7tA/9e1eZ5fOqu5W5E6Q4mZk3o7K4x2',
      full_name: 'Priya Sharma',
      phone: '+91-9820022334',
      role: 'Procurement Manager',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'u0000000-0000-0000-0000-000000000003',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      email: 'officer@apexglobal.com',
      password_hash: '$2a$10$wE99L1Y3uL0vS7WkJL1H1e7tA/9e1eZ5fOqu5W5E6Q4mZk3o7K4x2',
      full_name: 'Rahul Verma',
      phone: '+91-9820033445',
      role: 'Procurement Officer',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'u0000000-0000-0000-0000-000000000004',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      email: 'finance@apexglobal.com',
      password_hash: '$2a$10$wE99L1Y3uL0vS7WkJL1H1e7tA/9e1eZ5fOqu5W5E6Q4mZk3o7K4x2',
      full_name: 'Anita Desai',
      phone: '+91-9820044556',
      role: 'Finance Manager',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'u0000000-0000-0000-0000-000000000005',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      email: 'warehouse@apexglobal.com',
      password_hash: '$2a$10$wE99L1Y3uL0vS7WkJL1H1e7tA/9e1eZ5fOqu5W5E6Q4mZk3o7K4x2',
      full_name: 'Karan Patel',
      phone: '+91-9820055667',
      role: 'Warehouse Manager',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],
  suppliers: [
    {
      id: 's0000000-0000-0000-0000-000000000001',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      supplier_code: 'SUP-001',
      name: 'Titan Alloys & Steels Ltd',
      legal_name: 'Titan Alloys & Specialty Steels Pvt Ltd',
      contact_person: 'Rajesh Kulkarni',
      email: 'sales@titanalloys.com',
      phone: '+91-9833012345',
      city: 'Pune',
      state: 'Maharashtra',
      gstin: '27AABCT8899C1Z1',
      pan: 'AABCT8899C',
      categories: ['Raw Steels & Metals'],
      payment_terms: 'Net 30 Days',
      status: 'Active',
      on_time_delivery_rate: 96.50,
      quality_acceptance_rate: 98.20,
      rejection_rate: 1.80,
      reliability_score: 94.50,
      total_orders_completed: 48,
      created_at: new Date().toISOString()
    },
    {
      id: 's0000000-0000-0000-0000-000000000002',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      supplier_code: 'SUP-002',
      name: 'Vertex Precision Components',
      legal_name: 'Vertex Precision Engineering Works',
      contact_person: 'Sneha Iyer',
      email: 'orders@vertexprecision.com',
      phone: '+91-9844023456',
      city: 'Bengaluru',
      state: 'Karnataka',
      gstin: '29AADCV7766D1Z2',
      pan: 'AADCV7766D',
      categories: ['Raw Steels & Metals', 'Fabricated Parts'],
      payment_terms: 'Net 45 Days',
      status: 'Active',
      on_time_delivery_rate: 89.20,
      quality_acceptance_rate: 93.80,
      rejection_rate: 6.20,
      reliability_score: 86.00,
      total_orders_completed: 32,
      created_at: new Date().toISOString()
    },
    {
      id: 's0000000-0000-0000-0000-000000000003',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      supplier_code: 'SUP-003',
      name: 'ElectroTech Global Solutions',
      legal_name: 'ElectroTech Systems India Pvt Ltd',
      contact_person: 'Arun Nair',
      email: 'contact@electrotech.com',
      phone: '+91-9855034567',
      city: 'Chennai',
      state: 'Tamil Nadu',
      gstin: '33AAECE5544E1Z3',
      pan: 'AAECE5544E',
      categories: ['Electronic Components'],
      payment_terms: 'Net 30 Days',
      status: 'Active',
      on_time_delivery_rate: 98.00,
      quality_acceptance_rate: 99.10,
      rejection_rate: 0.90,
      reliability_score: 97.20,
      total_orders_completed: 64,
      created_at: new Date().toISOString()
    },
    {
      id: 's0000000-0000-0000-0000-000000000004',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      supplier_code: 'SUP-004',
      name: 'Nova Polymers & Lubricants',
      legal_name: 'Nova Industrial Fluids Ltd',
      contact_person: 'Amit Bansal',
      email: 'sales@novapolymers.com',
      phone: '+91-9866045678',
      city: 'Ahmedabad',
      state: 'Gujarat',
      gstin: '24AAACN1122N1Z4',
      pan: 'AAACN1122N',
      categories: ['Industrial Hydraulics & Valves'],
      payment_terms: 'Net 15 Days',
      status: 'Active',
      on_time_delivery_rate: 92.40,
      quality_acceptance_rate: 95.50,
      rejection_rate: 4.50,
      reliability_score: 90.00,
      total_orders_completed: 26,
      created_at: new Date().toISOString()
    }
  ],
  supplier_users: [
    {
      id: 'su000000-0000-0000-0000-000000000001',
      supplier_id: 's0000000-0000-0000-0000-000000000001',
      email: 'supplier1@titanalloys.com',
      password_hash: '$2a$10$wE99L1Y3uL0vS7WkJL1H1e7tA/9e1eZ5fOqu5W5E6Q4mZk3o7K4x2',
      full_name: 'Rajesh Kulkarni',
      phone: '+91-9833012345',
      role: 'Supplier Admin',
      is_active: true
    },
    {
      id: 'su000000-0000-0000-0000-000000000002',
      supplier_id: 's0000000-0000-0000-0000-000000000002',
      email: 'supplier2@vertexprecision.com',
      password_hash: '$2a$10$wE99L1Y3uL0vS7WkJL1H1e7tA/9e1eZ5fOqu5W5E6Q4mZk3o7K4x2',
      full_name: 'Sneha Iyer',
      phone: '+91-9844023456',
      role: 'Supplier Admin',
      is_active: true
    }
  ],
  product_categories: [
    { id: 'c0000000-0000-0000-0000-000000000001', organization_id: 'a0000000-0000-0000-0000-000000000001', name: 'Raw Steels & Metals', description: 'Cold rolled, stainless steel rods, sheets and structural alloys' },
    { id: 'c0000000-0000-0000-0000-000000000002', organization_id: 'a0000000-0000-0000-0000-000000000001', name: 'Electronic Components', description: 'Microcontrollers, sensors, power modules and PCBs' },
    { id: 'c0000000-0000-0000-0000-000000000003', organization_id: 'a0000000-0000-0000-0000-000000000001', name: 'Industrial Hydraulics & Valves', description: 'Pumps, actuators, high-pressure fittings and valves' }
  ],
  products: [
    {
      id: 'p0000000-0000-0000-0000-000000000001',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      category_id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Stainless Steel 316L Round Rod 25mm',
      sku: 'RAW-SS-316L-25',
      unit: 'Kg',
      hsn_code: '7222',
      standard_price: 420.00,
      min_order_qty: 50,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'p0000000-0000-0000-0000-000000000002',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      category_id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Aluminum Alloy 6061-T6 Extrusion Plate',
      sku: 'RAW-AL-6061-T6',
      unit: 'Kg',
      hsn_code: '7604',
      standard_price: 310.00,
      min_order_qty: 100,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'p0000000-0000-0000-0000-000000000003',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      category_id: 'c0000000-0000-0000-0000-000000000002',
      name: 'Industrial Microcontroller Unit Cortex-M7',
      sku: 'ELEC-MCU-M7-01',
      unit: 'Nos',
      hsn_code: '8542',
      standard_price: 1250.00,
      min_order_qty: 20,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'p0000000-0000-0000-0000-000000000004',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      category_id: 'c0000000-0000-0000-0000-000000000003',
      name: 'High-Pressure Hydraulic Gear Pump 250 Bar',
      sku: 'HYD-PUMP-250B',
      unit: 'Nos',
      hsn_code: '8413',
      standard_price: 18500.00,
      min_order_qty: 2,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],
  purchase_requirements: [
    {
      id: 'pr000000-0000-0000-0000-000000000001',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      requirement_number: 'REQ-2026-0001',
      title: 'High-Grade SS 316L Rods for Turbine Sub-assemblies',
      created_by: 'u0000000-0000-0000-0000-000000000003',
      department_id: 'd0000000-0000-0000-0000-000000000001',
      priority: 'High',
      required_date: '2026-10-25',
      delivery_location: 'Apex Plant #2, Andheri East, Mumbai',
      budget: 650000.00,
      status: 'RFQ Created',
      notes: 'Requires Mill Test Certificate EN 10204 3.1',
      items: [
        {
          id: 'pri00000-0000-0000-0000-000000000001',
          product_id: 'p0000000-0000-0000-0000-000000000001',
          product_name: 'Stainless Steel 316L Round Rod 25mm',
          sku: 'RAW-SS-316L-25',
          quantity: 1500,
          unit: 'Kg',
          estimated_unit_price: 420.00,
          total_estimated_price: 630000.00
        }
      ],
      created_at: new Date().toISOString()
    }
  ],
  rfqs: [
    {
      id: 'rfq00000-0000-0000-0000-000000000001',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      requirement_id: 'pr000000-0000-0000-0000-000000000001',
      rfq_number: 'RFQ-2026-0001',
      title: 'Supply of 1,500 Kg Stainless Steel 316L Rods',
      target_delivery_date: '2026-10-22',
      submission_deadline: '2026-10-10T18:00:00Z',
      delivery_location: 'Apex Plant #2, Mumbai',
      payment_terms: 'Net 30 Days',
      status: 'Open',
      created_by: 'u0000000-0000-0000-0000-000000000002',
      invited_suppliers: ['s0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000002'],
      items: [
        {
          id: 'rfqi0000-0000-0000-0000-000000000001',
          product_id: 'p0000000-0000-0000-0000-000000000001',
          product_name: 'Stainless Steel 316L Round Rod 25mm',
          sku: 'RAW-SS-316L-25',
          quantity: 1500,
          unit: 'Kg',
          specifications: 'Diameter 25mm +/- 0.1mm, Length 3m, Annealed & Pickled finish'
        }
      ],
      created_at: new Date().toISOString()
    }
  ],
  quotations: [
    {
      id: 'q0000000-0000-0000-0000-000000000001',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      rfq_id: 'rfq00000-0000-0000-0000-000000000001',
      supplier_id: 's0000000-0000-0000-0000-000000000001',
      supplier_name: 'Titan Alloys & Steels Ltd',
      quotation_number: 'QT-TITAN-8891',
      subtotal: 592500.00,
      discount_amount: 15000.00,
      taxable_amount: 577500.00,
      tax_rate: 18.00,
      gst_amount: 103950.00,
      freight_charges: 8500.00,
      grand_total: 689950.00,
      lead_time_days: 7,
      promised_delivery_date: '2026-10-18',
      payment_terms: 'Net 30 Days',
      warranty_months: 12,
      valid_until: '2026-11-15',
      notes: 'Ready stock in Pune warehouse. Mill Test Certificate EN 10204 3.1 included.',
      status: 'Under Evaluation',
      submitted_at: new Date().toISOString()
    },
    {
      id: 'q0000000-0000-0000-0000-000000000002',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      rfq_id: 'rfq00000-0000-0000-0000-000000000001',
      supplier_id: 's0000000-0000-0000-0000-000000000002',
      supplier_name: 'Vertex Precision Components',
      quotation_number: 'QT-VERTEX-3012',
      subtotal: 615000.00,
      discount_amount: 5000.00,
      taxable_amount: 610000.00,
      tax_rate: 18.00,
      gst_amount: 109800.00,
      freight_charges: 12000.00,
      grand_total: 731800.00,
      lead_time_days: 14,
      promised_delivery_date: '2026-10-24',
      payment_terms: 'Net 45 Days',
      warranty_months: 12,
      valid_until: '2026-11-10',
      notes: 'Freight inclusive of transit insurance to Mumbai.',
      status: 'Under Evaluation',
      submitted_at: new Date().toISOString()
    }
  ],
  quotation_scores: [
    {
      id: 'qs000000-0000-0000-0000-000000000001',
      quotation_id: 'q0000000-0000-0000-0000-000000000001',
      price_score: 93.50,
      delivery_score: 95.00,
      reliability_score: 94.50,
      quality_score: 98.20,
      commercial_score: 90.00,
      weighted_score: 94.45,
      ai_recommendation_status: 'Recommended',
      ai_summary: 'Titan Alloys provides the most competitive total price (₹6,89,950 vs ₹7,31,800), superior lead time of 7 days, and an exceptional historical quality acceptance rate of 98.2%. Lowest overall landed cost and lowest risk profile.',
      risk_factors: ['Slight freight charge added', 'Strict Net 30 payment term'],
      pros: ['5.7% lower landed cost than competitors', 'Fastest delivery lead time (7 days)', 'High historical reliability (94.5%)', 'Zero defects on last 12 consignments'],
      cons: ['Requires payment strictly within 30 days']
    },
    {
      id: 'qs000000-0000-0000-0000-000000000002',
      quotation_id: 'q0000000-0000-0000-0000-000000000002',
      price_score: 84.00,
      delivery_score: 78.00,
      reliability_score: 86.00,
      quality_score: 93.80,
      commercial_score: 95.00,
      weighted_score: 85.50,
      ai_recommendation_status: 'Competitive',
      ai_summary: 'Vertex Precision offers extended credit terms (Net 45), but landed price is 6.1% higher and lead time is 14 days with higher historical rejection rate (6.2%).',
      risk_factors: ['14 days lead time cuts close to scheduled assembly', 'Higher past rejection rate (6.2%)'],
      pros: ['Favorable Net 45 payment terms'],
      cons: ['Higher unit price and freight charges', 'Longer lead time (14 days)']
    }
  ],
  purchase_orders: [
    {
      id: 'po000000-0000-0000-0000-000000000001',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      po_number: 'PO-2026-0001',
      rfq_id: 'rfq00000-0000-0000-0000-000000000001',
      quotation_id: 'q0000000-0000-0000-0000-000000000001',
      supplier_id: 's0000000-0000-0000-0000-000000000001',
      supplier_name: 'Titan Alloys & Steels Ltd',
      subtotal: 577500.00,
      tax_amount: 103950.00,
      freight_amount: 8500.00,
      grand_total: 689950.00,
      delivery_address: 'Apex Plant #2, MIDC Andheri East, Mumbai 400093',
      expected_delivery_date: '2026-10-18',
      payment_terms: 'Net 30 Days',
      status: 'Approved',
      created_by: 'u0000000-0000-0000-0000-000000000002',
      items: [
        {
          id: 'poi00000-0000-0000-0000-000000000001',
          product_name: 'Stainless Steel 316L Round Rod 25mm',
          sku: 'RAW-SS-316L-25',
          quantity_ordered: 1500,
          quantity_shipped: 1500,
          quantity_received: 1500,
          quantity_accepted: 1495,
          unit_price: 385.00,
          tax_rate: 18.00,
          total_amount: 681450.00
        }
      ],
      created_at: new Date().toISOString()
    }
  ],
  shipments: [
    {
      id: 'sh000000-0000-0000-0000-000000000001',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      po_id: 'po000000-0000-0000-0000-000000000001',
      supplier_id: 's0000000-0000-0000-0000-000000000001',
      shipment_number: 'SHP-2026-0001',
      carrier_name: 'BlueDart Surface Cargo',
      tracking_number: 'BLD-MUM-892104',
      dispatch_date: '2026-10-14',
      expected_delivery_date: '2026-10-18',
      current_location: 'In Transit - Pune Depot hub',
      status: 'In Transit',
      notes: 'Covered trailer consignment with moisture protective wrapping.',
      created_at: new Date().toISOString()
    }
  ],
  goods_receipts: [
    {
      id: 'grn00000-0000-0000-0000-000000000001',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      grn_number: 'GRN-2026-0001',
      po_id: 'po000000-0000-0000-0000-000000000001',
      supplier_id: 's0000000-0000-0000-0000-000000000001',
      received_date: '2026-10-18',
      total_received_qty: 1500,
      total_accepted_qty: 1495,
      total_rejected_qty: 5,
      total_damaged_qty: 0,
      quality_result: 'Passed',
      inspection_notes: 'Visual & dimensional inspection passed. 5 Kg rod end rejected due to slight transit surface denting.',
      created_at: new Date().toISOString()
    }
  ],
  invoices: [
    {
      id: 'inv00000-0000-0000-0000-000000000001',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      supplier_id: 's0000000-0000-0000-0000-000000000001',
      po_id: 'po000000-0000-0000-0000-000000000001',
      invoice_number: 'INV-TITAN-2026-042',
      invoice_date: '2026-10-18',
      supplier_gstin: '27AABCT8899C1Z1',
      buyer_gstin: '27AAACA1234A1Z5',
      taxable_amount: 577500.00,
      cgst_amount: 51975.00,
      sgst_amount: 51975.00,
      igst_amount: 0.00,
      total_gst: 103950.00,
      grand_total: 689950.00,
      verification_status: 'Verified',
      verification_details: {
        match_score: 98,
        po_match: true,
        grn_match: true,
        price_discrepancy: 0,
        qty_discrepancy: 0,
        gstin_valid: true,
        gst_calculation_correct: true,
        checks: [
          '✅ PO Base Price Match: Invoiced ₹5,77,500 matches PO-2026-0001 subtotal ₹5,77,500 within 0.01 tolerance.',
          '✅ GRN Physical Parity: Linked to GRN-2026-0001 (1,495 units accepted, 5 defects handled per SLA).',
          '✅ GST Arithmetic: 18.00% statutory rate verified (CGST ₹51,975 + SGST ₹51,975 = ₹1,03,950).',
          '✅ GSTIN Validation: Supplier GSTIN (27AABCT8899C1Z1) matches valid 15-digit Maharashtra state registry.'
        ],
        comparison_matrix: [
          {
            metric: 'Taxable Subtotal',
            po_val: '₹5,77,500',
            grn_val: '—',
            inv_val: '₹5,77,500',
            variance: '₹0.00 (0.0%)',
            status: 'MATCH'
          },
          {
            metric: 'Goods Quantity',
            po_val: '1,500 Units',
            grn_val: '1,495 Accepted (5 Defective)',
            inv_val: '1,500 Units',
            variance: '-5 Defective',
            status: 'DEFECT_FLAGGED'
          },
          {
            metric: 'Applicable GST (18%)',
            po_val: '₹1,03,950',
            grn_val: '—',
            inv_val: '₹1,03,950',
            variance: '₹0.00',
            status: 'MATCH'
          },
          {
            metric: 'Freight Charges',
            po_val: '₹8,500',
            grn_val: '—',
            inv_val: '₹8,500',
            variance: '₹0.00',
            status: 'MATCH'
          },
          {
            metric: 'Total Landed Value',
            po_val: '₹6,89,950',
            grn_val: '—',
            inv_val: '₹6,89,950',
            variance: '₹0.00',
            status: 'MATCH'
          }
        ],
        ai_recommendation: 'FULL APPROVAL: 100% 3-Way Parity verified across Purchase Order, Goods Receipt, and Tax Invoice. Ready for immediate disbursement.',
        summary: '3-Way Match Verified. Invoice values match PO and GRN with 100% mathematical accuracy.'
      },
      finance_approved: true,
      payment_status: 'Processing',
      created_at: new Date().toISOString()
    }
  ],
  price_anomalies: [
    {
      id: 'pa000000-0000-0000-0000-000000000001',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      product_id: 'p0000000-0000-0000-0000-000000000002',
      product_name: 'Aluminum Alloy 6061-T6 Extrusion Plate',
      supplier_id: 's0000000-0000-0000-0000-000000000002',
      supplier_name: 'Vertex Precision Components',
      current_price: 395.00,
      historical_benchmark_price: 310.00,
      variance_percentage: 27.42,
      severity: 'High',
      alert_message: 'Significant price variance detected: Quoted ₹395/Kg vs historical benchmark ₹310/Kg (+27.4%). Recommended negotiation or alternative sourcing.',
      is_resolved: false,
      created_at: new Date().toISOString()
    }
  ],
  ai_insights: [
    {
      id: 'ai000000-0000-0000-0000-000000000001',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      category: 'Cost',
      title: 'Consolidation Savings in Raw Steels',
      description: 'Consolidating quarterly SS-316L and AL-6061 requirements can unlock 8.5% tiered volume discounts with Titan Alloys.',
      metrics: { potential_savings: 145000, confidence: 0.92 },
      action_item: 'Group next month requirements across Mechanical and Plant Ops departments before releasing RFQ.',
      created_at: new Date().toISOString()
    },
    {
      id: 'ai000000-0000-0000-0000-000000000002',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      category: 'Supplier',
      title: 'Quality Improvement: Titan Alloys',
      description: 'Titan Alloys defect rate decreased from 3.2% to 1.8% over the past 6 months following ISO 9001:2015 recertification.',
      metrics: { defect_drop: '43.7%', orders_analyzed: 24 },
      action_item: 'Eligible for Fast-Track GRN inspection.',
      created_at: new Date().toISOString()
    }
  ],
  notifications: [
    {
      id: 'notif000-0000-0000-0000-000000000001',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      title: 'New Quotation Received',
      message: 'Titan Alloys & Steels Ltd submitted quotation QT-TITAN-8891 for RFQ-2026-0001.',
      type: 'Quotation',
      link: '/quotations/compare',
      is_read: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'notif000-0000-0000-0000-000000000002',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      title: 'Price Anomaly Alert',
      message: 'High variance detected on Aluminum 6061 (+27.4%) from Vertex Precision.',
      type: 'Anomaly',
      link: '/analytics',
      is_read: false,
      created_at: new Date().toISOString()
    }
  ],
  audit_logs: [
    {
      id: 'aud00000-0000-0000-0000-000000000001',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      user_name: 'Priya Sharma',
      action: 'APPROVE',
      entity: 'Purchase Order',
      entity_id: 'po000000-0000-0000-0000-000000000001',
      details: { po_number: 'PO-2026-0001', amount: 689950.00 },
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString()
    }
  ],
  documents: [
    {
      id: 'doc00000-0000-0000-0000-000000000001',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      title: 'Titan Alloys Mill Test Certificate EN 10204 3.1',
      category: 'Quality Report',
      file_name: 'MTC_Titan_SS316L.pdf',
      file_path: '/uploads/MTC_Titan_SS316L.pdf',
      file_size: 450200,
      file_type: 'application/pdf',
      related_entity_type: 'PO',
      related_entity_id: 'po000000-0000-0000-0000-000000000001',
      created_at: new Date().toISOString()
    }
  ]
};

// Database Service abstraction with Supabase integration and robust fallback
export const dbService = {
  // Query all records from a table matching conditions
  async query(table, filter = {}) {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from(table).select('*');
        for (const [key, val] of Object.entries(filter)) {
          if (val !== undefined && val !== null) {
            query = query.eq(key, val);
          }
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        console.warn(`[Supabase Query Fallback] table ${table}:`, e.message);
      }
    }

    // Local resilient store fallback
    if (!localStore[table]) localStore[table] = [];
    return localStore[table].filter(item => {
      for (const [key, val] of Object.entries(filter)) {
        if (val !== undefined && val !== null && item[key] !== val) return false;
      }
      return true;
    });
  },

  // Find a single record
  async findOne(table, filter = {}) {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from(table).select('*');
        for (const [key, val] of Object.entries(filter)) {
          query = query.eq(key, val);
        }
        const { data, error } = await query.limit(1).maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn(`[Supabase findOne Fallback] table ${table}:`, e.message);
      }
    }

    const items = await this.query(table, filter);
    return items.length > 0 ? items[0] : null;
  },

  // Insert a record
  async insert(table, record) {
    const newRecord = {
      id: record.id || uuidv4(),
      ...record,
      created_at: record.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from(table).insert(newRecord).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn(`[Supabase insert Fallback] table ${table}:`, e.message);
      }
    }

    if (!localStore[table]) localStore[table] = [];
    localStore[table].unshift(newRecord);
    return newRecord;
  },

  // Update a record by ID or filter
  async update(table, idOrFilter, updates) {
    const updatedFields = { ...updates, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from(table).update(updatedFields);
        if (typeof idOrFilter === 'string') {
          query = query.eq('id', idOrFilter);
        } else {
          for (const [key, val] of Object.entries(idOrFilter)) {
            query = query.eq(key, val);
          }
        }
        const { data, error } = await query.select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn(`[Supabase update Fallback] table ${table}:`, e.message);
      }
    }

    if (!localStore[table]) localStore[table] = [];
    const index = localStore[table].findIndex(item => {
      if (typeof idOrFilter === 'string') return item.id === idOrFilter;
      for (const [key, val] of Object.entries(idOrFilter)) {
        if (item[key] !== val) return false;
      }
      return true;
    });

    if (index !== -1) {
      localStore[table][index] = { ...localStore[table][index], ...updatedFields };
      return localStore[table][index];
    }
    return null;
  },

  // Delete a record
  async delete(table, idOrFilter) {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from(table).delete();
        if (typeof idOrFilter === 'string') {
          query = query.eq('id', idOrFilter);
        } else {
          for (const [key, val] of Object.entries(idOrFilter)) {
            query = query.eq(key, val);
          }
        }
        await query;
      } catch (e) {
        console.warn(`[Supabase delete Fallback] table ${table}:`, e.message);
      }
    }

    if (!localStore[table]) return true;
    localStore[table] = localStore[table].filter(item => {
      if (typeof idOrFilter === 'string') return item.id !== idOrFilter;
      for (const [key, val] of Object.entries(idOrFilter)) {
        if (item[key] === val) return false;
      }
      return true;
    });
    return true;
  }
};
