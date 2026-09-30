import { dbService } from './dbService.js';
import { auditService } from './auditService.js';

export const supplierService = {
  async getSuppliers(organization_id, query = {}) {
    let list = await dbService.query('suppliers', { organization_id });
    if (list.length === 0) {
      list = await dbService.query('suppliers', {});
    }
    if (query.status) {
      return list.filter(s => s.status.toLowerCase() === query.status.toLowerCase());
    }
    if (query.category) {
      return list.filter(s => s.categories && s.categories.includes(query.category));
    }
    return list;
  },

  async getSupplierById(id, organization_id) {
    const supplier = await dbService.findOne('suppliers', { id });
    if (!supplier) throw { status: 404, message: 'Supplier not found' };
    const isDemoSupplier = supplier.id.startsWith('s0000000-') || supplier.organization_id === 'a0000000-0000-0000-0000-000000000001';
    if (organization_id && supplier.organization_id !== organization_id && !isDemoSupplier) {
      throw { status: 403, message: 'Access denied to this supplier record' };
    }
    return supplier;
  },

  async createSupplier(data, user) {
    const count = (await dbService.query('suppliers', { organization_id: user.organization_id })).length;
    const supplier_code = data.supplier_code || `SUP-${String(count + 1).padStart(3, '0')}`;

    const newSupplier = await dbService.insert('suppliers', {
      organization_id: user.organization_id,
      supplier_code,
      name: data.name,
      legal_name: data.legal_name || data.name,
      contact_person: data.contact_person,
      email: data.email.toLowerCase(),
      phone: data.phone,
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      pincode: data.pincode || '',
      country: data.country || 'India',
      gstin: data.gstin || '',
      pan: data.pan || '',
      bank_name: data.bank_name || '',
      bank_account_number: data.bank_account_number || '',
      ifsc_code: data.ifsc_code || '',
      categories: data.categories || [],
      payment_terms: data.payment_terms || 'Net 30 Days',
      status: data.status || 'Active',
      on_time_delivery_rate: 95.00,
      quality_acceptance_rate: 96.00,
      rejection_rate: 4.00,
      reliability_score: 92.00,
      total_orders_completed: 0
    });

    await auditService.log({
      organization_id: user.organization_id,
      user_id: user.id,
      user_name: user.full_name,
      action: 'CREATE_SUPPLIER',
      entity: 'Supplier',
      entity_id: newSupplier.id,
      details: { supplier_name: newSupplier.name, code: supplier_code }
    });

    return newSupplier;
  },

  async updateSupplier(id, updates, user) {
    const updated = await dbService.update('suppliers', id, updates);
    await auditService.log({
      organization_id: user.organization_id,
      user_id: user.id,
      user_name: user.full_name,
      action: 'UPDATE_SUPPLIER',
      entity: 'Supplier',
      entity_id: id,
      details: updates
    });
    return updated;
  }
};
