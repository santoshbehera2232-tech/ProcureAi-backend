import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Sparkles, PieChart, Layers, Download } from 'lucide-react';
import { api } from '../services/api.js';

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.getAnalytics();
      if (res.success) setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Procurement Spend & Savings Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">Category distribution, contract savings yield, and cost trend analytics.</p>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Capital Outlay</span>
          <p className="text-2xl font-black text-white mt-2">₹{(data?.totalSpend || 689950).toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-400 mt-1 block">Active across 3 categories</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">AI Negotiated Savings Yield</span>
          <p className="text-2xl font-black text-emerald-400 mt-2">₹{(data?.totalEstimatedSavings || 145000).toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">14.8% below initial requirement ceiling</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Active Supply Base</span>
          <p className="text-2xl font-black text-brand-400 mt-2">{data?.totalSuppliers || 4} Certified Vendors</p>
          <span className="text-[11px] text-slate-400 mt-1 block">98.2% average acceptance compliance</span>
        </div>
      </div>

      {/* Charts Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Share */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Spend Allocation by Category</h2>
          <div className="space-y-4">
            {(data?.spendByCategory || [
              { category: 'Raw Steels & Metals', spend: 689950, percentage: 58 },
              { category: 'Electronic Components', spend: 285000, percentage: 24 },
              { category: 'Industrial Hydraulics & Valves', spend: 215000, percentage: 18 }
            ]).map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">{cat.category}</span>
                  <span className="text-slate-400">₹{cat.spend.toLocaleString('en-IN')} ({cat.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${idx === 0 ? 'bg-brand-500' : idx === 1 ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Savings Distribution */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Savings Mechanics</h2>
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">Competitive Multi-Vendor Bidding</p>
                <p className="text-slate-400 text-[11px] mt-0.5">RFQ quote variance between top 2 vendors</p>
              </div>
              <span className="font-bold text-emerald-400 text-sm">₹41,850</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">Tiered Volume Consolidation</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Bulk procurement discount trigger (Titan Alloys)</p>
              </div>
              <span className="font-bold text-emerald-400 text-sm">₹65,000</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">Rejection & Defect Mitigation</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Prevented rework and line shutdown avoidance</p>
              </div>
              <span className="font-bold text-emerald-400 text-sm">₹38,150</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
