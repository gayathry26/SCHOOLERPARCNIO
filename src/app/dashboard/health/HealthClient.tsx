'use client';

import React, { useState } from 'react';
import {
  HeartPulse,
  AlertCircle,
  Stethoscope,
  Calendar,
  Plus,
  ShieldAlert,
  Search,
  CheckCircle2,
  FileText,
  UserCheck,
  Eye,
  Activity,
  Ambulance,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable, Column } from '@/components/ui/DataTable';
import { formatDate } from '@/lib/formatters';

export const HealthClient: React.FC<{
  healthProfiles: any[];
  clinicVisits: any[];
  checkupSchedules: any[];
  students: any[];
  userRole: string;
}> = ({
  healthProfiles: initialProfiles,
  clinicVisits: initialVisits,
  checkupSchedules: initialSchedules,
  students,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState('profiles');
  const [profiles, setProfiles] = useState(initialProfiles);
  const [visits, setVisits] = useState(initialVisits);
  const [schedules, setSchedules] = useState(initialSchedules);

  // Modals
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Forms
  const [visitForm, setVisitForm] = useState({
    studentId: students[0]?.id || '',
    symptoms: '',
    treatmentGiven: '',
    medicineAdministered: 'Paracetamol 250mg & ORS',
    referredToHospital: false,
  });

  const [profileForm, setProfileForm] = useState({
    studentId: students[0]?.id || '',
    bloodGroup: 'B+',
    heightCm: '158',
    weightKg: '50',
    visionLeft: '6/6',
    visionRight: '6/6',
    allergies: 'Peanuts & Dust',
    chronicConditions: 'Mild Asthmatic Symptoms',
    emergencyMedicalNotes: 'Carry inhaler during sports periods',
  });

  const [scheduleForm, setScheduleForm] = useState({
    title: 'Biannual Dental & Vision Camp',
    scheduledDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    doctorName: 'Dr. Anita Roy (Max Healthcare)',
    checkupType: 'Dental Hygiene & Refraction Screening',
  });

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LOG_CLINIC_VISIT', ...visitForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setVisits([data.visit, ...visits]);
        setIsVisitModalOpen(false);
        setVisitForm({
          studentId: students[0]?.id || '',
          symptoms: '',
          treatmentGiven: '',
          medicineAdministered: 'Paracetamol 250mg & ORS',
          referredToHospital: false,
        });
      } else {
        alert(data.error || 'Failed to log visit');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_PROFILE', ...profileForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfiles((prev) => {
          const idx = prev.findIndex((p) => p.studentId === data.profile.studentId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = data.profile;
            return next;
          }
          return [data.profile, ...prev];
        });
        setIsProfileModalOpen(false);
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_SCHEDULE', ...scheduleForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setSchedules([...schedules, data.schedule]);
        setIsScheduleModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const tabs: TabItem[] = [
    { id: 'profiles', label: 'Student Medical Profiles & Allergy Alerts', count: profiles.length, icon: <HeartPulse className="w-4 h-4 text-rose-500" /> },
    { id: 'visits', label: 'Infirmary Clinic Consultations', count: visits.length, icon: <Stethoscope className="w-4 h-4 text-[#086A92]" /> },
    { id: 'camps', label: 'Annual Health Checkup Camps', count: schedules.length, icon: <Calendar className="w-4 h-4 text-emerald-600" /> },
  ];

  const profileColumns: Column<any>[] = [
    {
      key: 'student',
      header: 'Student Name',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900">
            {row.student?.user?.firstName} {row.student?.user?.lastName || ''}
          </span>
          <span className="block text-[11px] text-slate-400 font-mono">
            Adm #{row.student?.admissionNumber} • {row.student?.enrollments?.[0]?.class?.name || 'Class 10'} - {row.student?.enrollments?.[0]?.section?.name || 'A'}
          </span>
        </div>
      ),
    },
    {
      key: 'bloodGroup',
      header: 'Blood Group',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
          {row.bloodGroup || 'O+'}
        </span>
      ),
    },
    {
      key: 'vitals',
      header: 'Physical Vitals',
      render: (row) => (
        <div className="text-xs text-slate-700 space-y-0.5">
          <div>Height: <strong className="text-slate-900">{row.heightCm} cm</strong> • Weight: <strong className="text-slate-900">{row.weightKg} kg</strong></div>
          <div className="text-[11px] text-slate-500">Vision: L {row.visionLeft} / R {row.visionRight}</div>
        </div>
      ),
    },
    {
      key: 'allergies',
      header: 'Allergy & Condition Alert',
      render: (row) => (
        <div>
          {row.allergies ? (
            <Badge variant="rose" size="sm" className="font-semibold">
              ⚠️ {row.allergies}
            </Badge>
          ) : (
            <span className="text-xs text-slate-400">None reported</span>
          )}
          {row.chronicConditions && (
            <span className="block text-[11px] text-amber-700 mt-1 font-medium">
              Note: {row.chronicConditions}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'notes',
      header: 'Emergency Action',
      render: (row) => (
        <span className="text-xs text-slate-600 italic">
          {row.emergencyMedicalNotes || 'Standard first aid protocol applies.'}
        </span>
      ),
    },
  ];

  const visitColumns: Column<any>[] = [
    {
      key: 'date',
      header: 'Date & Time',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-xs">{formatDate(row.visitDate)}</span>
          <span className="block text-[11px] text-slate-400 font-mono">
            {new Date(row.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 text-xs">
            {row.student?.user?.firstName} {row.student?.user?.lastName || ''}
          </span>
          <span className="block text-[11px] text-slate-400">
            {row.student?.enrollments?.[0]?.class?.name || 'Class 10'} - {row.student?.enrollments?.[0]?.section?.name || 'A'}
          </span>
        </div>
      ),
    },
    {
      key: 'symptoms',
      header: 'Reported Symptoms',
      render: (row) => <span className="text-xs font-medium text-slate-800">{row.symptoms}</span>,
    },
    {
      key: 'treatment',
      header: 'First-Aid & Medicines',
      render: (row) => (
        <div className="text-xs">
          <span className="text-slate-800">{row.treatmentGiven}</span>
          {row.medicineAdministered && (
            <span className="block text-[11px] text-slate-500 font-mono">Rx: {row.medicineAdministered}</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Disposition',
      render: (row) => (
        row.referredToHospital ? (
          <Badge variant="rose" size="sm" className="flex items-center gap-1 font-bold">
            <Ambulance className="w-3 h-3" /> Hospital Referral
          </Badge>
        ) : (
          <Badge variant="emerald" size="sm">
            Rested &amp; Returned to Class
          </Badge>
        )
      ),
    },
    {
      key: 'nurse',
      header: 'Attended By',
      render: (row) => <span className="text-[11px] text-slate-600">{row.attendedByNurse}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E4EAEC] p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <HeartPulse className="w-6 h-6 text-rose-600" />
              <span>School Health Management &amp; Infirmary</span>
            </h2>
            <Badge variant="purple" size="sm">
              Confidential Medical Room
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Student medical profiles, life-threatening allergy alerts, infirmary consultations, first-aid records, and health camps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Update Medical Profile
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="bg-[#086A92] hover:bg-[#065A7D] text-white flex items-center gap-1.5"
            onClick={() => setIsVisitModalOpen(true)}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Log Infirmary Visit
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Medical Records"
          value={profiles.length}
          change="Updated this term"
          trend="neutral"
          icon={<HeartPulse className="w-5 h-5 text-rose-600" />}
        />
        <StatCard
          title="Allergy / Chronic Alerts"
          value={profiles.filter((p) => p.allergies || p.chronicConditions).length}
          change="Special attention flagged"
          trend="up"
          icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          title="Infirmary Visits This Month"
          value={visits.length}
          change="All resolved safely"
          trend="neutral"
          icon={<Activity className="w-5 h-5 text-[#086A92]" />}
        />
        <StatCard
          title="Upcoming Health Camps"
          value={schedules.length}
          change="Next: Dental Screening"
          trend="neutral"
          icon={<Calendar className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab: Medical Profiles */}
      {activeTab === 'profiles' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Student Medical Profiles &amp; Emergency Directives
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Confidential records accessible solely by the authorized Campus Nurse, Doctor, Counsellor, and Principal.
                </p>
              </div>
            </div>
          </CardHeader>
          <DataTable
            data={profiles}
            columns={profileColumns}
            searchable
            searchPlaceholder="Search by student name or allergy..."
            pagination
            pageSize={10}
          />
        </Card>
      )}

      {/* Tab: Infirmary Visits */}
      {activeTab === 'visits' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Infirmary Consultations &amp; Daily First-Aid Log
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Immediate symptoms, care provided, and automatic SMS/WhatsApp notification dispatches to guardians.
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                className="bg-[#086A92] text-white"
                onClick={() => setIsVisitModalOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Log New Visit
              </Button>
            </div>
          </CardHeader>
          <DataTable
            data={visits}
            columns={visitColumns}
            searchable
            searchPlaceholder="Search consultations..."
            pagination
            pageSize={10}
          />
        </Card>
      )}

      {/* Tab: Camps */}
      {activeTab === 'camps' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Comprehensive Campus Health Camps</h3>
              <p className="text-xs text-slate-500">Scheduled visits by visiting paediatricians, dentists, and optometrists.</p>
            </div>
            <Button
              size="sm"
              variant="primary"
              className="bg-[#086A92] text-white"
              onClick={() => setIsScheduleModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Schedule Health Camp
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((camp) => (
              <Card key={camp.id}>
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="blue" size="sm">
                        {camp.status}
                      </Badge>
                      <h4 className="font-bold text-slate-900 text-base mt-2">{camp.title}</h4>
                      <span className="text-xs text-slate-500">{camp.checkupType}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Scheduled Date:</span>
                      <strong className="text-slate-900">{formatDate(camp.scheduledDate)}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Medical Officer:</span>
                      <strong className="text-slate-900">{camp.doctorName}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Target Audience:</span>
                      <span className="font-medium text-slate-800">All Wings (Grades 1–12)</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button size="xs" variant="outline" className="w-full text-slate-700">
                      Download Consent Letters &amp; Parent Slips
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Log Visit Modal */}
      <Modal isOpen={isVisitModalOpen} onClose={() => setIsVisitModalOpen(false)} title="Log Infirmary Consultation">
        <form onSubmit={handleCreateVisit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
            <select
              value={visitForm.studentId}
              onChange={(e) => setVisitForm({ ...visitForm, studentId: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.firstName} {s.user?.lastName || ''} (Adm #{s.admissionNumber} - {s.enrollments?.[0]?.class?.name || 'Class 10'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reported Symptoms / Complaint</label>
            <input
              type="text"
              required
              placeholder="e.g. Mild fever (100.2 F), stomach ache during lunch break"
              value={visitForm.symptoms}
              onChange={(e) => setVisitForm({ ...visitForm, symptoms: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Treatment Given / First Aid</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Rested on infirmary bed for 40 mins, cold compress applied, vitals monitored"
              value={visitForm.treatmentGiven}
              onChange={(e) => setVisitForm({ ...visitForm, treatmentGiven: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Medication Administered</label>
            <input
              type="text"
              value={visitForm.medicineAdministered}
              onChange={(e) => setVisitForm({ ...visitForm, medicineAdministered: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
            <input
              type="checkbox"
              id="hospitalRef"
              checked={visitForm.referredToHospital}
              onChange={(e) => setVisitForm({ ...visitForm, referredToHospital: e.target.checked })}
              className="w-4 h-4 text-rose-600 rounded"
            />
            <label htmlFor="hospitalRef" className="text-xs font-semibold text-rose-800 cursor-pointer">
              Emergency Escalation: Refer to partner hospital (Triggers instant SMS to Parent &amp; Principal)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsVisitModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" className="bg-[#086A92] text-white">
              Log Visit &amp; Notify Parents
            </Button>
          </div>
        </form>
      </Modal>

      {/* Update Profile Modal */}
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Update Student Health Profile">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
            <select
              value={profileForm.studentId}
              onChange={(e) => setProfileForm({ ...profileForm, studentId: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.firstName} {s.user?.lastName || ''} (Adm #{s.admissionNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={profileForm.bloodGroup}
                onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Height (cm)</label>
              <input
                type="number"
                value={profileForm.heightCm}
                onChange={(e) => setProfileForm({ ...profileForm, heightCm: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={profileForm.weightKg}
                onChange={(e) => setProfileForm({ ...profileForm, weightKg: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vision (Left)</label>
              <input
                type="text"
                value={profileForm.visionLeft}
                onChange={(e) => setProfileForm({ ...profileForm, visionLeft: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vision (Right)</label>
              <input
                type="text"
                value={profileForm.visionRight}
                onChange={(e) => setProfileForm({ ...profileForm, visionRight: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Allergies (Life-Threatening / Food / Drug)</label>
            <input
              type="text"
              placeholder="e.g. Peanuts, Penicillin, Dust allergy"
              value={profileForm.allergies}
              onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chronic Conditions / Physical Limitations</label>
            <input
              type="text"
              placeholder="e.g. Asthma, Juvenile Diabetes, Epilepsy"
              value={profileForm.chronicConditions}
              onChange={(e) => setProfileForm({ ...profileForm, chronicConditions: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Medical Action Protocol</label>
            <textarea
              rows={2}
              placeholder="Instructions for teachers & bus conductors in emergency"
              value={profileForm.emergencyMedicalNotes}
              onChange={(e) => setProfileForm({ ...profileForm, emergencyMedicalNotes: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" className="bg-[#086A92] text-white">
              Save Medical Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Camp Modal */}
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Schedule Campus Health Camp">
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Camp Title</label>
            <input
              type="text"
              required
              value={scheduleForm.title}
              onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Date</label>
              <input
                type="date"
                required
                value={scheduleForm.scheduledDate}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Visiting Doctor / Hospital</label>
              <input
                type="text"
                required
                value={scheduleForm.doctorName}
                onChange={(e) => setScheduleForm({ ...scheduleForm, doctorName: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Checkup Scope &amp; Tests</label>
            <input
              type="text"
              value={scheduleForm.checkupType}
              onChange={(e) => setScheduleForm({ ...scheduleForm, checkupType: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" className="bg-[#086A92] text-white">
              Schedule Camp
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
