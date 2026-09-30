import { dbService } from './dbService.js';
import { ENV } from '../config/env.js';

export const aiAnalysisService = {
  // Deterministic scoring engine with multi-factor weighting & AI transparent synthesis
  async analyzeQuotations(rfqId, organizationId) {
    const rfq = await dbService.findOne('rfqs', { id: rfqId });
    if (!rfq) throw { status: 404, message: 'RFQ not found' };

    const quotations = await dbService.query('quotations', { rfq_id: rfqId });
    if (quotations.length === 0) return [];

    const org = await dbService.findOne('organizations', { id: organizationId || rfq.organization_id });
    const weights = org?.scoring_weights || { price: 40, delivery: 20, reliability: 20, quality: 15, commercial: 5 };

    const suppliers = await dbService.query('suppliers', { organization_id: rfq.organization_id });

    // Determine lowest grand total for relative price scoring
    const lowestPrice = Math.min(...quotations.map(q => Number(q.grand_total)));

    const scoredQuotations = [];

    for (const quote of quotations) {
      const supplier = suppliers.find(s => s.id === quote.supplier_id) || {};

      // 1. Price Score (Lowest quote gets 100, others scaled relatively)
      const priceRatio = lowestPrice / Number(quote.grand_total);
      const priceScore = Math.max(50, Math.min(100, Math.round(priceRatio * 100 * 10) / 10));

      // 2. Delivery Score (Fastest lead time gets higher score)
      const leadTime = Number(quote.lead_time_days) || 10;
      let deliveryScore = 80;
      if (leadTime <= 7) deliveryScore = 95;
      else if (leadTime <= 10) deliveryScore = 90;
      else if (leadTime <= 14) deliveryScore = 80;
      else deliveryScore = 65;

      // 3. Reliability Score (Based on supplier historical metrics)
      const reliabilityScore = supplier.reliability_score || 90.00;

      // 4. Quality Score (Based on historical acceptance vs rejection)
      const qualityScore = supplier.quality_acceptance_rate || 95.00;

      // 5. Commercial Terms Score
      let commercialScore = 85;
      const terms = (quote.payment_terms || '').toLowerCase();
      if (terms.includes('45') || terms.includes('60')) commercialScore = 95;
      else if (terms.includes('30')) commercialScore = 90;
      else if (terms.includes('15')) commercialScore = 80;
      else if (terms.includes('advance')) commercialScore = 60;

      // Overall weighted score
      const weightedScore = Math.round(
        ((priceScore * weights.price) +
         (deliveryScore * weights.delivery) +
         (reliabilityScore * weights.reliability) +
         (qualityScore * weights.quality) +
         (commercialScore * weights.commercial)) / 100 * 10
      ) / 10;

      // Generate AI Synthesis / Explanation
      const pros = [];
      const cons = [];
      const risk_factors = [];

      if (priceScore >= 95) pros.push(`Lowest total landed cost of ₹${Number(quote.grand_total).toLocaleString('en-IN')}`);
      else if (priceScore < 85) cons.push(`Total landed cost is ${Math.round((Number(quote.grand_total) - lowestPrice) / lowestPrice * 100)}% higher than lowest bid`);

      if (leadTime <= 7) pros.push(`Rapid fulfillment lead time of ${leadTime} days`);
      else if (leadTime > 12) {
        cons.push(`Longer delivery timeline of ${leadTime} days`);
        risk_factors.push(`Lead time cuts close to required project timeline`);
      }

      if (supplier.rejection_rate && supplier.rejection_rate > 5) {
        risk_factors.push(`Historical defect/rejection rate is ${supplier.rejection_rate}%`);
      }

      if (supplier.on_time_delivery_rate && supplier.on_time_delivery_rate >= 95) {
        pros.push(`High on-time delivery record (${supplier.on_time_delivery_rate}%)`);
      }

      if (commercialScore >= 90) pros.push(`Favorable credit terms (${quote.payment_terms})`);

      // Determine recommendation classification
      let ai_recommendation_status = 'Competitive';
      if (weightedScore >= 90) ai_recommendation_status = 'Recommended';
      else if (weightedScore < 75 || risk_factors.length >= 2) ai_recommendation_status = 'High Risk';

      const ai_summary = `${supplier.name || 'Supplier'} scored an overall ${weightedScore}/100. ` +
        `Strengths: ${pros.slice(0, 2).join(', ') || 'Standard compliance'}. ` +
        (risk_factors.length > 0 ? `Noted risks: ${risk_factors.join('; ')}.` : 'Minimal operational risk detected.');

      const scoreRecord = {
        quotation_id: quote.id,
        price_score: priceScore,
        delivery_score: deliveryScore,
        reliability_score: reliabilityScore,
        quality_score: qualityScore,
        commercial_score: commercialScore,
        weighted_score: weightedScore,
        ai_recommendation_status,
        ai_summary,
        risk_factors,
        pros,
        cons,
        scoring_breakdown: {
          weights,
          components: { price: priceScore, delivery: deliveryScore, reliability: reliabilityScore, quality: qualityScore, commercial: commercialScore }
        }
      };

      // Save or update score record
      const existingScore = await dbService.findOne('quotation_scores', { quotation_id: quote.id });
      if (existingScore) {
        await dbService.update('quotation_scores', existingScore.id, scoreRecord);
      } else {
        await dbService.insert('quotation_scores', scoreRecord);
      }

      scoredQuotations.push({
        ...quote,
        supplier,
        score: scoreRecord
      });
    }

    return scoredQuotations.sort((a, b) => b.score.weighted_score - a.score.weighted_score);
  }
};
