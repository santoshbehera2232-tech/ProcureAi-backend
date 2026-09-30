import { dbService } from './dbService.js';
import { aiAnalysisService } from './aiAnalysisService.js';
import { auditService } from './auditService.js';
import { notificationService } from './notificationService.js';

export const quotationService = {
  async getQuotations(filter = {}) {
    const list = await dbService.query('quotations', filter);
    const scores = await dbService.query('quotation_scores');
    const suppliers = await dbService.query('suppliers');

    return list.map(q => ({
      ...q,
      supplier: suppliers.find(s => s.id === q.supplier_id),
      score: scores.find(sc => sc.quotation_id === q.id)
    }));
  },

  async getQuotationById(id) {
    const quotation = await dbService.findOne('quotations', { id });
    if (!quotation) throw { status: 404, message: 'Quotation not found' };

    const supplier = await dbService.findOne('suppliers', { id: quotation.supplier_id });
    const score = await dbService.findOne('quotation_scores', { quotation_id: id });
    const rfq = await dbService.findOne('rfqs', { id: quotation.rfq_id });

    return { ...quotation, supplier, score, rfq };
  },

  async submitQuotation(data, user) {
    const rfq = await dbService.findOne('rfqs', { id: data.rfq_id });
    if (!rfq) throw { status: 404, message: 'RFQ not found' };

    // Check submission deadline
    if (new Date(rfq.submission_deadline) < new Date()) {
      throw { status: 400, message: 'Submission deadline for this RFQ has expired. New quotations cannot be accepted.' };
    }

    const supplierId = user.supplier_id || data.supplier_id;
    const supplier = await dbService.findOne('suppliers', { id: supplierId });
    if (!supplier) throw { status: 400, message: 'Valid supplier profile required to submit quotation.' };

    const subtotal = parseFloat(data.subtotal) || 0.00;
    const discount_amount = parseFloat(data.discount_amount) || 0.00;
    const taxable_amount = Math.max(0, subtotal - discount_amount);
    const tax_rate = parseFloat(data.tax_rate) || 18.00;
    const gst_amount = Math.round((taxable_amount * (tax_rate / 100)) * 100) / 100;
    const freight_charges = parseFloat(data.freight_charges) || 0.00;
    const other_charges = parseFloat(data.other_charges) || 0.00;
    const grand_total = taxable_amount + gst_amount + freight_charges + other_charges;

    const count = (await dbService.query('quotations', { organization_id: rfq.organization_id })).length;
    const quotation_number = data.quotation_number || `QT-${(supplier.supplier_code || 'SUP').replace(/[^a-zA-Z0-9]/g, '')}-${String(count + 1001)}`;

    const quotation = await dbService.insert('quotations', {
      organization_id: rfq.organization_id,
      rfq_id: rfq.id,
      supplier_id: supplierId,
      supplier_name: supplier.name,
      quotation_number,
      subtotal,
      discount_amount,
      taxable_amount,
      tax_rate,
      gst_amount,
      freight_charges,
      other_charges,
      grand_total,
      lead_time_days: parseInt(data.lead_time_days, 10) || 7,
      promised_delivery_date: data.promised_delivery_date,
      payment_terms: data.payment_terms || 'Net 30 Days',
      warranty_months: parseInt(data.warranty_months, 10) || 12,
      valid_until: data.valid_until,
      notes: data.notes || '',
      status: 'Submitted'
    });

    // Run AI / Multi-factor analysis immediately
    await aiAnalysisService.analyzeQuotations(rfq.id, rfq.organization_id);

    await auditService.log({
      organization_id: rfq.organization_id,
      user_id: user.id,
      user_name: user.full_name || supplier.name,
      action: 'SUBMIT_QUOTATION',
      entity: 'Quotation',
      entity_id: quotation.id,
      details: { quotation_number, grand_total, supplier: supplier.name }
    });

    await notificationService.create({
      organization_id: rfq.organization_id,
      title: 'Quotation Received',
      message: `${supplier.name} submitted quotation ${quotation_number} (₹${grand_total.toLocaleString('en-IN')}) for ${rfq.rfq_number}.`,
      type: 'Quotation',
      link: `/quotations/compare?rfq_id=${rfq.id}`
    });

    return quotation;
  },

  async awardQuotation(quotationId, user) {
    const quotation = await dbService.findOne('quotations', { id: quotationId });
    if (!quotation) throw { status: 404, message: 'Quotation not found' };

    // Update quotation status
    await dbService.update('quotations', quotationId, { status: 'Awarded' });

    // Mark other quotations for this RFQ as Rejected
    const otherQuotes = await dbService.query('quotations', { rfq_id: quotation.rfq_id });
    for (const q of otherQuotes) {
      if (q.id !== quotationId && q.status !== 'Awarded') {
        await dbService.update('quotations', q.id, { status: 'Rejected' });
      }
    }

    // Update RFQ status to Awarded
    await dbService.update('rfqs', quotation.rfq_id, { status: 'Awarded' });

    await auditService.log({
      organization_id: quotation.organization_id,
      user_id: user.id,
      user_name: user.full_name,
      action: 'AWARD_QUOTATION',
      entity: 'Quotation',
      entity_id: quotationId,
      details: { quotation_number: quotation.quotation_number, total: quotation.grand_total }
    });

    return quotation;
  }
};
