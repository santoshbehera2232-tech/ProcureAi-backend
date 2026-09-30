import { dbService } from './dbService.js';
import { auditService } from './auditService.js';
import { notificationService } from './notificationService.js';

export const deliveryService = {
  async getGoodsReceipts(organization_id, filter = {}) {
    let list = await dbService.query('goods_receipts', { organization_id });
    if (filter.po_id) {
      list = list.filter(grn => grn.po_id === filter.po_id);
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async createGoodsReceipt(data, user) {
    const po = await dbService.findOne('purchase_orders', { id: data.po_id });
    if (!po) throw { status: 404, message: 'Purchase Order not found' };

    const count = (await dbService.query('goods_receipts', { organization_id: po.organization_id })).length;
    const grn_number = `GRN-2026-${String(count + 1).padStart(4, '0')}`;

    const total_received_qty = parseFloat(data.total_received_qty) || 0;
    const total_accepted_qty = parseFloat(data.total_accepted_qty) || 0;
    const total_rejected_qty = parseFloat(data.total_rejected_qty) || 0;
    const total_damaged_qty = parseFloat(data.total_damaged_qty) || 0;

    const grn = await dbService.insert('goods_receipts', {
      organization_id: po.organization_id,
      grn_number,
      po_id: po.id,
      shipment_id: data.shipment_id || null,
      supplier_id: po.supplier_id,
      received_date: data.received_date || new Date().toISOString().split('T')[0],
      received_by: user.id,
      total_received_qty,
      total_accepted_qty,
      total_rejected_qty,
      total_damaged_qty,
      quality_result: data.quality_result || 'Passed',
      inspection_notes: data.inspection_notes || ''
    });

    // Update PO status to Delivered / Completed
    await dbService.update('purchase_orders', po.id, {
      status: total_rejected_qty > 0 ? 'Partially Delivered' : 'Delivered'
    });

    // Update supplier performance KPI history
    const supplier = await dbService.findOne('suppliers', { id: po.supplier_id });
    if (supplier) {
      const completed = (supplier.total_orders_completed || 0) + 1;
      const rejectionRate = Math.max(0.5, Math.min(10, Math.round(((supplier.rejection_rate * (completed - 1) + (total_rejected_qty / (total_received_qty || 1) * 100)) / completed) * 10) / 10));
      const acceptanceRate = Math.round((100 - rejectionRate) * 10) / 10;
      await dbService.update('suppliers', supplier.id, {
        total_orders_completed: completed,
        rejection_rate: rejectionRate,
        quality_acceptance_rate: acceptanceRate
      });
    }

    await auditService.log({
      organization_id: po.organization_id,
      user_id: user.id,
      user_name: user.full_name,
      action: 'RECEIVE_DELIVERY_GRN',
      entity: 'GoodsReceipt',
      entity_id: grn.id,
      details: { grn_number, po_number: po.po_number, accepted: total_accepted_qty, rejected: total_rejected_qty }
    });

    await notificationService.create({
      organization_id: po.organization_id,
      title: 'Goods Received (GRN Created)',
      message: `${grn_number} created for ${po.po_number}. ${total_accepted_qty} items accepted, ${total_rejected_qty} rejected.`,
      type: 'Delivery',
      link: `/deliveries`
    });

    return grn;
  }
};
