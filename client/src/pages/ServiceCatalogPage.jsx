import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  FileCheck, 
  Clock, 
  Layers,
  Search
} from 'lucide-react';

export default function ServiceCatalogPage({ onSelectService }) {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await api.getServices();
        if (res.success) setServices(res.services || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const departments = ['ALL', ...new Set(services.map(s => s.department))];

  const filtered = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.description.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-2 inline-block">
          Module 4 • Integrated Service Catalogue
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Maharashtra State Citizen Services</h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
          Apply for public schemes across state departments. Enable automatic profile reuse to eliminate manual data entry and repeated document uploads.
        </p>

        {/* Search bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services (e.g. Scholarship, Income, Residence, CMEGP)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 text-white placeholder-slate-400 border border-white/20 rounded-xl text-xs focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            {departments.slice(0, 4).map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedDept === dept ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {dept === 'ALL' ? 'All Departments' : dept.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((service) => (
          <div
            key={service._id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                  <Building2 className="w-3 h-3" />
                  <span>{service.department}</span>
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-100 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Profile Auto-Fill</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{service.name}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{service.description}</p>

              {/* Benefits */}
              {service.benefits && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Sanction / Benefit</span>
                  <span className="font-bold text-slate-800">{service.benefits}</span>
                </div>
              )}

              {/* Required Categories */}
              <div className="mt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                  Inter-Department Requirements
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(service.requirements || []).map((req, rIdx) => (
                    <span
                      key={rIdx}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Orchestrated via <strong className="text-slate-600">{service.workflow?.length || 4} stages</strong>
              </span>
              <button
                onClick={() => onSelectService(service)}
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
              >
                <span>Apply with Saved Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
