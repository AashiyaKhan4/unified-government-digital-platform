import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Lock, Mail, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { login, register, switchRole } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        const res = await register({ name, email, password, role });
        if (!res.success) setError(res.message);
      } else {
        const res = await login(email, password);
        if (!res.success) setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoRole) => {
    setError('');
    setLoading(true);
    try {
      await switchRole(demoRole);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center px-4 py-12">
      {/* Top Branding */}
      <div className="text-center mb-8 max-w-lg">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-indigo-400/30">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Smart India Hackathon 2026 • SIH26129</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center space-x-2">
          <span>SAMANVAY</span>
          <span className="text-indigo-400 font-normal text-2xl font-serif">समन्वय</span>
        </h1>
        <p className="text-slate-300 text-sm mt-2 font-medium">
          Unified Government Digital Services Integration Platform
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Government of Maharashtra • Department of Skills, Employment, Entrepreneurship & Innovation
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Quick Demo Switcher Strip for Evaluators */}
        <div className="bg-slate-100 p-3 border-b border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2">
            ⚡ Quick 1-Click Demo Access for Judges
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('citizen')}
              className="py-1.5 px-2 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition shadow-2xs flex items-center justify-center space-x-1"
            >
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Citizen</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('official')}
              className="py-1.5 px-2 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition shadow-2xs flex items-center justify-center space-x-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="py-1.5 px-2 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition shadow-2xs flex items-center justify-center space-x-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 text-center font-bold text-xs">
          <button
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-3.5 transition ${!isRegister ? 'border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50/30' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sign In to Platform
          </button>
          <button
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-3.5 transition ${isRegister ? 'border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50/30' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Create New Citizen Profile
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email / Single Sign-On ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@samanvay.gov.in"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="citizen">Citizen (Unified Profile & Applications)</option>
                <option value="official">Department Official (Review & Sanction)</option>
                <option value="admin">System Administrator (Connectors & Health)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : isRegister ? 'Register & Initialize Profile' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            Secure Role-Based Access Control (RBAC) • SHA-256 bcrypt + JWT Token
          </p>
        </div>
      </div>

      {/* Footer acknowledgements */}
      <div className="text-center mt-6 text-xs text-slate-400">
        Department of Computer Science & Engineering • Medicaps University, Indore
      </div>
    </div>
  );
}
