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

test('Procurement System End-to-End Workflow Tests', async (t) => {

  await t.test('1. Authentication: Login with seeded credentials', async () => {
    const res = await authService.login({ email: 'admin@apexglobal.com', password: 'Password123!' });
    assert.ok(res.accessToken, 'Access token should be issued');
    assert.strictEqual(res.user.role, 'Company Admin');
  });

  await t.test('2. Authentication: Supplier Login for Vendor Portal', async () => {
    const res = await authService.login({ email: 'supplier1@titanalloys.com', password: 'Password123!', is_supplier: true });
    assert.ok(res.accessToken, 'Supplier access token should be issued');
    assert.strictEqual(res.user.is_supplier, true);
    assert.ok(res.supplier.id, 'Supplier profile must be attached');
  });

  await t.test('3. Quotation AI Multi-Factor Analysis: Deterministic Scoring', async () => {
    const scored = await aiAnalysisService.analyzeQuotations('rfq00000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001');
    assert.ok(scored.length >= 2, 'Should score all competing quotes');
    const top = scored[0];
    assert.ok(top.score.weighted_score > 80, 'Top quote should have high weighted score');
    assert.ok(top.score.ai_recommendation_status === 'Recommended' || top.score.ai_recommendation_status === 'Competitive');
    assert.ok(top.score.ai_summary.length > 20, 'Transparent AI explanation required');
  });

  await t.test('4. PO Generation: Automatic creation from awarded quotation', async () => {
    const user = { id: 'u0000000-0000-0000-0000-000000000001', full_name: 'Vikram Malhotra' };
    const po = await purchaseOrderService.createPOFromQuotation('q0000000-0000-0000-0000-000000000001', user);
    assert.ok(po.po_number.startsWith('PO-2026-'), 'Sequential PO number should be generated');
    assert.strictEqual(po.status, 'Approved');
  });

  await t.test('5. Delivery Receiving & Quality Inspection: GRN creation and metric update', async () => {
    const user = { id: 'u0000000-0000-0000-0000-000000000005', full_name: 'Karan Patel' };
    const grn = await deliveryService.createGoodsReceipt({
      po_id: 'po000000-0000-0000-0000-000000000001',
      total_received_qty: 1500,
      total_accepted_qty: 1495,
      total_rejected_qty: 5,
      quality_result: 'Passed'
    }, user);
    assert.ok(grn.grn_number.startsWith('GRN-2026-'));
    assert.strictEqual(grn.total_accepted_qty, 1495);
  });

  await t.test('6. Invoice Management: AI 3-Way Match Verification (PO vs GRN vs Invoice)', async () => {
    const user = { id: 'u0000000-0000-0000-0000-000000000004', full_name: 'Anita Desai' };
    const invoice = await invoiceService.createAndVerifyInvoice({
      po_id: 'po000000-0000-0000-0000-000000000001',
      invoice_number: `INV-TEST-${Date.now()}`,
      supplier_gstin: '27AABCT8899C1Z1',
      buyer_gstin: '27AAACA1234A1Z5',
      taxable_amount: 577500,
      cgst_amount: 51975,
      sgst_amount: 51975,
      igst_amount: 0
    }, user);
    assert.strictEqual(invoice.verification_status, 'Verified');
    assert.strictEqual(invoice.verification_details.po_match, true);
  });

  await t.test('7. Price Anomaly Detection: Detects price spikes exceeding benchmark', async () => {
    const anomaly = await anomalyService.checkPriceAnomaly({
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      product_id: 'p0000000-0000-0000-0000-000000000002',
      supplier_id: 's0000000-0000-0000-0000-000000000002',
      current_price: 395.00 // Standard benchmark is 310.00 (+27.4%)
    });
    assert.ok(anomaly, 'Should trigger anomaly alert');
    assert.strictEqual(anomaly.severity, 'High');
    assert.ok(anomaly.variance_percentage > 25);
  });

});
