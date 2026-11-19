import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Database,
  RefreshCw 
} from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState(null);

  const loadLogs = async () => {
    try {
      const params = {};
      if (outcomeFilter !== 'ALL') params.outcome = outcomeFilter;
      if (search) params.search = search;
      const res = await api.getAuditLogs(params);
      if (res.success) setLogs(res.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [outcomeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLogs();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-white/20 text-indigo-200 px-3 py-1 rounded-full text-xs font-semibold mb-2 inline-block">
            Module 10 • Immutable Audit & Provenance Trail (W3C PROV / IndEA)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">System Audit Log Viewer</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Append-only historical ledger capturing every citizen access, consent decision, inter-service API exchange, and official administrative determination with correlation IDs.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition flex items-center space-x-1.5 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-slate-300" />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action or keyword (e.g. INTEROP, CONSENT, LOGIN)..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </form>

        <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Outcomes</option>
            <option value="Success">Success Only</option>
            <option value="Failure">Failure / Blocked Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor ID / Entity</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Resource Endpoint</th>
                <th className="p-4">Outcome</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-sans">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExp = expandedLogId === log._id;
                  return (
                    <React.Fragment key={log._id}>
                      <tr className="hover:bg-slate-50/80 transition">
                        <td className="p-4 text-slate-500 text-[11px] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          {log.actor?.length > 16 ? log.actor.slice(0, 14) + '...' : log.actor}
                        </td>
                        <td className="p-4 text-indigo-700 font-bold">{log.action}</td>
                        <td className="p-4 text-slate-600 text-[11px] truncate max-w-[200px]">
                          {log.resource}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.outcome === 'Success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.outcome}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setExpandedLogId(isExp ? null : log._id)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 transition"
                            title="Inspect JSON metadata"
                          >
                            {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                      {isExp && (
                        <tr>
                          <td colSpan="6" className="p-4 bg-slate-900 text-slate-200 font-mono text-[11px]">
                            <div className="flex justify-between items-center text-slate-400 pb-1 mb-2 border-b border-slate-800 font-sans">
                              <span>Correlation ID: <strong className="text-amber-400">{log.correlationId || 'N/A'}</strong></span>
                              <span>Record ID: {log._id}</span>
                            </div>
                            <pre className="overflow-x-auto text-[11px] text-slate-300">
                              {JSON.stringify(log.details || log, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
