import React, { useState, useEffect } from 'react';
import { api } from '../api';
import TimelineTracker from '../components/TimelineTracker';
import { FileText, ArrowLeft, RefreshCw, Clock } from 'lucide-react';

export default function TrackingPage({ selectedAppId, setActiveTab }) {
  const [applications, setApplications] = useState([]);
  const [activeApp, setActiveApp] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    try {
      const res = await api.getApplications();
      if (res.success && res.applications) {
        setApplications(res.applications);
        if (selectedAppId) {
          const match = res.applications.find(a => a._id === selectedAppId);
          setActiveApp(match || res.applications[0]);
        } else if (res.applications.length > 0) {
          setActiveApp(res.applications[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [selectedAppId]);

  const handleRetry = async (appId) => {
    try {
      const res = await api.retryApplication(appId);
      if (res.success) {
        await loadApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-400">Loading Application Status...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Unified Application Tracking (Module 6)
          </h1>
          <p className="text-xs text-slate-500">
            Consolidated timeline synthesized from all participating departmental portals.
          </p>
        </div>

        <button
          onClick={loadApplications}
          className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center space-x-1.5 shadow-2xs self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Status</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Applications List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2 h-fit">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
            My Submissions ({applications.length})
          </span>

          <div className="space-y-1.5">
            {applications.map((app) => (
              <button
                key={app._id}
                onClick={() => setActiveApp(app)}
                className={`w-full text-left p-3 rounded-xl transition flex flex-col space-y-1 ${
                  activeApp?._id === app._id
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-2xs'
                    : 'hover:bg-slate-50 border border-transparent text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="truncate pr-1">{app.serviceName}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400 font-semibold">{app.applicationTrackingCode || app._id.slice(0, 8)}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    app.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                    app.status === 'Under Verification' ? 'bg-blue-100 text-blue-800' :
                    app.status === 'Pending Verification' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {app.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Full Timeline Tracker */}
        <div className="lg:col-span-3">
          {activeApp ? (
            <TimelineTracker application={activeApp} onRetry={handleRetry} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              No application selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
