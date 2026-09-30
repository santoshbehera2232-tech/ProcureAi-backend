import React, { useState, useEffect } from 'react';
import { Truck, Plus, MapPin, Search, Calendar, ChevronRight, X, Clock, CheckCircle } from 'lucide-react';
import { api } from '../services/api.js';

export const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    po_id: '',
    carrier_name: 'BlueDart Surface Cargo',
    tracking_number: '',
    dispatch_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    current_location: 'Vendor Central Dispatch Yard',
    notes: 'Shrink-wrapped pallets with moisture protection'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shipRes, poRes] = await Promise.all([
        api.getShipments(),
        api.getPurchaseOrders()
      ]);
      if (shipRes.success) setShipments(shipRes.data);
      if (poRes.success && poRes.data) {
        setPos(poRes.data);
        if (poRes.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            po_id: prev.po_id || poRes.data[0].id,
            expected_delivery_date: prev.expected_delivery_date || poRes.data[0].expected_delivery_date || ''
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
        po_id: pos[0].id,
        expected_delivery_date: pos[0].expected_delivery_date || ''
      }));
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createShipment(formData);
      if (res.success) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error dispatching shipment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Shipments & Logistics Tracking</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time consignments, carrier tracking, and transit lifecycle.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch Shipment</span>
        </button>
      </div>

      {/* Grid of Shipments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shipments.map(s => (
          <div key={s.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-extrabold text-brand-400">{s.shipment_number}</span>
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  {s.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-white mb-2">
                <Truck className="w-4 h-4 text-slate-400" />
                <span>{s.carrier_name}</span>
                <span className="text-slate-400 font-normal">({s.tracking_number})</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 my-3">
                <div className="flex items-start gap-2 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current Waypoint / Location:</span>
                    <span className="text-slate-200 font-semibold">{s.current_location}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2">
                <div>
                  <span>Dispatched: </span>
                  <span className="text-slate-200 font-medium">{s.dispatch_date}</span>
                </div>
                <div>
                  <span>ETA Delivery: </span>
                  <span className="text-slate-200 font-medium">{s.expected_delivery_date}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">{s.notes || 'In transit via carrier'}</span>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Active Track</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Dispatch New Shipment</h2>
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
                  onChange={(e) => {
                    const sel = pos.find(p => p.id === e.target.value);
                    setFormData({
                      ...formData,
                      po_id: e.target.value,
                      expected_delivery_date: sel?.expected_delivery_date || formData.expected_delivery_date
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
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
                    No purchase orders found. You can generate a PO from the Quotations comparison tab.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Logistics Carrier *</label>
                  <input
                    type="text"
                    required
                    value={formData.carrier_name}
                    onChange={(e) => setFormData({ ...formData, carrier_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">AWB / Tracking # *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BLD-894102"
                    value={formData.tracking_number}
                    onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Dispatch Date</label>
                  <input
                    type="date"
                    value={formData.dispatch_date}
                    onChange={(e) => setFormData({ ...formData, dispatch_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ETA Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expected_delivery_date}
                    onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Current Origin / Hub</label>
                <input
                  type="text"
                  value={formData.current_location}
                  onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
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
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
