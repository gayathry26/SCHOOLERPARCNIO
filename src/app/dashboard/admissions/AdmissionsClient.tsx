'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck2,
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  TrendingUp,
  FileText,
  Award,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/formatters';

export const AdmissionsClient: React.FC<{ initialApplications: any[]; userRole?: string }> = ({
  initialApplications,
  userRole,
}) => {
  const [applications, setApplications] = useState(initialApplications);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // New Enquiry Form
  const [formData, setFormData] = useState({
    studentName: '',
    gender: 'MALE',
    dob: '2012-05-15',
    applyingForClass: 'Class 10',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    address: 'Sector 62, Noida',
  });

  // Assessment Form
  const [interviewForm, setInterviewForm] = useState({
    score: '88',
    feedback: 'High aptitude in quantitative skills and logical reasoning. Recommended.',
    interviewerName: 'Principal Admissions Board',
  });

  const filtered = applications.filter((app) => {
    if (activeFilter === 'ALL') return true;
    return app.status === activeFilter;
  });

  const totalEnquiries = applications.length;
  const admittedCount = applications.filter((a) => a.status === 'ADMITTED').length;
  const conversionRate = totalEnquiries > 0 ? Math.round((admittedCount / totalEnquiries) * 100) : 0;

  const handleCreateEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setApplications((prev) => [data.application, ...prev]);
        setIsNewModalOpen(false);
        setFormData({
          studentName: '',
          gender: 'MALE',
          dob: '2012-05-15',
          applyingForClass: 'Class 10',
          parentName: '',
          parentEmail: '',
          parentPhone: '',
          address: 'Sector 62, Noida',
        });
      } else {
        alert(data.error || 'Failed to create enquiry');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedApp) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          status,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === selectedApp.id ? data.application : a))
        );
        setSelectedApp(data.application);
        if (status === 'ADMITTED') {
          alert('Student and Parent user accounts created! Student is now enrolled in Class.');
        }
      } else {
        alert(data.error || 'Update failed');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyDocument = async (docId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'VERIFY_DOCUMENT', documentId: docId, status }),
      });
      const data = await res.json();
      if (res.ok) {
        if (selectedApp) {
          const nextDocs = selectedApp.documents?.map((d: any) =>
            d.id === docId ? data.document : d
          );
          const nextApp = { ...selectedApp, documents: nextDocs };
          setSelectedApp(nextApp);
          setApplications((prev) => prev.map((a) => (a.id === nextApp.id ? nextApp : a)));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedApp) return;
    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SCHEDULE_INTERVIEW',
          applicationId: selectedApp.id,
          scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
          ...interviewForm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const nextApp = {
          ...selectedApp,
          status: 'INTERVIEW_SCHEDULED',
          interviews: [...(selectedApp.interviews || []), data.interview],
        };
        setSelectedApp(nextApp);
        setApplications((prev) => prev.map((a) => (a.id === nextApp.id ? nextApp : a)));
        alert('Assessment scheduled and recorded in candidate pipeline.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'applicationNo',
      header: 'App Number',
      render: (row) => <span className="font-mono font-bold text-slate-900">{row.applicationNo}</span>,
    },
    {
      key: 'studentName',
      header: 'Candidate Name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.studentName} size="sm" />
          <div>
            <span className="font-bold text-slate-900 block">{row.studentName}</span>
            <span className="block text-[11px] text-slate-400 font-medium">
              Gender: {row.gender} • DOB: {formatDate(row.dob)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'applyingForClass',
      header: 'Applying Class',
      render: (row) => <span className="font-semibold text-slate-800">{row.applyingForClass}</span>,
    },
    {
      key: 'parentName',
      header: 'Parent Contact',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800 text-xs">{row.parentName}</span>
          <span className="block text-[11px] text-slate-500 font-mono">{row.parentPhone}</span>
        </div>
      ),
    },
    {
      key: 'docs',
      header: 'Docs & Verified',
      render: (row) => {
        const docs = row.documents || [];
        const verified = docs.filter((d: any) => d.status === 'VERIFIED').length;
        return (
          <span className="text-xs text-slate-600 font-mono">
            {verified}/{docs.length || 3} Verified
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const colors: Record<string, string> = {
          ENQUIRY: 'bg-slate-100 text-slate-700',
          UNDER_REVIEW: 'bg-indigo-50 text-indigo-700',
          VERIFIED: 'bg-blue-50 text-blue-700',
          INTERVIEW_SCHEDULED: 'bg-amber-50 text-amber-700',
          APPROVED: 'bg-emerald-50 text-emerald-700',
          ADMITTED: 'bg-emerald-600 text-white',
          REJECTED: 'bg-rose-50 text-rose-700',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${colors[row.status] || 'bg-slate-100'}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'action',
      header: 'Action',
      sortable: false,
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => setSelectedApp(row)}>
          Review Pipeline
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] p-5 rounded-2xl shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-[#990000]" />
            <span>Admissions &amp; Lead CRM Pipeline</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enquiry lead scoring, document verification, interview scheduling, offer letters, and 1-click student account creation.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="bg-[#990000] hover:bg-[#800000] text-white"
          onClick={() => setIsNewModalOpen(true)}
        >
          <UserPlus className="w-3.5 h-3.5 mr-1" />
          New Admission Enquiry
        </Button>
      </div>

      {/* Conversion Funnel Banner */}
      <div className="p-4 bg-gradient-to-r from-[#990000]/10 via-sky-50 to-indigo-50 border border-sky-200/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#990000] text-white flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Admission Conversion Funnel (Session 2026-27)</h4>
            <span className="text-xs text-slate-600">
              {conversionRate}% Enquiries converted to confirmed enrolled students • Target CBSE/ICSE capacity: 95%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Total Leads</span>
            <strong className="text-slate-900 text-sm">{totalEnquiries}</strong>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <div>
            <span className="text-slate-500 block text-[11px]">Assessment</span>
            <strong className="text-slate-900 text-sm">
              {applications.filter((a) => ['INTERVIEW_SCHEDULED', 'APPROVED', 'ADMITTED'].includes(a.status)).length}
            </strong>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <div>
            <span className="text-slate-500 block text-[11px]">Enrolled</span>
            <strong className="text-emerald-700 text-sm">{admittedCount}</strong>
          </div>
        </div>
      </div>

      {/* KPI Pipeline Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Enquiries"
          value={applications.length}
          subtitle="Session 2026-27"
          icon={<Clock className="w-5 h-5 text-slate-600" />}
        />
        <StatCard
          title="Interviews &amp; Tests"
          value={applications.filter((a) => a.status === 'INTERVIEW_SCHEDULED').length}
          subtitle="Assessments pending"
          icon={<Calendar className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          title="Approved Offers"
          value={applications.filter((a) => a.status === 'APPROVED').length}
          subtitle="Awaiting fee receipt"
          icon={<CheckCircle2 className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Confirmed Admitted"
          value={applications.filter((a) => a.status === 'ADMITTED').length}
          subtitle="Student logins created"
          icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2 text-xs">
        {['ALL', 'ENQUIRY', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED', 'ADMITTED', 'REJECTED'].map(
          (st) => (
            <button
              key={st}
              onClick={() => setActiveFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          )
        )}
      </div>

      {/* Applications DataTable */}
      {filtered.length === 0 ? (
        <EmptyState
          illustration="no-students"
          title="No Admission Applications in this Stage"
          description="Prospective student inquiries, document verifications, and assessment interviews will be listed here."
          actionLabel="+ New Admission Enquiry"
          onAction={() => setIsNewModalOpen(true)}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          searchPlaceholder="Search by application #, candidate name, or parent phone..."
          pagination
          pageSize={10}
        />
      )}

      {/* MODAL: NEW ENQUIRY */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create Admission Enquiry"
      >
        <form onSubmit={handleCreateEnquiry} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#990000]"
                placeholder="Arya Sharma"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Applying For Class *</label>
              <select
                value={formData.applyingForClass}
                onChange={(e) => setFormData({ ...formData, applyingForClass: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#990000] bg-white"
              >
                {['Class 1', 'Class 5', 'Class 9', 'Class 10', 'Class 11 Science', 'Class 11 Commerce'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Parent Name *</label>
              <input
                type="text"
                required
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#990000]"
                placeholder="Dr. Rajesh Sharma"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Parent Phone *</label>
              <input
                type="tel"
                required
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#990000]"
                placeholder="+91 98111 22334"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Parent Email</label>
            <input
              type="email"
              value={formData.parentEmail}
              onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#990000]"
              placeholder="parent.sharma@example.com"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-[#990000] text-white">
              Save Admission Enquiry
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: REVIEW PIPELINE */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title={`Application Review: ${selectedApp?.applicationNo}`}
      >
        {selectedApp && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Candidate:</span>
                <span className="font-bold text-slate-900">{selectedApp.studentName} ({selectedApp.gender})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Parent / Guardian:</span>
                <span className="font-bold text-slate-900">{selectedApp.parentName} • {selectedApp.parentPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Status:</span>
                <Badge variant="emerald">{selectedApp.status}</Badge>
              </div>
            </div>

            {/* Document Verification Section */}
            <div className="border border-slate-200 rounded-xl p-3 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-[#990000]" />
                <span>Submitted Documents Verification</span>
              </h4>

              <div className="space-y-2 pt-1">
                {(selectedApp.documents && selectedApp.documents.length > 0
                  ? selectedApp.documents
                  : [
                      { id: 'd1', documentType: 'BIRTH_CERTIFICATE', status: 'VERIFIED' },
                      { id: 'd2', documentType: 'TRANSFER_CERTIFICATE', status: 'PENDING' },
                      { id: 'd3', documentType: 'PREVIOUS_REPORT_CARD', status: 'VERIFIED' },
                    ]
                ).map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-800">{doc.documentType.replace('_', ' ')}</span>
                      <span className="block text-[10px] text-slate-400">PDF • Uploaded via Online Portal</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={doc.status === 'VERIFIED' ? 'emerald' : 'amber'}>
                        {doc.status}
                      </Badge>
                      {doc.status !== 'VERIFIED' && (
                        <Button
                          size="xs"
                          variant="outline"
                          className="text-emerald-700 border-emerald-300"
                          onClick={() => handleVerifyDocument(doc.id, 'VERIFIED')}
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview & Assessment Section */}
            <div className="border border-slate-200 rounded-xl p-3 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Admissions Assessment &amp; Interview</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Entrance Test Score (%)</label>
                  <input
                    type="number"
                    value={interviewForm.score}
                    onChange={(e) => setInterviewForm({ ...interviewForm, score: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Interview Panel</label>
                  <input
                    type="text"
                    value={interviewForm.interviewerName}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interviewerName: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded text-xs"
                  />
                </div>
              </div>
              <Button size="xs" variant="outline" className="w-full" onClick={handleScheduleInterview}>
                Save &amp; Record Assessment Score
              </Button>
            </div>

            {/* Pipeline Action Buttons */}
            <div className="border border-slate-200 rounded-xl p-3 space-y-2">
              <h4 className="font-bold text-slate-900">Pipeline Progression Workflow:</h4>
              <p className="text-slate-500 text-[11px]">
                Advancing to <strong>&ldquo;ADMITTED&rdquo;</strong> will automatically create student &amp; parent login credentials, student profile, class enrollment, and fee invoices.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                  disabled={isUpdating}
                >
                  Under Review
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus('APPROVED')}
                  disabled={isUpdating}
                >
                  Issue Offer Letter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => handleUpdateStatus('REJECTED')}
                  disabled={isUpdating}
                >
                  Reject Application
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleUpdateStatus('ADMITTED')}
                  disabled={isUpdating}
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  Confirm &amp; Enrol
                </Button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
