import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldCheck, Star, Search, MapPin, Phone, Mail, Award, X } from 'lucide-react';
import { api } from '../services/api.js';

export const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    city: 'Pune',
    state: 'Maharashtra',
    gstin: '',
    pan: '',
    payment_terms: 'Net 30 Days'
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await api.getSuppliers();
      if (res.success) setSuppliers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createSupplier(formData);
      if (res.success) {
        setShowModal(false);
        fetchSuppliers();
      }
    } catch (err) {
      alert(err.message || 'Error creating supplier');
    }
  };

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.city && s.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Supplier Directory & Performance KPIs</h1>
          <p className="text-xs text-slate-400 mt-0.5">Vendor profiles, delivery compliance, and historical quality ratings.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Supplier</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by vendor name, city, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Grid of Suppliers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(s => (
          <div key={s.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-bold text-brand-400">{s.supplier_code}</span>
                  <h3 className="text-base font-bold text-white">{s.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{s.city}, {s.state}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {s.status}
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-1">{s.total_orders_completed || 0} Orders</span>
                </div>
              </div>

              {/* KPI Performance Bar */}
              <div className="grid grid-cols-3 gap-2 p-3 my-4 rounded-xl bg-slate-950 border border-slate-800/80 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">On-Time %</span>
                  <span className="font-bold text-emerald-400">{s.on_time_delivery_rate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">QA Acceptance</span>
                  <span className="font-bold text-blue-400">{s.quality_acceptance_rate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Rejection Rate</span>
                  <span className={`font-bold ${s.rejection_rate > 5 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {s.rejection_rate}%
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{s.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{s.phone || '+91-9800000000'}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>GSTIN: {s.gstin || '27AABCT8899C1Z1'}</span>
              <span className="text-brand-400 font-semibold">{s.payment_terms}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Onboard Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Onboard New Supplier</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Company / Trade Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bharat Heavy Precision Parts"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">GSTIN</label>
                  <input
                    type="text"
                    placeholder="27AABCT8899C1Z1"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25"
                >
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
