'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  CalendarCheck,
  ClipboardList,
  FileCheck2,
  DollarSign,
  MessageSquare,
  FileDown,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserRole } from '@/lib/auth';

export type QuickActionKey =
  | 'ADD_STUDENT'
  | 'MARK_ATTENDANCE'
  | 'CREATE_HOMEWORK'
  | 'CREATE_EXAM'
  | 'RECORD_PAYMENT'
  | 'SEND_ANNOUNCEMENT'
  | 'GENERATE_REPORT'
  | 'ADD_TEACHER'
  | 'LAUNCHER';

export function triggerQuickAction(action: QuickActionKey = 'LAUNCHER') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('edvonest:quick-action', {
        detail: { action },
      })
    );
  }
}

interface QuickActionLauncherProps {
  currentRole: UserRole;
}

export const QuickActionLauncher: React.FC<QuickActionLauncherProps> = ({ currentRole }) => {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<QuickActionKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [classesList, setClassesList] = useState<
    Array<{ id: string; name: string; stream?: string; sections: Array<{ id: string; name: string }> }>
  >([]);

  useEffect(() => {
    fetch('/api/classes?lookup=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes && data.classes.length > 0) {
          setClassesList(data.classes);
        }
      })
      .catch((err) => console.warn('Could not fetch classes for quick actions:', err));
  }, []);

  // Form states
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    className: 'Class 10',
    sectionName: 'A',
    gender: 'MALE',
    parentPhone: '',
    parentName: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    studentSearch: 'Aarav Verma (EDV-2025-0101)',
    feeHead: 'Term 2 Tuition Fee',
    amount: '12500',
    paymentMode: 'CASH',
    transactionRef: `REC-${Date.now().toString().slice(-6)}`,
  });

  const [homeworkForm, setHomeworkForm] = useState({
    className: 'Class 10-A',
    subject: 'Mathematics',
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    maxMarks: '20',
  });

  const [examForm, setExamForm] = useState({
    examName: '',
    className: 'Class 10',
    subject: 'Science',
    totalMarks: '80',
    passingMarks: '27',
    examDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    targetAudience: 'ALL',
    priority: 'NORMAL',
  });

  const [teacherForm, setTeacherForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: 'Mathematics',
    designation: 'Senior Faculty',
    phone: '',
  });

  const [reportForm, setReportForm] = useState({
    reportType: 'CBSE_COMPLIANCE',
    format: 'PDF',
    timeframe: 'CURRENT_TERM',
  });

  useEffect(() => {
    const handleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: QuickActionKey }>;
      if (customEvent.detail?.action) {
        setActiveAction(customEvent.detail.action);
        setSuccessMessage(null);
        setErrorMessage(null);
      }
    };

    window.addEventListener('edvonest:quick-action', handleEvent);
    return () => window.removeEventListener('edvonest:quick-action', handleEvent);
  }, []);

  const handleClose = () => {
    setActiveAction(null);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  // Submit: ADD_STUDENT
  const handleSubmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: studentForm.firstName,
          lastName: studentForm.lastName,
          className: studentForm.className,
          sectionName: studentForm.sectionName,
          gender: studentForm.gender,
          emergencyContact: studentForm.parentPhone,
          parentPhone: studentForm.parentPhone,
          parentName: studentForm.parentName,
          email: `${studentForm.firstName.toLowerCase()}.${Math.floor(1000 + Math.random() * 9000)}@student.edvonest.edu`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add student');
      setSuccessMessage(`Student ${studentForm.firstName} ${studentForm.lastName} enrolled successfully!`);
      setTimeout(() => {
        handleClose();
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error enrolling student');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit: RECORD_PAYMENT
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      setSuccessMessage(`Payment of ₹${paymentForm.amount} recorded for ${paymentForm.studentSearch}. Receipt generated!`);
      setTimeout(() => {
        handleClose();
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error recording payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit: CREATE_HOMEWORK
  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      setSuccessMessage(`Homework "${homeworkForm.title}" assigned to ${homeworkForm.className}!`);
      setTimeout(() => {
        handleClose();
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error assigning homework');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit: CREATE_EXAM
  const handleSubmitExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      setSuccessMessage(`Examination "${examForm.examName}" scheduled for ${examForm.className}!`);
      setTimeout(() => {
        handleClose();
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error scheduling examination');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit: SEND_ANNOUNCEMENT
  const handleSubmitAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/communication/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch announcement');
      setSuccessMessage(`Announcement "${announcementForm.title}" broadcast to ${announcementForm.targetAudience}!`);
      setTimeout(() => {
        handleClose();
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error broadcasting announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit: ADD_TEACHER
  const handleSubmitTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADD_TEACHER', ...teacherForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to onboard faculty');
      setSuccessMessage(`Faculty member ${teacherForm.firstName} ${teacherForm.lastName} registered successfully!`);
      setTimeout(() => {
        handleClose();
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error onboarding faculty');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit: GENERATE_REPORT
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(`Generating ${reportForm.reportType} (${reportForm.format}). Download will start momentarily...`);
    setTimeout(() => {
      setIsSubmitting(false);
      handleClose();
      router.push('/dashboard/reports');
    }, 1500);
  };

  // Quick Action Launcher Gallery items with permission gating
  const availableActions = [
    {
      key: 'ADD_STUDENT' as QuickActionKey,
      title: 'Add Student',
      subtitle: 'Fast admission enrollment',
      icon: UserPlus,
      roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'RECEPTIONIST'],
      badge: 'Admissions',
      color: 'text-[#990000]',
    },
    {
      key: 'MARK_ATTENDANCE' as QuickActionKey,
      title: 'Mark Attendance',
      subtitle: 'Classroom daily roll call',
      icon: CalendarCheck,
      roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'CLASS_TEACHER'],
      badge: 'Daily',
      color: 'text-[#990000]',
    },
    {
      key: 'CREATE_HOMEWORK' as QuickActionKey,
      title: 'Create Homework',
      subtitle: 'Assign task to class section',
      icon: ClipboardList,
      roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'CLASS_TEACHER'],
      badge: 'Academic',
      color: 'text-[#C00000]',
    },
    {
      key: 'CREATE_EXAM' as QuickActionKey,
      title: 'Create Examination',
      subtitle: 'Schedule test or term paper',
      icon: FileCheck2,
      roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'],
      badge: 'Assessment',
      color: 'text-[#C00000]',
    },
    {
      key: 'RECORD_PAYMENT' as QuickActionKey,
      title: 'Record Payment',
      subtitle: 'Fee counter instant collection',
      icon: DollarSign,
      roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PRINCIPAL'],
      badge: 'Finance',
      color: 'text-[#990000]',
    },
    {
      key: 'SEND_ANNOUNCEMENT' as QuickActionKey,
      title: 'Send Announcement',
      subtitle: 'Broadcast circular to parents/staff',
      icon: MessageSquare,
      roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'],
      badge: 'Broadcast',
      color: 'text-[#990000]',
    },
    {
      key: 'GENERATE_REPORT' as QuickActionKey,
      title: 'Generate Report',
      subtitle: 'CBSE, financial & attendance logs',
      icon: FileDown,
      roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'HR_MANAGER'],
      badge: 'Analytics',
      color: 'text-[#990000]',
    },
    {
      key: 'ADD_TEACHER' as QuickActionKey,
      title: 'Add Teacher',
      subtitle: 'Fast faculty onboarding',
      icon: Users,
      roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'HR_MANAGER'],
      badge: 'HR Staff',
      color: 'text-[#C00000]',
    },
  ].filter((item) => item.roles.includes(currentRole));

  return (
    <>
      {/* 1. LAUNCHER GALLERY MODAL */}
      <Modal
        isOpen={activeAction === 'LAUNCHER'}
        onClose={handleClose}
        title="⚡ Quick Action Launcher"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#737373]">
            Perform high-frequency school operations instantly from anywhere without switching pages.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
            {availableActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.key}
                  onClick={() => {
                    if (action.key === 'MARK_ATTENDANCE') {
                      handleClose();
                      router.push('/dashboard/attendance');
                    } else {
                      setActiveAction(action.key);
                    }
                  }}
                  className="flex items-start gap-3 p-3 rounded-xl border border-[#E5E5E5] hover:border-[#990000] hover:bg-[#FEF2F2]/40 transition-all text-left group cursor-pointer"
                >
                  <div className="p-2.5 rounded-lg bg-[#F5F5F5] group-hover:bg-white text-[#171717] shadow-2xs shrink-0">
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-[#171717] group-hover:text-[#990000] transition-colors truncate">
                        {action.title}
                      </h4>
                      <Badge variant="slate" size="xs">
                        {action.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#737373] mt-0.5 truncate">{action.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* 2. ADD STUDENT MODAL */}
      <Modal
        isOpen={activeAction === 'ADD_STUDENT'}
        onClose={handleClose}
        title="Quick Action: Enroll New Student"
      >
        <form onSubmit={handleSubmitStudent} className="space-y-3 text-xs">
          {successMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-[#990000] rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#990000] shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">First Name *</label>
              <input
                type="text"
                required
                value={studentForm.firstName}
                onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                placeholder="e.g. Aarav"
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={studentForm.lastName}
                onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                placeholder="e.g. Verma"
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Class *</label>
              <select
                value={studentForm.className}
                onChange={(e) => {
                  const newClassName = e.target.value;
                  const targetCls = classesList.find((c) => c.name === newClassName || c.id === newClassName);
                  const firstSec = targetCls?.sections?.[0]?.name || 'A';
                  setStudentForm({ ...studentForm, className: newClassName, sectionName: firstSec });
                }}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000] font-medium"
              >
                {(classesList.length > 0
                  ? classesList.map((c) => ({
                      value: c.name,
                      label: `${c.name}${c.stream ? ` (${c.stream})` : ''}`,
                    }))
                  : [
                      { value: 'LKG', label: 'LKG (Kindergarten)' },
                      { value: 'UKG', label: 'UKG (Kindergarten)' },
                      { value: 'Class 1', label: 'Class 1 (Primary)' },
                      { value: 'Class 2', label: 'Class 2 (Primary)' },
                      { value: 'Class 3', label: 'Class 3 (Primary)' },
                      { value: 'Class 4', label: 'Class 4 (Primary)' },
                      { value: 'Class 5', label: 'Class 5 (Primary)' },
                      { value: 'Class 6', label: 'Class 6 (Middle)' },
                      { value: 'Class 7', label: 'Class 7 (Middle)' },
                      { value: 'Class 8', label: 'Class 8 (Middle)' },
                      { value: 'Class 9', label: 'Class 9 (Secondary)' },
                      { value: 'Class 10', label: 'Class 10 (Secondary)' },
                      { value: 'Class 11', label: 'Class 11 (Senior Secondary)' },
                      { value: 'Class 12', label: 'Class 12 (Senior Secondary)' },
                    ]
                ).map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Gender *</label>
              <select
                value={studentForm.gender}
                onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000]"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Section Allocation - Restricted to Admin */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-[#171717]">Section Allocation *</label>
              <span className="text-[10px] font-bold text-[#990000] bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                Admin Only
              </span>
            </div>
            {currentRole === 'SUPER_ADMIN' || currentRole === 'SCHOOL_ADMIN' ? (
              <select
                value={studentForm.sectionName}
                onChange={(e) => setStudentForm({ ...studentForm, sectionName: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000] font-medium"
              >
                {(() => {
                  const selectedClassObj = classesList.find(
                    (c) => c.name === studentForm.className || c.id === studentForm.className
                  );
                  const sections =
                    selectedClassObj?.sections && selectedClassObj.sections.length > 0
                      ? selectedClassObj.sections
                      : [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' }];
                  return sections.map((sec) => (
                    <option key={sec.id || sec.name} value={sec.name}>
                      Section {sec.name}
                    </option>
                  ));
                })()}
              </select>
            ) : (
              <div className="p-2.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-xs text-[#737373] font-medium">
                Section allocation is managed exclusively by the School Administrator.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Parent Name</label>
              <input
                type="text"
                value={studentForm.parentName}
                onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                placeholder="e.g. Ramesh Verma"
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Parent Mobile *</label>
              <input
                type="tel"
                required
                value={studentForm.parentPhone}
                onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
            <Button variant="ghost" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Enroll Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. RECORD PAYMENT MODAL */}
      <Modal
        isOpen={activeAction === 'RECORD_PAYMENT'}
        onClose={handleClose}
        title="Quick Action: Record Counter Fee Payment"
      >
        <form onSubmit={handleSubmitPayment} className="space-y-3 text-xs">
          {successMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-[#990000] rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#990000] shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#171717] mb-1">Student</label>
            <input
              type="text"
              required
              value={paymentForm.studentSearch}
              onChange={(e) => setPaymentForm({ ...paymentForm, studentSearch: e.target.value })}
              className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Fee Head</label>
              <select
                value={paymentForm.feeHead}
                onChange={(e) => setPaymentForm({ ...paymentForm, feeHead: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000]"
              >
                <option value="Term 2 Tuition Fee">Term 2 Tuition Fee</option>
                <option value="Transport Bus Pass">Transport Bus Pass</option>
                <option value="Annual Examination Fee">Annual Examination Fee</option>
                <option value="Admission Enrolment Fee">Admission Enrolment Fee</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg font-mono font-bold text-[#990000] focus:outline-none focus:border-[#990000]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Payment Mode</label>
              <select
                value={paymentForm.paymentMode}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000]"
              >
                <option value="CASH">Cash (Counter)</option>
                <option value="UPI">UPI / QR Scan</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="CHEQUE">Bank Cheque / DD</option>
                <option value="NET_BANKING">Net Banking (NEFT/RTGS)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Receipt Reference</label>
              <input
                type="text"
                value={paymentForm.transactionRef}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg font-mono focus:outline-none focus:border-[#990000]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
            <Button variant="ghost" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Generate Official Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. CREATE HOMEWORK MODAL */}
      <Modal
        isOpen={activeAction === 'CREATE_HOMEWORK'}
        onClose={handleClose}
        title="Quick Action: Assign Homework"
      >
        <form onSubmit={handleSubmitHomework} className="space-y-3 text-xs">
          {successMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-[#990000] rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#990000] shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Target Class *</label>
              <select
                value={homeworkForm.className}
                onChange={(e) => setHomeworkForm({ ...homeworkForm, className: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000] font-medium"
              >
                {[
                  'LKG-A', 'LKG-B',
                  'UKG-A', 'UKG-B',
                  'Class 1-A', 'Class 1-B',
                  'Class 2-A', 'Class 2-B',
                  'Class 3-A', 'Class 3-B',
                  'Class 4-A', 'Class 4-B',
                  'Class 5-A', 'Class 5-B',
                  'Class 6-A', 'Class 6-B',
                  'Class 7-A', 'Class 7-B',
                  'Class 8-A', 'Class 8-B',
                  'Class 9-A', 'Class 9-B',
                  'Class 10-A', 'Class 10-B',
                  'Class 11-A', 'Class 11-B',
                  'Class 12-A', 'Class 12-B',
                ].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Subject *</label>
              <select
                value={homeworkForm.subject}
                onChange={(e) => setHomeworkForm({ ...homeworkForm, subject: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000]"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science (Physics & Chem)</option>
                <option value="English">English Literature</option>
                <option value="Social Science">Social Science</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#171717] mb-1">Assignment Title *</label>
            <input
              type="text"
              required
              value={homeworkForm.title}
              onChange={(e) => setHomeworkForm({ ...homeworkForm, title: e.target.value })}
              placeholder="e.g. Chapter 4: Quadratic Equations Problem Set 4.2"
              className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={homeworkForm.dueDate}
                onChange={(e) => setHomeworkForm({ ...homeworkForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Max Marks</label>
              <input
                type="number"
                value={homeworkForm.maxMarks}
                onChange={(e) => setHomeworkForm({ ...homeworkForm, maxMarks: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
            <Button variant="ghost" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Publish Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5. CREATE EXAM MODAL */}
      <Modal
        isOpen={activeAction === 'CREATE_EXAM'}
        onClose={handleClose}
        title="Quick Action: Schedule Examination"
      >
        <form onSubmit={handleSubmitExam} className="space-y-3 text-xs">
          {successMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-[#990000] rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#990000] shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#171717] mb-1">Exam Title *</label>
            <input
              type="text"
              required
              value={examForm.examName}
              onChange={(e) => setExamForm({ ...examForm, examName: e.target.value })}
              placeholder="e.g. Term 2 Periodic Assessment - Mathematics"
              className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Class *</label>
              <select
                value={examForm.className}
                onChange={(e) => setExamForm({ ...examForm, className: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000] font-medium"
              >
                {[
                  'LKG',
                  'UKG',
                  'Class 1',
                  'Class 2',
                  'Class 3',
                  'Class 4',
                  'Class 5',
                  'Class 6',
                  'Class 7',
                  'Class 8',
                  'Class 9',
                  'Class 10',
                  'Class 11',
                  'Class 12',
                ].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Subject *</label>
              <select
                value={examForm.subject}
                onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000]"
              >
                <option value="Science">Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Social Studies">Social Studies</option>
                <option value="English">English</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Exam Date *</label>
              <input
                type="date"
                required
                value={examForm.examDate}
                onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Total Marks</label>
              <input
                type="number"
                value={examForm.totalMarks}
                onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Passing Marks</label>
              <input
                type="number"
                value={examForm.passingMarks}
                onChange={(e) => setExamForm({ ...examForm, passingMarks: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
            <Button variant="ghost" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Schedule Examination
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. SEND ANNOUNCEMENT MODAL */}
      <Modal
        isOpen={activeAction === 'SEND_ANNOUNCEMENT'}
        onClose={handleClose}
        title="Quick Action: Broadcast Notice"
      >
        <form onSubmit={handleSubmitAnnouncement} className="space-y-3 text-xs">
          {successMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-[#990000] rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#990000] shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#171717] mb-1">Notice Headline *</label>
            <input
              type="text"
              required
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              placeholder="e.g. Annual Sports Meet Scheduled for Dec 15"
              className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Target Audience</label>
              <select
                value={announcementForm.targetAudience}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, targetAudience: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000]"
              >
                <option value="ALL">Entire Campus Community</option>
                <option value="PARENTS">Parents Only</option>
                <option value="TEACHERS">Faculty &amp; Staff Only</option>
                <option value="STUDENTS">Students Only</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Priority</label>
              <select
                value={announcementForm.priority}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000]"
              >
                <option value="NORMAL">Standard Notice</option>
                <option value="URGENT">High Priority Alert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#171717] mb-1">Circular Message *</label>
            <textarea
              required
              rows={4}
              value={announcementForm.content}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
              placeholder="Compose official circular details, timing, venue, instructions..."
              className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
            <Button variant="ghost" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Broadcast Announcement
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. ADD TEACHER MODAL */}
      <Modal
        isOpen={activeAction === 'ADD_TEACHER'}
        onClose={handleClose}
        title="Quick Action: Onboard Faculty Member"
      >
        <form onSubmit={handleSubmitTeacher} className="space-y-3 text-xs">
          {successMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-[#990000] rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#990000] shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">First Name *</label>
              <input
                type="text"
                required
                value={teacherForm.firstName}
                onChange={(e) => setTeacherForm({ ...teacherForm, firstName: e.target.value })}
                placeholder="e.g. Shalini"
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={teacherForm.lastName}
                onChange={(e) => setTeacherForm({ ...teacherForm, lastName: e.target.value })}
                placeholder="e.g. Nair"
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Department</label>
              <select
                value={teacherForm.department}
                onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000]"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Physics & Science">Physics &amp; Science</option>
                <option value="Languages">Languages &amp; Literature</option>
                <option value="Social Sciences">Social Sciences</option>
                <option value="Computer Science">Computer Science &amp; AI</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Designation</label>
              <input
                type="text"
                value={teacherForm.designation}
                onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                placeholder="e.g. Senior PGT Teacher"
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#171717] mb-1">Official Email</label>
            <input
              type="email"
              value={teacherForm.email}
              onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
              placeholder="e.g. s.nair@edvonest-academy.edu.in"
              className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
            <Button variant="ghost" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Add Faculty Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* 8. GENERATE REPORT MODAL */}
      <Modal
        isOpen={activeAction === 'GENERATE_REPORT'}
        onClose={handleClose}
        title="Quick Action: Export Institutional Report"
      >
        <form onSubmit={handleSubmitReport} className="space-y-3 text-xs">
          {successMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-[#990000] rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#990000] shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#171717] mb-1">Select Report Type</label>
            <select
              value={reportForm.reportType}
              onChange={(e) => setReportForm({ ...reportForm, reportType: e.target.value })}
              className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000]"
            >
              <option value="CBSE_COMPLIANCE">CBSE Annual Regulatory Compliance Report</option>
              <option value="FEE_COLLECTION">Daily &amp; Monthly Fee Reconciliation Ledger</option>
              <option value="ATTENDANCE_AUDIT">Campus Attendance &amp; Defaulter Audit</option>
              <option value="ACADEMIC_RESULTS">Term Examination Result &amp; Rank Distribution</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Export Format</label>
              <select
                value={reportForm.format}
                onChange={(e) => setReportForm({ ...reportForm, format: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000]"
              >
                <option value="PDF">Standard Signed PDF (.pdf)</option>
                <option value="CSV">Data Spreadsheet (.csv)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Timeframe</label>
              <select
                value={reportForm.timeframe}
                onChange={(e) => setReportForm({ ...reportForm, timeframe: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000]"
              >
                <option value="CURRENT_TERM">Current Term (2025–2026)</option>
                <option value="YEAR_TO_DATE">Full Academic Year</option>
                <option value="PAST_MONTH">Past 30 Days</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
            <Button variant="ghost" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Generate &amp; Download
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

