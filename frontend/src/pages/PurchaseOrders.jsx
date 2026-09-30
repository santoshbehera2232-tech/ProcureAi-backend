import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, FileDown, CheckCircle, Search, Eye, X, Building, Truck, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.js';

export const PurchaseOrders = () => {
  const [pos, setPos] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [search, setSearch] = useState('');
  const { id } = useParams();

  useEffect(() => {
    fetchPOs();
  }, []);

  useEffect(() => {
    if (id && pos.length > 0) {
      const match = pos.find(p => p.id === id);
      if (match) setSelectedPO(match);
    }
  }, [id, pos]);

  const fetchPOs = async () => {
    try {
      const res = await api.getPurchaseOrders();
      if (res.success) setPos(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (poId, poNumber) => {
    setDownloading(true);
    try {
      const blob = await api.downloadPOPDF(poId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${poNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Could not download PO PDF: ' + (err.message || 'Server error'));
    } finally {
      setDownloading(false);
    }
  };

  const handleAcknowledge = async (poId) => {
    try {
      await api.acknowledgePO(poId);
      fetchPOs();
      if (selectedPO) setSelectedPO({ ...selectedPO, status: 'Acknowledged' });
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = pos.filter(po =>
    po.po_number.toLowerCase().includes(search.toLowerCase()) ||
    (po.supplier_name && po.supplier_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Purchase Orders (PO)</h1>
          <p className="text-xs text-slate-400 mt-0.5">Legally certified purchase commitments and vendor fulfillment tracking.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by PO number or supplier name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-850/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">PO Number</th>
                <th className="py-3.5 px-4">Vendor / Supplier</th>
                <th className="py-3.5 px-4">Amount (₹)</th>
                <th className="py-3.5 px-4">Delivery Date</th>
                <th className="py-3.5 px-4">Payment Terms</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No purchase orders recorded yet.
                  </td>
                </tr>
              ) : (
                filtered.map(po => (
                  <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-brand-400">{po.po_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">{po.supplier_name || 'Vendor'}</td>
                    <td className="py-3 px-4 font-bold text-white">₹{Number(po.grand_total).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-slate-400">{po.expected_delivery_date}</td>
                    <td className="py-3 px-4 text-slate-400">{po.payment_terms}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        po.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        po.status === 'In Transit' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        po.status === 'Delivered' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPO(po)}
                          className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(po.id, po.po_number)}
                          disabled={downloading}
                          className="px-2.5 py-1 bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <FileDown className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO Detail Modal */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{selectedPO.po_number}</h2>
                <span className="text-[10px] font-bold bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full">
                  {selectedPO.status}
                </span>
              </div>
              <button onClick={() => setSelectedPO(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-400 block mb-0.5">Supplier / Vendor:</span>
                  <span className="font-bold text-white text-sm">{selectedPO.supplier_name}</span>
                  <p className="text-slate-400 mt-1">Payment: {selectedPO.payment_terms}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Delivery Target:</span>
                  <span className="font-semibold text-slate-200">{selectedPO.expected_delivery_date}</span>
                  <p className="text-slate-400 mt-1 truncate">{selectedPO.delivery_address}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <span className="font-bold text-slate-300 block mb-2">Order Line Items</span>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-850 text-[10px] text-slate-400 uppercase">
                      <tr>
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3">Qty</th>
                        <th className="py-2 px-3">Unit Price (₹)</th>
                        <th className="py-2 px-3 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(selectedPO.items || []).map((it, idx) => (
                        <tr key={idx} className="text-slate-300">
                          <td className="py-2 px-3 font-medium">{it.product_name}</td>
                          <td className="py-2 px-3">{it.quantity_ordered || it.quantity || 1}</td>
                          <td className="py-2 px-3">₹{Number(it.unit_price || 0).toLocaleString('en-IN')}</td>
                          <td className="py-2 px-3 text-right font-semibold text-white">
                            ₹{Number(it.total_amount || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-right">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>₹{Number(selectedPO.subtotal || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST (18%):</span>
                  <span>₹{Number(selectedPO.tax_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                {selectedPO.freight_amount && (
                  <div className="flex justify-between text-slate-400">
                    <span>Freight:</span>
                    <span>₹{Number(selectedPO.freight_amount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white text-sm pt-2 border-t border-slate-800">
                  <span>Grand Total:</span>
                  <span className="text-brand-400">₹{Number(selectedPO.grand_total).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 mt-4">
              <button
                onClick={() => handleDownloadPDF(selectedPO.id, selectedPO.po_number)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/20"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download Stamped PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
