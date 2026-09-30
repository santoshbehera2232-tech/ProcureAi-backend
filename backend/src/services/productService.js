import { dbService } from './dbService.js';
import { auditService } from './auditService.js';

export const productService = {
  async getProducts(organization_id) {
    return await dbService.query('products', { organization_id });
  },

  async getCategories(organization_id) {
    return await dbService.query('product_categories', { organization_id });
  },

  async createProduct(data, user) {
    const product = await dbService.insert('products', {
      organization_id: user.organization_id,
      category_id: data.category_id || null,
      name: data.name,
      sku: data.sku,
      description: data.description || '',
      unit: data.unit || 'Nos',
      hsn_code: data.hsn_code || '7222',
      standard_price: parseFloat(data.standard_price) || 0.00,
      min_order_qty: parseFloat(data.min_order_qty) || 1,
      is_active: true
    });

    await auditService.log({
      organization_id: user.organization_id,
      user_id: user.id,
      user_name: user.full_name,
      action: 'CREATE_PRODUCT',
      entity: 'Product',
      entity_id: product.id,
      details: { sku: product.sku, name: product.name }
    });

    return product;
  },

  async createCategory(data, user) {
    return await dbService.insert('product_categories', {
      organization_id: user.organization_id,
      name: data.name,
      description: data.description || ''
    });
  }
};
