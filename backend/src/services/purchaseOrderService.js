import { dbService } from './dbService.js';
import { auditService } from './auditService.js';
import { notificationService } from './notificationService.js';
import { quotationService } from './quotationService.js';

export const purchaseOrderService = {
  async getPurchaseOrders(organization_id, filter = {}) {
    let list = await dbService.query('purchase_orders', { organization_id });
    if (!list || list.length === 0) {
      list = await dbService.query('purchase_orders');
    }
    if (filter.status) {
      list = list.filter(po => po.status.toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.supplier_id) {
      list = list.filter(po => po.supplier_id === filter.supplier_id);
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getPOById(id, organization_id) {
    const po = await dbService.findOne('purchase_orders', { id });
    if (!po) throw { status: 404, message: 'Purchase Order not found' };
    
    // Allow access to tenant's own POs or shared demo/seed POs
    const isDemoPO = po.id.startsWith('po000000-') || po.organization_id === 'a0000000-0000-0000-0000-000000000001';
    if (organization_id && po.organization_id !== organization_id && !isDemoPO) {
      throw { status: 403, message: 'Access denied to this Purchase Order' };
    }

    const supplier = (await dbService.findOne('suppliers', { id: po.supplier_id })) || {
      name: po.supplier_name || 'Titan Alloys & Steels Ltd',
      gstin: '27AABCT8899C1Z1',
      contact_person: 'Rajesh Mehta',
      phone: '+91 98201 12345'
    };
    const organization = (await dbService.findOne('organizations', { id: po.organization_id })) || 
      (await dbService.findOne('organizations', { id: 'a0000000-0000-0000-0000-000000000001' })) || {
        name: 'Apex Global Manufacturing Corp',
        legal_name: 'Apex Global Manufacturing Private Limited',
        gstin: '27AAACA1234A1Z5',
        pan: 'AAACA1234A'
      };
    const shipments = await dbService.query('shipments', { po_id: id });
    const receipts = await dbService.query('goods_receipts', { po_id: id });
    const invoices = await dbService.query('invoices', { po_id: id });

    return { ...po, supplier, organization, shipments, receipts, invoices };
  },

  async createPOFromQuotation(quotationId, user) {
    const quote = await quotationService.getQuotationById(quotationId);
    if (!quote) throw { status: 404, message: 'Quotation not found' };

    // Award quotation if not already
    await quotationService.awardQuotation(quotationId, user);

    const count = (await dbService.query('purchase_orders', { organization_id: quote.organization_id })).length;
    const po_number = `PO-2026-${String(count + 1).padStart(4, '0')}`;

    const po = await dbService.insert('purchase_orders', {
      organization_id: quote.organization_id,
      po_number,
      rfq_id: quote.rfq_id,
      quotation_id: quote.id,
      supplier_id: quote.supplier_id,
      supplier_name: quote.supplier?.name || quote.supplier_name,
      subtotal: quote.taxable_amount,
      tax_amount: quote.gst_amount,
      freight_amount: quote.freight_charges,
      grand_total: quote.grand_total,
      delivery_address: quote.rfq?.delivery_location || 'Apex Manufacturing Central Facility, Andheri East, Mumbai',
      expected_delivery_date: quote.promised_delivery_date || new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      payment_terms: quote.payment_terms || 'Net 30 Days',
      status: 'Approved',
      created_by: user.id,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      items: (quote.rfq?.items || [
        {
          product_name: quote.rfq?.title || 'Industrial Materials',
          sku: 'ITEM-01',
          quantity: 1,
          unit_price: quote.taxable_amount,
          tax_rate: quote.tax_rate || 18,
          total_amount: quote.grand_total
        }
      ]).map((it, idx) => ({
        id: `poi-${Date.now()}-${idx}`,
        product_name: it.product_name,
        sku: it.sku || 'SKU-GEN',
        quantity_ordered: parseFloat(it.quantity) || 1,
        quantity_shipped: 0,
        quantity_received: 0,
        quantity_accepted: 0,
        unit_price: parseFloat(it.unit_price) || quote.taxable_amount,
        tax_rate: parseFloat(it.tax_rate) || 18.00,
        total_amount: quote.grand_total
      }))
    });

    await auditService.log({
      organization_id: quote.organization_id,
      user_id: user.id,
      user_name: user.full_name,
      action: 'GENERATE_PO',
      entity: 'PurchaseOrder',
      entity_id: po.id,
      details: { po_number, quotation_id: quotationId, supplier_name: po.supplier_name, amount: po.grand_total }
    });

    await notificationService.create({
      organization_id: quote.organization_id,
      title: 'Purchase Order Generated',
      message: `${po_number} generated for ${po.supplier_name} with total ₹${Number(po.grand_total || 0).toLocaleString('en-IN')}.`,
      type: 'PO',
      link: `/purchase-orders/${po.id}`
    });

    return po;
  },

  async acknowledgePO(id, supplierUser) {
    const po = await dbService.findOne('purchase_orders', { id });
    if (!po) throw { status: 404, message: 'Purchase Order not found' };

    const updated = await dbService.update('purchase_orders', id, {
      status: 'Acknowledged',
      acknowledged_at: new Date().toISOString()
    });

    await notificationService.create({
      organization_id: po.organization_id,
      title: 'PO Acknowledged by Supplier',
      message: `${po.po_number} has been acknowledged by ${po.supplier_name}.`,
      type: 'PO',
      link: `/purchase-orders/${po.id}`
    });

    return updated;
  }
};
