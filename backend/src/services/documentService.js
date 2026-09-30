import { dbService } from './dbService.js';
import { auditService } from './auditService.js';

export const documentService = {
  async getDocuments(organization_id, filter = {}) {
    let list = await dbService.query('documents', { organization_id });
    if (filter.category) {
      list = list.filter(d => d.category.toLowerCase() === filter.category.toLowerCase());
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async uploadDocument(data, user) {
    const doc = await dbService.insert('documents', {
      organization_id: user.organization_id,
      title: data.title,
      category: data.category || 'General',
      file_name: data.file_name || 'document.pdf',
      file_path: data.file_path || '/uploads/sample.pdf',
      file_size: data.file_size || 102400,
      file_type: data.file_type || 'application/pdf',
      related_entity_type: data.related_entity_type || null,
      related_entity_id: data.related_entity_id || null,
      uploaded_by: user.id
    });

    await auditService.log({
      organization_id: user.organization_id,
      user_id: user.id,
      user_name: user.full_name,
      action: 'UPLOAD_DOCUMENT',
      entity: 'Document',
      entity_id: doc.id,
      details: { title: doc.title, category: doc.category }
    });

    return doc;
  }
};
