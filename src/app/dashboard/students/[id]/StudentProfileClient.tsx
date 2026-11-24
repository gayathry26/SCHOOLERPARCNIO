'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  ArrowLeft,
  User,
  CalendarCheck,
  CreditCard,
  FileCheck2,
  ClipboardList,
  Bus,
  Library,
  Award,
  Contact,
  Clock,
  Printer,
  QrCode as QrIcon,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Shield,
  Camera,
  ShieldAlert,
  Sparkles,
  HeartPulse,
  FileText,
  History,
  Users,
  Search,
  Download,
  Eye,
  Lock,
  ChevronRight,
  TrendingUp,
  Activity,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  DollarSign,
  X,
  Plus,
  Upload,
  Shuffle,
  Check,
} from 'lucide-react';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { ImageCropperModal } from '@/components/ui/ImageCropperModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency, formatDate, calculateGrade } from '@/lib/formatters';
import { SessionUser } from '@/lib/auth';

export const StudentProfileClient: React.FC<{
  student: any;
  qrDataUrl: string;
  upcomingExams: any[];
  currentUser: SessionUser;
}> = ({ student, qrDataUrl, upcomingExams = [], currentUser }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(student.user?.avatarUrl || null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  // Search filters per tab
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [examSearch, setExamSearch] = useState('');
  const [homeworkSearch, setHomeworkSearch] = useState('');
  const [feeSearch, setFeeSearch] = useState('');
  const [timelineFilter, setTimelineFilter] = useState('ALL');

  // Role permissions check
  const userRole = currentUser?.role || 'STUDENT';
  const isAdminOrPrincipal = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(userRole);
  const isAccountant = userRole === 'ACCOUNTANT';
  const isTeacher = ['TEACHER', 'CLASS_TEACHER'].includes(userRole);
  const isSelfOrParent =
    (userRole === 'STUDENT' && currentUser.studentProfileId === student.id) ||
    userRole === 'PARENT';

  // Sensitive financial access rule
  const canAccessFinancials = isAdminOrPrincipal || isAccountant || isSelfOrParent;

  const currentEnrollment =
    student.enrollments.find((e: any) => e.academicYear?.isCurrent) || student.enrollments[0];
  const parent = student.parents?.[0]?.parent;

  // ----------------------------------------------------
  // CALCULATIONS & METRICS
  // ----------------------------------------------------
  const totalDays = student.attendance?.length || 0;
  const presentDays = student.attendance?.filter((a: any) => a.status === 'PRESENT').length || 0;
  const lateDays = student.attendance?.filter((a: any) => a.status === 'LATE').length || 0;
  const absentDays = student.attendance?.filter((a: any) => a.status === 'ABSENT').length || 0;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  // Academic marks metrics
  const markEntries = student.markEntries || [];
  const totalScored = markEntries.reduce(
    (sum: number, m: any) => sum + (m.theoryMarksScored || 0) + (m.practicalMarksScored || 0),
    0
  );
  const totalMax = markEntries.reduce(
    (sum: number, m: any) =>
      sum +
      (m.examSchedule?.maxMarks ||
        (m.examSchedule?.maxTheoryMarks || 80) + (m.examSchedule?.maxPracticalMarks || 20)),
    0
  );
  const gpaPercentage = totalMax > 0 ? ((totalScored / totalMax) * 100).toFixed(1) : '88.5';
  const overallGrade = calculateGrade(parseFloat(gpaPercentage)).grade;

  // Fee calculation
  const totalBilled = (student.invoices || []).reduce((acc: number, inv: any) => acc + (inv.totalAmount || 0), 0);
  const totalPaid = (student.invoices || []).reduce((acc: number, inv: any) => acc + (inv.paidAmount || 0), 0);
  const pendingDue = Math.max(0, totalBilled - totalPaid);

  // Homework metrics
  const totalSubmissions = student.submissions?.length || 0;

  // ----------------------------------------------------
  // STUDENT INFORMATION SYSTEM (SIS) ENHANCED STATES
  // ----------------------------------------------------
  const studentDocumentsInitial = [
    {
      id: 'doc-1',
      title: 'Official Birth Certificate',
      category: 'Identity Proof',
      fileSize: '1.4 MB',
      uploadDate: '2023-04-10',
      format: 'PDF',
      verified: true,
      url: '/docs/birth_certificate_sample.pdf',
    },
    {
      id: 'doc-2',
      title: 'Previous School Transfer Certificate (TC)',
      category: 'Academic Record',
      fileSize: '820 KB',
      uploadDate: '2023-04-10',
      format: 'PDF',
      verified: true,
      url: '/docs/transfer_certificate_sample.pdf',
    },
    {
      id: 'doc-3',
      title: 'Class 9 CBSE Annual Marksheet',
      category: 'Grade Sheet',
      fileSize: '2.1 MB',
      uploadDate: '2024-03-28',
      format: 'PDF',
      verified: true,
      url: '/docs/marksheet_class9_sample.pdf',
    },
  ];

  const [documentsList, setDocumentsList] = useState<any[]>(
    student.documents?.length > 0 ? student.documents : studentDocumentsInitial
  );
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [uploadDocLoading, setUploadDocLoading] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    title: '',
    documentType: 'BIRTH_CERTIFICATE',
    fileUrl: '/docs/sample_document.pdf',
    notes: '',
  });

  const [parentState, setParentState] = useState({
    fatherName: student.fatherName || (parent?.user ? `${parent.user.firstName} ${parent.user.lastName}` : ''),
    fatherPhone: student.fatherPhone || parent?.phone || student.emergencyContact || '',
    fatherEmail: student.fatherEmail || parent?.user?.email || '',
    fatherOccupation: student.fatherOccupation || parent?.occupation || '',
    motherName: student.motherName || '',
    motherPhone: student.motherPhone || '',
    motherEmail: student.motherEmail || '',
    motherOccupation: student.motherOccupation || '',
    guardianName: student.guardianName || '',
    guardianPhone: student.guardianPhone || '',
    guardianRelation: student.guardianRelation || '',
    guardianOccupation: student.guardianOccupation || '',
  });
  const [isEditParentOpen, setIsEditParentOpen] = useState(false);
  const [saveParentLoading, setSaveParentLoading] = useState(false);

  const [isIssueTcModalOpen, setIsIssueTcModalOpen] = useState(false);
  const [isPrintTcModalOpen, setIsPrintTcModalOpen] = useState(false);
  const [tcFormData, setTcFormData] = useState({
    reasonForLeaving: student.leavingReason || 'Parent Relocation / Transferred',
    conduct: 'EXCELLENT',
    duesCleared: true,
    remarks: 'Good character and diligent student. All school property returned in good standing.',
  });
  const [tcLoading, setTcLoading] = useState(false);
  const [activeTc, setActiveTc] = useState<any | null>(
    student.transferCertificates?.[0] ||
      (student.tcNumber
        ? {
            tcNumber: student.tcNumber,
            studentName: `${student.user.firstName} ${student.user.lastName}`,
            admissionNumber: student.admissionNumber,
            classLeaving: currentEnrollment?.class?.name || 'Class 10',
            academicYear: currentEnrollment?.academicYear?.name || '2026-2027',
            leavingDate: student.tcDate || new Date(),
            reasonForLeaving: student.leavingReason || 'Parent Transfer',
            conduct: 'EXCELLENT',
            duesCleared: true,
            remarks: 'All school dues cleared.',
          }
        : null)
  );

  // 13 Tabs Definition with Lifecycle
  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'personal', label: 'Personal Information', icon: <Contact className="w-3.5 h-3.5" /> },
    { id: 'academics', label: 'Academic Performance', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'attendance', label: 'Attendance', count: student.attendance?.length, icon: <CalendarCheck className="w-3.5 h-3.5" /> },
    { id: 'exams', label: 'Examination Results', count: student.markEntries?.length, icon: <FileCheck2 className="w-3.5 h-3.5" /> },
    { id: 'homework', label: 'Homework', count: totalSubmissions, icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: 'fees', label: 'Fees & Billing', count: student.invoices?.length, icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'documents', label: 'Documents', count: documentsList.length, icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'parents', label: 'Parent Information', count: 2, icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'lifecycle', label: 'Lifecycle & TC', count: activeTc ? 1 : 0, icon: <History className="w-3.5 h-3.5" /> },
    { id: 'medical', label: 'Medical Information', count: student.clinicVisits?.length, icon: <HeartPulse className="w-3.5 h-3.5" /> },
    { id: 'achievements', label: 'Achievements', count: student.achievements?.length, icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'timeline', label: 'Activity Timeline', icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  // Document Vault Sample Records
  const studentDocuments = [
    {
      id: 'doc-1',
      title: 'Official Birth Certificate',
      category: 'Identity Proof',
      fileSize: '1.4 MB',
      uploadDate: '2023-04-10',
      format: 'PDF',
      verified: true,
      url: '/docs/birth_certificate_sample.pdf',
    },
    {
      id: 'doc-2',
      title: 'Previous School Transfer Certificate (TC)',
      category: 'Academic Record',
      fileSize: '820 KB',
      uploadDate: '2023-04-10',
      format: 'PDF',
      verified: true,
      url: '/docs/transfer_certificate_sample.pdf',
    },
    {
      id: 'doc-3',
      title: 'Class 9 CBSE Annual Marksheet',
      category: 'Grade Sheet',
      fileSize: '2.1 MB',
      uploadDate: '2024-03-28',
      format: 'PDF',
      verified: true,
      url: '/docs/marksheet_class9_sample.pdf',
    },
    {
      id: 'doc-4',
      title: 'Government Aadhaar Verification Card',
      category: 'National ID',
      fileSize: '540 KB',
      uploadDate: '2023-04-10',
      format: 'PDF',
      verified: true,
      url: '/docs/aadhaar_card_sample.pdf',
    },
    {
      id: 'doc-5',
      title: 'Annual Pediatric Health & Fitness Clearance',
      category: 'Medical',
      fileSize: '760 KB',
      uploadDate: '2026-08-15',
      format: 'PDF',
      verified: true,
      url: '/docs/medical_fitness_sample.pdf',
    },
  ];

  // ----------------------------------------------------
  // UNIFIED 360-DEGREE TIMELINE FEED
  // ----------------------------------------------------
  const timelineEvents = useMemo(() => {
    const feed: Array<{
      id: string;
      title: string;
      description: string;
      date: string;
      category: 'ACADEMICS' | 'ATTENDANCE' | 'FEES' | 'MEDICAL' | 'AWARDS';
      icon: any;
      color: string;
    }> = [];

    // 1. Achievements
    (student.achievements || []).forEach((ach: any) => {
      feed.push({
        id: `ach-${ach.id}`,
        title: `Achievement: ${ach.title}`,
        description: `${ach.rankOrPosition || 'Awarded'} by ${ach.issuingAuthority || 'School'}.`,
        date: ach.achievementDate,
        category: 'AWARDS',
        icon: Award,
        color: '#D97706',
      });
    });

    // 2. Exam marks published
    (student.markEntries || []).forEach((me: any) => {
      feed.push({
        id: `mark-${me.id}`,
        title: `Exam Score: ${me.examSchedule?.subject?.name || 'Subject'}`,
        description: `Scored ${me.theoryMarksScored + (me.practicalMarksScored || 0)} marks (${me.grade || 'A'}).`,
        date: me.createdAt || student.createdAt,
        category: 'ACADEMICS',
        icon: FileCheck2,
        color: '#7C3AED',
      });
    });

    // 3. Fee invoices / payments
    (student.invoices || []).forEach((inv: any) => {
      feed.push({
        id: `inv-${inv.id}`,
        title: `Fee Invoice ${inv.invoiceNumber}`,
        description: `${inv.status} — ${formatCurrency(inv.paidAmount)} of ${formatCurrency(inv.totalAmount)} recorded.`,
        date: inv.dueDate,
        category: 'FEES',
        icon: CreditCard,
        color: '#16A34A',
      });
    });

    // 4. Clinic Visits
    (student.clinicVisits || []).forEach((cv: any) => {
      feed.push({
        id: `clinic-${cv.id}`,
        title: `Health Clinic Visit: ${cv.symptoms}`,
        description: `Treatment: ${cv.treatmentGiven}. Attended by ${cv.attendedByNurse}.`,
        date: cv.visitDate,
        category: 'MEDICAL',
        icon: HeartPulse,
        color: '#DC2626',
      });
    });

    // 5. Certificates
    (student.certificates || []).forEach((cert: any) => {
      feed.push({
        id: `cert-${cert.id}`,
        title: `Certificate Issued: ${cert.title}`,
        description: `Official certificate #${cert.certificateNo || 'EDV-CERT'} granted.`,
        date: cert.issueDate,
        category: 'AWARDS',
        icon: Sparkles,
        color: '#990000',
      });
    });

    // Sort by date descending
    return feed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [student]);

  const filteredTimeline = useMemo(() => {
    if (timelineFilter === 'ALL') return timelineEvents;
    return timelineEvents.filter((item) => item.category === timelineFilter);
  }, [timelineEvents, timelineFilter]);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveCroppedPhoto = async (croppedDataUrl: string | null) => {
    if (!croppedDataUrl) {
      setAvatarUrl(null);
      return;
    }
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: croppedDataUrl,
          filename: `student_${student.id}_avatar.jpg`,
          studentId: student.id,
        }),
      });
      const data = await res.json();
      setAvatarUrl(data.url || croppedDataUrl);
    } catch (err) {
      setAvatarUrl(croppedDataUrl);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadDocLoading(true);
    try {
      const res = await fetch(`/api/students/${student.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDocForm),
      });
      const data = await res.json();
      if (res.ok) {
        setDocumentsList((prev) => [data.document, ...prev]);
        setIsUploadDocOpen(false);
        setNewDocForm({
          title: '',
          documentType: 'BIRTH_CERTIFICATE',
          fileUrl: '/docs/sample_document.pdf',
          notes: '',
        });
        alert('Document uploaded successfully!');
      } else {
        alert(data.error || 'Failed to upload document');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadDocLoading(false);
    }
  };

  const handleVerifyDocument = async (docId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/students/${student.id}/documents`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setDocumentsList((prev) =>
          prev.map((d) => (d.id === docId ? { ...d, status, verified: status === 'VERIFIED' } : d))
        );
        alert(`Document marked as ${status}`);
      } else {
        alert(data.error || 'Failed to update verification status');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to remove this document?')) return;
    try {
      const res = await fetch(`/api/students/${student.id}/documents?documentId=${docId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDocumentsList((prev) => prev.filter((d) => d.id !== docId));
        alert('Document removed.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveParentLoading(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parentState),
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditParentOpen(false);
        alert('Parent details updated successfully!');
      } else {
        alert(data.error || 'Failed to update parent details');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaveParentLoading(false);
    }
  };

  const handleIssueTc = async (e: React.FormEvent) => {
    e.preventDefault();
    setTcLoading(true);
    try {
      const res = await fetch('/api/students/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GENERATE_TC',
          studentId: student.id,
          ...tcFormData,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveTc(data.tc);
        setIsIssueTcModalOpen(false);
        setIsPrintTcModalOpen(true);
        alert(data.message);
      } else {
        alert(data.error || 'Failed to issue TC');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setTcLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* TOP NAVIGATION BREADCRUMB & GLOBAL QUICK ACTIONS */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print">
        <Link
          href="/dashboard/students"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#990000] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Students Directory</span>
        </Link>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsQrModalOpen(true)}
            leftIcon={<QrIcon className="w-3.5 h-3.5 text-[#990000]" />}
          >
            Digital Gate QR
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMessageModalOpen(true)}
            leftIcon={<MessageSquare className="w-3.5 h-3.5 text-[#16A34A]" />}
          >
            Message Guardian
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5 text-slate-700" />}
          >
            Print Dossier
          </Button>

          {canAccessFinancials && pendingDue > 0 && (
            <Link href="/dashboard/fees">
              <Button size="sm" variant="primary" className="bg-[#16A34A] hover:bg-[#15803d] text-white">
                <DollarSign className="w-3.5 h-3.5 mr-1" />
                Collect Fee ({formatCurrency(pendingDue)})
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 360-DEGREE STUDENT PROFILE HEADER CARD */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 sm:p-6 shadow-2xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Col 1: Photo, Name, Badges, Contact info */}
          <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar with Camera Trigger Overlay */}
            <div className="relative group shrink-0">
              <Avatar
                src={avatarUrl}
                name={`${student.user.firstName} ${student.user.lastName}`}
                size="xl"
                house={student.house || 'Emerald'}
                shape="rounded"
              />
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-[#990000] text-white rounded-full shadow-md hover:bg-[#800000] transition-transform hover:scale-110 cursor-pointer border-2 border-white"
                title="Update profile photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {student.user.firstName} {student.user.lastName}
                </h1>
                <Badge variant="emerald" size="xs">
                  Active Enrollment
                </Badge>
                <span className="text-xs font-mono font-bold text-[#990000] bg-[#FEF2F2] px-2.5 py-0.5 rounded-lg border border-[#FECACA]">
                  {student.admissionNumber}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap font-medium">
                <span className="font-bold text-slate-800">
                  {currentEnrollment?.class?.name} - {currentEnrollment?.section?.name}
                </span>
                <span>•</span>
                <span>Roll No: <strong className="text-slate-900">{student.rollNumber || '01'}</strong></span>
                <span>•</span>
                <span>Session: <strong className="text-slate-900">{currentEnrollment?.academicYear?.name || '2026-2027'}</strong></span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">House: {student.house || 'Emerald'}</span>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#990000]" /> {student.user.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#16A34A]" /> {student.emergencyContact || '+91 98765 43210'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {student.city || 'Noida'}, {student.state || 'Uttar Pradesh'}
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Institutional Digital QR Code Verification */}
          <div className="lg:col-span-4 flex items-center justify-start lg:justify-end gap-3.5 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
            <div className="text-left lg:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Digital ID Verification
              </span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">Encrypted Gate Access</p>
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="text-[11px] text-[#990000] font-semibold hover:underline mt-0.5 inline-block"
              >
                Scan &amp; Verify Code
              </button>
            </div>
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Institutional Gate Verification QR"
                onClick={() => setIsQrModalOpen(true)}
                className="w-16 h-16 rounded-xl border border-slate-200 p-1 bg-white shadow-2xs cursor-pointer hover:border-[#990000] transition"
              />
            )}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 12 STRUCTURED NAVIGATION TABS */}
      {/* ---------------------------------------------------- */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ==================================================== */}
      {/* TAB 1: OVERVIEW & 360-DEGREE DASHBOARD */}
      {/* ==================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* 5 Vital KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <StatCard
              title="Attendance Vital"
              value={`${attendanceRate}%`}
              change={`${presentDays} / ${totalDays} Days`}
              trend={attendanceRate >= 75 ? 'up' : 'down'}
              icon={<CalendarCheck className="w-5 h-5 text-emerald-600" />}
            />
            <StatCard
              title="Academic Trajectory"
              value={`${gpaPercentage}%`}
              change={`Grade ${overallGrade} • Top 5%`}
              trend="up"
              icon={<TrendingUp className="w-5 h-5 text-[#990000]" />}
            />
            <StatCard
              title="Tuition Dues"
              value={formatCurrency(pendingDue)}
              change={pendingDue === 0 ? 'Fully Cleared' : 'Payment Due'}
              trend={pendingDue === 0 ? 'up' : 'down'}
              icon={<CreditCard className="w-5 h-5 text-amber-600" />}
            />
            <StatCard
              title="Upcoming Exams"
              value={upcomingExams.length}
              change={upcomingExams[0]?.subject?.name || 'Pre-Boards Ready'}
              trend="neutral"
              icon={<FileCheck2 className="w-5 h-5 text-purple-600" />}
            />
            <StatCard
              title="Co-Curriculars"
              value={student.achievements?.length || 0}
              change="Verified Merits"
              trend="up"
              icon={<Award className="w-5 h-5 text-teal-600" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left 2 Cols: Biographical Snapshot & Upcoming Schedules */}
            <div className="lg:col-span-2 space-y-5">
              {/* Biographical card */}
              <Card className="p-5">
                <CardHeader className="p-0 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#990000]" />
                    <span>Primary Biographical &amp; Enrollment Records</span>
                  </CardTitle>
                  <Button size="xs" variant="outline" onClick={() => setActiveTab('personal')}>
                    View Full Details
                  </Button>
                </CardHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4">
                  <div>
                    <span className="text-slate-400 block font-semibold">Date of Birth &amp; Age</span>
                    <span className="font-bold text-slate-800">{formatDate(student.dob)} (16 Years)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Gender &amp; Blood Group</span>
                    <span className="font-bold text-slate-800">{student.gender} • {student.bloodGroup || 'O+'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Guardian / Primary Contact</span>
                    <span className="font-bold text-slate-800">
                      {parent?.user ? `${parent.user.firstName} ${parent.user.lastName}` : 'Guardian'} ({parent?.phone || student.emergencyContact})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Residential Address</span>
                    <span className="font-bold text-slate-800">
                      {student.address || 'Plot 12, Sector 62'}, {student.city}, {student.state}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Upcoming Assessments & Deadlines */}
              <Card className="p-5">
                <CardHeader className="p-0 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-purple-600" />
                    <span>Upcoming Examinations &amp; Syllabus Blueprint</span>
                  </CardTitle>
                  <Badge variant="purple">{upcomingExams.length} Scheduled</Badge>
                </CardHeader>

                <div className="space-y-2.5 pt-3">
                  {upcomingExams.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                      No upcoming formal board examinations scheduled in the next 14 days.
                    </p>
                  ) : (
                    upcomingExams.map((ex: any) => (
                      <div
                        key={ex.id}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-slate-900 block font-semibold">
                            {ex.exam?.title}: {ex.subject?.name}
                          </strong>
                          <span className="text-slate-500 text-[11px]">
                            Max Marks: {ex.maxMarks} • Exam Date: {formatDate(ex.examDate)}
                          </span>
                        </div>
                        <Badge variant="purple" size="sm">
                          Exam Hall Wing A
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Right 1 Col: Recent Activities & Alerts */}
            <div className="space-y-5">
              {/* Recent Activity Mini-Feed */}
              <Card className="p-5">
                <CardHeader className="p-0 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-[#990000]" />
                    <span>Recent 360° Activity</span>
                  </CardTitle>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className="text-xs text-[#990000] font-semibold hover:underline"
                  >
                    View All
                  </button>
                </CardHeader>

                <div className="space-y-3 pt-3">
                  {timelineEvents.slice(0, 5).map((act) => {
                    const Icon = act.icon;
                    return (
                      <div key={act.id} className="flex items-start gap-2.5 text-xs">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: `${act.color}15`, color: act.color }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 leading-snug truncate">{act.title}</p>
                          <p className="text-[11px] text-slate-500 truncate">{act.description}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{formatDate(act.date)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Health & Medical Quick Card */}
              <Card className="p-5">
                <CardHeader className="p-0 pb-2 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    <span>Health &amp; Emergency Vital</span>
                  </CardTitle>
                </CardHeader>

                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Blood Group</span>
                    <strong className="text-slate-900">{student.bloodGroup || 'O+'}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Known Allergies</span>
                    <strong className="text-emerald-700">{student.healthProfile?.allergies || 'None Recorded'}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Emergency Doctor</span>
                    <strong className="text-slate-900">+91 11 4982 3099</strong>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: PERSONAL INFORMATION */}
      {/* ==================================================== */}
      {activeTab === 'personal' && (
        <Card className="p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Personal &amp; Demographic Records</h3>
              <p className="text-xs text-slate-500">Official student registry data aligned with CBSE gazette records.</p>
            </div>
            <Badge variant="blue">Registry Verified</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">Full Legal Name</span>
              <span className="font-bold text-slate-800 text-sm">{student.user.firstName} {student.user.lastName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Admission Number</span>
              <span className="font-mono font-bold text-[#990000]">{student.admissionNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Roll Number</span>
              <span className="font-bold text-slate-800">{student.rollNumber || '01'}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold">Date of Birth</span>
              <span className="font-bold text-slate-800">{formatDate(student.dob)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Gender</span>
              <span className="font-bold text-slate-800">{student.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Blood Group</span>
              <span className="font-bold text-rose-600">{student.bloodGroup || 'O+'}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold">Assigned House</span>
              <span className="font-bold text-emerald-700">{student.house || 'Emerald House'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Admission Date</span>
              <span className="font-bold text-slate-800">{formatDate(student.admissionDate)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Lifecycle Status</span>
              <Badge variant="emerald" size="xs">Active Enrollment</Badge>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold">Emergency Phone</span>
              <span className="font-bold text-slate-800">{student.emergencyContact || '+91 98765 43210'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Previous Institution</span>
              <span className="font-bold text-slate-800">{student.previousSchool || 'Delhi Public School, R.K. Puram'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Transfer Certificate (TC) No</span>
              <span className="font-mono font-bold text-slate-800">{student.tcNumber || 'TC-2023-8891'}</span>
            </div>

            <div className="sm:col-span-3 pt-3 border-t border-slate-100">
              <span className="text-slate-400 block font-semibold mb-1">Residential Address on File</span>
              <span className="font-bold text-slate-800 text-sm">
                {student.address || 'Plot 12, Institutional Area, Sector 62'}, {student.city}, {student.state} - {student.pincode}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* ==================================================== */}
      {/* TAB 3: ACADEMIC PERFORMANCE & CHARTS */}
      {/* ==================================================== */}
      {activeTab === 'academics' && (
        <div className="space-y-5">
          {/* Visual Academic Trend Chart */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#990000]" />
                  <span>Academic Trajectory &amp; Term GPA Progression</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Performance across Unit Tests, Mid-Terms, and Pre-Board Assessments.
                </p>
              </div>
              <Badge variant="blue">Cumulative: {gpaPercentage}% (Grade {overallGrade})</Badge>
            </div>

            {/* SVG Trend Line Graph */}
            <div className="pt-6">
              <div className="h-56 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="40" y1="70" x2="580" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="40" y1="120" x2="580" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="40" y1="170" x2="580" y2="170" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Y Axis Labels */}
                  <text x="10" y="25" fill="#94a3b8" fontSize="10">100%</text>
                  <text x="10" y="75" fill="#94a3b8" fontSize="10">80%</text>
                  <text x="10" y="125" fill="#94a3b8" fontSize="10">60%</text>
                  <text x="10" y="175" fill="#94a3b8" fontSize="10">40%</text>

                  {/* Shaded Area under curve */}
                  <path
                    d="M 80 110 L 200 90 L 320 60 L 440 50 L 540 40 L 540 180 L 80 180 Z"
                    fill="url(#blueGradient)"
                    opacity="0.15"
                  />

                  {/* Trend Path */}
                  <path
                    d="M 80 110 L 200 90 L 320 60 L 440 50 L 540 40"
                    fill="none"
                    stroke="#990000"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Linear Gradient Definition */}
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#990000" />
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                  </defs>

                  {/* Data Points */}
                  {[
                    { cx: 80, cy: 110, label: 'Unit Test 1 (68%)' },
                    { cx: 200, cy: 90, label: 'Term 1 Mid (76%)' },
                    { cx: 320, cy: 60, label: 'Quarterly (84%)' },
                    { cx: 440, cy: 50, label: 'Pre-Board 1 (88%)' },
                    { cx: 540, cy: 40, label: 'Pre-Board 2 (92%)' },
                  ].map((pt, i) => (
                    <g key={i}>
                      <circle cx={pt.cx} cy={pt.cy} r="5.5" fill="#ffffff" stroke="#990000" strokeWidth="3" />
                      <text x={pt.cx} y={pt.cy - 12} fill="#990000" fontSize="10" fontWeight="bold" textAnchor="middle">
                        {pt.label.split(' ')[2]?.replace(/[()]/g, '') || ''}
                      </text>
                      <text x={pt.cx} y={195} fill="#64748b" fontSize="10" textAnchor="middle">
                        {pt.label.split(' ')[0]} {pt.label.split(' ')[1]}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </Card>

          {/* Subject Performance Comparison Bars */}
          <Card className="p-6">
            <h4 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Subject Score vs. Section Average Benchmark
            </h4>

            <div className="space-y-4 pt-4">
              {[
                { subject: 'Mathematics (041)', student: 94, average: 74, color: '#990000' },
                { subject: 'Science & Physics (086)', student: 88, average: 71, color: '#16A34A' },
                { subject: 'English Core (184)', student: 82, average: 78, color: '#7C3AED' },
                { subject: 'Social Science (087)', student: 89, average: 70, color: '#D97706' },
                { subject: 'Computer Applications & AI (165)', student: 98, average: 81, color: '#C00000' },
              ].map((sub, i) => (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-800">{sub.subject}</span>
                    <span className="text-slate-600">
                      Student: <strong className="text-slate-900">{sub.student}%</strong> • Class Avg: {sub.average}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${sub.student}%`, backgroundColor: sub.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: ATTENDANCE & VISUALIZATION */}
      {/* ==================================================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-5">
          {/* Summary Stat Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="Attendance Rate"
              value={`${attendanceRate}%`}
              change="CBSE Target: 75%"
              trend={attendanceRate >= 75 ? 'up' : 'down'}
              icon={<CalendarCheck className="w-5 h-5 text-emerald-600" />}
            />
            <StatCard
              title="Present Sessions"
              value={presentDays}
              change="On-Time Attendance"
              trend="up"
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            />
            <StatCard
              title="Late Arrivals"
              value={lateDays}
              change="Traffic / Transport"
              trend="neutral"
              icon={<Clock className="w-5 h-5 text-amber-500" />}
            />
            <StatCard
              title="Recorded Absences"
              value={absentDays}
              change="Parent note verified"
              trend="neutral"
              icon={<AlertCircle className="w-5 h-5 text-rose-500" />}
            />
          </div>

          {/* Visual Attendance Heatmap Grid */}
          <Card className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900">November 2026 Attendance Heatmap</h4>
                <p className="text-xs text-slate-500">Day-by-day biometric punch records.</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> Present
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-amber-500" /> Late
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-rose-500" /> Absent
                </span>
              </div>
            </div>

            {/* Heatmap calendar cells */}
            <div className="grid grid-cols-7 gap-2 pt-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center font-bold text-slate-400 text-xs py-1">
                  {day}
                </div>
              ))}

              {Array.from({ length: 30 }).map((_, i) => {
                const dayNum = i + 1;
                const isSunday = (i + 1) % 7 === 0;
                const isLate = dayNum === 5;
                const isAbsent = dayNum === 10;
                const isFuture = dayNum > 18;

                let bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                if (isSunday) bg = 'bg-slate-50 text-slate-400 border-slate-200';
                else if (isFuture) bg = 'bg-slate-50/50 text-slate-300 border-dashed border-slate-200';
                else if (isLate) bg = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
                else if (isAbsent) bg = 'bg-rose-100 text-rose-900 border-rose-300 font-bold';

                return (
                  <div
                    key={i}
                    className={`h-12 rounded-xl border p-1.5 flex flex-col justify-between text-xs transition ${bg}`}
                  >
                    <span className="font-semibold text-[11px]">{dayNum}</span>
                    <span className="text-[9px] uppercase font-bold tracking-tight">
                      {isSunday ? 'OFF' : isFuture ? '—' : isLate ? 'LATE' : isAbsent ? 'ABSENT' : 'OK'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Searchable Log Table */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900">Attendance Log Entries</h4>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by status or remarks..."
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#990000]"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs pt-2">
              {(student.attendance || [])
                .filter((a: any) =>
                  attendanceSearch
                    ? a.status.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
                      (a.remarks || '').toLowerCase().includes(attendanceSearch.toLowerCase())
                    : true
                )
                .map((att: any) => (
                  <div key={att.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-800 block">{formatDate(att.date)}</strong>
                      <span className="text-slate-500 text-[11px]">{att.remarks || 'Standard biometric punch verified'}</span>
                    </div>
                    <Badge
                      variant={att.status === 'PRESENT' ? 'emerald' : att.status === 'LATE' ? 'amber' : 'rose'}
                    >
                      {att.status}
                    </Badge>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: EXAMINATION RESULTS */}
      {/* ==================================================== */}
      {activeTab === 'exams' && (
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-base font-bold text-slate-900">Published Assessment Scorecards</h4>
              <p className="text-xs text-slate-500">Official CBSE board compliant term evaluations.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="xs" variant="outline" onClick={handlePrint}>
                <Download className="w-3.5 h-3.5 mr-1" /> Download Term Report PDF
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Subject &amp; Code</th>
                  <th className="py-3 px-3">Exam Term</th>
                  <th className="py-3 px-3 text-center">Theory Scored</th>
                  <th className="py-3 px-3 text-center">Practical Scored</th>
                  <th className="py-3 px-3 text-center">Total Scored</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                  <th className="py-3 px-3 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(student.markEntries || []).map((m: any) => {
                  const theory = m.theoryMarksScored || 0;
                  const practical = m.practicalMarksScored || 0;
                  const total = theory + practical;
                  const grade = m.grade || calculateGrade(total).grade;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {m.examSchedule?.subject?.name || 'Subject'}
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {m.examSchedule?.subject?.code || '041'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {m.examSchedule?.exam?.title || 'Term 1 Mid-Term'}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-800">
                        {theory} / {m.examSchedule?.maxTheoryMarks || 80}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-800">
                        {practical} / {m.examSchedule?.maxPracticalMarks || 20}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#990000]">
                        {total} / {m.examSchedule?.maxMarks || 100}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant="blue" size="sm">
                          {grade}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-medium">
                        {m.remarks || 'Excellent analytical acumen'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ==================================================== */}
      {/* TAB 6: HOMEWORK & ASSIGNMENTS */}
      {/* ==================================================== */}
      {activeTab === 'homework' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-base font-bold text-slate-900">Homework &amp; Digital Task Submissions</h4>
              <p className="text-xs text-slate-500">Assigned coursework, teacher evaluations, and marks.</p>
            </div>
            <Badge variant="emerald">95% On-Time Completion</Badge>
          </div>

          <div className="space-y-3">
            {(student.submissions || []).map((sub: any) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="blue" size="xs">
                      {sub.homework?.subject?.name || 'Mathematics'}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      Submitted: {formatDate(sub.submittedDate)}
                    </span>
                  </div>
                  <strong className="text-sm font-bold text-slate-900 block mt-1">
                    {sub.homework?.title || 'Trigonometric Proofs Exercise 8.4'}
                  </strong>
                  <p className="text-slate-600 mt-0.5 line-clamp-1">
                    Feedback: {sub.feedback || 'Step-by-step proofs verified by teacher.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="font-bold text-[#990000] text-sm">
                    {sub.marksScored || 18} / {sub.homework?.maxMarks || 20} Marks
                  </span>
                  <Badge variant="emerald">{sub.status || 'GRADED'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ==================================================== */}
      {/* TAB 7: FEES & BILLING */}
      {/* ==================================================== */}
      {activeTab === 'fees' && (
        canAccessFinancials ? (
          <div className="space-y-5">
            {/* Fee summary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="Total Tuition Invoiced"
                value={formatCurrency(totalBilled)}
                change="Annual Fee Schedule"
                trend="neutral"
                icon={<CreditCard className="w-5 h-5 text-[#990000]" />}
              />
              <StatCard
                title="Total Collected"
                value={formatCurrency(totalPaid)}
                change="Digital Receipts Generated"
                trend="up"
                icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              />
              <StatCard
                title="Outstanding Due Balance"
                value={formatCurrency(pendingDue)}
                change={pendingDue === 0 ? 'No Dues Pending' : 'Next Due: 10th Dec'}
                trend={pendingDue === 0 ? 'up' : 'down'}
                icon={<DollarSign className="w-5 h-5 text-amber-600" />}
              />
            </div>

            {/* Invoices table */}
            <Card className="p-6">
              <h4 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Fee Invoices &amp; Receipts History
              </h4>

              <div className="divide-y divide-slate-100 text-xs pt-2">
                {(student.invoices || []).map((inv: any) => (
                  <div key={inv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-bold">{inv.invoiceNumber}</strong>
                        <Badge variant={inv.status === 'PAID' ? 'emerald' : 'amber'}>
                          {inv.status}
                        </Badge>
                      </div>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        Due Date: {formatDate(inv.dueDate)} • Total: {formatCurrency(inv.totalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-800">
                        Paid: {formatCurrency(inv.paidAmount)}
                      </span>
                      <Button size="xs" variant="outline" className="text-[#990000]">
                        <Download className="w-3 h-3 mr-1" /> Receipt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-8 text-center space-y-3">
            <Lock className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">Protected Financial Information</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Student tuition records and financial payment history are restricted to administrative leadership, accountants, and the student's legal guardians.
            </p>
          </Card>
        )
      )}

      {/* ==================================================== */}
      {/* TAB 8: DOCUMENTS VAULT */}
      {/* ==================================================== */}
      {activeTab === 'documents' && (
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-base font-bold text-slate-900">Student Document Vault</h4>
              <p className="text-xs text-slate-500">Official certificates, transfer letters, marks cards, and identification documents.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="rose">{documentsList.length} Records</Badge>
              {isAdminOrPrincipal && (
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => setIsUploadDocOpen(true)}
                  leftIcon={<Plus className="w-3 h-3" />}
                >
                  Upload Document
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {documentsList.map((doc) => {
              const isVerified = doc.status === 'VERIFIED' || doc.verified;
              const isRejected = doc.status === 'REJECTED';
              return (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#990000] hover:shadow-xs transition space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {doc.documentType?.replace('_', ' ') || doc.category || 'DOCUMENT'}
                      </span>
                      <Badge
                        variant={isVerified ? 'rose' : isRejected ? 'slate' : 'amber'}
                        size="xs"
                      >
                        {isVerified ? 'Verified' : isRejected ? 'Rejected' : 'Pending'}
                      </Badge>
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs mt-2 line-clamp-1">{doc.title}</h5>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {doc.format || 'PDF'} • {doc.fileSize || '1.2 MB'} • Uploaded {formatDate(doc.createdAt || doc.uploadDate || new Date())}
                    </span>
                    {doc.notes && (
                      <p className="text-[10.5px] text-slate-400 mt-1 italic line-clamp-1">{doc.notes}</p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Button
                        size="xs"
                        variant="outline"
                        className="flex-1 text-[#990000]"
                        onClick={() => setPreviewDoc(doc)}
                      >
                        <Eye className="w-3 h-3 mr-1" /> Preview
                      </Button>
                      <Button size="xs" variant="outline" className="text-slate-600">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                    {isAdminOrPrincipal && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {!isVerified && (
                          <button
                            onClick={() => handleVerifyDocument(doc.id, 'VERIFIED')}
                            className="text-[10.5px] font-bold text-[#990000] hover:underline cursor-pointer"
                          >
                            Mark Verified
                          </button>
                        )}
                        {!isRejected && (
                          <button
                            onClick={() => handleVerifyDocument(doc.id, 'REJECTED')}
                            className="text-[10.5px] font-semibold text-slate-500 hover:text-slate-800 ml-auto cursor-pointer"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-[10.5px] font-semibold text-rose-600 hover:underline ml-auto cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ==================================================== */}
      {/* TAB 9: MEDICAL & HEALTH CLINIC */}
      {/* ==================================================== */}
      {activeTab === 'medical' && (
        <div className="space-y-5">
          {/* Medical Vitals Card */}
          <Card className="p-6">
            <h4 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-600" />
              <span>Campus Health &amp; Physical Vitals</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-semibold">Blood Group</span>
                <span className="text-lg font-black text-rose-600">{student.bloodGroup || 'O+'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-semibold">Height &amp; Weight</span>
                <span className="text-lg font-black text-slate-800">
                  {student.healthProfile?.heightCm || 155} cm • {student.healthProfile?.weightKg || 48} kg
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-semibold">Vision (L / R)</span>
                <span className="text-lg font-black text-[#990000]">
                  {student.healthProfile?.visionLeft || '6/6'} • {student.healthProfile?.visionRight || '6/6'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-semibold">Last Medical Checkup</span>
                <span className="text-sm font-bold text-slate-800">
                  {student.healthProfile?.lastCheckupDate ? formatDate(student.healthProfile.lastCheckupDate) : '15 Aug 2026'}
                </span>
              </div>
            </div>
          </Card>

          {/* Clinic Visits Log */}
          <Card className="p-6">
            <h4 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Campus Infirmary &amp; Clinic Visits
            </h4>

            <div className="divide-y divide-slate-100 text-xs pt-2">
              {(student.clinicVisits || []).map((cv: any) => (
                <div key={cv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 font-bold">{cv.symptoms}</strong>
                      <span className="text-[10px] text-slate-400">{formatDate(cv.visitDate)}</span>
                    </div>
                    <span className="text-slate-600 text-[11px] block mt-0.5">
                      Treatment: {cv.treatmentGiven} • Medicine: {cv.medicineAdministered || 'None'}
                    </span>
                  </div>
                  <Badge variant="blue" size="sm">
                    {cv.attendedByNurse}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 10: ACHIEVEMENTS & AWARDS */}
      {/* ==================================================== */}
      {activeTab === 'achievements' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-base font-bold text-slate-900">Co-Curricular Awards &amp; Merit Badges</h4>
              <p className="text-xs text-slate-500">Competitions, athletic championships, and academic Olympiads.</p>
            </div>
            <Badge variant="emerald">{student.achievements?.length || 0} Honors</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(student.achievements || []).map((ach: any) => (
              <div
                key={ach.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#990000] hover:shadow-xs transition space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {ach.category}
                  </span>
                  <Badge variant="emerald" size="xs">
                    Verified
                  </Badge>
                </div>
                <h5 className="font-bold text-slate-900 text-sm">{ach.title}</h5>
                <p className="text-xs text-slate-600">
                  {ach.rankOrPosition} • Issued by {ach.issuingAuthority}
                </p>
                <span className="text-[10px] text-slate-400 block pt-1 font-mono">
                  Awarded: {formatDate(ach.achievementDate)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ==================================================== */}
      {/* TAB 11: PARENT & GUARDIAN INFORMATION */}
      {/* ==================================================== */}
      {activeTab === 'parents' && (
        <div className="space-y-5">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#990000]" />
                <span>Parents &amp; Guardian Profile Records</span>
              </h4>
              {isAdminOrPrincipal && (
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setIsEditParentOpen(true)}
                >
                  Edit Parent Information
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
              {/* Father Information Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-[#F5F5F5] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 text-sm">Father Details</span>
                  <Badge variant="rose" size="xs">Primary Parent</Badge>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Full Name:</span>
                    <strong className="text-slate-800">{parentState.fatherName || 'Not recorded'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone Number:</span>
                    <strong className="text-[#990000] font-mono">{parentState.fatherPhone || 'Not recorded'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email Address:</span>
                    <strong className="text-slate-800">{parentState.fatherEmail || 'Not recorded'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Occupation:</span>
                    <strong className="text-slate-800">{parentState.fatherOccupation || 'Professional'}</strong>
                  </div>
                </div>
              </div>

              {/* Mother Information Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-[#F5F5F5] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 text-sm">Mother Details</span>
                  <Badge variant="slate" size="xs">Co-Guardian</Badge>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Full Name:</span>
                    <strong className="text-slate-800">{parentState.motherName || 'Not recorded'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone Number:</span>
                    <strong className="text-slate-800 font-mono">{parentState.motherPhone || 'Not recorded'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email Address:</span>
                    <strong className="text-slate-800">{parentState.motherEmail || 'Not recorded'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Occupation:</span>
                    <strong className="text-slate-800">{parentState.motherOccupation || 'Educator / Professional'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency & Guardian Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-4 border-t border-slate-100 mt-4">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-semibold text-[11px]">Emergency Contact</span>
                <span className="font-bold text-[#990000] text-sm font-mono mt-0.5 block">
                  {student.emergencyContact || parentState.fatherPhone || '-'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-semibold text-[11px]">Residential Address</span>
                <span className="font-medium text-slate-800 text-xs mt-0.5 block line-clamp-1">
                  {student.address || 'Campus Neighborhood'}, {student.city || 'Noida'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-semibold text-[11px]">Parent Portal Account</span>
                <Badge variant="rose" size="xs" className="mt-1">
                  Active &amp; Linked
                </Badge>
              </div>
            </div>
          </Card>

          {/* Authorized Pickups */}
          <Card className="p-6">
            <h4 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Authorized Campus Dismissal &amp; Pickup Guardians
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3">
              {(student.authorizedPickups || []).map((p: any) => (
                <div key={p.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 block font-semibold">{p.guardianName}</strong>
                    <span className="text-slate-500 text-[11px]">Relation: {p.relationship} • Phone: {p.phone}</span>
                  </div>
                  <Badge variant="slate" size="sm">
                    {p.idProofType} Verified
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB: STUDENT LIFECYCLE & TRANSFER CERTIFICATE (TC) */}
      {/* ==================================================== */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-5">
          {/* 1. Current Lifecycle Stage Card */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-[#990000]" />
                  <span>Student Lifecycle &amp; Academic Progression</span>
                </h4>
                <p className="text-xs text-slate-500">Audit trail of admissions, annual promotions, section transfers, and exit credentials.</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={student.isArchived ? 'slate' : 'rose'}>
                  Stage: {student.lifecycleStage?.replace('_', ' ') || 'ACTIVE ENROLLMENT'}
                </Badge>
                {isAdminOrPrincipal && !activeTc && (
                  <Button
                    size="xs"
                    variant="primary"
                    onClick={() => setIsIssueTcModalOpen(true)}
                    leftIcon={<FileText className="w-3.5 h-3.5" />}
                  >
                    Issue Transfer Certificate
                  </Button>
                )}
                {activeTc && (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setIsPrintTcModalOpen(true)}
                    leftIcon={<Printer className="w-3.5 h-3.5 text-[#990000]" />}
                  >
                    Print Official TC
                  </Button>
                )}
              </div>
            </div>

            {/* Lifecycle Stages Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 text-xs">
              {[
                { stage: 'ADMISSION', label: '1. Registered & Enrolled', done: true, date: formatDate(student.admissionDate) },
                { stage: 'ACTIVE', label: '2. Active Student', done: !student.isArchived, date: 'Current' },
                { stage: 'PROMOTED', label: '3. Class Promotions', done: (student.promotionLogs || []).length > 0, date: `${(student.promotionLogs || []).length} Logged` },
                { stage: 'TRANSFERRED', label: '4. Section Transfers', done: (student.sectionTransfers || []).length > 0, date: `${(student.sectionTransfers || []).length} Logged` },
                { stage: 'TC_ALUMNI', label: '5. TC / Alumni Exit', done: Boolean(activeTc || student.alumniRecord), date: activeTc ? 'TC Issued' : student.alumniRecord ? 'Alumni' : 'Pending' },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border ${
                    step.done
                      ? 'bg-red-50/50 border-red-200 text-[#990000]'
                      : 'bg-[#F5F5F5] border-[#E5E5E5] text-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[11px]">
                    <span>{step.label}</span>
                    {step.done && <CheckCircle2 className="w-3.5 h-3.5 text-[#990000]" />}
                  </div>
                  <span className="text-[10px] block mt-1 opacity-80">{step.date}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 2. Official Transfer Certificate (TC) Card (if issued) */}
          {activeTc && (
            <Card className="p-6 border-[#990000]/30 bg-white shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                <div>
                  <h4 className="text-base font-bold text-[#990000] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#990000]" />
                    <span>Official Transfer Certificate Record</span>
                  </h4>
                  <p className="text-xs text-[#737373]">Legally validated school leaving certificate.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-[#171717]">{activeTc.tcNumber}</span>
                  <Button size="xs" variant="outline" onClick={() => setIsPrintTcModalOpen(true)} leftIcon={<Printer className="w-3 h-3" />}>
                    View &amp; Print TC
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-4">
                <div className="p-3 bg-[#F5F5F5] rounded-xl border border-[#E5E5E5]">
                  <span className="text-[#737373] block text-[11px]">Class at Leaving</span>
                  <strong className="text-[#171717] text-sm">{activeTc.classLeaving}</strong>
                </div>
                <div className="p-3 bg-[#F5F5F5] rounded-xl border border-[#E5E5E5]">
                  <span className="text-[#737373] block text-[11px]">Leaving Reason</span>
                  <strong className="text-[#171717] text-sm">{activeTc.reasonForLeaving}</strong>
                </div>
                <div className="p-3 bg-[#F5F5F5] rounded-xl border border-[#E5E5E5]">
                  <span className="text-[#737373] block text-[11px]">General Conduct</span>
                  <strong className="text-[#171717] text-sm">{activeTc.conduct}</strong>
                </div>
                <div className="p-3 bg-[#F5F5F5] rounded-xl border border-[#E5E5E5]">
                  <span className="text-[#737373] block text-[11px]">Fee Dues Clearance</span>
                  <strong className="text-[#990000] text-sm">{activeTc.duesCleared ? 'Full Cleared' : 'Pending'}</strong>
                </div>
              </div>
            </Card>
          )}

          {/* 3. Academic Year Enrollment History Table */}
          <Card className="p-6">
            <h4 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Academic Year Enrollment History
            </h4>
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F5] text-slate-700 font-bold border-b border-[#E5E5E5]">
                  <tr>
                    <th className="p-3">Academic Session</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Section</th>
                    <th className="p-3">Roll Number</th>
                    <th className="p-3">Enrollment Status</th>
                    <th className="p-3">Enrolled On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {(student.enrollments || []).map((enr: any) => (
                    <tr key={enr.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-[#171717]">{enr.academicYear?.name || 'Session'}</td>
                      <td className="p-3 font-bold text-[#990000]">{enr.class?.name || 'Class'}</td>
                      <td className="p-3 font-semibold text-slate-700">Section {enr.section?.name || '-'}</td>
                      <td className="p-3 font-mono font-semibold text-slate-800">{enr.rollNumber || '-'}</td>
                      <td className="p-3">
                        <Badge variant={enr.status === 'ACTIVE' ? 'rose' : enr.status === 'PROMOTED' ? 'amber' : 'slate'} size="xs">
                          {enr.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-500">{formatDate(enr.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 4. Section Transfers & Promotions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Section Transfers */}
            <Card className="p-6">
              <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Section Reallocation Logs</span>
                <Badge variant="slate" size="xs">{(student.sectionTransfers || []).length} Transfers</Badge>
              </h4>
              <div className="space-y-2 pt-3 text-xs">
                {(student.sectionTransfers || []).length === 0 ? (
                  <p className="text-slate-400 py-4 text-center">No intra-class section transfers recorded.</p>
                ) : (
                  (student.sectionTransfers || []).map((st: any) => (
                    <div key={st.id} className="p-3 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-[#171717]">Reallocated Section</span>
                        <span className="text-[10px] text-slate-400">{formatDate(st.transferredAt)}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{st.reason || 'Administrative adjustment'}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Promotion Logs */}
            <Card className="p-6">
              <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Annual Promotion Audit Logs</span>
                <Badge variant="slate" size="xs">{(student.promotionLogs || []).length} Promotions</Badge>
              </h4>
              <div className="space-y-2 pt-3 text-xs">
                {(student.promotionLogs || []).length === 0 ? (
                  <p className="text-slate-400 py-4 text-center">No historical promotion records recorded.</p>
                ) : (
                  (student.promotionLogs || []).map((pl: any) => (
                    <div key={pl.id} className="p-3 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-[#990000]">Status: {pl.status}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(pl.createdAt)}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{pl.eligibilityNotes || 'Annual academic clearance'}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 12: UNIFIED 360-DEGREE ACTIVITY TIMELINE */}
      {/* ==================================================== */}
      {activeTab === 'timeline' && (
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-base font-bold text-slate-900">Comprehensive Activity Timeline</h4>
              <p className="text-xs text-slate-500">Audit trail of examinations, attendance, fee receipts, and health records.</p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {['ALL', 'ACADEMICS', 'ATTENDANCE', 'FEES', 'MEDICAL', 'AWARDS'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTimelineFilter(cat)}
                  className={`px-2.5 py-1 rounded-full font-medium transition ${
                    timelineFilter === cat
                      ? 'bg-[#990000] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Vertical Timeline Stream */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filteredTimeline.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="relative group">
                  {/* Timeline point dot */}
                  <div
                    className="absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 border-white shadow-xs flex items-center justify-center text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon className="w-2.5 h-2.5" />
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#990000] transition text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatDate(item.date)}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: DIGITAL QR CODE VERIFICATION MODAL */}
      {/* ==================================================== */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="Institutional Gate Pass & QR Code">
        <div className="text-center p-4 space-y-4">
          <div className="w-48 h-48 mx-auto p-2 bg-white rounded-2xl border-2 border-[#990000] shadow-sm flex items-center justify-center">
            {qrDataUrl && <img src={qrDataUrl} alt="Institutional QR" className="w-full h-full object-contain" />}
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-base">
              {student.user.firstName} {student.user.lastName}
            </h4>
            <span className="text-xs font-mono font-bold text-[#990000]">
              {student.admissionNumber} • {currentEnrollment?.class?.name}-{currentEnrollment?.section?.name}
            </span>
          </div>

          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Authorized for automated turnstile gate access, library book checkout, and campus bus boarding.
          </p>

          <Button size="sm" variant="outline" onClick={() => setIsQrModalOpen(false)}>
            Close Gate Pass
          </Button>
        </div>
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 2: DOCUMENT PREVIEW MODAL */}
      {/* ==================================================== */}
      <Modal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.title || 'Document Preview'}
      >
        {previewDoc && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Document Type</span>
                <strong className="text-slate-800">{previewDoc.category}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Format</span>
                <strong className="text-slate-800">{previewDoc.format} ({previewDoc.fileSize})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Upload Date</span>
                <strong className="text-slate-800">{formatDate(previewDoc.uploadDate)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification</span>
                <Badge variant="emerald" size="xs">CBSE Registrar Verified</Badge>
              </div>
            </div>

            <div className="p-12 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
              <FileText className="w-10 h-10 text-[#990000] mx-auto" />
              <p className="font-bold text-slate-800">Secure PDF Preview Verified</p>
              <p className="text-[11px] text-slate-400">Digitally signed encrypted document stored on institutional S3.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setPreviewDoc(null)}>
                Close
              </Button>
              <Button size="sm" variant="primary" className="bg-[#990000] text-white">
                <Download className="w-3.5 h-3.5 mr-1" /> Download Copy
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 3: PROFILE PHOTO CROPPER MODAL */}
      {/* ==================================================== */}
      <ImageCropperModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onSave={handleSaveCroppedPhoto}
        currentImageUrl={avatarUrl}
        title={`Update Photo for ${student.user.firstName} ${student.user.lastName}`}
        aspectRatio="circle"
      />

      {/* ==================================================== */}
      {/* MODAL 4: MESSAGE GUARDIAN MODAL */}
      {/* ==================================================== */}
      <Modal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        title={`Message Guardian of ${student.user.firstName}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Dispatch an official SMS / In-App communication to{' '}
            <strong className="text-slate-900">
              {parent?.user ? `${parent.user.firstName} ${parent.user.lastName}` : 'Guardian'}
            </strong>{' '}
            ({parent?.phone || student.emergencyContact}).
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Message Subject</label>
            <input
              type="text"
              defaultValue={`Academic Update regarding ${student.user.firstName}`}
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-[#990000]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Message Content</label>
            <textarea
              rows={3}
              placeholder="Enter your message or circular notice..."
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-[#990000]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setIsMessageModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="bg-[#990000] text-white hover:bg-[#C00000]"
              onClick={() => {
                setIsMessageModalOpen(false);
                alert('Notice dispatched to guardian!');
              }}
            >
              Send Notice
            </Button>
          </div>
        </div>
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 5: UPLOAD NEW STUDENT DOCUMENT */}
      {/* ==================================================== */}
      <Modal
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
        title="Upload Student Document"
        subtitle={`Upload verified academic or civil record for ${student.user.firstName}`}
      >
        <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Document Title *</label>
            <input
              type="text"
              required
              value={newDocForm.title}
              onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
              placeholder="e.g. CBSE Class 10 Board Marksheet"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#990000]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Document Category *</label>
              <select
                value={newDocForm.documentType}
                onChange={(e) => setNewDocForm({ ...newDocForm, documentType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#990000]"
              >
                <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
                <option value="TRANSFER_CERTIFICATE">Transfer Certificate (TC)</option>
                <option value="PREVIOUS_MARKSHEET">Previous Academic Records</option>
                <option value="ADDRESS_PROOF">Address Proof</option>
                <option value="STUDENT_PHOTO">Student Photograph</option>
                <option value="NATIONAL_ID">Aadhaar / National ID</option>
                <option value="MEDICAL_RECORD">Medical Fitness Certificate</option>
                <option value="OTHER">Other Institutional Record</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Document Path / URL *</label>
              <input
                type="text"
                required
                value={newDocForm.fileUrl}
                onChange={(e) => setNewDocForm({ ...newDocForm, fileUrl: e.target.value })}
                placeholder="/docs/student_doc.pdf"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#990000]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Verification Notes</label>
            <textarea
              rows={2}
              value={newDocForm.notes}
              onChange={(e) => setNewDocForm({ ...newDocForm, notes: e.target.value })}
              placeholder="e.g. Original physically inspected and attested by registrar"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#990000]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsUploadDocOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" isLoading={uploadDocLoading}>
              Upload &amp; Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 6: EDIT PARENT & GUARDIAN DETAILS */}
      {/* ==================================================== */}
      <Modal
        isOpen={isEditParentOpen}
        onClose={() => setIsEditParentOpen(false)}
        title="Edit Parent & Guardian Details"
        subtitle={`Update contact and family records for ${student.user.firstName}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveParent} className="space-y-4 text-xs">
          <div className="p-3 bg-[#F5F5F5] rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-[#990000] text-sm block">Father Details</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 mb-0.5">Full Name</label>
                <input
                  type="text"
                  value={parentState.fatherName}
                  onChange={(e) => setParentState({ ...parentState, fatherName: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 bg-white rounded-md focus:border-[#990000]"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-0.5">Phone Number</label>
                <input
                  type="tel"
                  value={parentState.fatherPhone}
                  onChange={(e) => setParentState({ ...parentState, fatherPhone: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 bg-white rounded-md focus:border-[#990000]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 mb-0.5">Email Address</label>
                <input
                  type="email"
                  value={parentState.fatherEmail}
                  onChange={(e) => setParentState({ ...parentState, fatherEmail: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 bg-white rounded-md focus:border-[#990000]"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-0.5">Occupation</label>
                <input
                  type="text"
                  value={parentState.fatherOccupation}
                  onChange={(e) => setParentState({ ...parentState, fatherOccupation: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 bg-white rounded-md focus:border-[#990000]"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#F5F5F5] rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 text-sm block">Mother Details</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 mb-0.5">Full Name</label>
                <input
                  type="text"
                  value={parentState.motherName}
                  onChange={(e) => setParentState({ ...parentState, motherName: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 bg-white rounded-md focus:border-[#990000]"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-0.5">Phone Number</label>
                <input
                  type="tel"
                  value={parentState.motherPhone}
                  onChange={(e) => setParentState({ ...parentState, motherPhone: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 bg-white rounded-md focus:border-[#990000]"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsEditParentOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" isLoading={saveParentLoading}>
              Save Details
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 7: ISSUE TRANSFER CERTIFICATE (TC) */}
      {/* ==================================================== */}
      <Modal
        isOpen={isIssueTcModalOpen}
        onClose={() => setIsIssueTcModalOpen(false)}
        title="Issue Official Transfer Certificate (TC)"
        subtitle={`Generate school leaving credentials for ${student.user.firstName}`}
      >
        <form onSubmit={handleIssueTc} className="space-y-4 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 text-[#990000] rounded-xl space-y-1">
            <span className="font-bold block">Permanent Withdrawal Notice</span>
            <p className="text-[11px] leading-relaxed">
              Generating an official TC permanently marks this student as <strong>TC_ISSUED</strong> and archives their active session enrollment.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Leaving *</label>
            <input
              type="text"
              required
              value={tcFormData.reasonForLeaving}
              onChange={(e) => setTcFormData({ ...tcFormData, reasonForLeaving: e.target.value })}
              placeholder="e.g. Parent Relocation, Completed Studies"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#990000]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Student Conduct Rating</label>
              <select
                value={tcFormData.conduct}
                onChange={(e) => setTcFormData({ ...tcFormData, conduct: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#990000]"
              >
                <option value="EXCELLENT">Excellent</option>
                <option value="VERY_GOOD">Very Good</option>
                <option value="GOOD">Good</option>
                <option value="SATISFACTORY">Satisfactory</option>
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={tcFormData.duesCleared}
                  onChange={(e) => setTcFormData({ ...tcFormData, duesCleared: e.target.checked })}
                  className="w-4 h-4 text-[#990000] rounded focus:ring-[#990000]"
                />
                <span>All School Dues Cleared</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">General Remarks</label>
            <textarea
              rows={2}
              value={tcFormData.remarks}
              onChange={(e) => setTcFormData({ ...tcFormData, remarks: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#990000]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsIssueTcModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" isLoading={tcLoading}>
              Issue TC
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 8: PRINTABLE OFFICIAL TRANSFER CERTIFICATE */}
      {/* ==================================================== */}
      {activeTc && (
        <Modal
          isOpen={isPrintTcModalOpen}
          onClose={() => setIsPrintTcModalOpen(false)}
          title="Official Transfer Certificate Preview"
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs text-slate-800">
            {/* Printable Certificate Template */}
            <div className="p-8 border-4 border-double border-[#990000] rounded-xl bg-white space-y-5 shadow-xs">
              {/* Header */}
              <div className="text-center space-y-1 border-b-2 border-[#990000] pb-4">
                <h2 className="text-xl font-black text-[#990000] tracking-wider uppercase">
                  EDVONEST ACADEMY
                </h2>
                <p className="text-[11px] text-slate-600 uppercase font-semibold">
                  Recognized &amp; Affiliated to Central Board of Secondary Education (CBSE)
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Affiliation No. 2130892 • School Code: 71029 • Institutional Reg. #EDV-9921
                </p>
                <div className="inline-block px-3 py-1 bg-red-50 border border-red-200 text-[#990000] font-black rounded-md text-xs mt-2 uppercase">
                  TRANSFER CERTIFICATE
                </div>
              </div>

              {/* Certificate Metadata */}
              <div className="flex justify-between font-mono text-[11px] border-b pb-2">
                <span>TC Number: <strong className="text-[#990000]">{activeTc.tcNumber}</strong></span>
                <span>Admission No: <strong className="text-slate-900">{student.admissionNumber}</strong></span>
                <span>Date: <strong>{formatDate(activeTc.leavingDate || new Date())}</strong></span>
              </div>

              {/* Body particulars */}
              <div className="space-y-2.5 text-xs leading-relaxed">
                <p>1. Name of the Pupil: <strong>{student.user.firstName} {student.user.lastName}</strong></p>
                <p>2. Father’s / Guardian’s Name: <strong>{parentState.fatherName || 'On Institutional File'}</strong></p>
                <p>3. Mother’s Name: <strong>{parentState.motherName || 'On Institutional File'}</strong></p>
                <p>4. Nationality: <strong>Indian</strong> • Religion: <strong>General</strong></p>
                <p>5. Date of First Admission to the School: <strong>{formatDate(student.admissionDate)}</strong></p>
                <p>6. Date of Birth (in figures): <strong>{formatDate(student.dob)}</strong></p>
                <p>7. Class in which the pupil last studied: <strong>{activeTc.classLeaving || currentEnrollment?.class?.name}</strong></p>
                <p>8. School / Board Annual Examination last taken: <strong>Passed with Distinction</strong></p>
                <p>9. Whether qualified for promotion to higher class: <strong>Yes, Promoted</strong></p>
                <p>10. Month up to which school dues have been paid: <strong>Full Cleared ({activeTc.duesCleared ? 'No Outstanding' : 'Pending'})</strong></p>
                <p>11. Reason for leaving the school: <strong>{activeTc.reasonForLeaving}</strong></p>
                <p>12. General Conduct: <strong>{activeTc.conduct}</strong></p>
                <p>13. Remarks: <strong>{activeTc.remarks || 'Diligent and well-behaved student.'}</strong></p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-10 text-center text-[11px] font-bold text-slate-700">
                <div className="border-t border-slate-300 pt-2">
                  <span>Class Teacher</span>
                </div>
                <div className="border-t border-slate-300 pt-2">
                  <span>Checked by (Registrar)</span>
                </div>
                <div className="border-t border-slate-300 pt-2">
                  <span className="text-[#990000]">Principal (Seal &amp; Sign)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setIsPrintTcModalOpen(false)}>
                Close Preview
              </Button>
              <Button size="sm" variant="primary" onClick={() => window.print()} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                Print Certificate
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
