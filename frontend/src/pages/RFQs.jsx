import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Sparkles, Search, Filter, Calendar, Users, ChevronRight, X, Clock } from 'lucide-react';
import { api } from '../services/api.js';

export const RFQs = () => {
  const [rfqs, setRfqs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchParams] = useSearchParams();

  // Sensible default dates: deadline 7 days from today, target delivery 21 days from today
  const defaultDeadline = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const defaultDelivery = new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0];

  // Create form state
  const [formData, setFormData] = useState({
    title: '',
    target_delivery_date: defaultDelivery,
    submission_deadline: defaultDeadline,
    delivery_location: 'Apex Central Plant, Mumbai',
    payment_terms: 'Net 30 Days',
    invited_suppliers: [],
    items: [
      { product_name: 'Stainless Steel 316L Round Rod 25mm', sku: 'RAW-SS-316L-25', quantity: 1000, unit: 'Kg', specifications: 'Standard mill finish EN 10204 3.1' }
    ]
  });

  useEffect(() => {
    fetchData();
    const fromId = searchParams.get('createFrom');
    if (fromId) {
      api.getRequirements().then(res => {
        if (res.success && res.data) {
          const req = res.data.find(r => r.id === fromId);
          if (req) {
            setFormData(prev => ({
              ...prev,
              title: `RFQ for ${req.title}`,
              requirement_id: req.id,
              target_delivery_date: req.required_by_date || prev.target_delivery_date,
              items: (req.items && req.items.length > 0) ? req.items.map(it => ({
                product_name: it.product_name,
                sku: it.sku || '',
                quantity: it.quantity,
                unit: it.unit || 'Kg',
                specifications: it.specifications || 'Standard specifications'
              })) : prev.items
            }));
          }
        }
      }).catch(console.error);
      setShowModal(true);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [rfqRes, supRes] = await Promise.all([
        api.getRFQs(),
        api.getSuppliers()
      ]);
      if (rfqRes.success && rfqRes.data) setRfqs(rfqRes.data);
      if (supRes.success && supRes.data) {
        setSuppliers(supRes.data);
        if (supRes.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            invited_suppliers: prev.invited_suppliers.length > 0 ? prev.invited_suppliers : supRes.data.map(s => s.id)
          }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    if (suppliers.length > 0 && formData.invited_suppliers.length === 0) {
      setFormData(prev => ({
        ...prev,
        invited_suppliers: suppliers.map(s => s.id)
      }));
    }
    setShowModal(true);
  };

  const handleToggleSupplier = (supId) => {
    setFormData(prev => {
      const exists = prev.invited_suppliers.includes(supId);
      return {
        ...prev,
        invited_suppliers: exists
          ? prev.invited_suppliers.filter(id => id !== supId)
          : [...prev.invited_suppliers, supId]
      };
    });
  };

  const handleSelectAllSuppliers = () => {
    if (formData.invited_suppliers.length === suppliers.length) {
      setFormData(prev => ({ ...prev, invited_suppliers: [] }));
    } else {
      setFormData(prev => ({ ...prev, invited_suppliers: suppliers.map(s => s.id) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Auto-fallback for suppliers so submission never fails
    let toInvite = formData.invited_suppliers;
    if (toInvite.length === 0) {
      if (suppliers.length > 0) {
        toInvite = suppliers.map(s => s.id);
      } else {
        toInvite = ['s0000000-0000-0000-0000-000000000001'];
      }
    }

    try {
      const payload = {
        ...formData,
        invited_suppliers: toInvite,
        submission_deadline: formData.submission_deadline
          ? (formData.submission_deadline.includes('T') ? formData.submission_deadline : `${formData.submission_deadline}T18:00:00Z`)
          : new Date(Date.now() + 7 * 86400000).toISOString(),
        target_delivery_date: formData.target_delivery_date || defaultDelivery
      };

      const res = await api.createRFQ(payload);
      if (res.success) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error publishing RFQ');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Requests for Quotations (RFQs)</h1>
          <p className="text-xs text-slate-400 mt-0.5">Competitive multi-vendor quote solicitations and deadline management.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create RFQ</span>
        </button>
      </div>

      {/* Grid of RFQs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rfqs.map(rfq => (
          <div key={rfq.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-extrabold text-brand-400 tracking-wider">{rfq.rfq_number}</span>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {rfq.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white line-clamp-1">{rfq.title}</h3>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Due: {rfq.target_delivery_date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Closing: {new Date(rfq.submission_deadline).toLocaleDateString()}</span>
                </div>
                <div className="col-span-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{(rfq.invited_suppliers || []).length} Vendors Invited</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Payment: {rfq.payment_terms}</span>
              <Link
                to={`/quotations/compare?rfq_id=${rfq.id}`}
                className="px-3.5 py-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Compare & AI Score</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create RFQ Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Create Request for Quotation (RFQ)</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">RFQ Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourcing Stainless Steel 316L Billets Lot 10"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.target_delivery_date}
                    onChange={(e) => setFormData({ ...formData, target_delivery_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Submission Deadline *</label>
                  <input
                    type="date"
                    required
                    value={formData.submission_deadline}
                    onChange={(e) => setFormData({ ...formData, submission_deadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Sourcing Item Details */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Sourcing Requirement Specification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-0.5">Item Description</label>
                    <input
                      type="text"
                      required
                      value={formData.items[0]?.product_name || ''}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[0] = { ...newItems[0], product_name: e.target.value };
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Target Quantity</label>
                    <input
                      type="number"
                      required
                      value={formData.items[0]?.quantity || 1000}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[0] = { ...newItems[0], quantity: parseFloat(e.target.value) || 0 };
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Suppliers Invitation Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300">Invite Qualified Suppliers *</label>
                  {suppliers.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllSuppliers}
                      className="text-[10px] text-brand-400 hover:text-brand-300 font-semibold"
                    >
                      {formData.invited_suppliers.length === suppliers.length ? 'Deselect All' : `Select All (${suppliers.length})`}
                    </button>
                  )}
                </div>

                {suppliers.length === 0 ? (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
                    Directory suppliers loading... Registered suppliers (Titan Alloys, Vertex Precision, ElectroTech) will be automatically invited.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                    {suppliers.map(s => {
                      const checked = formData.invited_suppliers.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                            checked ? 'bg-brand-600/20 border border-brand-500/40 text-brand-200' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleSupplier(s.id)}
                            className="rounded border-slate-700 text-brand-500 focus:ring-brand-500"
                          />
                          <span className="truncate">{s.name} ({s.city || 'India'})</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-500/25"
                >
                  Publish RFQ to Suppliers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
