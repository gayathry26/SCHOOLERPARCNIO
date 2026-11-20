'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building,
  ShieldCheck,
  Calendar,
  DollarSign,
  Bell,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Illustration } from '@/components/ui/Illustration';

export const SettingsClient: React.FC<{ school: any }> = ({ school }) => {
  const [activeTab, setActiveTab] = useState('school');
  const [formData, setFormData] = useState({
    name: school?.name || 'Edvonest Model International Academy',
    affiliationNo: school?.affiliationNo || 'CBSE/AFF/2026/89410',
    board: school?.board || 'CBSE',
    email: school?.email || 'contact@edvonest-academy.edu.in',
    phone: school?.phone || '+91 11 4982 3000',
    address: school?.address || 'Plot 12, Institutional Area, Sector 62',
    city: school?.city || 'Noida',
    state: school?.state || 'Uttar Pradesh',
    pincode: school?.pincode || '201309',
    currencySymbol: '₹',
    currencyCode: 'INR',
    attendanceThreshold: 75.0,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs: TabItem[] = [
    { id: 'school', label: 'School Profile', icon: <Building className="w-4 h-4" /> },
    { id: 'academic', label: 'Academic & Grading Rules', icon: <Calendar className="w-4 h-4" /> },
    { id: 'financial', label: 'Finance & Payment Gateways', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notification Triggers', icon: <Bell className="w-4 h-4" /> },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to persist settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            <span>School Configuration &amp; Global Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional profile, board affiliation parameters, grading criteria, and payment integrations.
          </p>
        </div>

        {saveSuccess && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" /> Settings Updated Successfully
          </span>
        )}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ---------------------------------------------------- */}
      {/* TAB 1: SCHOOL PROFILE */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'school' && (
        <Card>
          <CardHeader>
            <CardTitle>Institutional Details &amp; Board Affiliation</CardTitle>
          </CardHeader>

          {/* Institutional Brand Header Card */}
          <div className="mx-6 mb-5 flex flex-col sm:flex-row items-center gap-4 p-4 bg-gradient-to-r from-[#EAF5F8] to-[#F7FAFA] border border-[#E4EAEC] rounded-2xl">
            <Illustration variant="campus-welcome" size={68} />
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-sm font-bold text-[#17313A]">{formData.name}</h3>
                <Badge variant="blue" size="xs">{formData.board} Accredited</Badge>
              </div>
              <p className="text-[11px] text-[#6B7C83] mt-0.5">
                Affiliation: <span className="font-mono font-semibold text-[#086A92]">{formData.affiliationNo}</span> • EdvoNest Unified School OS
              </p>
              <p className="text-[10px] text-[#008C91] font-semibold mt-1">
                Learn • Grow • Succeed
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">School Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Affiliation Number (CBSE/ICSE) *</label>
                <input
                  type="text"
                  required
                  value={formData.affiliationNo}
                  onChange={(e) => setFormData({ ...formData, affiliationNo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Education Board</label>
                <select
                  value={formData.board}
                  onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-white"
                >
                  <option value="CBSE">CBSE (Central Board of Secondary Education)</option>
                  <option value="ICSE">CISCE / ICSE</option>
                  <option value="STATE">State Education Board</option>
                  <option value="IB">International Baccalaureate (IB)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Campus Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City &amp; State</label>
                <input
                  type="text"
                  value={`${formData.city}, ${formData.state}`}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={loading} leftIcon={<Save className="w-4 h-4" />}>
                Save School Configuration
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: ACADEMIC RULES */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'academic' && (
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Grading Scales &amp; Attendance Thresholds</CardTitle>
          </CardHeader>
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Minimum Exam Eligibility Attendance:</span>
                <span className="font-bold text-emerald-700 text-sm font-mono">75.0%</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Students falling below 75% attendance trigger automated parent alerts and administrative review for board exam roll numbers.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">CBSE 9-Point Grading Scale:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-white rounded border border-slate-200">A1: 91% – 100%</div>
                <div className="p-2 bg-white rounded border border-slate-200">A2: 81% – 90%</div>
                <div className="p-2 bg-white rounded border border-slate-200">B1: 71% – 80%</div>
                <div className="p-2 bg-white rounded border border-slate-200">B2: 61% – 70%</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: FINANCIAL SETTINGS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'financial' && (
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Currency &amp; Razorpay Gateway Configuration</CardTitle>
          </CardHeader>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value="₹ (INR)"
                  readOnly
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Payment Gateway</label>
                <input
                  type="text"
                  value="Razorpay Gateway (Verified)"
                  readOnly
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-emerald-700"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: NOTIFICATIONS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'notifications' && (
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Automated Event Triggers</CardTitle>
          </CardHeader>
          <div className="space-y-3 text-xs">
            {[
              { title: 'Student Absent Alert to Parent', desc: 'Dispatches instant push & SMS notice when child is marked absent', active: true },
              { title: 'Fee Payment Received Confirmation', desc: 'Sends receipt number and amount breakdown to parent', active: true },
              { title: 'New Homework & Deadline Reminder', desc: 'Alerts student & parent upon homework assignment creation', active: true },
              { title: 'Examination Schedule & Result Published', desc: 'Notifies when marks are finalized and locked', active: true },
            ].map((n, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{n.title}</h4>
                  <p className="text-slate-500 text-[11px]">{n.desc}</p>
                </div>
                <Badge variant="emerald">Enabled</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
