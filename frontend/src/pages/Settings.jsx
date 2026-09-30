import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Sliders, Building, Check, Save } from 'lucide-react';
import { api } from '../services/api.js';

export const Settings = () => {
  const [org, setOrg] = useState(null);
  const [weights, setWeights] = useState({
    price: 40,
    delivery: 20,
    reliability: 20,
    quality: 15,
    commercial: 5
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchOrg();
  }, []);

  const fetchOrg = async () => {
    try {
      const res = await api.getOrganization();
      if (res.success && res.data) {
        setOrg(res.data);
        if (res.data.scoring_weights) setWeights(res.data.scoring_weights);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleWeightChange = (key, val) => {
    setWeights(prev => ({ ...prev, [key]: Number(val) }));
    setSaved(false);
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleSaveWeights = async () => {
    if (totalWeight !== 100) {
      return alert(`Total weights must sum to exactly 100%. Current total: ${totalWeight}%`);
    }
    try {
      await api.updateScoringWeights(weights);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white">System Settings & Governance</h1>
        <p className="text-xs text-slate-400 mt-0.5">Configure multi-factor AI scoring weights and company procurement parameters.</p>
      </div>

      {/* AI Scoring Weights Configuration */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-400" />
              <span>Quotation AI Scoring Weights Configuration</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Weights determine how algorithms score and rank competing vendor proposals.</p>
          </div>
          <div className="text-right">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${totalWeight === 100 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
              Total: {totalWeight}%
            </span>
          </div>
        </div>

        <div className="space-y-5">
          {[
            { key: 'price', label: 'Price Competitiveness (%)', desc: 'Relative landed cost compared to competitors & standard cost benchmark' },
            { key: 'delivery', label: 'Delivery Speed & Lead Time (%)', desc: 'Promised fulfillment timeline against project deadline' },
            { key: 'reliability', label: 'Supplier Reliability History (%)', desc: 'Historical on-time delivery track record and fulfillment rate' },
            { key: 'quality', label: 'Quality & Low Defect History (%)', desc: 'Acceptance rate and lack of QA rejection in previous consignments' },
            { key: 'commercial', label: 'Commercial Terms (%)', desc: 'Favorable credit terms (Net 30/45) and warranty duration' }
          ].map(crit => (
            <div key={crit.key} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-slate-200">{crit.label}</span>
                  <p className="text-[11px] text-slate-400">{crit.desc}</p>
                </div>
                <span className="font-bold text-brand-400 text-sm">{weights[crit.key]}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={weights[crit.key]}
                onChange={(e) => handleWeightChange(crit.key, e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={handleSaveWeights}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-brand-500/25 transition-all"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Weights Saved Successfully!' : 'Save Weights'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
