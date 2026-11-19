import React from 'react';
import { ShieldCheck, Lock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function ConsentModal({
  isOpen,
  onClose,
  requestingDepartment = 'Higher & Technical Education Department',
  purpose = 'Automated cross-department eligibility verification for scholarship sanction.',
  categories = ['Income certificate status', 'Residence verification', 'Educational information'],
  expiryDays = 90,
  onApprove,
  onDeny
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-blue-800 p-5 text-white flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
              Module 3 • Privacy & Consent Gate
            </span>
            <h3 className="text-lg font-bold">Approve Data Sharing Consent</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 flex items-start space-x-3">
            <Lock className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 leading-relaxed">
              <strong className="font-semibold">{requestingDepartment}</strong> is requesting permission to access your verified records from independent government databases.
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Requested Data Categories
            </label>
            <ul className="space-y-2">
              {categories.map((cat, idx) => (
                <li key={idx} className="flex items-center space-x-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{cat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Purpose of Data Access
            </label>
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {purpose}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Validity Period: <strong className="text-slate-800">{expiryDays} Days</strong></span>
            <span className="text-[11px] text-indigo-600">You may revoke anytime</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
          <button
            onClick={onDeny}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition flex items-center space-x-1.5"
          >
            <XCircle className="w-4 h-4 text-rose-500" />
            <span>Deny Access</span>
          </button>
          <button
            onClick={onApprove}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 shadow-md transition flex items-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Approve & Proceed</span>
          </button>
        </div>
      </div>
    </div>
  );
}
