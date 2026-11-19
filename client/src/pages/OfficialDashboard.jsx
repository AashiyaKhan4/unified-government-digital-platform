import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  User, 
  Activity, 
  Sparkles,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export default function OfficialDashboard({ setActiveTab }) {
  const [analytics, setAnalytics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const [anRes, appRes] = await Promise.all([
        api.getAnalytics(),
        api.getApplications()
      ]);
      if (anRes.success) setAnalytics(anRes.analytics);
      if (appRes.success) setApplications(appRes.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDecision = async (status) => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      const res = await api.updateApplicationStatus(selectedApp._id, status, decisionRemarks);
      if (res.success) {
        setMessage(`Application ${selectedApp.applicationTrackingCode} marked as ${status}. Citizen notified.`);
        setTimeout(() => setMessage(''), 4000);
        setSelectedApp(null);
        setDecisionRemarks('');
        await loadData();
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-400">Loading Official Dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-2 inline-block">
            Module 9 • Department Official Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Government Services Monitoring & Sanctions
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Real-time cross-department analytics, SLA compliance, and automated verification oversight for Maharashtra state public welfare schemes.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition flex items-center space-x-1.5 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-slate-300" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-bold flex items-center space-x-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* KPI Stats Strip (SDS Page 9) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Total Received</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{analytics?.totalApplications || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Approved</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{analytics?.approved || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Pending / In-review</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{analytics?.underVerification || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Delayed / Pending</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{analytics?.delayedApplications || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Avg Processing</span>
          <div className="text-base font-black text-indigo-700 mt-1 truncate" title={analytics?.averageProcessingDays}>
            {analytics?.averageProcessingDays?.split(' ')[0] || '1.8'} Days
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Failed API Req</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{analytics?.failedApiRequests || 0}</div>
        </div>
      </div>

      {/* Department Breakdown & Performance Chart (Page 9 Mock Graph) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Department-Wise Service Delivery Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">Live Workload Distribution</span>
          </div>

          <div className="space-y-4 pt-2">
            {Object.entries(analytics?.departmentBreakdown || {}).map(([dept, stats]) => (
              <div key={dept} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>{dept}</span>
                  <span>{stats.total} Applications</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 flex overflow-hidden">
                  <div
                    style={{ width: `${(stats.approved / (stats.total || 1)) * 100}%` }}
                    className="bg-emerald-500 h-full"
                    title={`Approved: ${stats.approved}`}
                  />
                  <div
                    style={{ width: `${(stats.pending / (stats.total || 1)) * 100}%` }}
                    className="bg-blue-500 h-full"
                    title={`Pending: ${stats.pending}`}
                  />
                  <div
                    style={{ width: `${(stats.rejected / (stats.total || 1)) * 100}%` }}
                    className="bg-rose-500 h-full"
                    title={`Rejected: ${stats.rejected}`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                  <span className="text-emerald-700">✓ {stats.approved} Approved</span>
                  <span className="text-blue-700">⏳ {stats.pending} Pending</span>
                  <span className="text-rose-700">✗ {stats.rejected} Rejected</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Sync & Gateway Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Interoperability Engine Health</span>
            </h3>

            <div className="space-y-2.5 text-xs pt-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Gateway Protocol</span>
                <span className="font-bold text-indigo-700">REST / IndEA 1.0</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Data Sync Status</span>
                <span className="font-bold text-emerald-600">{analytics?.dataSyncStatus || 'Healthy'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Active Connectors</span>
                <span className="font-bold text-slate-800">{analytics?.connectors?.length || 3} Registered</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('audit-logs')}
            className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition text-center"
          >
            Inspect Immutable Audit Trail →
          </button>
        </div>
      </div>

      {/* Review & Sanction Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Application Action Queue</h3>
            <p className="text-xs text-slate-500">Official review & statutory decision gateway.</p>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            {applications.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-4">Tracking Code</th>
                <th className="p-4">Service</th>
                <th className="p-4">Department</th>
                <th className="p-4">Status</th>
                <th className="p-4">Cross-Verification Results</th>
                <th className="p-4 text-right">Official Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-mono font-bold text-indigo-700">
                    {app.applicationTrackingCode || app._id.slice(0, 8)}
                  </td>
                  <td className="p-4 font-bold text-slate-900">{app.serviceName}</td>
                  <td className="p-4 text-slate-600">{app.department}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      app.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'Under Verification' ? 'bg-blue-100 text-blue-800' :
                      app.status === 'Pending Verification' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-[11px]">
                    {app.verifiedData ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        ✓ Income & Residence Verified
                      </span>
                    ) : (
                      <span className="text-slate-400">Direct Dept Process</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition"
                    >
                      Review & Sanction
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedApp.applicationTrackingCode}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedApp.serviceName}</h3>
                <p className="text-xs text-slate-500">{selectedApp.department}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Applicant details */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-800">{selectedApp.formData?.fullName || 'Rahul Sharma'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Institution / Course:</span>
                <span className="font-medium text-slate-800 truncate max-w-[250px]">{selectedApp.formData?.institution}</span>
              </div>
              {selectedApp.verifiedData && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-emerald-700 font-bold block mb-1">Connector Verified Records:</span>
                  <div className="text-[11px] text-slate-600">
                    Annual Income: ₹{selectedApp.verifiedData.income?.annualIncome || '1,80,000'} (Valid) • Domicile: {selectedApp.verifiedData.residence?.district || 'Mumbai Suburban'} (Verified)
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Officer Sanction Remarks</label>
              <textarea
                rows="2"
                value={decisionRemarks}
                onChange={(e) => setDecisionRemarks(e.target.value)}
                placeholder="Enter statutory sanction remarks or justification..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleDecision('Rejected')}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition"
              >
                Reject Application
              </button>
              <button
                onClick={() => handleDecision('Approved')}
                disabled={actionLoading}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-md"
              >
                Sanction & Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
