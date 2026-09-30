import test from 'node:test';
import assert from 'node:assert';
import { authService } from '../src/services/authService.js';
import { requirementService } from '../src/services/requirementService.js';
import { rfqService } from '../src/services/rfqService.js';
import { quotationService } from '../src/services/quotationService.js';
import { aiAnalysisService } from '../src/services/aiAnalysisService.js';
import { purchaseOrderService } from '../src/services/purchaseOrderService.js';
import { deliveryService } from '../src/services/deliveryService.js';
import { invoiceService } from '../src/services/invoiceService.js';
import { anomalyService } from '../src/services/anomalyService.js';
import { supplierService } from '../src/services/supplierService.js';
import { productService } from '../src/services/productService.js';
import { shipmentService } from '../src/services/shipmentService.js';
import { documentService } from '../src/services/documentService.js';
import { analyticsService } from '../src/services/analyticsService.js';
import { notificationService } from '../src/services/notificationService.js';
import { auditService } from '../src/services/auditService.js';
import { pdfService } from '../src/services/pdfService.js';
import { dbService } from '../src/services/dbService.js';

test('ProcureAI Enterprise Backend Comprehensive Test Suite', async (t) => {

  let testUser = null;
  let testOrg = null;
  let testSupplier = null;
  let testReq = null;
  let testRfq = null;
  let testQuote = null;
  let testPo = null;

  await t.test('1. Authentication: Login with seeded credentials', async () => {
    const res = await authService.login({ email: 'admin@apexglobal.com', password: 'Password123!' });
    assert.ok(res.accessToken, 'Access token should be issued');
    assert.strictEqual(res.user.role, 'Company Admin');
    testUser = res.user;
    testOrg = res.organization;
  });

  await t.test('2. Authentication: Supplier Login for Vendor Portal', async () => {
    const res = await authService.login({ email: 'supplier1@titanalloys.com', password: 'Password123!', is_supplier: true });
    assert.ok(res.accessToken, 'Supplier access token should be issued');
    assert.strictEqual(res.user.is_supplier, true);
    assert.ok(res.supplier.id, 'Supplier profile must be attached');
    testSupplier = res.supplier;
  });

  await t.test('3. Authentication: Register new organization and admin', async () => {
    const uniqueEmail = `test_admin_${Date.now()}@titanprocure.com`;
    const regRes = await authService.register({
      email: uniqueEmail,
      password: 'SecurePassword123!',
      full_name: 'Rajesh Test Admin',
      phone: '+91 9988776655',
      company_name: 'Titan Heavy Industries Pvt Ltd',
      gstin: '27AAACT9988T1Z4',
      pan: 'AAACT9988T'
    });
    assert.ok(regRes.accessToken);
    assert.strictEqual(regRes.user.email, uniqueEmail);
    assert.strictEqual(regRes.organization.name, 'Titan Heavy Industries Pvt Ltd');
  });

  await t.test('4. Product & Category Management: Create and retrieve catalog items', async () => {
    const cat = await productService.createCategory({ name: 'Specialty Fasteners', description: 'Industrial high-tensile fasteners' }, testUser);
    assert.ok(cat.id);
    const prod = await productService.createProduct({
      name: 'Titanium Grade 5 Hex Bolt M12',
      sku: `BOLT-TI-${Date.now()}`,
      description: 'High strength Grade 5 fasteners',
      category_id: cat.id,
      unit: 'Nos',
      standard_price: 450.00
    }, testUser);
    assert.ok(prod.id);
    assert.strictEqual(prod.standard_price, 450.00);

    const prods = await productService.getProducts(testOrg.id);
    assert.ok(prods.length > 0, 'Products list should contain items');
  });

  await t.test('5. Supplier Management: Create, retrieve, and update vendor profile', async () => {
    const sup = await supplierService.createSupplier({
      name: 'AeroTech Fasteners Ltd',
      email: `aerotech_${Date.now()}@fasteners.in`,
      phone: '+91 9123456780',
      contact_person: 'Amitabh Joshi',
      gstin: '27AABCA5544C1Z9',
      categories: ['Specialty Fasteners']
    }, testUser);
    assert.ok(sup.id);
    assert.strictEqual(sup.status, 'Active');

    const fetched = await supplierService.getSupplierById(sup.id, testOrg.id);
    assert.strictEqual(fetched.name, 'AeroTech Fasteners Ltd');

    const updated = await supplierService.updateSupplier(sup.id, { reliability_score: 96.5 }, testUser);
    assert.strictEqual(updated.reliability_score, 96.5);
  });

  await t.test('6. Purchase Requirement Workflow: Create, list, approve requirement', async () => {
    testReq = await requirementService.createRequirement({
      title: 'Procurement of High Tensile Fasteners for Q4 Plant Overhaul',
      priority: 'High',
      required_date: '2026-11-15',
      delivery_location: 'Central Plant Dock 4',
      budget: 500000.00,
      items: [
        { product_name: 'Titanium Grade 5 Hex Bolt M12', sku: 'BOLT-TI-01', quantity: 1000, estimated_unit_price: 450.00 }
      ]
    }, testUser);
    assert.ok(testReq.id);
    assert.strictEqual(testReq.status, 'Submitted');

    const approved = await requirementService.updateStatus(testReq.id, { status: 'Approved', comments: 'Budget allocated' }, testUser);
    assert.strictEqual(approved.status, 'Approved');
  });

  await t.test('7. RFQ Creation: Publish RFQ to selected suppliers', async () => {
    testRfq = await rfqService.createRFQ({
      requirement_id: testReq.id,
      title: 'RFQ for High Tensile Grade 5 Fasteners',
      target_delivery_date: '2026-11-20',
      submission_deadline: '2026-10-15',
      delivery_location: 'Central Plant Dock 4',
      invited_suppliers: ['s0000000-0000-0000-0000-000000000001'],
      items: [
        { product_name: 'Titanium Grade 5 Hex Bolt M12', sku: 'BOLT-TI-01', quantity: 1000, unit: 'Nos' }
      ]
    }, testUser);
    assert.ok(testRfq.id);
    assert.ok(testRfq.rfq_number.startsWith('RFQ-2026-'));
  });

  await t.test('8. Quotation Submission & AI Analysis Engine: Score quotes multi-factorially', async () => {
    testQuote = await quotationService.submitQuotation({
      rfq_id: testRfq.id,
      supplier_id: 's0000000-0000-0000-0000-000000000001',
      taxable_amount: 420000.00,
      gst_amount: 75600.00,
      freight_charges: 5000.00,
      grand_total: 500600.00,
      lead_time_days: 7,
      payment_terms: 'Net 30 Days',
      validity_date: '2026-10-31',
      promised_delivery_date: '2026-11-10'
    }, { id: 'u0000000-0000-0000-0000-000000000001', full_name: 'Supplier Rep' });
    assert.ok(testQuote.id);

    const scored = await aiAnalysisService.analyzeQuotations(testRfq.id, testOrg.id);
    assert.ok(scored.length >= 1, 'Should score the quotation');
    assert.ok(scored[0].score.weighted_score > 70);
    assert.ok(scored[0].score.ai_summary.length > 10);
  });

  await t.test('9. PO Generation & PDF Document Service: Generate PO and PDF buffer', async () => {
    testPo = await purchaseOrderService.createPOFromQuotation(testQuote.id, testUser);
    assert.ok(testPo.po_number.startsWith('PO-2026-'));
    assert.strictEqual(testPo.status, 'Approved');

    // Generate PO Receipt PDF buffer
    const poFull = await purchaseOrderService.getPOById(testPo.id, testOrg.id);
    const pdfBuffer = await pdfService.generatePOReceiptPDF(poFull, poFull.supplier, poFull.organization);
    assert.ok(Buffer.isBuffer(pdfBuffer), 'PDF service must output a valid binary Buffer');
    assert.ok(pdfBuffer.length > 500, 'PDF buffer must have valid byte content');

    // Vendor Acknowledgment
    const ack = await purchaseOrderService.acknowledgePO(testPo.id, { id: 'sup-user-1' });
    assert.strictEqual(ack.status, 'Acknowledged');
  });

  await t.test('10. Shipment & Logistics: Dispatch tracking update', async () => {
    const shp = await shipmentService.createShipment({
      po_id: testPo.id,
      carrier_name: 'BlueDart Express Freight',
      tracking_number: `TRK-BD-${Date.now()}`,
      current_location: 'Mumbai Hub Clearance Dock'
    }, testUser);
    assert.ok(shp.id);
    assert.strictEqual(shp.status, 'In Transit');

    const updatedShp = await shipmentService.updateShipmentLocation(shp.id, {
      current_location: 'In transit - Bhiwandi Express Corridor',
      status: 'Out for Delivery'
    }, testUser);
    assert.strictEqual(updatedShp.status, 'Out for Delivery');
  });

  await t.test('11. Delivery & GRN Inspection: Register goods receipt and check metrics', async () => {
    const grn = await deliveryService.createGoodsReceipt({
      po_id: testPo.id,
      total_received_qty: 1000,
      total_accepted_qty: 995,
      total_rejected_qty: 5,
      quality_result: 'Passed with minor deviations'
    }, testUser);
    assert.ok(grn.grn_number.startsWith('GRN-2026-'));
    assert.strictEqual(grn.total_accepted_qty, 995);
  });

  await t.test('12. Invoice Management: 3-Way Match Verification & Finance Approval', async () => {
    const invoice = await invoiceService.createAndVerifyInvoice({
      po_id: testPo.id,
      invoice_number: `INV-${Date.now()}`,
      supplier_gstin: '27AABCT8899C1Z1',
      taxable_amount: 420000.00,
      cgst_amount: 37800.00,
      sgst_amount: 37800.00,
      igst_amount: 0
    }, testUser);
    assert.ok(invoice.id);
    assert.strictEqual(invoice.verification_status, 'Verified');
    const score = invoice.match_score ?? invoice.verification_details?.match_score;
    assert.ok(score >= 80, `Expected score >= 80, received ${score}`);

    const approved = await invoiceService.approveInvoice(invoice.id, testUser);
    assert.strictEqual(approved.finance_approved, true);
  });

  await t.test('13. Price Anomaly Detection & AI Insights', async () => {
    const anomaly = await anomalyService.checkPriceAnomaly({
      organization_id: testOrg.id,
      product_id: 'p0000000-0000-0000-0000-000000000002',
      supplier_id: 's0000000-0000-0000-0000-000000000002',
      current_price: 395.00
    });
    assert.ok(anomaly, 'Should trigger anomaly');
    assert.strictEqual(anomaly.severity, 'High');

    const insights = await anomalyService.getAIInsights(testOrg.id);
    assert.ok(Array.isArray(insights));
  });

  await t.test('14. Document Vault & Compliance Certificate PDF Generation', async () => {
    const doc = await documentService.uploadDocument({
      title: 'Material Test Certificate EN 10204 3.1 - Batch B-991',
      category: 'Quality Report',
      file_name: 'MTC_Batch_B991.pdf',
      file_size: 204800
    }, testUser);
    assert.ok(doc.id);

    const certPdf = await pdfService.generateDocumentPDF(doc, testOrg);
    assert.ok(Buffer.isBuffer(certPdf), 'Certificate PDF must be a buffer');
    assert.ok(certPdf.length > 500);
  });

  await t.test('15. Procurement Analytics Aggregation', async () => {
    const analytics = await analyticsService.getDashboardAnalytics(testOrg.id);
    assert.ok(typeof analytics.totalSpend === 'number');
    assert.ok(Array.isArray(analytics.monthlySpend));
    assert.ok(Array.isArray(analytics.spendByCategory));
  });

  await t.test('16. Notification and Audit Logs Verification', async () => {
    const notifs = await notificationService.getNotifications(testOrg.id, testUser.id);
    assert.ok(Array.isArray(notifs));
    assert.ok(notifs.length > 0);

    const logs = await auditService.getLogs(testOrg.id);
    assert.ok(Array.isArray(logs));
    assert.ok(logs.length > 0);
  });

});
