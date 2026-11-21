import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Bell, 
  User, 
  LogOut, 
  Layers, 
  FileText, 
  CheckCircle, 
  Sliders, 
  Activity, 
  Code2,
  ChevronDown
} from 'lucide-react';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, switchRole, logout, unreadCount } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleRoleSwitch = async (role) => {
    if (user?.role === role) return;
    setIsSwitching(true);
    await switchRole(role);
    setIsSwitching(false);
    if (role === 'citizen') setActiveTab('dashboard');
    else if (role === 'official') setActiveTab('official-dashboard');
    else if (role === 'admin') setActiveTab('admin-connectors');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Gov Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 text-white text-xs px-4 py-1.5 flex justify-between items-center font-medium">
        <div className="flex items-center space-x-2">
          <span className="bg-white/20 px-2 py-0.5 rounded font-mono text-[11px]">Maharashtra Digital Governance</span>
          <span>Government of Maharashtra • MSIS & Skill Development Dept</span>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <span>Medicaps University, Indore • Project–1</span>
          <span className="opacity-80">Students: Aarya Jain & Aashiya Khan</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => setActiveTab(user?.role === 'citizen' ? 'dashboard' : user?.role === 'official' ? 'official-dashboard' : 'admin-connectors')}
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-md">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black text-slate-900 tracking-tight">Unified Government Digital Platform</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Interoperable Citizen Service Delivery & Integration Gateway</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {user?.role === 'citizen' && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  My Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Unified Profile
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'services' || activeTab === 'apply' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Service Catalogue
                </button>
                <button
                  onClick={() => setActiveTab('consents')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'consents' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Consent Manager
                </button>
              </>
            )}

            {(user?.role === 'official' || user?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('official-dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  activeTab === 'official-dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Official Dashboard
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin-connectors')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  activeTab === 'admin-connectors' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Connectors & Health
              </button>
            )}

            {(user?.role === 'official' || user?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('audit-logs')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  activeTab === 'audit-logs' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Audit Logs
              </button>
            )}

            {/* Architecture & Interop Inspector Tab */}
            <button
              onClick={() => setActiveTab('demo-interop')}
              className={`px-3 py-2 rounded-md text-sm font-semibold flex items-center space-x-1.5 transition ${
                activeTab === 'demo-interop'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
              title="Architecture & Schema Transformation Inspector"
            >
              <Code2 className="w-4 h-4 text-amber-700" />
              <span>Interop Inspector</span>
            </button>
          </nav>

          {/* Right actions: Role Quick Switcher + Notifications + Profile */}
          <div className="flex items-center space-x-3">
            {/* Quick Role Switcher Pill */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase px-2">Role:</span>
              <button
                onClick={() => handleRoleSwitch('citizen')}
                disabled={isSwitching}
                className={`px-2 py-1 text-xs font-semibold rounded transition ${
                  user?.role === 'citizen'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Citizen
              </button>
              <button
                onClick={() => handleRoleSwitch('official')}
                disabled={isSwitching}
                className={`px-2 py-1 text-xs font-semibold rounded transition ${
                  user?.role === 'official'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Official
              </button>
              <button
                onClick={() => handleRoleSwitch('admin')}
                disabled={isSwitching}
                className={`px-2 py-1 text-xs font-semibold rounded transition ${
                  user?.role === 'admin'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationDrawer onClose={() => setShowNotifications(false)} />
              )}
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center pl-2 border-l border-slate-200 space-x-2">
              <div className="hidden md:block text-right">
                <div className="text-xs font-bold text-slate-800">{user?.name}</div>
                <div className="text-[10px] uppercase font-semibold text-indigo-600">{user?.role}</div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
