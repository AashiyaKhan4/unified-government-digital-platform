import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Lock, 
  User, 
  Calendar, 
  MapPin, 
  GraduationCap 
} from 'lucide-react';
import ConsentModal from '../components/ConsentModal';

export default function ApplicationFormPage({ service, setActiveTab, setSelectedAppId }) {
  const [profile, setProfile] = useState(null);
  const [useSavedProfile, setUseSavedProfile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [error, setError] = useState('');

  // Default to Scholarship if not set
  const currentService = service || {
    _id: 'default-scholarship',
    name: 'Post-Matric Scholarship Scheme 2026',
    department: 'Higher & Technical Education Department',
    requirements: ['Unified Profile', 'Income Certificate', 'Residence Verification', 'Academic Records']
  };

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [course, setCourse] = useState('');
  const [annualIncome, setAnnualIncome] = useState('₹1,80,000');
  const [bankAccount, setBankAccount] = useState('SBI-MH-994821034');
  const [category, setCategory] = useState('General Merit');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.getProfile();
        if (res.success && res.profile) {
          setProfile(res.profile);
          populateFromProfile(res.profile);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const populateFromProfile = (p) => {
    setFullName(p.fullName || 'Rahul Sharma');
    setDateOfBirth(p.dateOfBirth || '2004-06-15');
    setAddress(p.address || 'Flat 402, Green Park, Andheri East, Mumbai, Maharashtra - 400069');
    setPhone(p.contact?.phone || '+91 98201 12345');
    setInstitution(p.education?.institution || 'Government College of Engineering, Mumbai');
    setCourse(p.education?.course || 'B.Tech in Computer Science & Engineering');
  };

  const handleToggleProfile = (checked) => {
    setUseSavedProfile(checked);
    if (checked && profile) {
      populateFromProfile(profile);
    } else {
      setFullName('');
      setDateOfBirth('');
      setAddress('');
      setPhone('');
      setInstitution('');
      setCourse('');
    }
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    setError('');
    // Open explicit consent modal as required in UC-03 & UC-04
    setShowConsentModal(true);
  };

  const handleConsentApproved = async () => {
    setShowConsentModal(false);
    await proceedSubmission(true);
  };

  const handleConsentDenied = async () => {
    setShowConsentModal(false);
    await proceedSubmission(false);
  };

  const proceedSubmission = async (consentGranted) => {
    setSubmitting(true);
    setError('');
    try {
      const formData = {
        fullName,
        dateOfBirth,
        address,
        phone,
        institution,
        course,
        annualIncome,
        bankAccount,
        category
      };

      const res = await api.submitApplication({
        serviceId: currentService._id,
        formData,
        consentGranted,
        requestedCategories: ['Income Certificate', 'Residence Verification', 'Academic Record']
      });

      if (res.success && res.application) {
        if (setSelectedAppId) setSelectedAppId(res.application._id);
        setActiveTab('tracking');
      } else {
        setError(res.message || 'Failed to submit application');
      }
    } catch (err) {
      setError(err.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Service Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-2 text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md text-xs font-bold w-fit mb-3 border border-indigo-100">
          <Building2 className="w-3.5 h-3.5" />
          <span>{currentService.department}</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Application Form: {currentService.name}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Submission invokes the Workflow Engine to coordinate cross-department verification.
        </p>

        {/* Profile Reuse Banner (Module 2 Showcase) */}
        <div className="mt-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-xs font-bold text-indigo-950 block">
                Reuse Unified Citizen Profile (Zero Redundant Data Entry)
              </strong>
              <p className="text-xs text-indigo-800/80 mt-0.5">
                Automatically import verified personal, address, and educational data from your common profile.
              </p>
            </div>
          </div>

          <label className="flex items-center space-x-2.5 bg-white px-4 py-2 rounded-xl border border-indigo-300 shadow-2xs cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={useSavedProfile}
              onChange={(e) => handleToggleProfile(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-xs font-bold text-indigo-950">Use Saved Profile</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl font-bold">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmitClick} className="space-y-6">
        {/* Section 1: Pre-filled Common Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Applicant Core Information</span>
            </h3>
            {useSavedProfile && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pre-filled from Unified Citizen Profile</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Permanent Residential Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">College / Educational Institution</label>
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Course & Branch</label>
              <input
                type="text"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Service-Specific Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Service-Specific Application Details</span>
            </h3>
            <span className="text-[11px] text-slate-400">Department Requirements</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Declared Annual Family Income</label>
              <input
                type="text"
                required
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                * Will be verified via Revenue Department Income Connector.
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Category / Quota</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="General Merit">General Merit (EBC)</option>
                <option value="OBC">Other Backward Class (OBC)</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Direct Benefit Transfer (DBT) Bank Account</label>
              <input
                type="text"
                required
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Submission initiates consent-gated cross-department verification.</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center space-x-2"
          >
            <span>{submitting ? 'Orchestrating Application...' : 'Review Consent & Submit Application'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Consent Modal Trigger */}
      <ConsentModal
        isOpen={showConsentModal}
        requestingDepartment={currentService.department}
        purpose={`Automated inter-departmental eligibility verification for ${currentService.name}.`}
        categories={['Income Certificate status', 'Residence verification', 'Educational information']}
        expiryDays={90}
        onApprove={handleConsentApproved}
        onDeny={handleConsentDenied}
      />
    </div>
  );
}
