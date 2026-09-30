import React, { useState, useEffect } from 'react';
import { AlertTriangle, Sparkles, TrendingUp, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api.js';

export const Anomalies = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [anomRes, insRes] = await Promise.all([
        api.getAnomalies(),
        api.getAIInsights()
      ]);
      if (anomRes.success) setAnomalies(anomRes.data);
      if (insRes.success) setInsights(insRes.data);
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
          <h1 className="text-xl font-bold text-white">Price Anomaly Detection & AI Insights</h1>
          <p className="text-xs text-slate-400 mt-0.5">Automated detection of vendor price spikes against internal cost benchmarks.</p>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider">Active Price Variance Alerts</h2>
        <div className="grid grid-cols-1 gap-4">
          {anomalies.length === 0 ? (
            <div className="p-6 bg-slate-900 border border-emerald-500/30 rounded-2xl flex items-center gap-3.5 shadow-lg shadow-emerald-500/5">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">No Active Price Anomalies</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">All vendor quotations and unit prices are currently within acceptable benchmark thresholds (&lt;10% variance).</p>
              </div>
            </div>
          ) : (
            anomalies.map(anom => (
              <div key={anom.id} className="p-5 bg-slate-900 border border-amber-500/40 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{anom.product_name}</span>
                      <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        +{anom.variance_percentage}% Variance
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{anom.alert_message}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                      <span>Quoted Price: <strong className="text-white">₹{anom.current_price}</strong></span>
                      <span>Standard Benchmark: <strong className="text-slate-300">₹{anom.historical_benchmark_price}</strong></span>
                      <span>Supplier: <strong className="text-slate-300">{anom.supplier_name}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Strategic AI Insights */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Strategic Procurement Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map(ins => (
            <div key={ins.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">{ins.category} Optimization</span>
                <h3 className="text-sm font-bold text-white mt-1 mb-2">{ins.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{ins.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Recommended Action:</span>
                <p className="text-xs text-emerald-300 font-medium">{ins.action_item}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
