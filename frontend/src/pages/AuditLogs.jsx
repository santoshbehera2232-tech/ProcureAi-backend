import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, Search, Filter } from 'lucide-react';
import { api } from '../services/api.js';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.getAuditLogs();
      if (res.success) setLogs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.user_name.toLowerCase().includes(search.toLowerCase()) ||
    l.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Immutable Governance Audit Logs</h1>
          <p className="text-xs text-slate-400 mt-0.5">Tamper-evident trail of approvals, quote awards, deliveries, and logins.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by action (e.g. GENERATE_PO, AWARD_QUOTATION), user or entity..."
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
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Operator / User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Details Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4 font-semibold text-white">{l.user_name}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-brand-300 border border-slate-700">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{l.entity}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{l.ip_address}</td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                    {JSON.stringify(l.details || {})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
