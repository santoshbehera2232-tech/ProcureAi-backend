import React, { useState, useEffect } from 'react';
import { FolderLock, FileText, Download, Plus, Search, Filter, X } from 'lucide-react';
import { api } from '../services/api.js';

export const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Quality Report',
    file_name: 'Certificate_EN10204.pdf'
  });

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await api.getDocuments();
      if (res.success) setDocuments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const res = await api.uploadDocument(formData);
      if (res.success) {
        setShowModal(false);
        fetchDocs();
      }
    } catch (err) {
      alert(err.message || 'Error uploading document');
    }
  };

  const handleDownload = async (doc) => {
    try {
      const blob = await api.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Could not download document: ' + (err.message || 'Error'));
    }
  };

  const filtered = documents.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Document Vault & Specifications</h1>
          <p className="text-xs text-slate-400 mt-0.5">Encrypted compliance repository: Mill certificates, contracts, and quality specs.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search documents by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map(doc => (
          <div key={doc.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="p-3 w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-brand-400 mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {doc.category}
              </span>
              <h3 className="text-sm font-bold text-white mt-2 mb-1 line-clamp-1">{doc.title}</h3>
              <p className="text-[11px] text-slate-400 font-mono truncate">{doc.file_name}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{Math.round((doc.file_size || 450000) / 1024)} KB</span>
              <button
                onClick={() => handleDownload(doc)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 rounded-lg text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Upload Compliance Document</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ISO 9001:2015 Recertification Certificate"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Quality Report">Quality Report / MTC</option>
                  <option value="Contract">Procurement Contract</option>
                  <option value="GST Document">GST Certificate</option>
                  <option value="Product Specification">Technical Specs Sheet</option>
                </select>
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
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
