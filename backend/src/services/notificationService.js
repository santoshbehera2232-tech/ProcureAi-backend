import { dbService } from './dbService.js';

export const notificationService = {
  async create({ organization_id, user_id, title, message, type = 'System', link = '/' }) {
    try {
      return await dbService.insert('notifications', {
        organization_id,
        user_id: user_id || null,
        title,
        message,
        type,
        link,
        is_read: false
      });
    } catch (err) {
      console.error('[Notification Error]:', err.message);
    }
  },

  async getNotifications(organization_id, user_id) {
    const list = await dbService.query('notifications', { organization_id });
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async markAsRead(id, organization_id) {
    return await dbService.update('notifications', id, { is_read: true });
  },

  async markAllAsRead(organization_id) {
    const list = await dbService.query('notifications', { organization_id });
    for (const item of list) {
      await dbService.update('notifications', item.id, { is_read: true });
    }
    return true;
  }
};
