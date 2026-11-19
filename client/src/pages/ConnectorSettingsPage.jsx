import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Sliders, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Edit3, 
  Save, 
  Play, 
  Link,
  Server,
  Layers,
  Code2 
} from 'lucide-react';

export default function ConnectorSettingsPage() {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [endpointEdit, setEndpointEdit] = useState('');
  const [testResults, setTestResults] = useState({});
  const [message, setMessage] = useState('');

  const loadConnectors = async () => {
    try {
      const res = await api.getConnectors();
      if (res.success) setConnectors(res.connectors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnectors();
  }, []);

  const handleTestPing = async (connector) => {
    setTestingId(connector._id);
    try {
      const res = await api.testConnector(connector._id);
      setTestResults(prev => ({ ...prev, [connector._id]: res.health }));
      await loadConnectors();
    } catch (err) {
      setTestResults(prev => ({ ...prev, [connector._id]: { healthy: false, error: err.message } }));
    } finally {
      setTestingId(null);
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setEndpointEdit(c.endpoint);
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await api.updateConnector(id, { endpoint: endpointEdit });
      if (res.success) {
        setMessage('Connector configuration successfully updated!');
        setTimeout(() => setMessage(''), 4000);
        setEditingId(null);
        await loadConnectors();
      }
    } catch (err) {
      alert('Failed to update connector: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-400">Loading Connectors...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-2 inline-block">
            Module 11 • System Administrator Connector Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Reusable Connector Architecture & API Health
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Manage polymorphic BaseConnector adapters, endpoints, and field-mapping dictionaries connecting independent departmental APIs without requiring software replacements.
          </p>
        </div>

        <button
          onClick={loadConnectors}
          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition flex items-center space-x-1.5 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-slate-300" />
          <span>Refresh Connectors</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-bold flex items-center space-x-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {connectors.map((c) => {
          const isTesting = testingId === c._id;
          const isEditing = editingId === c._id;
          const tResult = testResults[c._id];
          const status = c.connectionStatus || 'Connected';

          return (
            <div
              key={c._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    status === 'Connected' ? 'bg-emerald-100 text-emerald-800' :
                    status === 'Delayed' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {status}
                  </span>
                </div>

                {/* Endpoint */}
                <div className="text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    API Base Endpoint
                  </span>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={endpointEdit}
                        onChange={(e) => setEndpointEdit(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-indigo-500"
                      />
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleSaveEdit(c._id)}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold flex items-center space-x-1"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[11px] font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl font-mono text-[11px] text-slate-700 border border-slate-100">
                      <span className="truncate pr-2">{c.endpoint}</span>
                      <button
                        onClick={() => startEdit(c)}
                        className="text-slate-400 hover:text-indigo-600 shrink-0"
                        title="Edit endpoint"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Mapping Rules */}
                <div className="text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Field Mapping Rules (Common → Portal)
                  </span>
                  <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[10px] space-y-1">
                    {Object.entries(c.mappingRules || {}).map(([commonKey, portalKey]) => (
                      <div key={commonKey} className="flex justify-between">
                        <span className="text-indigo-400 font-bold">{commonKey}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-emerald-400 font-bold">{portalKey}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test Result Display */}
                {tResult && (
                  <div className={`p-2.5 rounded-xl text-xs font-medium border ${
                    tResult.healthy ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {tResult.healthy ? `✓ Live Ping Success (Latency: ${tResult.latency || '15ms'})` : `✗ Ping Failed: ${tResult.error}`}
                  </div>
                )}
              </div>

              {/* Bottom Test Ping Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Last tested: {c.lastTested ? new Date(c.lastTested).toLocaleTimeString() : 'Recently'}
                </span>
                <button
                  onClick={() => handleTestPing(c)}
                  disabled={isTesting}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition flex items-center space-x-1"
                >
                  <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Pinging...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
