import { dbService } from './dbService.js';
import { notificationService } from './notificationService.js';

export const anomalyService = {
  async getAnomalies(organization_id) {
    let list = await dbService.query('price_anomalies', { organization_id });
    if (!list || list.length === 0) list = await dbService.query('price_anomalies');
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getAIInsights(organization_id) {
    let list = await dbService.query('ai_insights', { organization_id });
    if (!list || list.length === 0) list = await dbService.query('ai_insights');
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  // Scan quotes or products for price spikes against historical benchmark
  async checkPriceAnomaly({ organization_id, product_id, supplier_id, current_price }) {
    const product = await dbService.findOne('products', { id: product_id });
    if (!product || !product.standard_price) return null;

    const benchmark = Number(product.standard_price);
    const price = Number(current_price);
    const variance = ((price - benchmark) / benchmark) * 100;

    // Trigger alert if variance > +15%
    if (variance > 15) {
      const supplier = await dbService.findOne('suppliers', { id: supplier_id });
      const severity = variance > 25 ? 'High' : 'Medium';
      const message = `Price variance detected: Quoted ₹${price}/unit vs standard benchmark ₹${benchmark}/unit (+${variance.toFixed(1)}%). Investigation recommended.`;

      const anomaly = await dbService.insert('price_anomalies', {
        organization_id,
        product_id,
        product_name: product.name,
        supplier_id,
        supplier_name: supplier?.name || 'Unknown',
        current_price: price,
        historical_benchmark_price: benchmark,
        variance_percentage: Math.round(variance * 10) / 10,
        severity,
        alert_message: message,
        is_resolved: false
      });

      await notificationService.create({
        organization_id,
        title: 'Price Spike Anomaly Detected',
        message,
        type: 'Anomaly',
        link: '/analytics'
      });

      return anomaly;
    }

    return null;
  }
};
