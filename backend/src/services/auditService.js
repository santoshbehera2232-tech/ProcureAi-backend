import { dbService } from './dbService.js';

export const auditService = {
  async log({ organization_id, user_id, user_name, action, entity, entity_id, details, ip_address }) {
    try {
      return await dbService.insert('audit_logs', {
        organization_id,
        user_id: user_id || null,
        user_name: user_name || 'System User',
        action,
        entity,
        entity_id: entity_id || null,
        details: details || {},
        ip_address: ip_address || '127.0.0.1'
      });
    } catch (err) {
      console.error('[Audit Log Error]:', err.message);
    }
  },

  async getLogs(organization_id, filters = {}) {
    let all = await dbService.query('audit_logs', { organization_id });
    if (!all || all.length === 0) all = await dbService.query('audit_logs');
    return all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
};
