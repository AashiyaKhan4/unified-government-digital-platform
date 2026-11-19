import React from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Bell, Check, Clock, AlertTriangle, ShieldCheck, FileCheck } from 'lucide-react';

export default function NotificationDrawer({ onClose }) {
  const { notifications, refreshNotifications } = useAuth();

  const handleMarkAll = async () => {
    await api.markAllNotificationsRead();
    await refreshNotifications();
  };

  const handleMarkOne = async (id) => {
    await api.markNotificationRead(id);
    await refreshNotifications();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'application_approved':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'consent_request':
      case 'consent_granted':
        return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
      case 'service_delayed':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <FileCheck className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-indigo-700" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Notifications & Alerts</span>
        </div>
        <button
          onClick={handleMarkAll}
          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition"
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No notifications at the moment.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleMarkOne(n._id)}
              className={`p-3 text-left transition cursor-pointer flex items-start space-x-3 ${
                n.readStatus ? 'bg-white hover:bg-slate-50 opacity-80' : 'bg-indigo-50/50 hover:bg-indigo-50 font-medium'
              }`}
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 shrink-0">
                <Bell className="w-4 h-4 text-slate-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-800 leading-snug">{n.message}</p>
                <span className="text-[10px] text-slate-400 mt-1 inline-block">
                  {n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
              </div>
              {!n.readStatus && (
                <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
        <button
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-700 font-medium py-1 px-3"
        >
          Close
        </button>
      </div>
    </div>
  );
}
