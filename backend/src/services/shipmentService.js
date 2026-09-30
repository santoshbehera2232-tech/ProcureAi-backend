import { dbService } from './dbService.js';
import { auditService } from './auditService.js';
import { notificationService } from './notificationService.js';

export const shipmentService = {
  async getShipments(organization_id, filter = {}) {
    let list = await dbService.query('shipments', { organization_id });
    if (filter.po_id) {
      list = list.filter(s => s.po_id === filter.po_id);
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async createShipment(data, user) {
    const po = await dbService.findOne('purchase_orders', { id: data.po_id });
    if (!po) throw { status: 404, message: 'Purchase Order not found' };

    const count = (await dbService.query('shipments', { organization_id: po.organization_id })).length;
    const shipment_number = `SHP-2026-${String(count + 1).padStart(4, '0')}`;

    const shipment = await dbService.insert('shipments', {
      organization_id: po.organization_id,
      po_id: po.id,
      supplier_id: po.supplier_id,
      shipment_number,
      carrier_name: data.carrier_name,
      tracking_number: data.tracking_number,
      dispatch_date: data.dispatch_date || new Date().toISOString().split('T')[0],
      expected_delivery_date: data.expected_delivery_date || po.expected_delivery_date,
      current_location: data.current_location || 'Dispatched from Supplier Central Logistics Hub',
      status: 'In Transit',
      notes: data.notes || ''
    });

    // Update PO status to In Transit
    await dbService.update('purchase_orders', po.id, { status: 'In Transit' });

    await auditService.log({
      organization_id: po.organization_id,
      user_id: user.id,
      user_name: user.full_name,
      action: 'DISPATCH_SHIPMENT',
      entity: 'Shipment',
      entity_id: shipment.id,
      details: { shipment_number, carrier: shipment.carrier_name, tracking_number: shipment.tracking_number }
    });

    await notificationService.create({
      organization_id: po.organization_id,
      title: 'Shipment Dispatched',
      message: `Consignment for ${po.po_number} dispatched via ${shipment.carrier_name} (${shipment.tracking_number}).`,
      type: 'Delivery',
      link: `/shipments`
    });

    return shipment;
  },

  async updateShipmentLocation(id, { current_location, status }, user) {
    const shipment = await dbService.findOne('shipments', { id });
    if (!shipment) throw { status: 404, message: 'Shipment not found' };

    const updates = {};
    if (current_location) updates.current_location = current_location;
    if (status) updates.status = status;

    return await dbService.update('shipments', id, updates);
  }
};
