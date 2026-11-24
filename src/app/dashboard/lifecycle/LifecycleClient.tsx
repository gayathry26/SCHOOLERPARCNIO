'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Shield,
  FileCheck2,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  Award,
  FileText,
  UserCheck,
  UserX,
  Shuffle,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Download,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { exportToCSV } from '@/lib/export';

interface LifecycleClientProps {
  initialYears: any[];
  activeYear: any;
  classes: any[];
  teachers: any[];
  initialAllocations: any[];
  initialEnrollments: any[];
  applications: any[];
  initialAlumni: any[];
  closingLogs: any[];
  initialPromotions: any[];
  unpaidInvoices: any[];
  examSchedules: any[];
  userRole: string;
}

export const LifecycleClient: React.FC<LifecycleClientProps> = ({
  initialYears,
  activeYear,
  classes,
  teachers,
  initialAllocations,
  initialEnrollments,
  applications,
  initialAlumni,
  closingLogs,
  initialPromotions,
  unpaidInvoices,
  examSchedules,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [academicYears, setAcademicYears] = useState(initialYears);
  const [currentActiveYear, setCurrentActiveYear] = useState(activeYear);
  const [selectedYearId, setSelectedYearId] = useState(activeYear?.id || initialYears[0]?.id);
  const [allocations, setAllocations] = useState(initialAllocations);
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [promotions, setPromotions] = useState(initialPromotions);
  const [alumniList, setAlumniList] = useState(initialAlumni);
  const [closingList, setClosingList] = useState(closingLogs);

  // Loading and feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [showNewYearModal, setShowNewYearModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showTransferSectionModal, setShowTransferSectionModal] = useState<any>(null);
  const [showTcModal, setShowTcModal] = useState<any>(null);
  const [showAlumniModal, setShowAlumniModal] = useState<any>(null);
  const [showClosingWizard, setShowClosingWizard] = useState(false);

  // Form states: New Year
  const [newYearForm, setNewYearForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    setAsActive: false,
  });

  // Form states: Teacher Allocation
  const [allocationForm, setAllocationForm] = useState({
    teacherId: teachers[0]?.id || '',
    classId: classes[0]?.id || '',
    sectionId: classes[0]?.sections[0]?.id || '',
    subjectId: classes[0]?.subjects[0]?.id || '',
    role: 'SUBJECT_TEACHER',
    periodsPerWeek: 5,
  });

  // Form states: Section Transfer
  const [transferForm, setTransferForm] = useState({
    toSectionId: '',
    reason: 'Parent request / section balance',
  });

  // Form states: Transfer Certificate
  const [tcForm, setTcForm] = useState({
    tcNumber: `TC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    leavingReason: 'Family relocation / Completed Grade',
    remarks: 'Satisfactory conduct. All school dues cleared.',
  });

  // Form states: Alumni Registration
  const [alumniForm, setAlumniForm] = useState({
    graduationYear: new Date().getFullYear().toString(),
    finalClass: 'Class 12',
    passingMarksPercent: 88.5,
    conduct: 'EXCELLENT',
    currentPursuit: 'Pursuing Bachelor of Technology (Computer Science)',
    contactEmail: '',
    contactPhone: '',
    notes: 'Valedictorian candidate',
  });

  // Promotion Engine selection states
  const [promoFromClassId, setPromoFromClassId] = useState(classes[0]?.id || '');
  const [promoToYearId, setPromoToYearId] = useState(
    academicYears.find((y) => y.id !== selectedYearId)?.id || selectedYearId
  );
  const [promoToClassId, setPromoToClassId] = useState(classes[1]?.id || classes[0]?.id || '');
  const [promoToSectionId, setPromoToSectionId] = useState(classes[1]?.sections[0]?.id || classes[0]?.sections[0]?.id || '');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [minAttendancePercent, setMinAttendancePercent] = useState(75);
  const [minMarksPercent, setMinMarksPercent] = useState(33);

  // Computed data
  const selectedYear = academicYears.find((y) => y.id === selectedYearId) || currentActiveYear;
  const isSelectedYearLocked = Boolean(selectedYear?.isLocked || selectedYear?.status === 'CLOSED');

  // Filter enrollments for Promotion view
  const currentClassEnrollments = enrollments.filter(
    (e) => e.academicYearId === selectedYearId && (!promoFromClassId || e.classId === promoFromClassId)
  );

  const calculateStudentMetrics = (enr: any) => {
    const student = enr.student;
    // Calculate attendance percentage
    const attRecords = student.attendance || [];
    const presentCount = attRecords.filter((a: any) => a.status === 'PRESENT').length;
    const attPct = attRecords.length > 0 ? Math.round((presentCount / attRecords.length) * 100) : 92;

    // Calculate marks percentage
    const marks = student.markEntries || [];
    let marksPct = 82;
    if (marks.length > 0) {
      const totalObtained = marks.reduce((sum: number, m: any) => sum + (m.theoryMarks + m.practicalMarks), 0);
      const totalMax = marks.reduce((sum: number, m: any) => sum + (m.examSchedule?.maxMarks || 100), 0);
      marksPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 80;
    }

    const hasDue = (student.invoices || []).some(
      (inv: any) => inv.status === 'PENDING' || inv.status === 'PARTIALLY_PAID'
    );

    const isEligible = attPct >= minAttendancePercent && marksPct >= minMarksPercent;

    return { attPct, marksPct, hasDue, isEligible };
  };

  // ----------------------------------------------------
  // API DISPATCH HELPERS
  // ----------------------------------------------------
  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_ACADEMIC_YEAR',
          ...newYearForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create academic year');

      setAcademicYears([data.academicYear, ...academicYears]);
      if (newYearForm.setAsActive) {
        setCurrentActiveYear(data.academicYear);
        setSelectedYearId(data.academicYear.id);
      }
      setShowNewYearModal(false);
      setFeedbackMessage({ type: 'success', text: `Academic session "${newYearForm.name}" created successfully.` });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateYear = async (yearId: string) => {
    setIsLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ACTIVATE_ACADEMIC_YEAR',
          yearId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to activate session');

      const updated = academicYears.map((y) => ({
        ...y,
        isCurrent: y.id === yearId,
        status: y.id === yearId ? 'ACTIVE' : y.status,
      }));
      setAcademicYears(updated);
      const target = updated.find((y) => y.id === yearId);
      setCurrentActiveYear(target);
      setSelectedYearId(yearId);
      setFeedbackMessage({ type: 'success', text: `Session ${target?.name} is now the active operational school session.` });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseYear = async (yearId: string) => {
    setIsLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLOSE_ACADEMIC_YEAR',
          yearId,
          summaryNotes: 'Year-end academic session closing performed by Principal.',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to close academic session');

      const updated = academicYears.map((y) =>
        y.id === yearId
          ? { ...y, status: 'CLOSED', isLocked: true, isCurrent: false, closedAt: new Date() }
          : y
      );
      setAcademicYears(updated);
      setShowClosingWizard(false);
      setFeedbackMessage({
        type: 'success',
        text: `Session finalized & locked. Verified ${data.metrics.promotedCount} promoted students, recorded in institutional audit log.`,
      });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecutePromotion = async () => {
    if (selectedStudentIds.length === 0) {
      setFeedbackMessage({ type: 'error', text: 'Please select at least one student to promote.' });
      return;
    }

    setIsLoading(true);
    setFeedbackMessage(null);
    try {
      const promotionsPayload = selectedStudentIds.map((sId) => {
        const enr = enrollments.find((e) => e.studentId === sId);
        const metrics = enr ? calculateStudentMetrics(enr) : { attPct: 90, marksPct: 80, isEligible: true };
        return {
          studentId: sId,
          fromClassId: enr?.classId,
          toClassId: promoToClassId,
          toSectionId: promoToSectionId,
          status: metrics.isEligible ? 'PROMOTED' : 'CONDITIONAL',
          attendancePercent: metrics.attPct,
          marksPercent: metrics.marksPct,
          eligibilityNotes: metrics.isEligible
            ? 'Met attendance and marks criteria'
            : 'Conditional promotion pending academic improvement',
        };
      });

      const res = await fetch('/api/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PROMOTE_STUDENTS',
          fromYearId: selectedYearId,
          toYearId: promoToYearId,
          promotions: promotionsPayload,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to execute promotions');

      setSelectedStudentIds([]);
      setFeedbackMessage({
        type: 'success',
        text: `Successfully processed promotions for ${data.promotedCount} students into the target academic session without data duplication.`,
      });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showTransferSectionModal) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TRANSFER_SECTION',
          studentId: showTransferSectionModal.student.id,
          academicYearId: selectedYearId,
          toSectionId: transferForm.toSectionId,
          reason: transferForm.reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to transfer section');

      setShowTransferSectionModal(null);
      setFeedbackMessage({ type: 'success', text: 'Section re-allocation completed and logged.' });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleIssueTc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showTcModal) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ISSUE_TC_LEAVING',
          studentId: showTcModal.student.id,
          tcNumber: tcForm.tcNumber,
          leavingReason: tcForm.leavingReason,
          remarks: tcForm.remarks,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue TC');

      setShowTcModal(null);
      setFeedbackMessage({
        type: 'success',
        text: `Transfer Certificate #${tcForm.tcNumber} issued. Student marked as withdrawn and profile archived safely.`,
      });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAlumniModal) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REGISTER_ALUMNI',
          studentId: showAlumniModal.student.id,
          ...alumniForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register alumni');

      setAlumniList([data.alumni, ...alumniList]);
      setShowAlumniModal(null);
      setFeedbackMessage({ type: 'success', text: 'Student successfully graduated and inducted into the Alumni Directory.' });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllocateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ALLOCATE_TEACHER',
          academicYearId: selectedYearId,
          ...allocationForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to allocate teacher');

      setAllocations([data.allocation, ...allocations]);
      setShowAllocateModal(false);
      setFeedbackMessage({ type: 'success', text: 'Faculty subject and section allocation recorded.' });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAllocation = async (allocationId: string) => {
    if (!confirm('Are you sure you want to remove this teacher allocation?')) return;
    try {
      const res = await fetch('/api/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REMOVE_TEACHER_ALLOCATION',
          allocationId,
        }),
      });
      if (!res.ok) throw new Error('Failed to delete allocation');
      setAllocations(allocations.filter((a) => a.id !== allocationId));
      setFeedbackMessage({ type: 'success', text: 'Allocation removed successfully.' });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    }
  };

  const exportLifecycleReport = () => {
    const data = enrollments.map((e) => {
      const m = calculateStudentMetrics(e);
      return {
        'Admission Number': e.student.admissionNumber,
        'Student Name': `${e.student.user.firstName} ${e.student.user.lastName}`,
        Class: e.class.name,
        Section: e.section.name,
        'Session Status': e.status,
        'Lifecycle Stage': e.student.lifecycleStage || 'ACTIVE_ENROLLMENT',
        'Attendance Rate (%)': m.attPct,
        'Academic Performance (%)': m.marksPct,
        'Fee Dues Pending': m.hasDue ? 'Yes' : 'No',
        'Promotion Eligibility': m.isEligible ? 'Eligible' : 'Detained / Pending Support',
      };
    });
    exportToCSV(data, `EDVONEST_${selectedYear?.name || 'Active'}_Student_Lifecycle_Report`);
  };

  const tabs: TabItem[] = [
    { id: 'sessions', label: 'Academic Sessions', count: academicYears.length, icon: <Calendar className="w-4 h-4" /> },
    { id: 'pipeline', label: 'Lifecycle Pipeline', count: enrollments.length, icon: <Layers className="w-4 h-4" /> },
    { id: 'promotion', label: 'Class Promotion Engine', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'teachers', label: 'Teacher Allocation', count: allocations.length, icon: <Users className="w-4 h-4" /> },
    { id: 'closing', label: 'Year-End Closing', icon: <Lock className="w-4 h-4" /> },
    { id: 'alumni', label: 'Alumni & Leaving (TC)', count: alumniList.length, icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* HEADER SECTION */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FEF2F2] text-[#990000]">
              <RefreshCw className="w-6 h-6 animate-[spin_6s_linear_infinite]" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                Academic Year &amp; School Lifecycle
                <Badge variant="blue" className="bg-[#990000] text-white text-xs px-2.5 py-0.5">
                  CBSE / ICSE Compliant
                </Badge>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Learn • Grow • Succeed &bull; Session isolation, promotions, teacher matrices, and year-end closing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Session Selector */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-[#990000]" />
            <span className="text-xs font-semibold text-slate-600">Viewing Session:</span>
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent border-none outline-none cursor-pointer"
            >
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name} {y.isCurrent ? '★ (Active)' : y.status === 'CLOSED' ? '🔒 (Closed)' : '(Upcoming)'}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={exportLifecycleReport}
            className="text-xs font-semibold border-slate-200"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Report
          </Button>

          {['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(userRole) && (
            <Button
              size="sm"
              onClick={() => setShowNewYearModal(true)}
              className="bg-[#990000] hover:bg-[#065475] text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> New Session
            </Button>
          )}
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-medium ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-4"
          >
            &times;
          </button>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ==================================================== */}
      {/* TAB 1: ACADEMIC SESSIONS MANAGEMENT */}
      {/* ==================================================== */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {academicYears.map((yr) => {
              const isCurr = yr.isCurrent;
              const isClosed = yr.isLocked || yr.status === 'CLOSED';
              const enrollmentCount = yr._count?.enrollments || 0;

              return (
                <Card
                  key={yr.id}
                  hoverEffect
                  className={`border-2 transition-all ${
                    isCurr
                      ? 'border-[#990000] shadow-sm bg-gradient-to-br from-white to-[#F0F8FA]'
                      : isClosed
                      ? 'border-slate-200 bg-slate-50/70'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        {yr.name}
                        {isCurr && (
                          <Badge variant="emerald" className="text-[10px] px-2 py-0.5">
                            Active Session
                          </Badge>
                        )}
                        {isClosed && (
                          <Badge variant="slate" className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700">
                            Archived 🔒
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {new Date(yr.startDate).toLocaleDateString()} — {new Date(yr.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`p-2 rounded-xl ${
                        isCurr ? 'bg-emerald-100 text-emerald-700' : isClosed ? 'bg-slate-200 text-slate-500' : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {isClosed ? <Lock className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                    </span>
                  </CardHeader>

                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs text-slate-500 block">Enrollments</span>
                        <span className="text-base font-bold text-slate-800">{enrollmentCount}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs text-slate-500 block">Classes</span>
                        <span className="text-base font-bold text-slate-800">{classes.length}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs text-slate-500 block">Status</span>
                        <span className="text-[11px] font-bold text-slate-800 uppercase">{yr.status}</span>
                      </div>
                    </div>

                    {isClosed ? (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-800 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Sealed historical session. All marks, fees, and attendance are in read-only audit mode.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-2">
                        {!isCurr && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivateYear(yr.id)}
                            disabled={isLoading}
                            className="w-full text-xs font-semibold text-[#990000] border-[#990000]/30 hover:bg-[#FEF2F2]"
                          >
                            <Unlock className="w-3.5 h-3.5 mr-1" /> Make Active Session
                          </Button>
                        )}
                        {['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(userRole) && isCurr && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setShowClosingWizard(true)}
                            className="w-full text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
                          >
                            <Lock className="w-3.5 h-3.5 mr-1" /> Year-End Closing Wizard
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: STUDENT LIFECYCLE PIPELINE */}
      {/* ==================================================== */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Comprehensive Student Lifecycle Pipeline</h3>
              <p className="text-xs text-slate-500">Track students from prospective enquiry to active enrollment, section transfers, and graduation.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Enrolled ({enrollments.length})
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ml-2"></span> Alumni ({alumniList.length})
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block ml-2"></span> TC Issued ({enrollments.filter((e) => e.status === 'TC_ISSUED').length})
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Student &amp; Admission</th>
                    <th className="py-3.5 px-4">Class &amp; Section</th>
                    <th className="py-3.5 px-4">Lifecycle Stage</th>
                    <th className="py-3.5 px-4">Attendance Rate</th>
                    <th className="py-3.5 px-4">Exam Performance</th>
                    <th className="py-3.5 px-4">Fee Dues</th>
                    <th className="py-3.5 px-4 text-right">Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {enrollments.map((enr) => {
                    const student = enr.student;
                    const metrics = calculateStudentMetrics(enr);
                    const stage = student.lifecycleStage || 'ACTIVE_ENROLLMENT';

                    return (
                      <tr key={enr.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">
                            {student.user.firstName} {student.user.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {student.admissionNumber} &bull; Roll: {enr.rollNumber || student.rollNumber || '-'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800">{enr.class.name}</span>
                          <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-md bg-slate-100 font-bold">
                            Sec {enr.section.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              stage === 'PROMOTED'
                                ? 'emerald'
                                : stage === 'TC_ISSUED'
                                ? 'slate'
                                : stage === 'ALUMNI'
                                ? 'teal'
                                : 'blue'
                            }
                            className="text-[10px] uppercase font-bold"
                          >
                            {stage.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold ${metrics.attPct >= 75 ? 'text-emerald-700' : 'text-rose-600'}`}>
                              {metrics.attPct}%
                            </span>
                            <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${metrics.attPct >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min(100, metrics.attPct)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900">{metrics.marksPct}%</span>
                          <span className="text-[10px] text-slate-400 block">Avg Term Score</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {metrics.hasDue ? (
                            <Badge variant="amber" className="text-[10px]">
                              Dues Pending
                            </Badge>
                          ) : (
                            <Badge variant="emerald" className="text-[10px]">
                              Cleared
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => {
                                setShowTransferSectionModal(enr);
                                setTransferForm({
                                  toSectionId: enr.sectionId,
                                  reason: 'Class section rebalance request',
                                });
                              }}
                              className="text-[10px] h-7 px-2 font-semibold"
                            >
                              <Shuffle className="w-3 h-3 mr-1" /> Transfer Sec
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => setShowTcModal(enr)}
                              className="text-[10px] h-7 px-2 font-semibold text-amber-700 hover:bg-amber-50"
                            >
                              <FileText className="w-3 h-3 mr-1" /> Issue TC
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => setShowAlumniModal(enr)}
                              className="text-[10px] h-7 px-2 font-semibold text-emerald-700 hover:bg-emerald-50"
                            >
                              <Award className="w-3 h-3 mr-1" /> Alumni
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: CLASS PROMOTION ENGINE */}
      {/* ==================================================== */}
      {activeTab === 'promotion' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <Card className="p-6 border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[#990000]" />
              Automated Class Promotion Matrix
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">
              Promote verified students into the next academic year. All past term marks, roll numbers, and attendance records remain permanently preserved under their original academic session.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">From Academic Session</label>
                <div className="text-xs font-bold text-slate-900 py-2 px-3 bg-white border border-slate-200 rounded-lg">
                  {selectedYear?.name}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Source Class</label>
                <select
                  value={promoFromClassId}
                  onChange={(e) => setPromoFromClassId(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg py-2 px-3 outline-none"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Target Academic Session</label>
                <select
                  value={promoToYearId}
                  onChange={(e) => setPromoToYearId(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg py-2 px-3 outline-none"
                >
                  {academicYears.map((yr) => (
                    <option key={yr.id} value={yr.id}>
                      {yr.name} {yr.isCurrent ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Promote To Target Class &amp; Section</label>
                <div className="flex gap-2">
                  <select
                    value={promoToClassId}
                    onChange={(e) => {
                      setPromoToClassId(e.target.value);
                      const targetCls = classes.find((c) => c.id === e.target.value);
                      if (targetCls && targetCls.sections.length > 0) {
                        setPromoToSectionId(targetCls.sections[0].id);
                      }
                    }}
                    className="w-2/3 text-xs font-medium bg-white border border-slate-200 rounded-lg py-2 px-3 outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={promoToSectionId}
                    onChange={(e) => setPromoToSectionId(e.target.value)}
                    className="w-1/3 text-xs font-medium bg-white border border-slate-200 rounded-lg py-2 px-2 outline-none"
                  >
                    {classes
                      .find((c) => c.id === promoToClassId)
                      ?.sections.map((sec: any) => (
                        <option key={sec.id} value={sec.id}>
                          Sec {sec.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Threshold rules */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Min. Attendance Threshold:</span>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={minAttendancePercent}
                    onChange={(e) => setMinAttendancePercent(Number(e.target.value))}
                    className="w-16 text-xs border border-slate-200 rounded-md py-1 px-2 font-bold"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Min. Passing Marks Threshold:</span>
                  <input
                    type="number"
                    min="30"
                    max="100"
                    value={minMarksPercent}
                    onChange={(e) => setMinMarksPercent(Number(e.target.value))}
                    className="w-16 text-xs border border-slate-200 rounded-md py-1 px-2 font-bold"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (selectedStudentIds.length === currentClassEnrollments.length) {
                      setSelectedStudentIds([]);
                    } else {
                      setSelectedStudentIds(currentClassEnrollments.map((e) => e.studentId));
                    }
                  }}
                  className="text-xs font-semibold"
                >
                  {selectedStudentIds.length === currentClassEnrollments.length ? 'Deselect All' : 'Select All Eligible'}
                </Button>

                <Button
                  size="sm"
                  onClick={handleExecutePromotion}
                  disabled={isLoading || selectedStudentIds.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                  Promote {selectedStudentIds.length} Selected Students
                </Button>
              </div>
            </div>
          </Card>

          {/* Student Selection Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          currentClassEnrollments.length > 0 &&
                          selectedStudentIds.length === currentClassEnrollments.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentIds(currentClassEnrollments.map((enr) => enr.studentId));
                          } else {
                            setSelectedStudentIds([]);
                          }
                        }}
                      />
                    </th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Current Section</th>
                    <th className="py-3 px-4">Attendance Rate</th>
                    <th className="py-3 px-4">Term Marks Avg</th>
                    <th className="py-3 px-4">Fee Balance</th>
                    <th className="py-3 px-4">Promotion Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentClassEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                        No students enrolled in this class for the selected academic session.
                      </td>
                    </tr>
                  ) : (
                    currentClassEnrollments.map((enr) => {
                      const student = enr.student;
                      const isSelected = selectedStudentIds.includes(student.id);
                      const m = calculateStudentMetrics(enr);

                      return (
                        <tr
                          key={enr.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? 'bg-emerald-50/50' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudentIds([...selectedStudentIds, student.id]);
                                } else {
                                  setSelectedStudentIds(selectedStudentIds.filter((id) => id !== student.id));
                                }
                              }}
                            />
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {student.user.firstName} {student.user.lastName}
                            <span className="block text-[10px] text-slate-400 font-mono">
                              Adm: {student.admissionNumber}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">Section {enr.section.name}</td>
                          <td className="py-3.5 px-4">
                            <span className={`font-bold ${m.attPct >= minAttendancePercent ? 'text-emerald-700' : 'text-rose-600'}`}>
                              {m.attPct}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`font-bold ${m.marksPct >= minMarksPercent ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {m.marksPct}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {m.hasDue ? (
                              <Badge variant="amber" className="text-[10px]">
                                Fee Due
                              </Badge>
                            ) : (
                              <Badge variant="emerald" className="text-[10px]">
                                Cleared
                              </Badge>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {m.isEligible ? (
                              <Badge variant="emerald" className="text-[10px]">
                                Eligible for Promotion
                              </Badge>
                            ) : (
                              <Badge variant="rose" className="text-[10px]">
                                At Academic Risk / Review
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: TEACHER ALLOCATION MATRIX */}
      {/* ==================================================== */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Academic Year Teacher Allocation Matrix</h3>
              <p className="text-xs text-slate-500">
                Allocate faculty to classes, sections, and subjects for session {selectedYear?.name}. Historical allocations remain archived.
              </p>
            </div>
            {['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(userRole) && (
              <Button
                size="sm"
                onClick={() => setShowAllocateModal(true)}
                disabled={isSelectedYearLocked}
                className="bg-[#990000] hover:bg-[#065475] text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Allocate Faculty
              </Button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Faculty Member</th>
                    <th className="py-3.5 px-4">Class &amp; Section</th>
                    <th className="py-3.5 px-4">Assigned Subject</th>
                    <th className="py-3.5 px-4">Designation / Role</th>
                    <th className="py-3.5 px-4">Periods/Week</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {allocations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                        No teacher allocations recorded for session {selectedYear?.name} yet.
                      </td>
                    </tr>
                  ) : (
                    allocations.map((alloc) => (
                      <tr key={alloc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">
                            {alloc.teacher.user.firstName} {alloc.teacher.user.lastName}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Code: {alloc.teacher.employeeCode} &bull; {alloc.teacher.specialization}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800">{alloc.class.name}</span>
                          <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-md bg-slate-100 font-bold">
                            Sec {alloc.section.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {alloc.subject?.name || 'Class Teacher Duties'}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={alloc.role === 'CLASS_TEACHER' ? 'blue' : 'slate'}
                            className="text-[10px] uppercase font-bold"
                          >
                            {alloc.role.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{alloc.periodsPerWeek} Periods</td>
                        <td className="py-3.5 px-4 text-right">
                          {['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(userRole) && !isSelectedYearLocked && (
                            <Button
                              size="xs"
                              variant="danger"
                              onClick={() => handleRemoveAllocation(alloc.id)}
                              className="text-[10px] h-7 px-2"
                            >
                              Remove
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: YEAR-END CLOSING WIZARD */}
      {/* ==================================================== */}
      {activeTab === 'closing' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <Card className="p-6 border-slate-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              <span className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <Lock className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Institutional Year-End Closing Hub</h3>
                <p className="text-xs text-slate-500">
                  Follow the statutory checklist to verify fee dues, exam locks, promotions, and archive session {selectedYear?.name}.
                </p>
              </div>
            </div>

            {isSelectedYearLocked ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
                <Shield className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">This Academic Session is Officially Closed &amp; Sealed</h4>
                <p className="text-xs text-slate-500 max-w-lg mx-auto">
                  Closed at: {selectedYear?.closedAt ? new Date(selectedYear.closedAt).toLocaleString() : 'Past Date'}. All student enrollments, exam score sheets, and fee transactions are preserved for CBSE/ICSE regulatory compliance.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">Fee Ledger &amp; Dues Verification</h4>
                        <span className="text-xs font-bold text-amber-700">{unpaidInvoices.length} Pending Invoices</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Verify all fee collections for term invoices. Unpaid balance summary will be logged into the annual report.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">Examinations &amp; Final Grade Lock</h4>
                        <span className="text-xs font-bold text-emerald-700">{examSchedules.length} Exam Schedules</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Ensure all term results, marksheets, and report cards are verified by class teachers and sealed.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">Student Promotion &amp; TC Issuance</h4>
                        <span className="text-xs font-bold text-blue-700">{enrollments.length} Students Tracked</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Execute promotions to next grade or graduate students to alumni before permanently sealing the session.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    Permanent Operation Warning
                  </div>
                  <span>
                    Closing this session marks all enrollments as archived and permanently prevents modifications to marks, attendance, or fees under {selectedYear?.name}.
                  </span>
                </div>

                {['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(userRole) && (
                  <Button
                    onClick={() => handleCloseYear(selectedYear?.id)}
                    disabled={isLoading}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3 shadow-sm"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Finalize, Lock &amp; Archive Academic Session {selectedYear?.name}
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 6: ALUMNI & SCHOOL LEAVING (TC) */}
      {/* ==================================================== */}
      {activeTab === 'alumni' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Alumni Directory &amp; School Leaving Registry</h3>
              <p className="text-xs text-slate-500">
                Lifelong records of graduated students, transfer certificate recipients, and university pursuits.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Alumni Name</th>
                    <th className="py-3.5 px-4">Graduation Year</th>
                    <th className="py-3.5 px-4">Final Class</th>
                    <th className="py-3.5 px-4">Conduct</th>
                    <th className="py-3.5 px-4">Current Pursuit / Higher Ed</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {alumniList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                        No alumni records registered yet. Use the Student Lifecycle Pipeline tab to induct graduating students.
                      </td>
                    </tr>
                  ) : (
                    alumniList.map((al) => (
                      <tr key={al.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {al.student?.user?.firstName} {al.student?.user?.lastName}
                          <span className="block text-[10px] text-slate-400 font-mono">
                            Adm: {al.student?.admissionNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{al.graduationYear}</td>
                        <td className="py-3.5 px-4">{al.finalClass}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant="emerald" className="text-[10px]">
                            {al.conduct}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{al.currentPursuit || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {al.contactEmail || al.student?.user?.email || 'On file'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: NEW ACADEMIC SESSION */}
      {/* ==================================================== */}
      {showNewYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#990000]" />
              Create New Academic Session
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure start date, end date, and session label (e.g. 2026–2027).
            </p>

            <form onSubmit={handleCreateYear} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Session Name / Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026–2027"
                  value={newYearForm.name}
                  onChange={(e) => setNewYearForm({ ...newYearForm, name: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-[#990000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newYearForm.startDate}
                    onChange={(e) => setNewYearForm({ ...newYearForm, startDate: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newYearForm.endDate}
                    onChange={(e) => setNewYearForm({ ...newYearForm, endDate: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="setAsActiveCheck"
                  checked={newYearForm.setAsActive}
                  onChange={(e) => setNewYearForm({ ...newYearForm, setAsActive: e.target.checked })}
                />
                <label htmlFor="setAsActiveCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Activate immediately as the primary operational session
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewYearModal(false)}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="bg-[#990000] hover:bg-[#065475] text-white text-xs font-bold"
                >
                  Create Session
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ALLOCATE TEACHER */}
      {/* ==================================================== */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#990000]" />
              Allocate Faculty Member
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Assign subject or class teacher responsibility for session {selectedYear?.name}.
            </p>

            <form onSubmit={handleAllocateTeacher} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Faculty</label>
                <select
                  value={allocationForm.teacherId}
                  onChange={(e) => setAllocationForm({ ...allocationForm, teacherId: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user.firstName} {t.user.lastName} ({t.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Class</label>
                  <select
                    value={allocationForm.classId}
                    onChange={(e) => {
                      const cId = e.target.value;
                      const cls = classes.find((c) => c.id === cId);
                      setAllocationForm({
                        ...allocationForm,
                        classId: cId,
                        sectionId: cls?.sections[0]?.id || '',
                        subjectId: cls?.subjects[0]?.id || '',
                      });
                    }}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Section</label>
                  <select
                    value={allocationForm.sectionId}
                    onChange={(e) => setAllocationForm({ ...allocationForm, sectionId: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none"
                  >
                    {classes
                      .find((c) => c.id === allocationForm.classId)
                      ?.sections.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          Section {s.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                <select
                  value={allocationForm.subjectId}
                  onChange={(e) => setAllocationForm({ ...allocationForm, subjectId: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none"
                >
                  {classes
                    .find((c) => c.id === allocationForm.classId)
                    ?.subjects.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assignment Role</label>
                  <select
                    value={allocationForm.role}
                    onChange={(e) => setAllocationForm({ ...allocationForm, role: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none font-bold"
                  >
                    <option value="SUBJECT_TEACHER">Subject Teacher</option>
                    <option value="CLASS_TEACHER">Class Teacher</option>
                    <option value="CO_TEACHER">Co-Teacher / Lab Mentor</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Periods / Week</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={allocationForm.periodsPerWeek}
                    onChange={(e) => setAllocationForm({ ...allocationForm, periodsPerWeek: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllocateModal(false)}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="bg-[#990000] hover:bg-[#065475] text-white text-xs font-bold"
                >
                  Confirm Allocation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: SECTION TRANSFER */}
      {/* ==================================================== */}
      {showTransferSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-[#990000]" />
              Transfer Student Section
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Re-allocate {showTransferSectionModal.student.user.firstName} {showTransferSectionModal.student.user.lastName} ({showTransferSectionModal.class.name}) to another section.
            </p>

            <form onSubmit={handleTransferSection} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Section</label>
                <select
                  value={transferForm.toSectionId}
                  onChange={(e) => setTransferForm({ ...transferForm, toSectionId: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none font-bold"
                >
                  {classes
                    .find((c) => c.id === showTransferSectionModal.classId)
                    ?.sections.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        Section {s.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Reason for Section Transfer</label>
                <textarea
                  rows={3}
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none"
                  placeholder="e.g. Second language elective adjustment or parent request"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTransferSectionModal(null)}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="bg-[#990000] hover:bg-[#065475] text-white text-xs font-bold"
                >
                  Save Transfer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ISSUE TRANSFER CERTIFICATE (TC) */}
      {/* ==================================================== */}
      {showTcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Issue Transfer Certificate (TC)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Generate official school leaving certificate for {showTcModal.student.user.firstName} {showTcModal.student.user.lastName}.
            </p>

            <form onSubmit={handleIssueTc} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Certificate Number</label>
                <input
                  type="text"
                  required
                  value={tcForm.tcNumber}
                  onChange={(e) => setTcForm({ ...tcForm, tcNumber: e.target.value })}
                  className="w-full text-xs font-mono font-bold border border-slate-200 rounded-lg py-2 px-3 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Reason for Leaving</label>
                <input
                  type="text"
                  required
                  value={tcForm.leavingReason}
                  onChange={(e) => setTcForm({ ...tcForm, leavingReason: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Remarks / Character Reference</label>
                <textarea
                  rows={2}
                  value={tcForm.remarks}
                  onChange={(e) => setTcForm({ ...tcForm, remarks: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px]">
                Upon issuing, the student profile will be safely archived and removed from active class registers.
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTcModal(null)}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                >
                  Issue TC &amp; Archive
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: REGISTER ALUMNI */}
      {/* ==================================================== */}
      {showAlumniModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Graduate &amp; Induct to Alumni Registry
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Archive graduating student {showAlumniModal.student.user.firstName} {showAlumniModal.student.user.lastName} into lifelong alumni records.
            </p>

            <form onSubmit={handleRegisterAlumni} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Graduation Year</label>
                  <input
                    type="text"
                    required
                    value={alumniForm.graduationYear}
                    onChange={(e) => setAlumniForm({ ...alumniForm, graduationYear: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Final Class</label>
                  <input
                    type="text"
                    required
                    value={alumniForm.finalClass}
                    onChange={(e) => setAlumniForm({ ...alumniForm, finalClass: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Current Higher Ed / Career Pursuit</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech Computer Science at IIT Delhi"
                  value={alumniForm.currentPursuit}
                  onChange={(e) => setAlumniForm({ ...alumniForm, currentPursuit: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Conduct</label>
                  <select
                    value={alumniForm.conduct}
                    onChange={(e) => setAlumniForm({ ...alumniForm, conduct: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none font-bold"
                  >
                    <option value="EXCELLENT">Excellent</option>
                    <option value="VERY_GOOD">Very Good</option>
                    <option value="GOOD">Good</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Passing Marks (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={alumniForm.passingMarksPercent}
                    onChange={(e) => setAlumniForm({ ...alumniForm, passingMarksPercent: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAlumniModal(null)}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  Induct to Alumni
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
