'use client';

import React, { useState } from 'react';
import {
  HeartHandshake,
  Calendar,
  FileCheck2,
  CheckCircle2,
  Clock,
  BookOpen,
  DollarSign,
  BellRing,
  User,
  GraduationCap,
  Bus,
  Plus,
  Video,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { formatDate, formatCurrency } from '@/lib/formatters';

export const ParentPortalClient: React.FC<{
  parentProfile: any;
  primaryStudent: any;
  ptmBookings: any[];
  digitalConsents: any[];
  homeworkList: any[];
  teachers: any[];
  invoices: any[];
  userRole: string;
}> = ({
  parentProfile,
  primaryStudent,
  ptmBookings: initialPtms,
  digitalConsents: initialConsents,
  homeworkList,
  teachers,
  invoices,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState('digest');
  const [ptms, setPtms] = useState(initialPtms);
  const [consents, setConsents] = useState(initialConsents);
  const [isPtmModalOpen, setIsPtmModalOpen] = useState(false);

  const [ptmForm, setPtmForm] = useState({
    teacherId: teachers[0]?.id || '',
    scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    timeSlot: '10:00 AM - 10:20 AM',
    meetingMode: 'IN_PERSON',
    notes: 'Discussion on midterm exam preparation and science project',
  });

  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);

  const handleBookPtm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/parent-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'BOOK_PTM', ...ptmForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setPtms([data.booking, ...ptms]);
        setIsPtmModalOpen(false);
      } else {
        alert(data.error || 'Failed to book slot');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignConsent = async (consentId: string, isAccepted: boolean) => {
    try {
      const res = await fetch('/api/parent-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SIGN_CONSENT', consentId, isAccepted }),
      });
      const data = await res.json();
      if (res.ok) {
        setConsents((prev) =>
          prev.map((c) => (c.id === consentId ? { ...c, isAccepted, signedAt: new Date() } : c))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const tabs: TabItem[] = [
    { id: 'digest', label: 'Daily Student Activity Digest', icon: <User className="w-4 h-4 text-[#990000]" /> },
    { id: 'homework', label: 'Homework & Assignments', count: homeworkList.length, icon: <BookOpen className="w-4 h-4 text-amber-500" /> },
    { id: 'ptm', label: 'Parent-Teacher Conferences (PTM)', count: ptms.length, icon: <Calendar className="w-4 h-4 text-emerald-600" /> },
    { id: 'consents', label: 'Digital Circulars & Consent Forms', count: consents.filter((c) => c.isAccepted === null).length, icon: <FileCheck2 className="w-4 h-4 text-indigo-600" /> },
    { id: 'fees', label: 'Fee Invoices & Receipts', count: invoices.length, icon: <DollarSign className="w-4 h-4 text-emerald-600" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-[#990000] to-[#171717] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-2xl font-bold">
            {primaryStudent?.user?.firstName?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider bg-white/15 px-2 py-0.5 rounded text-white/90">
                Ward Profile
              </span>
              <span className="text-xs text-white/80 font-mono">Adm #{primaryStudent?.admissionNumber || 'EDV-1002'}</span>
            </div>
            <h2 className="text-2xl font-bold mt-0.5 tracking-tight">
              {primaryStudent?.user?.firstName || 'Aarav'} {primaryStudent?.user?.lastName || 'Sharma'}
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              {primaryStudent?.enrollments?.[0]?.class?.name || 'Class 10'} - {primaryStudent?.enrollments?.[0]?.section?.name || 'A'} • CBSE Board Curriculum
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15 text-xs">
          <div>
            <span className="text-white/70 block text-[10px] uppercase font-mono">Attendance Rate</span>
            <strong className="text-emerald-300 text-sm">96.4% Present</strong>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div>
            <span className="text-white/70 block text-[10px] uppercase font-mono">School Bus</span>
            <strong className="text-white text-sm">Route #1 (Stop 3)</strong>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div>
            <span className="text-white/70 block text-[10px] uppercase font-mono">Academic Standing</span>
            <strong className="text-amber-300 text-sm">Grade A1 (91.2%)</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab: Daily Activity Digest */}
      {activeTab === 'digest' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Today&apos;s School Day Live Digest ({new Date().toLocaleDateString()})</span>
                  </CardTitle>
                  <Badge variant="emerald">Campus Check-In: 07:52 AM</Badge>
                </div>
              </CardHeader>
              <div className="p-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Morning Turnstile Gate Verification</h4>
                    <p className="text-xs text-slate-500">
                      Smart ID scan recorded at Gate 1 Main Entrance. Temperature normal (98.4°F).
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Today&apos;s Classroom Timetable &amp; Subjects
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-slate-400 font-mono text-[10px]">08:00 - 08:45 AM • Period 1</span>
                      <strong className="block text-slate-900 font-bold mt-0.5">Mathematics (Quadratic Equations)</strong>
                      <span className="text-slate-500 text-[11px]">Teacher: Mr. Rajesh Kumar • Chapter 4 Exercise 4.2</span>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-slate-400 font-mono text-[10px]">08:50 - 09:35 AM • Period 2</span>
                      <strong className="block text-slate-900 font-bold mt-0.5">Physics Lab (Ohm&apos;s Law Practical)</strong>
                      <span className="text-slate-500 text-[11px]">Teacher: Dr. S. K. Verma • Lab Equipment verified</span>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-slate-400 font-mono text-[10px]">09:40 - 10:25 AM • Period 3</span>
                      <strong className="block text-slate-900 font-bold mt-0.5">English Literature (The Necklace)</strong>
                      <span className="text-slate-500 text-[11px]">Teacher: Ms. Ananya Sen • Character Analysis Discussion</span>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-slate-400 font-mono text-[10px]">10:45 - 11:30 AM • Period 4</span>
                      <strong className="block text-slate-900 font-bold mt-0.5">Computer Science (Python Functions)</strong>
                      <span className="text-slate-500 text-[11px]">Teacher: Mr. Arun Saxena • Lab Session Complete</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <BellRing className="w-3.5 h-3.5" />
                    Teacher Diary Note from Class Teacher:
                  </span>
                  <p className="text-amber-800">
                    &ldquo;Aarav actively contributed during the Physics practical circuit demonstration today. Please verify that his English presentation slides are uploaded by 6 PM.&rdquo;
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Quick Actions & Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-[#990000]" />
                  <span>Instant Notification Channels</span>
                </CardTitle>
              </CardHeader>
              <div className="p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <strong className="text-slate-800 block">WhatsApp Gate &amp; Bus Pings</strong>
                    <span className="text-[11px] text-slate-500">Live entry/exit &amp; bus arrivals</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#990000] rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <strong className="text-slate-800 block">SMS Absence &amp; Fee Alerts</strong>
                    <span className="text-[11px] text-slate-500">High-priority transactional SMS</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsEnabled}
                    onChange={(e) => setSmsEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#990000] rounded"
                  />
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-slate-700"
                  onClick={() => setIsPtmModalOpen(true)}
                >
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  Schedule Teacher Meeting
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Homework */}
      {activeTab === 'homework' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Daily Homework &amp; Assignment Tracker
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">Review pending homework tasks and submission deadlines.</p>
              </div>
            </div>
          </CardHeader>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {homeworkList.map((hw) => (
              <div key={hw.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="blue" size="sm">
                    {hw.subject?.name || 'Core Subject'}
                  </Badge>
                  <span className="text-xs text-slate-500 font-mono">Due: {formatDate(hw.dueDate)}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{hw.title}</h4>
                <p className="text-xs text-slate-600">{hw.description}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Faculty: {hw.subject?.name || 'Department Faculty'}</span>
                  <span className="text-emerald-700 font-semibold">Ready for Upload</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: PTM Conferences */}
      {activeTab === 'ptm' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Parent-Teacher Meeting (PTM) Bookings</h3>
              <p className="text-xs text-slate-500">Book confidential 1-on-1 conferences with faculty.</p>
            </div>
            <Button
              size="sm"
              variant="primary"
              className="bg-[#990000] text-white"
              onClick={() => setIsPtmModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Book PTM Slot
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ptms.map((ptm) => (
              <Card key={ptm.id}>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={ptm.meetingMode === 'VIDEO_CALL' ? 'purple' : 'blue'} size="sm">
                      {ptm.meetingMode}
                    </Badge>
                    <Badge variant="emerald" size="sm">
                      {ptm.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      {ptm.teacher?.user?.firstName || 'Faculty'} {ptm.teacher?.user?.lastName || ''}
                    </h4>
                    <span className="text-xs text-slate-500">Subject / Class Teacher</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Date:</span>
                      <strong className="text-slate-900">{formatDate(ptm.scheduledDate)}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Time:</span>
                      <strong className="text-slate-900">{ptm.timeSlot}</strong>
                    </div>
                  </div>
                  {ptm.notes && <p className="text-xs text-slate-600 italic">&ldquo;{ptm.notes}&rdquo;</p>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Digital Consents */}
      {activeTab === 'consents' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Digital Circulars &amp; Parent Consent Forms
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Paperless consent signing for educational trips, sports day participation, and school programs.
              </p>
            </div>
          </CardHeader>
          <div className="p-5 space-y-4">
            {consents.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base">{c.title}</h4>
                    <Badge variant={c.isAccepted === null ? 'amber' : c.isAccepted ? 'emerald' : 'rose'}>
                      {c.isAccepted === null ? 'Pending Signature' : c.isAccepted ? 'Consented & Signed' : 'Declined'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl">{c.description}</p>
                  <span className="text-[11px] font-mono text-slate-400 mt-1 block">
                    Response Deadline: {formatDate(c.deadline)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {c.isAccepted === null ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-600 border-rose-200"
                        onClick={() => handleSignConsent(c.id, false)}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                        onClick={() => handleSignConsent(c.id, true)}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Provide Digital Consent
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Signed electronically on {formatDate(c.signedAt || new Date())}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Fees */}
      {activeTab === 'fees' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Fee Invoices, Receipts &amp; Dues
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">Instant digital fee payment and tax-compliant receipts.</p>
              </div>
            </div>
          </CardHeader>
          <div className="p-5 space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900 block">{inv.invoiceNumber}</span>
                  <span className="text-slate-500">Due: {formatDate(inv.dueDate)}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm font-mono">{formatCurrency(inv.totalAmount)}</span>
                  <span className="block text-[11px] text-slate-400">Total Billable</span>
                </div>
                <Badge variant={inv.status === 'PAID' ? 'emerald' : 'amber'}>{inv.status}</Badge>
                <Button size="xs" variant="outline" onClick={() => alert('Viewing invoice PDF')}>
                  Receipt
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Book PTM Modal */}
      <Modal isOpen={isPtmModalOpen} onClose={() => setIsPtmModalOpen(false)} title="Book Parent-Teacher Conference (PTM)">
        <form onSubmit={handleBookPtm} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Teacher / Subject Faculty</label>
            <select
              value={ptmForm.teacherId}
              onChange={(e) => setPtmForm({ ...ptmForm, teacherId: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user?.firstName} {t.user?.lastName || ''} ({t.designation || 'Teacher'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Date</label>
              <input
                type="date"
                required
                value={ptmForm.scheduledDate}
                onChange={(e) => setPtmForm({ ...ptmForm, scheduledDate: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
              <select
                value={ptmForm.timeSlot}
                onChange={(e) => setPtmForm({ ...ptmForm, timeSlot: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              >
                <option value="09:00 AM - 09:20 AM">09:00 AM - 09:20 AM</option>
                <option value="10:00 AM - 10:20 AM">10:00 AM - 10:20 AM</option>
                <option value="11:30 AM - 11:50 AM">11:30 AM - 11:50 AM</option>
                <option value="02:00 PM - 02:20 PM">02:00 PM - 02:20 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Format</label>
            <select
              value={ptmForm.meetingMode}
              onChange={(e) => setPtmForm({ ...ptmForm, meetingMode: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            >
              <option value="IN_PERSON">In-Person at Campus Conference Room</option>
              <option value="VIDEO_CALL">Secure Video Conference Link</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Discussion Agenda / Questions</label>
            <textarea
              rows={2}
              value={ptmForm.notes}
              onChange={(e) => setPtmForm({ ...ptmForm, notes: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsPtmModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" className="bg-[#990000] text-white">
              Confirm Conference Slot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
