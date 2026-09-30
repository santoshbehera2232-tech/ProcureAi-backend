import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  FileCheck2,
  Users,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  ChevronRight,
  BarChart3,
  Receipt
} from 'lucide-react';
import { api } from '../services/api.js';

export const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [rfqs, setRfqs] = useState([]);
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsRes, rfqRes, poRes] = await Promise.all([
        api.getAnalytics(),
        api.getRFQs(''),
        api.getPurchaseOrders('')
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (rfqRes.success) setRfqs(rfqRes.data.slice(0, 4));
      if (poRes.success) setPos(poRes.data.slice(0, 4));
    } catch (e) {
      console.error('Error fetching dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading procurement metrics...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Procurement Spend',
      value: `₹${(analytics?.totalSpend || 689950).toLocaleString('en-IN')}`,
      change: '+12.4% vs last quarter',
      icon: TrendingUp,
      accent: 'from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/30'
    },
    {
      label: 'Procurement Savings Achieved',
      value: `₹${(analytics?.totalEstimatedSavings || 145000).toLocaleString('en-IN')}`,
      change: '14.8% below initial budget',
      icon: Sparkles,
      accent: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30'
    },
    {
      label: 'Active Purchase Orders',
      value: analytics?.activePOs ?? 1,
      change: '2 consignments in transit',
      icon: ShoppingBag,
      accent: 'from-indigo-500/20 to-indigo-600/10 text-indigo-400 border-indigo-500/30'
    },
    {
      label: 'Supplier Quality Acceptance',
      value: `${analytics?.avgQualityRate ?? 98.2}%`,
      change: '0.9% defect rejection rate',
      icon: ShieldCheck,
      accent: 'from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/30'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/40 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Procurement Intelligence Dashboard</h1>
            <span className="text-[10px] font-bold bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full border border-brand-500/30">
              Live Governance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Multi-tenant sourcing, automated RFQ matching, and AI 3-way invoice verification.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/purchase-requirements"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors"
          >
            + New Requirement
          </Link>
          <Link
            to="/rfqs"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors"
          >
            + Create RFQ
          </Link>
          <Link
            to="/quotations/compare"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quotation AI Engine</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-gradient-to-br bg-slate-900/90 border transition-all hover:scale-[1.01] ${kpi.accent}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{kpi.label}</span>
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-white mt-3 tracking-tight">{kpi.value}</p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <span>{kpi.change}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* AI Anomaly Alert Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300">AI Price Variance Alert: Aluminum Alloy 6061-T6</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded">+27.4% Variance</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Vertex Precision quoted ₹395/Kg vs historical benchmark ₹310/Kg. ProcureAI recommends price negotiation or alternative sourcing via Titan Alloys.
            </p>
          </div>
        </div>
        <Link
          to="/anomalies"
          className="shrink-0 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/40 transition-colors"
        >
          Review Analysis
        </Link>
      </div>

      {/* Charts & Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend by Category Card */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Spend by Category</h2>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-4">
            {(analytics?.spendByCategory || []).map((cat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{cat.category}</span>
                  <span className="text-slate-400">₹{cat.spend.toLocaleString('en-IN')} ({cat.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${i === 0 ? 'bg-brand-500' : i === 1 ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend Card */}
        <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Procurement Spend vs Savings (Last 6 Months)</h2>
            <span className="text-xs text-emerald-400 font-medium">Avg 11.2% Savings Rate</span>
          </div>
          <div className="grid grid-cols-6 gap-2 h-44 items-end pt-4 pb-2 border-b border-slate-800">
            {(analytics?.monthlySpend || []).map((m, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-32">
                  <div
                    className="w-1/2 bg-brand-500/80 rounded-t group-hover:bg-brand-400 transition-all"
                    style={{ height: `${Math.min(100, (m.spend / 750000) * 100)}%` }}
                    title={`Spend: ₹${m.spend.toLocaleString()}`}
                  />
                  <div
                    className="w-1/2 bg-emerald-500/80 rounded-t group-hover:bg-emerald-400 transition-all"
                    style={{ height: `${Math.min(100, (m.savings / 80000) * 80)}%` }}
                    title={`Savings: ₹${m.savings.toLocaleString()}`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 truncate w-full text-center">{m.month.split(' ')[0]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-brand-500" />
              <span className="text-slate-400">Procurement Spend</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-slate-400">Procured Savings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column: Active RFQs & Recent Purchase Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RFQs List */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Active RFQs</h2>
            <Link to="/rfqs" className="text-xs text-brand-400 hover:underline flex items-center gap-1">
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {rfqs.map(rfq => (
              <div key={rfq.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">{rfq.rfq_number}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                      {rfq.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{rfq.title}</p>
                </div>
                <Link
                  to={`/quotations/compare?rfq_id=${rfq.id}`}
                  className="px-3 py-1.5 bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 text-xs font-medium rounded-lg transition-colors shrink-0"
                >
                  Compare
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* POs List */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Recent Purchase Orders</h2>
            <Link to="/purchase-orders" className="text-xs text-brand-400 hover:underline flex items-center gap-1">
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {pos.map(po => (
              <div key={po.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">{po.po_number}</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full">
                      {po.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Vendor: {po.supplier_name || 'Titan Alloys'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">₹{Number(po.grand_total).toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-slate-400">{po.payment_terms}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
