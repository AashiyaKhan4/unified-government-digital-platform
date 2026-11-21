import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  Building2,
  Calendar
} from 'lucide-react';

export default function ConsentPage() {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadConsents = async () => {
    try {
      const res = await api.getConsentHistory();
      if (res.success) setConsents(res.consents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsents();
  }, []);

  const handleRevoke = async (consentId) => {
    if (!window.confirm('Are you sure you want to revoke this consent? Connected government portals will immediately be blocked from exchanging this data.')) return;
    try {
      const res = await api.revokeConsent(consentId);
      if (res.success) {
        setMessage('Consent revoked successfully. Inter-service data sharing stopped.');
        setTimeout(() => setMessage(''), 4000);
        await loadConsents();
      }
    } catch (err) {
      alert('Error revoking consent: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-400">Loading Consent Registry...</div>;
  }

  const activeConsents = consents.filter(c => c.status === 'Approved');
  const pastConsents = consents.filter(c => c.status !== 'Approved');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-2 inline-block">
          Module 3 • Citizen-Controlled Consent Framework
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Data Sharing Permissions & Consent History</h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
          Under the Digital Personal Data Protection guidelines, the platform gives you complete sovereignty over which departments can access your verified records, for what purpose, and for how long.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-bold flex items-center space-x-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Active Consents */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Active Data Sharing Authorizations ({activeConsents.length})</span>
        </h2>

        {activeConsents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No active consents currently granted.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeConsents.map((consent) => (
              <div
                key={consent._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                      <Building2 className="w-3 h-3" />
                      <span>{consent.requestingServiceId || 'Scholarship Department'}</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Approved
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                      Permitted Data Categories
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(consent.categories || []).map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">
                      Authorized Purpose
                    </span>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {consent.purpose}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Expires: {consent.expiry ? new Date(consent.expiry).toLocaleDateString() : '90 Days'}</span>
                  </div>

                  <button
                    onClick={() => handleRevoke(consent._id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke Consent</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past / Revoked Consents History */}
      {pastConsents.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-slate-400" />
            <span>Past / Revoked Consents History</span>
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Categories</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Revoked / Ended</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pastConsents.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-800">{c.requestingServiceId}</td>
                    <td className="p-3.5 text-slate-600">{c.categories?.join(', ')}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{c.revokedAt ? new Date(c.revokedAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
