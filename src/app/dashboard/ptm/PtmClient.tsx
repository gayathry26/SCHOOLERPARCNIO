'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Users,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  Lock,
  Plus,
  Search,
  FileText,
  RefreshCw,
  Bell,
  ChevronRight,
  Sparkles,
  Filter,
  Layers,
  Award,
  AlertTriangle,
  Printer,
  CalendarCheck,
  GraduationCap,
  MessageSquare,
  Eye,
  CheckSquare,
  Square,
  Building,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable, Column } from '@/components/ui/DataTable';
import { formatDate } from '@/lib/formatters';

export interface PtmClientProps {
  initialEvents: any[];
  initialBookings: any[];
  initialSlots: any[];
  teachers: any[];
  classes: any[];
  currentUser: any;
  currentUserProfile: {
    isParent: boolean;
    isTeacher: boolean;
    isAdmin: boolean;
    parentProfile?: any;
    teacherProfile?: any;
  };
}

export const PtmClient: React.FC<PtmClientProps> = ({
  initialEvents,
  initialBookings,
  initialSlots,
  teachers,
  classes,
  currentUser,
  currentUserProfile,
}) => {
  const { isParent, isTeacher, isAdmin, parentProfile, teacherProfile } = currentUserProfile;

  // Tabs & Views
  const defaultTab = isParent ? 'my-appointments' : isTeacher ? 'teacher-schedule' : 'admin-overview';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Core Data State
  const [events, setEvents] = useState<any[]>(initialEvents);
  const [bookings, setBookings] = useState<any[]>(initialBookings);
  const [slots, setSlots] = useState<any[]>(initialSlots);

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showNotification = (success: string | null, error: string | null = null) => {
    setSuccessMsg(success);
    setErrorMsg(error);
    if (success) {
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isSlotConfigModalOpen, setIsSlotConfigModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);

  // Active Selections
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(events[0] || null);

  // Filter States
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // 1. Create Event Form
  const [eventForm, setEventForm] = useState({
    title: '',
    description: 'Term review meeting covering formative marks, co-curricular records, and behavioral development.',
    eventDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    startTime: '09:00 AM',
    endTime: '02:00 PM',
    slotDuration: '15',
    bufferTime: '5',
    targetClassIds: 'ALL',
    meetingMode: 'HYBRID',
    locationRoom: 'Respective Classrooms & Senior Wing Hall',
    defaultMeetingLink: 'https://meet.google.com/edv-ptm-session',
    allowSubjectTeacherChoice: true,
    bookingDeadline: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    autoGenerateSlots: true,
  });

  // 2. Booking Wizard Form (for parents)
  const defaultStudentId = parentProfile?.students?.[0]?.student?.id || '';
  const [bookingForm, setBookingForm] = useState({
    eventId: events[0]?.id || '',
    studentId: defaultStudentId,
    teacherId: teachers[0]?.id || '',
    slotId: '',
    notes: 'Discussion regarding student academic focus and recent class assessment marks',
  });

  // 3. Reschedule Form
  const [rescheduleSlotId, setRescheduleSlotId] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('Parent schedule clash; requested alternative slot');

  // 4. Cancel Form
  const [cancellationReason, setCancellationReason] = useState('Unavoidable family emergency / scheduling conflict');

  // 5. Notes Form (Private Teacher Notes vs Shared Notes)
  const [notesForm, setNotesForm] = useState({
    sharedNotes: '',
    privateTeacherNotes: '',
    followUps: [] as { id?: string; title: string; assignedTo: string; dueDate: string; notes?: string }[],
    newFollowUpTitle: '',
    newFollowUpAssignee: 'PARENT',
    newFollowUpDueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
  });

  // 6. Slot Configuration Form (for teachers)
  const [slotConfigForm, setSlotConfigForm] = useState({
    ptmEventId: events[0]?.id || '',
    slotDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    startTime: '09:00 AM',
    endTime: '01:00 PM',
    duration: 15,
    mode: 'IN_PERSON',
    roomNumber: 'Room 204',
    meetingLink: 'https://meet.google.com/edv-faculty-consultation',
  });

  // -------------------------------------------------------------
  // ANALYTICS & KPIS
  // -------------------------------------------------------------
  const totalBookingsCount = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'RESCHEDULED');
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED');
  const noShowBookings = bookings.filter((b) => b.status === 'NO_SHOW');

  // -------------------------------------------------------------
  // TABS CONFIGURATION
  // -------------------------------------------------------------
  const tabs: TabItem[] = [
    ...(isAdmin
      ? [
          {
            id: 'admin-overview',
            label: 'School PTM Overview & Events',
            count: events.length,
            icon: <Building className="w-4 h-4 text-[#086A92]" />,
          },
          {
            id: 'master-schedule',
            label: 'Master Appointment Schedule',
            count: bookings.length,
            icon: <CalendarCheck className="w-4 h-4 text-indigo-600" />,
          },
        ]
      : []),
    ...(isTeacher
      ? [
          {
            id: 'teacher-schedule',
            label: 'My PTM Consultations & Notes',
            count: bookings.filter((b) => b.teacherId === teacherProfile?.id).length,
            icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
          },
          {
            id: 'slot-manager',
            label: 'My Availability Slots',
            count: slots.filter((s) => s.teacherId === teacherProfile?.id).length,
            icon: <Clock className="w-4 h-4 text-[#086A92]" />,
          },
        ]
      : []),
    ...(isParent
      ? [
          {
            id: 'my-appointments',
            label: 'My Booked Consultations',
            count: bookings.length,
            icon: <Calendar className="w-4 h-4 text-[#086A92]" />,
          },
          {
            id: 'book-slot',
            label: 'Book PTM Time Slot',
            icon: <Plus className="w-4 h-4 text-emerald-600" />,
          },
        ]
      : []),
  ];

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------

  // 1. Create PTM Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/ptm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_EVENT', ...eventForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setEvents([data.ptmEvent, ...events]);
        setIsEventModalOpen(false);
        showNotification(`Created PTM Event: "${data.ptmEvent.title}"`);
      } else {
        showNotification(null, data.error || 'Failed to create event');
      }
    } catch (e: any) {
      showNotification(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Book Slot (Parent)
  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.slotId) {
      showNotification(null, 'Please choose an available time slot.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/ptm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'BOOK_SLOT', ...bookingForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookings([data.booking, ...bookings]);
        setSlots((prev) =>
          prev.map((s) => (s.id === bookingForm.slotId ? { ...s, isBooked: true } : s))
        );
        setIsBookingModalOpen(false);
        setActiveTab('my-appointments');
        showNotification('Appointment successfully confirmed! An in-app reminder has been scheduled.');
      } else {
        showNotification(null, data.error || 'Failed to book slot');
      }
    } catch (e: any) {
      showNotification(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Reschedule Booking
  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !rescheduleSlotId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ptm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESCHEDULE_BOOKING',
          bookingId: selectedBooking.id,
          newSlotId: rescheduleSlotId,
          rescheduleReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === selectedBooking.id ? data.booking : b))
        );
        setIsRescheduleModalOpen(false);
        setSelectedBooking(null);
        showNotification('Appointment successfully rescheduled!');
      } else {
        showNotification(null, data.error || 'Failed to reschedule');
      }
    } catch (e: any) {
      showNotification(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Cancel Booking
  const handleCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ptm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CANCEL_BOOKING',
          bookingId: selectedBooking.id,
          cancellationReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === selectedBooking.id ? { ...b, status: 'CANCELLED', cancellationReason } : b))
        );
        setIsCancelModalOpen(false);
        setSelectedBooking(null);
        showNotification('Appointment cancelled. The time slot has been released.');
      } else {
        showNotification(null, data.error || 'Failed to cancel appointment');
      }
    } catch (e: any) {
      showNotification(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Save Notes & Follow-ups (Teacher/Admin)
  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ptm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_MEETING_NOTES',
          bookingId: selectedBooking.id,
          sharedNotes: notesForm.sharedNotes,
          privateTeacherNotes: notesForm.privateTeacherNotes,
          followUps: notesForm.followUps,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === selectedBooking.id
              ? {
                  ...b,
                  sharedNotes: notesForm.sharedNotes,
                  privateTeacherNotes: notesForm.privateTeacherNotes,
                  status: 'COMPLETED',
                  followUps: [...(b.followUps || []), ...notesForm.followUps.filter((f) => !f.id)],
                }
              : b
          )
        );
        setIsNotesModalOpen(false);
        setSelectedBooking(null);
        showNotification('Meeting notes saved and meeting marked as COMPLETED.');
      } else {
        showNotification(null, data.error || 'Failed to save notes');
      }
    } catch (e: any) {
      showNotification(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. Send Reminder
  const handleSendReminder = async (bookingId: string) => {
    try {
      const res = await fetch('/api/ptm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEND_REMINDER', bookingId }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, reminderSent: true } : b))
        );
        showNotification('Automated notification reminder sent to attendee.');
      } else {
        showNotification(null, data.error || 'Failed to send reminder');
      }
    } catch (e: any) {
      showNotification(null, e.message);
    }
  };

  // 7. Update Status (Teacher/Admin)
  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetch('/api/ptm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_STATUS', bookingId, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
        );
        showNotification(`Status updated to ${status}`);
      } else {
        showNotification(null, data.error || 'Failed to update status');
      }
    } catch (e: any) {
      showNotification(null, e.message);
    }
  };

  // Available slots for selected teacher & event in booking form
  const availableSlotsForBooking = slots.filter(
    (s) =>
      s.teacherId === bookingForm.teacherId &&
      (!bookingForm.eventId || s.ptmEventId === bookingForm.eventId) &&
      !s.isBooked &&
      !s.isBlocked
  );

  // Available slots for rescheduling
  const availableSlotsForReschedule = selectedBooking
    ? slots.filter(
        (s) =>
          s.teacherId === selectedBooking.teacherId &&
          s.id !== selectedBooking.slotId &&
          !s.isBooked &&
          !s.isBlocked
      )
    : [];

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white border border-[#E4EAEC] p-6 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF5F8] text-[#086A92] flex items-center justify-center font-bold">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Parent-Teacher Meeting &amp; Appointment Scheduling
              </h1>
              <Badge variant="blue" size="sm">
                Conflict-Protected
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Class-wise PTM events, teacher availability calendars, time slot reservations, follow-ups, and confidential notes.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {isAdmin && (
            <Button
              size="sm"
              variant="primary"
              className="bg-[#086A92] text-white flex items-center gap-1.5"
              onClick={() => setIsEventModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Create PTM Event
            </Button>
          )}

          {isParent && (
            <Button
              size="sm"
              variant="primary"
              className="bg-[#086A92] text-white flex items-center gap-1.5"
              onClick={() => {
                setActiveTab('book-slot');
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Book Appointment
            </Button>
          )}

          {isTeacher && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsSlotConfigModalOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-[#086A92]" />
              Add Custom Availability
            </Button>
          )}
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            &times;
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-700 hover:text-rose-900 font-bold">
            &times;
          </button>
        </div>
      )}

      {/* KPIS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active PTM Events"
          value={events.length}
          subtitle="Open for parent bookings"
          trend="neutral"
          variant="blue"
          icon={<Calendar className="w-5 h-5 text-[#086A92]" />}
        />
        <StatCard
          title="Confirmed Appointments"
          value={confirmedBookings.length}
          subtitle={`${slots.filter((s) => !s.isBooked).length} slots still open`}
          trend="up"
          variant="emerald"
          icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Completed Consultations"
          value={completedBookings.length}
          subtitle="Feedback notes recorded"
          trend="neutral"
          variant="indigo"
          icon={<CheckCircle2 className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Cancellations / No-Shows"
          value={cancelledBookings.length + noShowBookings.length}
          subtitle={`${cancelledBookings.length} cancelled • ${noShowBookings.length} no-show`}
          trend={cancelledBookings.length > 0 ? 'down' : 'neutral'}
          variant="amber"
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* TABS NAVIGATION */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ========================================================= */}
      {/* TAB: ADMIN OVERVIEW & EVENTS */}
      {/* ========================================================= */}
      {activeTab === 'admin-overview' && isAdmin && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    School-Wide PTM Events
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Class-targeted parent-teacher meeting schedules with automated slot distribution.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-[#086A92] text-white"
                  onClick={() => setIsEventModalOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> New Event
                </Button>
              </div>
            </CardHeader>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 transition-colors hover:border-[#086A92]/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 block uppercase">
                        PTM ID: {ev.id}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-0.5">{ev.title}</h3>
                    </div>
                    <Badge variant={ev.status === 'OPEN_FOR_BOOKING' ? 'emerald' : 'slate'}>
                      {ev.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{ev.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#086A92]" />
                      <span>{formatDate(ev.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#086A92]" />
                      <span>
                        {ev.startTime} - {ev.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="truncate">{ev.locationRoom}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-purple-600" />
                      <span>Mode: {ev.meetingMode}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 font-mono">
                    <span className="text-slate-500">
                      Slots: <strong>{ev._count?.slots || 0}</strong> • Bookings: <strong>{ev._count?.bookings || 0}</strong>
                    </span>
                    <span className="text-[#086A92] font-bold">
                      {ev.slotDuration} min consultations
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: MASTER SCHEDULE (ADMIN & PRINCIPAL) */}
      {/* ========================================================= */}
      {activeTab === 'master-schedule' && isAdmin && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Master Appointment Schedule &amp; Attendance
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full registry of parent appointments across all wings and teachers.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center flex-wrap gap-2">
                <select
                  value={selectedTeacherFilter}
                  onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-[#086A92]"
                >
                  <option value="ALL">All Faculty ({teachers.length})</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user.firstName} {t.user.lastName || ''} ({t.specialization})
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-[#086A92]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="RESCHEDULED">RESCHEDULED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="NO_SHOW">NO_SHOW</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <div className="p-5 space-y-3">
            {bookings
              .filter((b) => (selectedTeacherFilter === 'ALL' || b.teacherId === selectedTeacherFilter))
              .filter((b) => (statusFilter === 'ALL' || b.status === statusFilter))
              .map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs transition-colors hover:border-[#086A92]/40"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#086A92]">{b.timeSlot}</span>
                      <span className="font-mono text-slate-400">• {formatDate(b.scheduledDate)}</span>
                      <Badge
                        variant={
                          b.status === 'COMPLETED'
                            ? 'emerald'
                            : b.status === 'CONFIRMED'
                            ? 'blue'
                            : b.status === 'RESCHEDULED'
                            ? 'amber'
                            : 'rose'
                        }
                      >
                        {b.status}
                      </Badge>
                      <Badge variant={b.meetingMode === 'ONLINE_VIDEO' ? 'purple' : 'slate'} size="xs">
                        {b.meetingMode}
                      </Badge>
                    </div>

                    <div className="text-slate-800">
                      <strong>Student:</strong> {b.student?.user?.firstName} {b.student?.user?.lastName || ''} (
                      {b.student?.admissionNumber}) • <strong>Parent:</strong> {b.parent?.user?.firstName}{' '}
                      {b.parent?.user?.lastName || ''} • <strong>Faculty:</strong> {b.teacher?.user?.firstName}{' '}
                      {b.teacher?.user?.lastName || ''} ({b.teacher?.specialization})
                    </div>

                    {b.sharedNotes && (
                      <p className="text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px]">
                        <strong>Parent Feedback:</strong> {b.sharedNotes}
                      </p>
                    )}

                    {b.privateTeacherNotes && (
                      <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong>Confidential Faculty Note (Restricted):</strong> {b.privateTeacherNotes}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        setSelectedBooking(b);
                        setIsViewDetailsModalOpen(true);
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" /> View Card
                    </Button>

                    <Button
                      size="xs"
                      variant="outline"
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                      onClick={() => handleSendReminder(b.id)}
                    >
                      <Bell className="w-3 h-3 mr-1" /> Remind
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB: TEACHER SCHEDULE & CONSULTATIONS */}
      {/* ========================================================= */}
      {activeTab === 'teacher-schedule' && isTeacher && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    My Scheduled Parent Consultations
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Prepare confidential student observations, record shared parent feedback, and set follow-ups.
                  </p>
                </div>
              </div>
            </CardHeader>

            <div className="p-5 space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 transition-colors hover:border-[#086A92]/40"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-[#086A92]">{b.timeSlot}</span>
                      <span className="font-mono text-xs text-slate-400">• {formatDate(b.scheduledDate)}</span>
                      <Badge
                        variant={
                          b.status === 'COMPLETED'
                            ? 'emerald'
                            : b.status === 'CONFIRMED'
                            ? 'blue'
                            : b.status === 'RESCHEDULED'
                            ? 'amber'
                            : 'rose'
                        }
                      >
                        {b.status}
                      </Badge>
                      <Badge variant={b.meetingMode === 'ONLINE_VIDEO' ? 'purple' : 'slate'} size="xs">
                        {b.meetingMode === 'ONLINE_VIDEO' ? 'Online Google Meet' : b.roomNumber || 'Room 204'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {b.meetingMode === 'ONLINE_VIDEO' && b.meetingLink && (
                        <a
                          href={b.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Join Video Call
                        </a>
                      )}

                      <Button
                        size="xs"
                        variant="primary"
                        className="bg-[#086A92] text-white flex items-center gap-1"
                        onClick={() => {
                          setSelectedBooking(b);
                          setNotesForm({
                            sharedNotes: b.sharedNotes || '',
                            privateTeacherNotes: b.privateTeacherNotes || '',
                            followUps: b.followUps || [],
                            newFollowUpTitle: '',
                            newFollowUpAssignee: 'PARENT',
                            newFollowUpDueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
                          });
                          setIsNotesModalOpen(true);
                        }}
                      >
                        <FileText className="w-3 h-3" />
                        Meeting Notes &amp; Follow-ups
                      </Button>
                    </div>
                  </div>

                  {/* Attendee Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Student Name</span>
                      <span className="font-bold text-slate-900 block">
                        {b.student?.user?.firstName} {b.student?.user?.lastName || ''}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Adm #{b.student?.admissionNumber || 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Parent / Guardian</span>
                      <span className="font-bold text-slate-900 block">
                        {b.parent?.user?.firstName} {b.parent?.user?.lastName || ''}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Contact: {b.parent?.user?.phone || 'Confidential'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Agenda / Parent Query</span>
                      <span className="text-slate-700 italic block line-clamp-2">
                        &ldquo;{b.notes || 'Academic review'}&rdquo;
                      </span>
                    </div>
                  </div>

                  {/* Notes Previews */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Shared Feedback (Visible to Parents)</span>
                      </div>
                      <p className="text-slate-700 text-[11px]">
                        {b.sharedNotes || 'No shared parent feedback recorded yet. Click "Meeting Notes" to document.'}
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Confidential Faculty Note (Restricted)</span>
                      </div>
                      <p className="text-slate-700 text-[11px]">
                        {b.privateTeacherNotes || 'No private observation logged. Only visible to you and the Principal.'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Status Bar */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Follow-up tasks: <strong>{b.followUps?.length || 0} active</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                        className="text-[11px] text-emerald-700 hover:underline font-semibold"
                      >
                        Mark Completed
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'NO_SHOW')}
                        className="text-[11px] text-rose-600 hover:underline"
                      >
                        Mark No-Show
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {bookings.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-8">
                  No appointments booked with you yet. Check your slot manager tab to ensure your slots are published.
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: SLOT MANAGER (TEACHER) */}
      {/* ========================================================= */}
      {activeTab === 'slot-manager' && isTeacher && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  My Consultation Time Slots
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish availability windows, set physical rooms or Google Meet links, and block breaks.
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                className="bg-[#086A92] text-white"
                onClick={() => setIsSlotConfigModalOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Slots
              </Button>
            </div>
          </CardHeader>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots
              .filter((s) => s.teacherId === teacherProfile?.id)
              .map((s) => (
                <div
                  key={s.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    s.isBooked
                      ? 'bg-blue-50/60 border-blue-200'
                      : s.isBlocked
                      ? 'bg-slate-100 border-slate-300 opacity-70'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">
                      {s.startTime} - {s.endTime}
                    </span>
                    <Badge variant={s.isBooked ? 'blue' : s.isBlocked ? 'slate' : 'emerald'} size="xs">
                      {s.isBooked ? 'Booked' : s.isBlocked ? 'Blocked' : 'Available'}
                    </Badge>
                  </div>

                  <span className="text-[11px] text-slate-500 block">Date: {formatDate(s.slotDate)}</span>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
                    {s.meetingMode === 'ONLINE_VIDEO' ? (
                      <>
                        <Video className="w-3 h-3 text-purple-600" />
                        <span>Online Meet</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3 h-3 text-indigo-600" />
                        <span>{s.roomNumber || 'Room 204'}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB: MY APPOINTMENTS (PARENT) */}
      {/* ========================================================= */}
      {activeTab === 'my-appointments' && isParent && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    My Scheduled Parent-Teacher Consultations
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your booked appointments with faculty. You can join virtual meetings, reschedule slots, or cancel.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-[#086A92] text-white"
                  onClick={() => setActiveTab('book-slot')}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Book New Slot
                </Button>
              </div>
            </CardHeader>

            <div className="p-5 space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 transition-colors hover:border-[#086A92]/40"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-[#086A92]">{b.timeSlot}</span>
                      <span className="font-mono text-xs text-slate-400">• {formatDate(b.scheduledDate)}</span>
                      <Badge
                        variant={
                          b.status === 'COMPLETED'
                            ? 'emerald'
                            : b.status === 'CONFIRMED'
                            ? 'blue'
                            : b.status === 'RESCHEDULED'
                            ? 'amber'
                            : 'rose'
                        }
                      >
                        {b.status}
                      </Badge>
                      <Badge variant={b.meetingMode === 'ONLINE_VIDEO' ? 'purple' : 'slate'} size="xs">
                        {b.meetingMode}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {b.meetingMode === 'ONLINE_VIDEO' && b.meetingLink && b.status !== 'CANCELLED' && (
                        <a
                          href={b.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Join Meeting
                        </a>
                      )}

                      {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && (
                        <>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => {
                              setSelectedBooking(b);
                              setIsRescheduleModalOpen(true);
                            }}
                          >
                            Reschedule
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            className="text-rose-600 border-rose-200 hover:bg-rose-50"
                            onClick={() => {
                              setSelectedBooking(b);
                              setIsCancelModalOpen(true);
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Consultation Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Faculty Member</span>
                      <span className="font-bold text-slate-900 block">
                        {b.teacher?.user?.firstName} {b.teacher?.user?.lastName || ''}
                      </span>
                      <span className="text-[11px] text-[#086A92] font-mono">
                        {b.teacher?.designation || 'Faculty'} ({b.teacher?.specialization})
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Student / Ward</span>
                      <span className="font-bold text-slate-900 block">
                        {b.student?.user?.firstName} {b.student?.user?.lastName || ''}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Admission #{b.student?.admissionNumber || 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Meeting Location</span>
                      <span className="font-bold text-slate-900 block">
                        {b.meetingMode === 'ONLINE_VIDEO' ? 'Virtual Google Meet' : b.roomNumber || 'Main Campus Room 204'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Event: {b.ptmEvent?.title || 'Academic PTM'}
                      </span>
                    </div>
                  </div>

                  {/* Parent-Visible Teacher Feedback (Shared Notes) */}
                  {b.sharedNotes && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Teacher Consultation Feedback &amp; Suggestions</span>
                      </div>
                      <p className="text-emerald-950 text-xs">{b.sharedNotes}</p>
                    </div>
                  )}

                  {/* Follow-up Action Items */}
                  {b.followUps && b.followUps.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5">
                      <span className="font-bold text-slate-800 block text-[11px]">Agreed Follow-Up Action Tasks:</span>
                      {b.followUps.map((task: any) => (
                        <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="flex items-center gap-2">
                            {task.status === 'COMPLETED' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            <span className={task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-800'}>
                              {task.title}
                            </span>
                          </div>
                          <Badge variant={task.status === 'COMPLETED' ? 'emerald' : 'amber'} size="xs">
                            {task.assignedTo}: {task.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {bookings.length === 0 && (
                <div className="text-center py-10 space-y-3">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">You have no upcoming PTM bookings.</p>
                  <Button
                    size="sm"
                    variant="primary"
                    className="bg-[#086A92] text-white"
                    onClick={() => setActiveTab('book-slot')}
                  >
                    Book Your PTM Slot Now
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: BOOK TIME SLOT (PARENT WIZARD) */}
      {/* ========================================================= */}
      {activeTab === 'book-slot' && isParent && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Book Parent-Teacher Consultation Slot
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose your student, the respective subject or class teacher, and select an available time window.
              </p>
            </div>
          </CardHeader>

          <form onSubmit={handleBookSlot} className="p-6 space-y-6">
            {/* Step 1 & 2: Event & Student */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select PTM Event *</label>
                <select
                  value={bookingForm.eventId}
                  onChange={(e) => setBookingForm({ ...bookingForm, eventId: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({formatDate(ev.eventDate)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Ward / Student *</label>
                <select
                  value={bookingForm.studentId}
                  onChange={(e) => setBookingForm({ ...bookingForm, studentId: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
                >
                  {parentProfile?.students?.map((s: any) => (
                    <option key={s.student.id} value={s.student.id}>
                      {s.student.user.firstName} {s.student.user.lastName || ''} (Admission #{s.student.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3: Choose Teacher */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Faculty / Teacher *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {teachers.map((t) => {
                  const isSelected = bookingForm.teacherId === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setBookingForm({ ...bookingForm, teacherId: t.id, slotId: '' })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#086A92] bg-[#EAF5F8]/40 ring-1 ring-[#086A92]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-slate-900 text-xs block">
                        {t.user.firstName} {t.user.lastName || ''}
                      </span>
                      <span className="text-[11px] text-[#086A92] font-mono block mt-0.5">
                        {t.specialization} • {t.designation}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Available Time Slots Matrix */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Available Time Slot *
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {availableSlotsForBooking.length} slots currently available
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {availableSlotsForBooking.map((s) => {
                  const isSelected = bookingForm.slotId === s.id;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setBookingForm({ ...bookingForm, slotId: s.id })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500'
                          : 'border-slate-200 bg-white hover:border-[#086A92] text-slate-800'
                      }`}
                    >
                      <div className="font-bold font-mono text-xs">{s.startTime} - {s.endTime}</div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                        {s.meetingMode === 'ONLINE_VIDEO' ? (
                          <>
                            <Video className="w-3 h-3 text-purple-600" />
                            <span>Online Video</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3 h-3 text-indigo-600" />
                            <span>{s.roomNumber || 'Room 204'}</span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {availableSlotsForBooking.length === 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  No open slots found for this teacher in the selected event. Please pick another teacher or check back later.
                </div>
              )}
            </div>

            {/* Step 5: Agenda / Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discussion Agenda / Specific Questions for Faculty
              </label>
              <textarea
                rows={2}
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button size="sm" variant="outline" type="button" onClick={() => setActiveTab('my-appointments')}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                type="submit"
                disabled={loading || !bookingForm.slotId}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? 'Confirming...' : 'Confirm Appointment'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE PTM EVENT (ADMIN) */}
      {/* ========================================================= */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Create School PTM Event"
        subtitle="Establish school-wide or class-targeted parent-teacher meeting session"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Term 2 Academic & Behavioral Review PTM"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Date *</label>
              <input
                type="date"
                required
                value={eventForm.eventDate}
                onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Booking Deadline</label>
              <input
                type="date"
                value={eventForm.bookingDeadline}
                onChange={(e) => setEventForm({ ...eventForm, bookingDeadline: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="text"
                value={eventForm.startTime}
                onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded p-1.5 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="text"
                value={eventForm.endTime}
                onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded p-1.5 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Duration (Min)</label>
              <input
                type="number"
                value={eventForm.slotDuration}
                onChange={(e) => setEventForm({ ...eventForm, slotDuration: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded p-1.5 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Buffer (Min)</label>
              <input
                type="number"
                value={eventForm.bufferTime}
                onChange={(e) => setEventForm({ ...eventForm, bufferTime: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded p-1.5 focus:border-[#086A92] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Mode</label>
              <select
                value={eventForm.meetingMode}
                onChange={(e) => setEventForm({ ...eventForm, meetingMode: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              >
                <option value="HYBRID">HYBRID (Physical &amp; Online)</option>
                <option value="IN_PERSON">IN_PERSON (On Campus)</option>
                <option value="ONLINE_VIDEO">ONLINE_VIDEO (Virtual Video)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Location</label>
              <input
                type="text"
                value={eventForm.locationRoom}
                onChange={(e) => setEventForm({ ...eventForm, locationRoom: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={eventForm.autoGenerateSlots}
                onChange={(e) => setEventForm({ ...eventForm, autoGenerateSlots: e.target.checked })}
              />
              <span>Auto-generate standard slots for all active faculty members</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Generates conflict-free 15-minute intervals between 9 AM and 1 PM for all faculty automatically.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsEventModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading} className="bg-[#086A92] text-white">
              {loading ? 'Creating...' : 'Publish PTM Event'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: MEETING NOTES EDITOR (TEACHER PRIVATE VS SHARED) */}
      {/* ========================================================= */}
      <Modal
        isOpen={isNotesModalOpen}
        onClose={() => {
          setIsNotesModalOpen(false);
          setSelectedBooking(null);
        }}
        title={`PTM Consultation Notes: ${selectedBooking?.student?.user?.firstName || 'Student'}`}
        subtitle={`Scheduled: ${selectedBooking?.timeSlot} with Parent ${selectedBooking?.parent?.user?.firstName || ''}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveNotes} className="space-y-4">
          {/* SHARED FEEDBACK */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>Shared Consultation Summary (Visible in Parent Portal)</span>
              </label>
              <Badge variant="emerald" size="xs">Parent Facing</Badge>
            </div>
            <textarea
              rows={3}
              placeholder="e.g. Commended strong performance in geometry and algebraic calculations. Advised 20 minutes daily practice on word problems. Great classroom participation."
              value={notesForm.sharedNotes}
              onChange={(e) => setNotesForm({ ...notesForm, sharedNotes: e.target.value })}
              className="w-full text-xs border border-emerald-300 rounded-lg p-2.5 focus:border-emerald-600 outline-none bg-white"
            />
          </div>

          {/* CONFIDENTIAL FACULTY NOTES */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>🔒 Confidential Faculty &amp; Principal Observations (Strictly Hidden from Parents)</span>
              </label>
              <Badge variant="amber" size="xs">Restricted</Badge>
            </div>
            <p className="text-[11px] text-amber-800">
              Only accessible to you, the Class Teacher, and the Principal. Use this for behavioral patterns, sensitive concerns, or special remediation notes.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Student displays signs of test anxiety during timed tests. Discussed discreetly with counselor Ms. Ritu; plan 1-on-1 mock quiz next week without putting pressure."
              value={notesForm.privateTeacherNotes}
              onChange={(e) => setNotesForm({ ...notesForm, privateTeacherNotes: e.target.value })}
              className="w-full text-xs border border-amber-300 rounded-lg p-2.5 focus:border-amber-600 outline-none bg-white"
            />
          </div>

          {/* FOLLOW-UP TASKS */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">Agreed Follow-Up Action Tasks</span>

            {/* List existing */}
            {notesForm.followUps.map((t, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-[#086A92]" />
                  <span className="font-semibold text-slate-900">{t.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="slate" size="xs">{t.assignedTo}</Badge>
                  <span className="text-[10px] text-slate-400 font-mono">Due: {formatDate(t.dueDate)}</span>
                </div>
              </div>
            ))}

            {/* Add new task input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="New follow-up action item..."
                value={notesForm.newFollowUpTitle}
                onChange={(e) => setNotesForm({ ...notesForm, newFollowUpTitle: e.target.value })}
                className="flex-1 text-xs border border-slate-300 rounded-lg p-2 outline-none bg-white"
              />
              <select
                value={notesForm.newFollowUpAssignee}
                onChange={(e) => setNotesForm({ ...notesForm, newFollowUpAssignee: e.target.value })}
                className="text-xs border border-slate-300 rounded-lg p-2 outline-none bg-white"
              >
                <option value="PARENT">Assign to Parent</option>
                <option value="TEACHER">Assign to Teacher</option>
                <option value="STUDENT">Assign to Student</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => {
                  if (notesForm.newFollowUpTitle.trim()) {
                    setNotesForm({
                      ...notesForm,
                      followUps: [
                        ...notesForm.followUps,
                        {
                          title: notesForm.newFollowUpTitle.trim(),
                          assignedTo: notesForm.newFollowUpAssignee,
                          dueDate: notesForm.newFollowUpDueDate,
                        },
                      ],
                      newFollowUpTitle: '',
                    });
                  }
                }}
              >
                Add Task
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsNotesModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading} className="bg-emerald-600 text-white">
              {loading ? 'Saving...' : 'Save Notes & Complete Meeting'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: RESCHEDULE APPOINTMENT */}
      {/* ========================================================= */}
      <Modal
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          setSelectedBooking(null);
        }}
        title="Reschedule Appointment"
        subtitle={`Current slot: ${selectedBooking?.timeSlot} on ${formatDate(selectedBooking?.scheduledDate)}`}
      >
        <form onSubmit={handleReschedule} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Choose New Available Slot with {selectedBooking?.teacher?.user?.firstName}
            </label>
            <select
              value={rescheduleSlotId}
              onChange={(e) => setRescheduleSlotId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            >
              <option value="">-- Choose New Slot --</option>
              {availableSlotsForReschedule.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.startTime} - {s.endTime} ({formatDate(s.slotDate)}) - {s.meetingMode}
                </option>
              ))}
            </select>
            {availableSlotsForReschedule.length === 0 && (
              <p className="text-[11px] text-rose-600 mt-1">
                No alternative open slots available for this teacher in this session.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Rescheduling</label>
            <input
              type="text"
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsRescheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={loading || !rescheduleSlotId}
              className="bg-[#086A92] text-white"
            >
              {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: CANCEL APPOINTMENT */}
      {/* ========================================================= */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedBooking(null);
        }}
        title="Cancel PTM Appointment"
        subtitle="This will release the booked slot for other attendees and notify the teacher"
      >
        <form onSubmit={handleCancelBooking} className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            Are you sure you want to cancel the meeting scheduled with{' '}
            <strong>{selectedBooking?.teacher?.user?.firstName}</strong> for{' '}
            <strong>{selectedBooking?.timeSlot}</strong>?
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cancellation Reason</label>
            <textarea
              rows={2}
              required
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsCancelModalOpen(false)}>
              Keep Appointment
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading} className="bg-rose-600 text-white">
              {loading ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: VIEW DETAILS CARD */}
      {/* ========================================================= */}
      <Modal
        isOpen={isViewDetailsModalOpen}
        onClose={() => {
          setIsViewDetailsModalOpen(false);
          setSelectedBooking(null);
        }}
        title="Consultation Summary Card"
        subtitle="Verified parent-teacher conference record"
      >
        {selectedBooking && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#086A92] text-sm">{selectedBooking.timeSlot}</span>
                <Badge variant="blue" size="sm">{selectedBooking.status}</Badge>
              </div>
              <div className="text-slate-600">
                Date: {formatDate(selectedBooking.scheduledDate)} • Location:{' '}
                {selectedBooking.meetingMode === 'ONLINE_VIDEO' ? 'Virtual Video Meet' : selectedBooking.roomNumber || 'Room 204'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Student</span>
                <strong className="text-slate-900 block">{selectedBooking.student?.user?.firstName} {selectedBooking.student?.user?.lastName || ''}</strong>
                <span className="text-slate-500 font-mono">Adm: {selectedBooking.student?.admissionNumber}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Faculty</span>
                <strong className="text-slate-900 block">{selectedBooking.teacher?.user?.firstName} {selectedBooking.teacher?.user?.lastName || ''}</strong>
                <span className="text-slate-500 font-mono">{selectedBooking.teacher?.specialization}</span>
              </div>
            </div>

            {selectedBooking.sharedNotes && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="font-bold block mb-1">Parent Feedback:</span>
                <p>{selectedBooking.sharedNotes}</p>
              </div>
            )}

            {selectedBooking.privateTeacherNotes && isAdmin && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-950">
                <span className="font-bold flex items-center gap-1 mb-1">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  Confidential Faculty Note (Principal Access Only):
                </span>
                <p>{selectedBooking.privateTeacherNotes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setIsViewDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
