import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, X, FileCheck2, Search, Filter, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const PurchaseRequirements = () => {
  const [requirements, setRequirements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    priority: 'Medium',
    required_date: '',
    delivery_location: 'Apex Central Plant, Mumbai',
    notes: '',
    items: [
      { product_name: '', sku: '', quantity: 1, unit: 'Kg', estimated_unit_price: 0 }
    ]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, prodRes] = await Promise.all([
        api.getRequirements(),
        api.getProducts()
      ]);
      if (reqRes.success) setRequirements(reqRes.data);
      if (prodRes.success) setProducts(prodRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_name: '', sku: '', quantity: 1, unit: 'Kg', estimated_unit_price: 0 }]
    }));
  };

  const handleItemChange = (idx, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[idx][field] = value;
      return { ...prev, items: newItems };
    });
  };

  const handleSelectProduct = (idx, productId) => {
    const selected = products.find(p => p.id === productId);
    if (selected) {
      setFormData(prev => {
        const newItems = [...prev.items];
        newItems[idx].product_id = selected.id;
        newItems[idx].product_name = selected.name;
        newItems[idx].sku = selected.sku;
        newItems[idx].unit = selected.unit;
        newItems[idx].estimated_unit_price = selected.standard_price;
        return { ...prev, items: newItems };
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createRequirement(formData);
      if (res.success) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error creating requirement');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.updateRequirementStatus(id, { status, comments: `Status changed to ${status}` });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = requirements.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.requirement_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Purchase Requirements</h1>
          <p className="text-xs text-slate-400 mt-0.5">Internal material requisitions with budgeting and approval gates.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Requirement</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by REQ number, title, specification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
          <option value="RFQ Created">RFQ Created</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-850/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">REQ #</th>
                <th className="py-3.5 px-4">Title & Material</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Budget (₹)</th>
                <th className="py-3.5 px-4">Required Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No purchase requirements found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(req => (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{req.requirement_number}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-200">{req.title}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{req.delivery_location}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.priority === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      ₹{Number(req.budget).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{req.required_date}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        req.status === 'RFQ Created' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        req.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {req.status === 'Submitted' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(req.id, 'Approved')}
                              title="Approve Requirement"
                              className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(req.id, 'Rejected')}
                              title="Reject Requirement"
                              className="p-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {req.status === 'Approved' && (
                          <button
                            onClick={() => navigate(`/rfqs?createFrom=${req.id}`)}
                            className="px-2.5 py-1 bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <span>Create RFQ</span>
                            <ArrowRight className="w-3 h-3" />
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

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Create Purchase Requirement</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Requirement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Precision CNC Machined Components Lot B"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Required By Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.required_date}
                    onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Delivery Plant</label>
                  <input
                    type="text"
                    value={formData.delivery_location}
                    onChange={(e) => setFormData({ ...formData, delivery_location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">Bill of Materials / Items</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-center">
                      <div className="sm:col-span-4">
                        <select
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-xs text-white"
                          onChange={(e) => handleSelectProduct(idx, e.target.value)}
                        >
                          <option value="">Select Catalog Product...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          placeholder="Item Name"
                          value={item.product_name}
                          onChange={(e) => handleItemChange(idx, 'product_name', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="number"
                          placeholder="Est. Unit Price ₹"
                          value={item.estimated_unit_price}
                          onChange={(e) => handleItemChange(idx, 'estimated_unit_price', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
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
                  Submit Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
