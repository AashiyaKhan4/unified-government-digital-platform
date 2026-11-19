import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import CitizenDashboard from './pages/CitizenDashboard';
import ProfilePage from './pages/ProfilePage';
import ServiceCatalogPage from './pages/ServiceCatalogPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import TrackingPage from './pages/TrackingPage';
import ConsentPage from './pages/ConsentPage';
import OfficialDashboard from './pages/OfficialDashboard';
import AuditLogsPage from './pages/AuditLogsPage';
import ConnectorSettingsPage from './pages/ConnectorSettingsPage';
import InteropVisualizer from './components/InteropVisualizer';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedAppId, setSelectedAppId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm font-medium">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span>Initializing Samanvay Platform...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleSelectService = (service) => {
    setSelectedService(service);
    setActiveTab('apply');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && (
            <CitizenDashboard
              setActiveTab={setActiveTab}
              setSelectedAppId={setSelectedAppId}
            />
          )}

          {activeTab === 'profile' && <ProfilePage />}

          {activeTab === 'services' && (
            <ServiceCatalogPage onSelectService={handleSelectService} />
          )}

          {activeTab === 'apply' && (
            <ApplicationFormPage
              service={selectedService}
              setActiveTab={setActiveTab}
              setSelectedAppId={setSelectedAppId}
            />
          )}

          {activeTab === 'tracking' && (
            <TrackingPage
              selectedAppId={selectedAppId}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'consents' && <ConsentPage />}

          {activeTab === 'official-dashboard' && (
            <OfficialDashboard setActiveTab={setActiveTab} />
          )}

          {activeTab === 'admin-connectors' && <ConnectorSettingsPage />}

          {activeTab === 'audit-logs' && <AuditLogsPage />}

          {activeTab === 'demo-interop' && <InteropVisualizer />}
        </main>
      </div>

      {/* Footer with Academic & SIH attribution */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="font-bold text-slate-700">
            SAMANVAY – Unified Government Digital Services Integration Platform (UGDS)
          </div>
          <div>
            SIH 2026 Problem Statement SIH26129 • Government of Maharashtra (Maharashtra State Innovation Society)
          </div>
          <div className="text-[11px] text-slate-400">
            B.Tech (VII Sem) Project–1 • Developed by Aarya Jain (EN23CS301016) & Aashiya Khan (EN23CS301022) • Under Guidance of Prof. Rashmi Vijaywargiya • Medicaps University, Indore
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
