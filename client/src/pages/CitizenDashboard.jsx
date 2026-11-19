import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { 
  FileText, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  PlusCircle, 
  ArrowUpRight, 
  ExternalLink,
  User,
  Layers,
  Sparkles
} from 'lucide-react';

export default function CitizenDashboard({ setActiveTab, setSelectedAppId }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [appRes, profRes] = await Promise.all([
          api.getApplications(),
          api.getProfile()
        ]);
        if (appRes.success) setApplications(appRes.applications || []);
        if (profRes.success) setProfile(profRes.profile || null);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const viewTimeline = (appId) => {
    if (setSelectedAppId) setSelectedAppId(appId);
    setActiveTab('tracking');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Approved</span>;
      case 'Under Verification':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Under verification</span>;
      case 'Pending Verification':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Pending</span>;
      case 'Incomplete':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">Incomplete (Consent needed)</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-800 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-200 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Unified Citizen Portal • Single Sign-On Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Citizen'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Access all Maharashtra government digital services, track cross-department applications, and manage your data-sharing permissions from one secure dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('services')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition shadow-md flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Apply for New Service</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition border border-white/20 flex items-center space-x-1.5"
            >
              <User className="w-4 h-4" />
              <span>View Unified Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{applications.length}</div>
            <div className="text-xs text-slate-500 font-medium">Total Applications</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {applications.filter(a => a.status === 'Approved').length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Approved Services</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {applications.filter(a => a.status === 'Under Verification' || a.status === 'Pending Verification').length}
            </div>
            <div className="text-xs text-slate-500 font-medium">In Process / Verification</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {profile?.verifiedFields?.length || 3}
            </div>
            <div className="text-xs text-slate-500 font-medium">Verified Common Credentials</div>
          </div>
        </div>
      </div>

      {/* Main Section: Unified Application Tracking Table (Page 4 SDS Example) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Unified Application Status (Module 6)</h3>
            <p className="text-xs text-slate-500">
              Real-time cross-department status tracking powered by polymorphic API connectors.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('services')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center space-x-1"
          >
            <span>Browse Services</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-4">Service Name</th>
                <th className="p-4">Department</th>
                <th className="p-4">Application ID</th>
                <th className="p-4">Status</th>
                <th className="p-4">Submitted</th>
                <th className="p-4 text-right">Unified Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No active applications found. Click "Apply for New Service" to start!
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{app.serviceName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{app.department}</td>
                    <td className="p-4 font-mono font-bold text-indigo-700">
                      {app.applicationTrackingCode || app._id.slice(0, 8)}
                    </td>
                    <td className="p-4">{getStatusBadge(app.status)}</td>
                    <td className="p-4 text-slate-500">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => viewTimeline(app._id)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition inline-flex items-center space-x-1"
                      >
                        <span>Track Timeline</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Linked Connected Services Strip (Page 4 SDS) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Connected Maharashtra State Portals (Interoperable)</span>
          </h3>
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
            All 3 Gateways Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex justify-between items-center">
              <strong className="font-bold text-slate-800">MahaDBT Scholarship Portal</strong>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-slate-500 text-[11px]">Primary key: <code className="text-indigo-600 font-mono">student_name</code></p>
            <div className="text-emerald-700 font-semibold text-[11px] pt-1">Connected via ScholarshipConnector</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex justify-between items-center">
              <strong className="font-bold text-slate-800">Revenue Dept Income Registry</strong>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-slate-500 text-[11px]">Primary key: <code className="text-indigo-600 font-mono">applicant_name</code></p>
            <div className="text-emerald-700 font-semibold text-[11px] pt-1">Connected via CertificateConnector</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex justify-between items-center">
              <strong className="font-bold text-slate-800">Maharashtra Domicile Registry</strong>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-slate-500 text-[11px]">Primary key: <code className="text-indigo-600 font-mono">fullName</code></p>
            <div className="text-emerald-700 font-semibold text-[11px] pt-1">Connected via ResidenceConnector</div>
          </div>
        </div>
      </div>
    </div>
  );
}
