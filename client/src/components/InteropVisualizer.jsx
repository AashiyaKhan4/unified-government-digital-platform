import React, { useState } from 'react';
import { api } from '../api';
import { 
  Code2, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  RefreshCw,
  Sliders,
  Database,
  Cpu
} from 'lucide-react';

export default function InteropVisualizer() {
  const [targetService, setTargetService] = useState('income');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [portalConfigs, setPortalConfigs] = useState(null);

  const fetchConfigs = async () => {
    try {
      const res = await api.getMockPortalsConfig();
      if (res.success) setPortalConfigs(res.portals);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchConfigs();
  }, []);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.testManualIntegration({
        targetService,
        category: targetService === 'income' ? 'Income Certificate' : targetService === 'residence' ? 'Residence Verification' : 'Scholarship Records',
        payload: {
          name: 'Rahul Sharma',
          citizen_reference: 'CIT-1024',
          date_of_birth: '2004-06-15'
        }
      });
      setResult(res);
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const setStatus = async (portal, status) => {
    await api.updateMockPortalConfig(portal, { status });
    await fetchConfigs();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold mb-2 border border-amber-400/30">
              <Cpu className="w-3.5 h-3.5" />
              <span>Core Architectural Innovation • Interoperability Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Data Mapping & Interoperability Architecture
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Demonstrating how the Unified Government Digital Platform connects heterogeneous departmental databases using polymorphic connectors, canonical schema transformation, and strict consent verification.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleTest}
              disabled={loading}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg flex items-center space-x-2"
            >
              <Play className={`w-4 h-4 fill-slate-950 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Executing Exchange...' : 'Run Live Interoperability Test'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Schema Comparison Matrix & Mock Portal Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapping Matrix */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Heterogeneous Schema Normalization Matrix</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Unified Data Model (UDM)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold">
                <tr>
                  <th className="p-3 rounded-l-lg">Unified Common Field</th>
                  <th className="p-3">Scholarship Portal</th>
                  <th className="p-3">Income Certificate Portal</th>
                  <th className="p-3 rounded-r-lg">Residence Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-indigo-700">name</td>
                  <td className="p-3 text-slate-600">student_name</td>
                  <td className="p-3 text-slate-600">applicant_name</td>
                  <td className="p-3 text-slate-600">fullName</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-indigo-700">citizen_reference</td>
                  <td className="p-3 text-slate-600">student_id</td>
                  <td className="p-3 text-slate-600">applicant_number</td>
                  <td className="p-3 text-slate-600">resident_id</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-indigo-700">date_of_birth</td>
                  <td className="p-3 text-slate-600">birth_date (DD-MM-YYYY)</td>
                  <td className="p-3 text-slate-600">dob (YYYY-MM-DD)</td>
                  <td className="p-3 text-slate-600">date_of_birth (ISO)</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-indigo-700">verification</td>
                  <td className="p-3 text-slate-600">eligibility_status</td>
                  <td className="p-3 text-slate-600">verification_status</td>
                  <td className="p-3 text-slate-600">residence_status</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            * Connectors inherit from BaseConnector and utilize DataMapper to convert each departmental dialect automatically without altering database structures.
          </p>
        </div>

        {/* Live Fault Injection Simulator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>Fault Injection Simulator</span>
          </h3>
          <p className="text-xs text-slate-500">
            Simulate portal delays or 503 outages to see the platform's automated retry policy and Pending Verification status in action!
          </p>

          <div className="space-y-3 pt-1">
            {['income', 'residence', 'scholarship'].map((pName) => {
              const curStatus = portalConfigs?.[pName]?.status || 'Connected';
              return (
                <div key={pName} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 uppercase">{pName} Portal</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      curStatus === 'Connected' ? 'bg-emerald-100 text-emerald-800' :
                      curStatus === 'Delayed' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {curStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    <button
                      onClick={() => setStatus(pName, 'Connected')}
                      className={`py-1 rounded text-[10px] font-semibold transition ${
                        curStatus === 'Connected' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-600'
                      }`}
                    >
                      Online
                    </button>
                    <button
                      onClick={() => setStatus(pName, 'Delayed')}
                      className={`py-1 rounded text-[10px] font-semibold transition ${
                        curStatus === 'Delayed' ? 'bg-amber-500 text-white' : 'bg-white border text-slate-600'
                      }`}
                    >
                      Delay
                    </button>
                    <button
                      onClick={() => setStatus(pName, 'Down')}
                      className={`py-1 rounded text-[10px] font-semibold transition ${
                        curStatus === 'Down' ? 'bg-rose-600 text-white' : 'bg-white border text-slate-600'
                      }`}
                    >
                      503 Outage
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Target Service Selector Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-600 uppercase">Select Target Connector:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setTargetService('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                targetService === 'income' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Revenue / Income Certificate
            </button>
            <button
              onClick={() => setTargetService('residence')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                targetService === 'residence' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              District / Residence Registry
            </button>
            <button
              onClick={() => setTargetService('scholarship')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                targetService === 'scholarship' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Scholarship Portal
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Target Endpoint: <code className="text-slate-700">/mock-portals/{targetService}/verify</code>
        </span>
      </div>

      {/* Live Execution Output Inspection */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${result.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <h3 className="text-sm font-bold text-slate-900">
                Live Data Exchange Pipeline Result ({result.data?.connectorName || targetService.toUpperCase()})
              </h3>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-600">
              Correlation ID: {result.data?.correlationId || 'N/A'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Outgoing Mapped Request */}
            <div className="bg-slate-900 rounded-xl p-4 text-slate-100 font-mono text-xs flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-amber-400 font-bold">
                <span>1. DataMapper Output</span>
                <span className="text-[10px] text-slate-400">Target Schema</span>
              </div>
              <pre className="overflow-x-auto flex-1 text-[11px] text-slate-300">
                {JSON.stringify(result.data?.rawRequest || { error: 'Request blocked before transmission' }, null, 2)}
              </pre>
            </div>

            {/* Box 2: Raw Portal Response */}
            <div className="bg-slate-900 rounded-xl p-4 text-slate-100 font-mono text-xs flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-blue-400 font-bold">
                <span>2. Raw Connected API Reply</span>
                <span className="text-[10px] text-slate-400">Heterogeneous Format</span>
              </div>
              <pre className="overflow-x-auto flex-1 text-[11px] text-slate-300">
                {JSON.stringify(result.data?.rawResponse || result.data?.error || result, null, 2)}
              </pre>
            </div>

            {/* Box 3: Common Response */}
            <div className="bg-slate-900 rounded-xl p-4 text-slate-100 font-mono text-xs flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-emerald-400 font-bold">
                <span>3. Unified Common Response</span>
                <span className="text-[10px] text-slate-400">Normalized (UDM)</span>
              </div>
              <pre className="overflow-x-auto flex-1 text-[11px] text-slate-300">
                {JSON.stringify(result.data?.data || result.data?.status || result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
