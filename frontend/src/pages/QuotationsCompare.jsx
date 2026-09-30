import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Clock,
  Award,
  ChevronDown,
  Building,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api.js';

export const QuotationsCompare = () => {
  const [rfqs, setRfqs] = useState([]);
  const [selectedRfqId, setSelectedRfqId] = useState('');
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [awarding, setAwarding] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRFQs();
  }, []);

  const fetchRFQs = async () => {
    try {
      const res = await api.getRFQs();
      if (res.success && res.data.length > 0) {
        setRfqs(res.data);
        const queryRfq = searchParams.get('rfq_id') || res.data[0].id;
        setSelectedRfqId(queryRfq);
        loadComparison(queryRfq);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadComparison = async (rfqId) => {
    setLoading(true);
    try {
      const res = await api.getQuotationAnalysis(rfqId);
      if (res.success) {
        setComparison(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRFQ = (rfqId) => {
    setSelectedRfqId(rfqId);
    loadComparison(rfqId);
  };

  const handleAwardAndGeneratePO = async (quotationId) => {
    if (!window.confirm('Award this quotation and automatically generate certified Purchase Order?')) {
      return;
    }
    setAwarding(true);
    try {
      const res = await api.createPOFromQuotation(quotationId);
      if (res.success) {
        navigate(`/purchase-orders/${res.data.id}`);
      }
    } catch (err) {
      alert(err.message || 'Error generating PO');
    } finally {
      setAwarding(false);
    }
  };

  const selectedRfq = rfqs.find(r => r.id === selectedRfqId);

  return (
    <div className="space-y-6">
      {/* Header with RFQ Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">AI Quotation Comparison Matrix</h1>
            <span className="text-[10px] font-extrabold bg-gradient-to-r from-indigo-500 to-brand-500 text-white px-2 py-0.5 rounded-full shadow-sm">
              Multi-Factor Heuristics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic weighted multi-criteria scoring combined with AI risk assessment and recommendation transparency.
          </p>
        </div>

        {/* RFQ Dropdown Selector */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5 text-xs">
          <span className="text-slate-400 pl-2">Select RFQ:</span>
          <select
            value={selectedRfqId}
            onChange={(e) => handleSelectRFQ(e.target.value)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer pr-3"
          >
            {rfqs.map(r => (
              <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                {r.rfq_number} - {r.title.slice(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Running AI scoring engine across submitted quotes...</p>
          </div>
        </div>
      ) : comparison.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <Sparkles className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No Quotations Received Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Vendors invited to this RFQ have not submitted binding quotes yet. Use the Supplier Portal to submit proposals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {comparison.map((item, idx) => {
            const isTopRanked = idx === 0;
            const score = item.score || {};

            return (
              <div
                key={item.id}
                className={`rounded-2xl p-6 transition-all flex flex-col justify-between border ${
                  isTopRanked
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-brand-950/20 border-brand-500/60 shadow-xl shadow-brand-500/10 ring-1 ring-brand-500/30'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div>
                  {/* Top Badge & Supplier Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400">{item.quotation_number}</span>
                        {isTopRanked && (
                          <span className="text-[10px] font-extrabold bg-brand-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            TOP RECOMMENDED
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Building className="w-4 h-4 text-brand-400" />
                        <span>{item.supplier?.name || item.supplier_name}</span>
                      </h3>
                      <p className="text-xs text-slate-400">{item.supplier?.city}, {item.supplier?.state}</p>
                    </div>

                    {/* Overall Score Circle Badge */}
                    <div className="text-center p-2.5 rounded-xl bg-slate-950 border border-slate-800 min-w-20">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Weighted Score</span>
                      <span className={`text-xl font-black ${score.weighted_score >= 90 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                        {score.weighted_score}
                      </span>
                      <span className="text-[10px] text-slate-500">/100</span>
                    </div>
                  </div>

                  {/* AI Recommendation Summary */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-5">
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      <span className="font-bold text-brand-300">AI Synthesis: </span>
                      {score.ai_summary}
                    </p>
                  </div>

                  {/* Scoring Components Meter */}
                  <div className="space-y-2.5 mb-5 bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Multi-Factor Criteria Breakdown</p>
                    {[
                      { label: 'Price Competitiveness (40%)', val: score.price_score, color: 'bg-emerald-500' },
                      { label: 'Delivery Lead Time (20%)', val: score.delivery_score, color: 'bg-blue-500' },
                      { label: 'Supplier Reliability (20%)', val: score.reliability_score, color: 'bg-purple-500' },
                      { label: 'Historical Quality (15%)', val: score.quality_score, color: 'bg-cyan-500' },
                      { label: 'Commercial Terms (5%)', val: score.commercial_score, color: 'bg-amber-500' }
                    ].map((crit, cIdx) => (
                      <div key={cIdx} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">{crit.label}</span>
                          <span className="font-semibold text-slate-200">{crit.val}/100</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${crit.color}`} style={{ width: `${crit.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial Details Table */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Subtotal</span>
                      <span className="text-xs font-semibold text-slate-300">₹{Number(item.taxable_amount).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">GST (18%)</span>
                      <span className="text-xs font-semibold text-slate-300">₹{Number(item.gst_amount).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Freight</span>
                      <span className="text-xs font-semibold text-slate-300">₹{Number(item.freight_charges).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-400 font-bold block">Grand Total</span>
                      <span className="text-xs font-bold text-white">₹{Number(item.grand_total).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Pros & Risk Factors */}
                  <div className="space-y-2 mb-6">
                    {(score.pros || []).map((pro, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2 text-xs text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{pro}</span>
                      </div>
                    ))}
                    {(score.risk_factors || []).map((risk, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-2 text-xs text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Award Action Button */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400">Lead Time: </span>
                    <span className="font-semibold text-white">{item.lead_time_days} Days</span>
                  </div>
                  <button
                    onClick={() => handleAwardAndGeneratePO(item.id)}
                    disabled={awarding || item.status === 'Awarded'}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-lg ${
                      item.status === 'Awarded'
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                        : isTopRanked
                        ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/25'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>{item.status === 'Awarded' ? 'Awarded (PO Created)' : 'Award & Generate PO'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
