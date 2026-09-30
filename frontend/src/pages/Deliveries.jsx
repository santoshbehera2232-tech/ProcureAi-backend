import React, { useState, useEffect } from 'react';
import { PackageCheck, Plus, ShieldCheck, AlertTriangle, Search, X, Check } from 'lucide-react';
import { api } from '../services/api.js';

export const Deliveries = () => {
  const [grns, setGrns] = useState([]);
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    po_id: '',
    received_date: new Date().toISOString().split('T')[0],
    total_received_qty: 1500,
    total_accepted_qty: 1495,
    total_rejected_qty: 5,
    total_damaged_qty: 0,
    quality_result: 'Passed',
    inspection_notes: 'Visual and dimensional sampling passed EN 10204 3.1 standards.'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [grnRes, poRes] = await Promise.all([
        api.getDeliveries(),
        api.getPurchaseOrders()
      ]);
      if (grnRes.success) setGrns(grnRes.data);
      if (poRes.success && poRes.data) {
        setPos(poRes.data);
        if (poRes.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            po_id: prev.po_id || poRes.data[0].id
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
    if (pos.length > 0 && !formData.po_id) {
      setFormData(prev => ({
        ...prev,
        po_id: pos[0].id
      }));
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createGoodsReceipt(formData);
      if (res.success) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error recording goods receipt');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Goods Receipt & Quality Inspection (GRN)</h1>
          <p className="text-xs text-slate-400 mt-0.5">Physical receiving, QA acceptance verification, and defect rejection logs.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Goods Receipt (GRN)</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-850/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">GRN Number</th>
                <th className="py-3.5 px-4">Received Date</th>
                <th className="py-3.5 px-4">Received Qty</th>
                <th className="py-3.5 px-4">Accepted Qty</th>
                <th className="py-3.5 px-4">Rejected Qty</th>
                <th className="py-3.5 px-4">QA Result</th>
                <th className="py-3.5 px-4">Inspection Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {grns.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No Goods Receipt Notes registered yet.
                  </td>
                </tr>
              ) : (
                grns.map(grn => (
                  <tr key={grn.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-brand-400">{grn.grn_number}</td>
                    <td className="py-3 px-4 text-slate-400">{grn.received_date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{grn.total_received_qty}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-400">{grn.total_accepted_qty}</td>
                    <td className="py-3 px-4 font-semibold text-rose-400">{grn.total_rejected_qty}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        grn.quality_result === 'Passed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {grn.quality_result}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{grn.inspection_notes || 'Inspected'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Record Goods Receipt Note (GRN)</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Purchase Order *</label>
                <select
                  required
                  value={formData.po_id}
                  onChange={(e) => setFormData({ ...formData, po_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="" className="bg-slate-900 text-slate-400">
                    {pos.length === 0 ? '-- No Purchase Orders Available --' : 'Select PO...'}
                  </option>
                  {pos.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white py-1">
                      {p.po_number} - {p.supplier_name || 'Vendor'} (₹{Number(p.grand_total).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
                {pos.length === 0 && (
                  <p className="text-[11px] text-amber-400 mt-1">
                    No purchase orders found. Please ensure a PO has been generated.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Received Qty *</label>
                  <input
                    type="number"
                    required
                    value={formData.total_received_qty}
                    onChange={(e) => setFormData({ ...formData, total_received_qty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Accepted Qty *</label>
                  <input
                    type="number"
                    required
                    value={formData.total_accepted_qty}
                    onChange={(e) => setFormData({ ...formData, total_accepted_qty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Rejected Qty</label>
                  <input
                    type="number"
                    value={formData.total_rejected_qty}
                    onChange={(e) => setFormData({ ...formData, total_rejected_qty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Quality Inspection Result</label>
                <select
                  value={formData.quality_result}
                  onChange={(e) => setFormData({ ...formData, quality_result: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Passed">Passed (Meets 100% specs)</option>
                  <option value="Conditionally Passed">Conditionally Passed</option>
                  <option value="Rejected">Rejected (Non-conforming)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Quality Inspection Remarks</label>
                <textarea
                  rows="3"
                  value={formData.inspection_notes}
                  onChange={(e) => setFormData({ ...formData, inspection_notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-brand-500"
                />
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
                  Register GRN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
