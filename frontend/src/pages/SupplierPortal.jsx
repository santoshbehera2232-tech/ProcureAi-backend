import React, { useState, useEffect } from 'react';
import { FileCheck2, Send, ShoppingBag, Truck, Receipt, CheckCircle, Clock, X } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const SupplierPortal = () => {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState(null);

  // Quote Form
  const [quoteForm, setQuoteForm] = useState({
    subtotal: 580000,
    discount_amount: 10000,
    freight_charges: 8000,
    lead_time_days: 7,
    promised_delivery_date: '',
    payment_terms: 'Net 30 Days',
    notes: 'Ex-works Pune with Mill Test Certificate EN 10204 3.1'
  });

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      const [rfqRes, poRes] = await Promise.all([
        api.getRFQs(),
        api.getPurchaseOrders()
      ]);
      if (rfqRes.success) setRfqs(rfqRes.data);
      if (poRes.success) setPos(poRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuote = (rfq) => {
    setSelectedRfq(rfq);
    setQuoteForm(prev => ({
      ...prev,
      promised_delivery_date: rfq.target_delivery_date
    }));
    setShowQuoteModal(true);
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    try {
      const res = await api.submitQuotation({
        rfq_id: selectedRfq.id,
        supplier_id: user?.supplier_id,
        ...quoteForm
      });
      if (res.success) {
        alert('Quotation submitted successfully! It is now being analyzed by the company.');
        setShowQuoteModal(false);
        fetchVendorData();
      }
    } catch (err) {
      alert(err.message || 'Error submitting quote');
    }
  };

  const handleAcknowledge = async (poId) => {
    try {
      await api.acknowledgePO(poId);
      alert('Purchase Order successfully acknowledged.');
      fetchVendorData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 p-6 rounded-2xl border border-indigo-800/40">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
            Secure Vendor Portal
          </span>
        </div>
        <h1 className="text-xl font-bold text-white mt-1">Welcome, {user?.full_name || 'Vendor Admin'}</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Responding on behalf of: <strong className="text-brand-400">{user?.supplier_name || 'Titan Alloys & Steels Ltd'}</strong>
        </p>
      </div>

      {/* Two Column: Active RFQs to Bid & Purchase Orders Awarded */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active RFQs */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-brand-400" />
              <span>RFQs Open for Bidding</span>
            </h2>
            <span className="text-xs text-slate-400">{rfqs.length} Opportunities</span>
          </div>

          <div className="space-y-3">
            {rfqs.map(rfq => (
              <div key={rfq.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-400">{rfq.rfq_number}</span>
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>Closes: {new Date(rfq.submission_deadline).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-1">{rfq.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">Due Date: {rfq.target_delivery_date}</p>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenQuote(rfq)}
                    className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-brand-500/20 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Binding Quote</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* POs Awarded */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Awarded Purchase Orders</span>
            </h2>
            <span className="text-xs text-slate-400">{pos.length} Orders</span>
          </div>

          <div className="space-y-3">
            {pos.map(po => (
              <div key={po.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">{po.po_number}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      {po.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-300 font-semibold">Total Order Value:</span>
                    <span className="text-xs font-bold text-white">₹{Number(po.grand_total).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Target Delivery: {po.expected_delivery_date}</p>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-800">
                  {po.status === 'Approved' ? (
                    <button
                      onClick={() => handleAcknowledge(po.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Acknowledge PO</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>PO Acknowledged</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quote Submission Modal */}
      {showQuoteModal && selectedRfq && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-brand-400">{selectedRfq.rfq_number}</span>
                <h2 className="text-base font-bold text-white">Submit Commercial Quotation</h2>
              </div>
              <button onClick={() => setShowQuoteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Subtotal (Excl. Tax) ₹ *</label>
                  <input
                    type="number"
                    required
                    value={quoteForm.subtotal}
                    onChange={(e) => setQuoteForm({ ...quoteForm, subtotal: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Trade Discount ₹</label>
                  <input
                    type="number"
                    value={quoteForm.discount_amount}
                    onChange={(e) => setQuoteForm({ ...quoteForm, discount_amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Freight Charges ₹</label>
                  <input
                    type="number"
                    value={quoteForm.freight_charges}
                    onChange={(e) => setQuoteForm({ ...quoteForm, freight_charges: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Lead Time (Days) *</label>
                  <input
                    type="number"
                    required
                    value={quoteForm.lead_time_days}
                    onChange={(e) => setQuoteForm({ ...quoteForm, lead_time_days: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Promised Delivery Date *</label>
                <input
                  type="date"
                  required
                  value={quoteForm.promised_delivery_date}
                  onChange={(e) => setQuoteForm({ ...quoteForm, promised_delivery_date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Technical Notes / Certifications</label>
                <textarea
                  rows="2"
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Binding Proposal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
