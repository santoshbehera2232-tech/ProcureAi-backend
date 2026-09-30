import { dbService } from './dbService.js';
import { auditService } from './auditService.js';
import { notificationService } from './notificationService.js';

export const requirementService = {
  async getRequirements(organization_id) {
    const list = await dbService.query('purchase_requirements', { organization_id });
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getRequirementById(id, organization_id) {
    const req = await dbService.findOne('purchase_requirements', { id, organization_id });
    if (!req) throw { status: 404, message: 'Purchase requirement not found' };
    return req;
  },

  async createRequirement(data, user) {
    const count = (await dbService.query('purchase_requirements', { organization_id: user.organization_id })).length;
    const requirement_number = `REQ-2026-${String(count + 1).padStart(4, '0')}`;

    const items = data.items || [];
    const totalBudget = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.estimated_unit_price || 0)), 0);

    const requirement = await dbService.insert('purchase_requirements', {
      organization_id: user.organization_id,
      requirement_number,
      title: data.title,
      created_by: user.id,
      department_id: data.department_id || null,
      priority: data.priority || 'Medium',
      required_date: data.required_date,
      delivery_location: data.delivery_location,
      budget: totalBudget || parseFloat(data.budget) || 0.00,
      status: 'Submitted',
      notes: data.notes || '',
      technical_specs: data.technical_specs || '',
      items: items.map((it, idx) => ({
        id: `pri-${Date.now()}-${idx}`,
        product_id: it.product_id || null,
        product_name: it.product_name,
        sku: it.sku || '',
        quantity: parseFloat(it.quantity),
        unit: it.unit || 'Nos',
        estimated_unit_price: parseFloat(it.estimated_unit_price) || 0.00,
        total_estimated_price: parseFloat(it.quantity) * (parseFloat(it.estimated_unit_price) || 0.00)
      }))
    });

    await auditService.log({
      organization_id: user.organization_id,
      user_id: user.id,
      user_name: user.full_name,
      action: 'CREATE_REQUIREMENT',
      entity: 'PurchaseRequirement',
      entity_id: requirement.id,
      details: { requirement_number, budget: requirement.budget }
    });

    await notificationService.create({
      organization_id: user.organization_id,
      title: 'New Purchase Requirement Submitted',
      message: `${requirement_number}: "${requirement.title}" submitted by ${user.full_name} for approval.`,
      type: 'RFQ',
      link: `/purchase-requirements/${requirement.id}`
    });

    return requirement;
  },

  async updateStatus(id, { status, comments }, user) {
    const req = await dbService.findOne('purchase_requirements', { id, organization_id: user.organization_id });
    if (!req) throw { status: 404, message: 'Purchase requirement not found' };

    const updates = { status, approval_comments: comments || '' };
    if (status === 'Approved') {
      updates.approved_by = user.id;
      updates.approved_at = new Date().toISOString();
    }

    const updated = await dbService.update('purchase_requirements', id, updates);

    await auditService.log({
      organization_id: user.organization_id,
      user_id: user.id,
      user_name: user.full_name,
      action: `REQUIREMENT_${status.toUpperCase()}`,
      entity: 'PurchaseRequirement',
      entity_id: id,
      details: { status, comments }
    });

    await notificationService.create({
      organization_id: user.organization_id,
      title: `Requirement ${req.requirement_number} ${status}`,
      message: `Purchase requirement has been marked as ${status} by ${user.full_name}.`,
      type: 'RFQ',
      link: `/purchase-requirements/${id}`
    });

    return updated;
  }
};
