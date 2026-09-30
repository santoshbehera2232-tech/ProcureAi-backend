import { dbService } from './dbService.js';
import { auditService } from './auditService.js';
import { notificationService } from './notificationService.js';

export const rfqService = {
  async getRFQs(organization_id, filter = {}) {
    let list = await dbService.query('rfqs', { organization_id });
    if (list.length === 0) {
      list = await dbService.query('rfqs', {});
    }
    if (filter.status) {
      list = list.filter(r => r.status.toLowerCase() === filter.status.toLowerCase());
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getRFQById(id, organization_id) {
    const rfq = await dbService.findOne('rfqs', { id });
    if (!rfq) throw { status: 404, message: 'RFQ not found' };
    const isDemoRFQ = rfq.id.startsWith('rfq00000-') || rfq.organization_id === 'a0000000-0000-0000-0000-000000000001';
    if (organization_id && rfq.organization_id !== organization_id && !isDemoRFQ) {
      throw { status: 403, message: 'Access denied' };
    }

    // Attach invited suppliers details
    const allSuppliers = await dbService.query('suppliers', { organization_id: rfq.organization_id });
    const invitedSuppliers = (rfq.invited_suppliers || []).map(supId => {
      const s = allSuppliers.find(sup => sup.id === supId);
      return s || { id: supId, name: 'Unknown Supplier' };
    });

    // Attach submitted quotations
    const quotations = await dbService.query('quotations', { rfq_id: id });
    const scores = await dbService.query('quotation_scores');

    const quotationsWithScores = quotations.map(q => {
      const score = scores.find(sc => sc.quotation_id === q.id);
      return { ...q, score };
    });

    return { ...rfq, invited_suppliers_details: invitedSuppliers, quotations: quotationsWithScores };
  },

  async createRFQ(data, user) {
    const count = (await dbService.query('rfqs', { organization_id: user.organization_id })).length;
    const rfq_number = `RFQ-2026-${String(count + 1).padStart(4, '0')}`;

    const rfq = await dbService.insert('rfqs', {
      organization_id: user.organization_id,
      requirement_id: data.requirement_id || null,
      rfq_number,
      title: data.title,
      description: data.description || '',
      target_delivery_date: data.target_delivery_date,
      submission_deadline: data.submission_deadline,
      delivery_location: data.delivery_location || 'Main Central Warehouse',
      payment_terms: data.payment_terms || 'Net 30 Days',
      status: 'Open',
      created_by: user.id,
      invited_suppliers: data.invited_suppliers || [],
      items: (data.items || []).map((it, idx) => ({
        id: `rfqi-${Date.now()}-${idx}`,
        product_id: it.product_id || null,
        product_name: it.product_name,
        sku: it.sku || '',
        quantity: parseFloat(it.quantity),
        unit: it.unit || 'Nos',
        specifications: it.specifications || ''
      }))
    });

    // If linked to requirement, update requirement status
    if (data.requirement_id) {
      await dbService.update('purchase_requirements', data.requirement_id, { status: 'RFQ Created' });
    }

    await auditService.log({
      organization_id: user.organization_id,
      user_id: user.id,
      user_name: user.full_name,
      action: 'CREATE_RFQ',
      entity: 'RFQ',
      entity_id: rfq.id,
      details: { rfq_number, invitedCount: (data.invited_suppliers || []).length }
    });

    await notificationService.create({
      organization_id: user.organization_id,
      title: 'New RFQ Published',
      message: `${rfq_number}: "${rfq.title}" published with deadline ${rfq.submission_deadline ? new Date(rfq.submission_deadline).toLocaleDateString() : 'TBD'}.`,
      type: 'RFQ',
      link: `/rfqs/${rfq.id}`
    });

    return rfq;
  },

  async updateRFQStatus(id, status, user) {
    return await dbService.update('rfqs', id, { status });
  }
};
