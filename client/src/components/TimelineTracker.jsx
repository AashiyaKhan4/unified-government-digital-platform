import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, Database, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

export default function TimelineTracker({ application, onRetry }) {
  const [showRawLogs, setShowRawLogs] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  if (!application) return null;

  const timeline = application.timeline || [];
  const status = application.status;
  const isDelayed = status === 'Pending Verification';
  const isIncomplete = status === 'Incomplete';

  const stagesDef = [
    { name: 'Application Submitted', desc: 'Successfully received by the department via Samanvay Gateway' },
    { name: 'Initial Validation', desc: 'Basic information and unified profile matched' },
    { name: 'Department Verification', desc: 'Inter-department verification of income, residence & records' },
    { name: 'Decision / Approval', desc: 'Sanction and final departmental determination' }
  ];

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    await onRetry(application._id);
    setIsRetrying(false);
  };

  const getStageStatus = (stageName) => {
    const found = timeline.find(t => t.stage.toLowerCase().includes(stageName.toLowerCase().slice(0, 10)));
    if (!found) {
      if (status === 'Approved') return 'Completed';
      return 'Upcoming';
    }
    return found.status;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
              {application.applicationTrackingCode || application._id}
            </span>
            <h2 className="text-lg font-bold text-slate-900">{application.serviceName}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Department: <strong className="text-slate-700">{application.department}</strong> • Submitted: {new Date(application.submittedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
            status === 'Under Verification' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
            status === 'Pending Verification' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
            status === 'Incomplete' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
            'bg-slate-100 text-slate-800'
          }`}>
            {status}
          </span>

          {isDelayed && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition flex items-center space-x-1"
              title="Retry verification through connectors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>

      {/* Delayed / Incomplete Notice Banner */}
      {isDelayed && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <strong className="font-bold">Pending External Portal Response:</strong> {application.statusReason || 'One or more connected departmental APIs experienced latency. Application has been safely preserved in Pending Verification state per resilience policy.'}
          </div>
        </div>
      )}

      {isIncomplete && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900">
            <strong className="font-bold">Consent Required:</strong> {application.statusReason || 'Application requires citizen data sharing consent before inter-service verifications can proceed.'}
          </div>
        </div>
      )}

      {/* 4-Stage Stepper (Page 7 UI) */}
      <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {stagesDef.map((stage, idx) => {
          const stStatus = getStageStatus(stage.name);
          const isDone = stStatus === 'Completed' || stStatus === 'Approved';
          const isInProg = stStatus === 'In Progress' || stStatus === 'Under Final Review';
          const isBlocked = stStatus === 'Blocked' || stStatus === 'Pending';

          return (
            <div key={idx} className="relative flex items-start space-x-4">
              {/* Stepper Dot */}
              <div className={`absolute -left-6 flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white ${
                isDone ? 'border-emerald-600 text-emerald-600' :
                isInProg ? 'border-blue-600 text-blue-600 ring-4 ring-blue-100' :
                isBlocked ? 'border-amber-500 text-amber-500 ring-4 ring-amber-100' :
                'border-slate-300 text-slate-300'
              }`}>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />
                ) : isInProg ? (
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                ) : (
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Stage content */}
              <div className="flex-1 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">{stage.name}</h4>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    isDone ? 'bg-emerald-100 text-emerald-800' :
                    isInProg ? 'bg-blue-100 text-blue-800' :
                    isBlocked ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {stStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verified Data Summary Card (Page 15) */}
      {application.verifiedData && (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Cross-Department Verified Credentials (via Connectors)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
            {application.verifiedData.income && (
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                <span className="text-[11px] text-slate-500 block">Income Verification</span>
                <strong className="text-slate-800">Status: {application.verifiedData.income.status || 'VALID'}</strong>
                <div className="text-slate-600 text-[11px]">Annual Income: ₹{application.verifiedData.income.annualIncome || '1,80,000'}</div>
                <div className="text-slate-500 text-[10px]">Cert No: {application.verifiedData.income.certificateNumber || application.verifiedData.income.certificateNo || 'MH-INC-2026-98124'}</div>
              </div>
            )}
            {application.verifiedData.residence && (
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                <span className="text-[11px] text-slate-500 block">Residence / Domicile</span>
                <strong className="text-slate-800">Status: {application.verifiedData.residence.status || 'VERIFIED'}</strong>
                <div className="text-slate-600 text-[11px]">District: {application.verifiedData.residence.district || 'Mumbai Suburban'}</div>
                <div className="text-slate-500 text-[10px]">Tenure: {application.verifiedData.residence.yearsOfResidence || 15} Years</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expandable Interoperability Trace Log for Demonstrators */}
      {application.interoperabilityLogs && application.interoperabilityLogs.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => setShowRawLogs(!showRawLogs)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-indigo-600 py-1"
          >
            <span className="flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>Interoperability Audit Trace ({application.interoperabilityLogs.length} exchange events)</span>
            </span>
            {showRawLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showRawLogs && (
            <div className="mt-3 space-y-3 animate-in fade-in duration-150">
              {application.interoperabilityLogs.map((log, lIdx) => (
                <div key={lIdx} className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                  <div className="flex justify-between items-center text-slate-400 pb-1 mb-1 border-b border-slate-800">
                    <span className="text-emerald-400 font-bold">{log.service}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <pre>{JSON.stringify(log.result, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
