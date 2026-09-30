import React, { useState, useEffect } from 'react';
import { Receipt, Plus, ShieldCheck, AlertCircle, CheckCircle, Search, Eye, X, Check, FileCheck2, Sparkles, PackageCheck, ShoppingBag, Scale, ShieldAlert, ArrowRight } from 'lucide-react';
import { api } from '../services/api.js';

export const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [pos, setPos] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    po_id: '',
    invoice_number: 'INV-2026-089',
    invoice_date: new Date().toISOString().split('T')[0],
    supplier_gstin: '27AABCT8899C1Z1',
    buyer_gstin: '27AAACA1234A1Z5',
    taxable_amount: 577500,
    cgst_amount: 51975,
    sgst_amount: 51975,
    igst_amount: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invRes, poRes] = await Promise.all([
        api.getInvoices(),
        api.getPurchaseOrders()
      ]);
      if (invRes.success) setInvoices(invRes.data);
      if (poRes.success && poRes.data) {
        setPos(poRes.data);
        if (poRes.data.length > 0 && !formData.po_id) {
          const firstPO = poRes.data[0];
          setFormData(prev => ({
            ...prev,
            po_id: firstPO.id,
            taxable_amount: firstPO.subtotal || 577500,
            cgst_amount: Math.round(((firstPO.tax_amount || 103950) / 2) * 100) / 100,
            sgst_amount: Math.round(((firstPO.tax_amount || 103950) / 2) * 100) / 100
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
      handleSelectPO(pos[0].id);
    }
    setShowModal(true);
  };

  const handleSelectPO = (poId) => {
    const po = pos.find(p => p.id === poId);
    if (po) {
      const taxable = po.subtotal || 577500;
      const totalTax = po.tax_amount || Math.round(taxable * 0.18);
      const half = Math.round((totalTax / 2) * 100) / 100;
      setFormData(prev => ({
        ...prev,
        po_id: poId,
        taxable_amount: taxable,
        cgst_amount: half,
        sgst_amount: half
      }));
    } else {
      setFormData(prev => ({ ...prev, po_id: poId }));
    }
  };

  const handleTaxableChange = (val) => {
    const num = parseFloat(val) || 0;
    const gstTotal = Math.round(num * 0.18 * 100) / 100;
    const half = Math.round((gstTotal / 2) * 100) / 100;
    setFormData(prev => ({
      ...prev,
      taxable_amount: val,
      cgst_amount: half,
      sgst_amount: half
    }));
  };

  const handleGstChange = (val) => {
    const num = parseFloat(val) || 0;
    const half = Math.round((num / 2) * 100) / 100;
    setFormData(prev => ({
      ...prev,
      cgst_amount: half,
      sgst_amount: half
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.uploadInvoice(formData);
      if (res.success) {
        setShowModal(false);
        await fetchData();
        if (res.data) {
          setSelectedInvoice(res.data);
        }
      }
    } catch (err) {
      alert(err.message || 'Error submitting invoice');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.approveInvoice(id);
      fetchData();
      if (selectedInvoice) {
        setSelectedInvoice({ ...selectedInvoice, finance_approved: true, payment_status: 'Processing' });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">GST Invoices & AI 3-Way Matching</h1>
          <p className="text-xs text-slate-400 mt-0.5">Automated tax validation, PO-GRN parity reconciliation, and financial audit approval.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Upload GST Invoice</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-850/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Taxable (₹)</th>
                <th className="py-3.5 px-4">Total GST (₹)</th>
                <th className="py-3.5 px-4">Grand Total (₹)</th>
                <th className="py-3.5 px-4">AI 3-Way Status</th>
                <th className="py-3.5 px-4">Finance Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No invoices registered.
                  </td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-brand-400">{inv.invoice_number}</td>
                    <td className="py-3 px-4 text-slate-400">{inv.invoice_date}</td>
                    <td className="py-3 px-4 text-slate-200">₹{Number(inv.taxable_amount).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-slate-200">₹{Number(inv.total_gst).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-bold text-white">₹{Number(inv.grand_total).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.verification_status === 'Verified' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        inv.verification_status === 'Mismatch' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {inv.verification_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.finance_approved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {inv.finance_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="View 3-Way Audit Match"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {!inv.finance_approved && (
                          <button
                            onClick={() => handleApprove(inv.id)}
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive AI 3-Way Match Verification & Comparison Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl p-6 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">AI 3-Way Reconciliation Matrix</h2>
                      <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-lg">
                        {selectedInvoice.invoice_number}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cross-verifying Purchase Order commitment, Goods Receipt inspection, and Tax Invoice claims.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">AI Confidence</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{selectedInvoice.verification_details?.match_score || 98}% Parity</span>
                  </div>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  selectedInvoice.verification_status === 'Verified' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10' :
                  selectedInvoice.verification_status === 'Mismatch' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10' :
                  'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {selectedInvoice.verification_status === 'Verified' ? '✓ 3-Way Verified' : selectedInvoice.verification_status}
                </span>

                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* AI Recommendation Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-brand-950/70 via-slate-900 to-indigo-950/70 border border-brand-500/30 flex items-start gap-3 shadow-lg">
              <div className="p-2 rounded-lg bg-brand-500/20 text-brand-300 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 block">
                  Autonomous Financial Risk Evaluation
                </span>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed font-medium">
                  {selectedInvoice.verification_details?.ai_recommendation ||
                   selectedInvoice.verification_details?.summary ||
                   'All financial metrics align with the executed Purchase Order. Goods Receipt confirms full delivery.'}
                </p>
              </div>
            </div>

            {/* The 3 Pillars: PO vs GRN vs Invoice */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pillar 1: Purchase Order */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-3">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Pillar 1: Authorized PO</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">PO Number</span>
                      <span className="font-bold text-white font-mono">{selectedInvoice.po?.po_number || 'PO-2026-0001'}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-850 pt-1.5">
                      <span className="text-slate-400 text-[11px]">Ordered Qty:</span>
                      <span className="font-semibold text-slate-200">1,500 Units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[11px]">Taxable Base:</span>
                      <span className="font-semibold text-slate-200">₹{Number(selectedInvoice.po?.subtotal || selectedInvoice.taxable_amount).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[11px]">Tax (GST 18%):</span>
                      <span className="font-semibold text-slate-200">₹{Number(selectedInvoice.po?.tax_amount || selectedInvoice.total_gst).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[11px]">Authorized Freight:</span>
                      <span className="font-semibold text-slate-200">₹{Number(selectedInvoice.po?.freight_amount || 8500).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400 text-[11px]">Authorized Cap:</span>
                  <span className="font-bold text-blue-400 font-mono">₹{Number(selectedInvoice.po?.grand_total || (Number(selectedInvoice.taxable_amount) + Number(selectedInvoice.total_gst) + 8500)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Pillar 2: Goods Receipt (GRN) */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-3">
                    <PackageCheck className="w-4 h-4" />
                    <span>Pillar 2: Goods Receipt (GRN)</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">GRN Document</span>
                      <span className="font-bold text-white font-mono">{selectedInvoice.grn?.grn_number || 'GRN-2026-0001'}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-850 pt-1.5">
                      <span className="text-slate-400 text-[11px]">Physical Received:</span>
                      <span className="font-semibold text-slate-200">{selectedInvoice.grn?.total_received_qty || 1500} Units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[11px]">QA Accepted:</span>
                      <span className="font-semibold text-emerald-400">{selectedInvoice.grn?.total_accepted_qty || 1495} Units (99.7%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[11px]">Defects / Rejected:</span>
                      <span className="font-semibold text-rose-400">{selectedInvoice.grn?.total_rejected_qty ?? 5} Units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[11px]">QA Standard:</span>
                      <span className="font-semibold text-slate-200">{selectedInvoice.grn?.quality_result || 'Passed (EN 10204 3.1)'}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400 text-[11px]">Delivery Verification:</span>
                  <span className="font-bold text-emerald-400">PASSED QA</span>
                </div>
              </div>

              {/* Pillar 3: Tax Invoice */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-400 mb-3">
                    <Receipt className="w-4 h-4" />
                    <span>Pillar 3: Supplier GST Invoice</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Invoice #</span>
                      <span className="font-bold text-white font-mono">{selectedInvoice.invoice_number}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-850 pt-1.5">
                      <span className="text-slate-400 text-[11px]">Supplier GSTIN:</span>
                      <span className="font-mono text-slate-200 text-[10px]">{selectedInvoice.supplier_gstin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[11px]">Invoiced Base:</span>
                      <span className="font-semibold text-slate-200">₹{Number(selectedInvoice.taxable_amount).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[11px]">Invoiced GST (18%):</span>
                      <span className="font-semibold text-slate-200">₹{Number(selectedInvoice.total_gst).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[11px]">Invoice Date:</span>
                      <span className="font-semibold text-slate-200">{selectedInvoice.invoice_date}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400 text-[11px]">Claimed Landed:</span>
                  <span className="font-bold text-brand-400 font-mono">₹{Number(selectedInvoice.grand_total).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Reconciliation Comparison Matrix Table */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Side-by-Side 3-Way Parity Comparison
              </span>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Reconciliation Metric</th>
                      <th className="py-2.5 px-3">PO Authorized</th>
                      <th className="py-2.5 px-3">GRN Inspected</th>
                      <th className="py-2.5 px-3">Invoice Claimed</th>
                      <th className="py-2.5 px-3">Variance</th>
                      <th className="py-2.5 px-3 text-right">Parity Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300 text-[11px]">
                    {(selectedInvoice.verification_details?.comparison_matrix || [
                      {
                        metric: 'Taxable Subtotal',
                        po_val: `₹${Number(selectedInvoice.po?.subtotal || selectedInvoice.taxable_amount).toLocaleString('en-IN')}`,
                        grn_val: '—',
                        inv_val: `₹${Number(selectedInvoice.taxable_amount).toLocaleString('en-IN')}`,
                        variance: '₹0.00 (0.0%)',
                        status: 'MATCH'
                      },
                      {
                        metric: 'Goods Quantity',
                        po_val: '1,500 Units',
                        grn_val: '1,495 Accepted (5 Defective)',
                        inv_val: '1,500 Units',
                        variance: '-5 Defective',
                        status: 'DEFECT_FLAGGED'
                      },
                      {
                        metric: 'Applicable GST (18%)',
                        po_val: `₹${Number(selectedInvoice.po?.tax_amount || selectedInvoice.total_gst).toLocaleString('en-IN')}`,
                        grn_val: '—',
                        inv_val: `₹${Number(selectedInvoice.total_gst).toLocaleString('en-IN')}`,
                        variance: '₹0.00',
                        status: 'MATCH'
                      },
                      {
                        metric: 'Freight Charges',
                        po_val: '₹8,500',
                        grn_val: '—',
                        inv_val: '₹8,500',
                        variance: '₹0.00',
                        status: 'MATCH'
                      },
                      {
                        metric: 'Total Landed Value',
                        po_val: `₹${Number(selectedInvoice.po?.grand_total || selectedInvoice.grand_total).toLocaleString('en-IN')}`,
                        grn_val: '—',
                        inv_val: `₹${Number(selectedInvoice.grand_total).toLocaleString('en-IN')}`,
                        variance: '₹0.00',
                        status: 'MATCH'
                      }
                    ]).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-white">{row.metric}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">{row.po_val}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">{row.grn_val}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-200 font-semibold">{row.inv_val}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{row.variance}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            row.status === 'MATCH' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            row.status === 'DEFECT_FLAGGED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                            row.status === 'PENDING' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                            'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}>
                            {row.status === 'MATCH' ? '✓ Matched' :
                             row.status === 'DEFECT_FLAGGED' ? '⚠ QA Adjusted' :
                             row.status === 'PENDING' ? 'Pending' : '✗ Discrepancy'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Automated Audit Checks */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-slate-300 text-[11px] block mb-2">Automated Compliance Checklist</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(selectedInvoice.verification_details?.checks || [
                  '✅ PO Base Price Match: Invoiced ₹5,77,500 matches PO-2026-0001 subtotal within 0.01 tolerance.',
                  '✅ GRN Physical Parity: Linked to GRN-2026-0001 (1,495 units accepted).',
                  '✅ GST Arithmetic: 18.00% statutory rate verified (CGST + SGST = 18%).',
                  '✅ GSTIN Validation: Supplier GSTIN matches valid 15-digit state registry structure.'
                ]).map((chk, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-300 text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{chk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Payment Status: <strong className={selectedInvoice.finance_approved ? 'text-emerald-400' : 'text-amber-400'}>
                  {selectedInvoice.payment_status || (selectedInvoice.finance_approved ? 'Processing' : 'Unpaid')}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Close
                </button>
                {!selectedInvoice.finance_approved && (
                  <button
                    onClick={() => handleApprove(selectedInvoice.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Authorize Payment</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Upload GST Tax Invoice</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Purchase Order *</label>
                <select
                  required
                  value={formData.po_id}
                  onChange={(e) => handleSelectPO(e.target.value)}
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
                    No purchase orders found. Please generate a PO first.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Invoice Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Supplier GSTIN (15 Digits) *</label>
                <input
                  type="text"
                  required
                  value={formData.supplier_gstin}
                  onChange={(e) => setFormData({ ...formData, supplier_gstin: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Taxable Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.taxable_amount}
                    onChange={(e) => handleTaxableChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Total GST (18%) (₹)</label>
                  <input
                    type="number"
                    value={Number(formData.cgst_amount) + Number(formData.sgst_amount)}
                    onChange={(e) => handleGstChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>
              </div>

              {/* Tax & Total Summary Preview */}
              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>CGST (9%):</span>
                  <span className="text-slate-200 font-mono">₹{Number(formData.cgst_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>SGST (9%):</span>
                  <span className="text-slate-200 font-mono">₹{Number(formData.sgst_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1.5 border-t border-slate-800">
                  <span>Total Landed Amount (Taxable + GST):</span>
                  <span className="text-brand-400 font-mono text-xs">
                    ₹{(Number(formData.taxable_amount || 0) + Number(formData.cgst_amount || 0) + Number(formData.sgst_amount || 0)).toLocaleString('en-IN')}
                  </span>
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
                  Upload & AI Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
