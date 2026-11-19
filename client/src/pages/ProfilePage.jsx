import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  GraduationCap, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Code2, 
  Edit3 
} from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [showJson, setShowJson] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');
  const [institution, setInstitution] = useState('');
  const [year, setYear] = useState('');
  const [score, setScore] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.getProfile();
      if (res.success && res.profile) {
        const p = res.profile;
        setProfile(p);
        setFullName(p.fullName || '');
        setDateOfBirth(p.dateOfBirth || '');
        setAddress(p.address || '');
        setPhone(p.contact?.phone || '');
        setEmail(p.contact?.email || '');
        setCourse(p.education?.course || '');
        setInstitution(p.education?.institution || '');
        setYear(p.education?.year || '');
        setScore(p.education?.score || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.updateProfile({
        fullName,
        dateOfBirth,
        address,
        contact: { phone, email },
        education: { course, institution, year: Number(year), score: Number(score) }
      });
      if (res.success) {
        setProfile(res.profile);
        setIsEditing(false);
        setMessage('Unified Citizen Profile saved and synchronized with Common Schema!');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      setMessage('Failed to update profile: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-400">Loading Unified Profile...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-2 inline-block">
            Module 2 • Single Reusable Profile
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Unified Citizen Profile</h1>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
            Enter your details once. The Samanvay Integration Engine automatically maps and pre-fills them across all Maharashtra government departments.
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowJson(!showJson)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition flex items-center space-x-1.5"
          >
            <Code2 className="w-4 h-4 text-amber-300" />
            <span>{showJson ? 'Hide UDM Schema' : 'View UDM Schema'}</span>
          </button>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition shadow-md flex items-center space-x-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-bold flex items-center space-x-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* JSON Schema Viewer (SDS Unified Data Model) */}
      {showJson && (
        <div className="bg-slate-900 rounded-2xl p-5 text-slate-100 font-mono text-xs shadow-xl animate-in fade-in duration-150">
          <div className="flex justify-between items-center pb-2 mb-3 border-b border-slate-800">
            <span className="text-amber-400 font-bold">Unified Data Model (UDM) Canonical Representation</span>
            <span className="text-[11px] text-slate-500">MongoDB CitizenProfiles Collection</span>
          </div>
          <pre className="overflow-x-auto text-[11px] text-slate-300">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      )}

      {/* Main Profile Details */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Personal & Demographic */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Personal & Demographic Information</span>
            </h3>
            <span className="text-[11px] text-slate-400">Common Schema Fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name (Canonical: name)</label>
              {isEditing ? (
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              ) : (
                <div className="p-2.5 bg-slate-50 rounded-xl font-medium text-slate-800 border border-slate-100">
                  {profile?.fullName}
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Date of Birth (date_of_birth)</label>
              {isEditing ? (
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              ) : (
                <div className="p-2.5 bg-slate-50 rounded-xl font-medium text-slate-800 border border-slate-100 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{profile?.dateOfBirth}</span>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Permanent Residential Address (address)</label>
              {isEditing ? (
                <textarea
                  rows="2"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              ) : (
                <div className="p-2.5 bg-slate-50 rounded-xl font-medium text-slate-800 border border-slate-100 flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{profile?.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Contact Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Phone className="w-4 h-4 text-indigo-600" />
              <span>Contact Information</span>
            </h3>
            <span className="text-[11px] text-slate-400">Federated Identifiers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mobile Phone Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              ) : (
                <div className="p-2.5 bg-slate-50 rounded-xl font-medium text-slate-800 border border-slate-100 flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{profile?.contact?.phone}</span>
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              ) : (
                <div className="p-2.5 bg-slate-50 rounded-xl font-medium text-slate-800 border border-slate-100 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{profile?.contact?.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Educational Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Educational Information (Pre-fillable for Scholarships)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Reused across Higher Ed Schemes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Degree / Course Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              ) : (
                <div className="p-2.5 bg-slate-50 rounded-xl font-medium text-slate-800 border border-slate-100">
                  {profile?.education?.course}
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Institution / College</label>
              {isEditing ? (
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              ) : (
                <div className="p-2.5 bg-slate-50 rounded-xl font-medium text-slate-800 border border-slate-100">
                  {profile?.education?.institution}
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Academic Year</label>
              {isEditing ? (
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              ) : (
                <div className="p-2.5 bg-slate-50 rounded-xl font-medium text-slate-800 border border-slate-100">
                  {profile?.education?.year}
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Percentage / CGPA</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.1"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              ) : (
                <div className="p-2.5 bg-slate-50 rounded-xl font-medium text-slate-800 border border-slate-100">
                  {profile?.education?.score}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Verified Field Badges (SDS Data Dictionary) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Cross-Department Credentials</span>
          </div>
          <p className="text-xs text-slate-500">
            Fields verified directly through authoritative departmental connectors without requiring manual document uploads.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {(profile?.verifiedFields || ['Unified Identity (Verified)']).map((badge, bIdx) => (
              <span
                key={bIdx}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{badge}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Action button if editing */}
        {isEditing && (
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-700 text-white text-xs font-bold rounded-xl hover:bg-indigo-800 transition shadow-md flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save & Update Common Schema</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
