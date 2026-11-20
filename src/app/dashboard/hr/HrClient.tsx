'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  CalendarCheck,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  FileText,
  Building,
  Plus,
  ArrowRightLeft,
  Star,
  Award,
  BarChart2,
  Calendar,
  UserCheck,
  History,
  ShieldAlert,
  Layers,
  Briefcase,
  RotateCcw,
  Trash2,
  AlertTriangle,
  TrendingUp,
  UserPlus,
  ChevronRight,
  Filter,
  Check,
  Search,
  BookOpen,
} from 'lucide-react';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { showToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/formatters';

const getUserFullName = (u?: { firstName?: string; lastName?: string; name?: string } | null, fallback = 'Staff') => {
  if (!u) return fallback;
  if (u.firstName) return `${u.firstName} ${u.lastName || ''}`.trim();
  if (u.name) return u.name;
  return fallback;
};

export interface HrClientProps {
  teachers: any[];
  staff: any[];
  leaves: any[];
  salarySlips: any[];
  substitutes: any[];
  attendanceRecords: any[];
  appraisals: any[];
  sections: any[];
  academicYears: any[];
  classes: any[];
  departments: any[];
  subjects: any[];
  userRole: string;
}

export const HrClient: React.FC<HrClientProps> = ({
  teachers: initialTeachers,
  staff: initialStaff,
  leaves: initialLeaves,
  salarySlips,
  substitutes: initialSubstitutes,
  attendanceRecords: initialAttendance,
  appraisals: initialAppraisals,
  sections,
  academicYears = [],
  classes = [],
  departments = [],
  subjects = [],
  userRole,
}) => {
  // Navigation & Data States
  const [activeTab, setActiveTab] = useState('directory');
  const [teachers, setTeachers] = useState(initialTeachers);
  const [staff, setStaff] = useState(initialStaff);
  const [leaves, setLeaves] = useState(initialLeaves);
  const [substitutes, setSubstitutes] = useState(initialSubstitutes);
  const [appraisals, setAppraisals] = useState(initialAppraisals);

  // Status Filter in Directory
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Academic Year selection for teaching allocations
  const defaultYearId = academicYears.find((y) => y.isCurrent)?.id || academicYears[0]?.id || '';
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState(defaultYearId);

  // 360° Staff Profile Drawer / Modal
  const [selectedStaffProfile, setSelectedStaffProfile] = useState<any | null>(null);
  const [profileSubTab, setProfileSubTab] = useState<'overview' | 'assignments' | 'salary' | 'lifecycle'>('overview');

  // Action Modals
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isAppraisalModalOpen, setIsAppraisalModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isBulkAllocateModalOpen, setIsBulkAllocateModalOpen] = useState(false);
  const [isLifecycleModalOpen, setIsLifecycleModalOpen] = useState(false);
  const [isRejoinModalOpen, setIsRejoinModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isDesignationModalOpen, setIsDesignationModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);

  // Substitute Form
  const [subForm, setSubForm] = useState({
    absentTeacherId: teachers[0]?.id || '',
    substituteTeacherId: teachers[1]?.id || teachers[0]?.id || '',
    sectionId: sections[0]?.id || '',
    periodIndex: 2,
    date: new Date().toISOString().split('T')[0],
  });

  // Appraisal Form
  const [appraisalForm, setAppraisalForm] = useState({
    teacherProfileId: teachers[0]?.id || '',
    appraisalYear: '2025-2026',
    teachingQualityScore: '4.8',
    studentFeedbackScore: '4.7',
    administrativeScore: '4.5',
    finalRating: 'OUTSTANDING',
    reviewRemarks: 'Excellent classroom delivery, 100% CBSE syllabus completion, highly rated by students.',
  });

  // Teaching Allocation Form
  const [allocForm, setAllocForm] = useState({
    teacherId: teachers[0]?.id || '',
    academicYearId: defaultYearId,
    classId: classes[0]?.id || '',
    sectionId: classes[0]?.sections?.[0]?.id || sections[0]?.id || '',
    subjectId: subjects[0]?.id || '',
    role: 'SUBJECT_TEACHER',
    periodsPerWeek: 5,
  });

  // Timetable Clash Check State
  const [clashCheckState, setClashCheckState] = useState<{
    dayOfWeek: string;
    periodIndex: number;
    checking: boolean;
    result: { hasClash: boolean; clashDetails: string | null } | null;
  }>({
    dayOfWeek: 'MONDAY',
    periodIndex: 1,
    checking: false,
    result: null,
  });

  // Bulk Allocate Form
  const [bulkAllocForm, setBulkAllocForm] = useState({
    sourceAcademicYearId: academicYears[0]?.id || '',
    targetAcademicYearId: academicYears[1]?.id || academicYears[0]?.id || '',
  });

  // Lifecycle Status Form
  const [lifecycleForm, setLifecycleForm] = useState({
    newStatus: 'ON_LEAVE',
    effectiveDate: new Date().toISOString().split('T')[0],
    exitReason: '',
    lifecycleNotes: '',
  });

  // Rejoin Form
  const [rejoinRemarks, setRejoinRemarks] = useState('');

  // Transfer Dept Form
  const [transferDeptId, setTransferDeptId] = useState(departments[0]?.id || '');
  const [transferRemarks, setTransferRemarks] = useState('');

  // Designation Change Form
  const [newDesignation, setNewDesignation] = useState('');
  const [designationRemarks, setDesignationRemarks] = useState('');

  // Salary Revision Form
  const [salaryRevisionForm, setSalaryRevisionForm] = useState({
    newSalary: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: 'Annual Performance Appraisal Revision',
  });

  // Add Teacher Form
  const [newTeacherForm, setNewTeacherForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeCode: '',
    designation: 'TGT',
    department: 'Academics',
    qualification: 'M.Sc, B.Ed',
    basicSalary: 55000,
  });

  const [isActionLoading, setIsActionLoading] = useState(false);

  // Flattened all allocations across teachers
  const allAllocations = useMemo(() => {
    const list: any[] = [];
    teachers.forEach((t) => {
      if (t.teacherAllocations && Array.isArray(t.teacherAllocations)) {
        t.teacherAllocations.forEach((alloc: any) => {
          list.push({
            ...alloc,
            teacher: t,
          });
        });
      }
    });
    return list;
  }, [teachers]);

  // Filtered allocations for selected academic year
  const yearAllocations = useMemo(() => {
    if (!selectedAcademicYearId) return allAllocations;
    return allAllocations.filter((a) => a.academicYearId === selectedAcademicYearId);
  }, [allAllocations, selectedAcademicYearId]);

  // Normalized Directory Employees
  const allEmployees = useMemo(() => {
    const tList = teachers.map((t) => ({
      id: t.id,
      code: t.employeeCode,
      name: getUserFullName(t.user),
      firstName: t.user?.firstName || '',
      lastName: t.user?.lastName || '',
      role: t.designation || 'Teaching Faculty',
      dept: t.department?.name || 'Academics',
      departmentId: t.departmentId,
      qualification: t.qualification || 'M.Sc, B.Ed',
      salary: t.basicSalary || 52000,
      phone: t.user?.phone,
      email: t.user?.email,
      status: t.status || 'ACTIVE',
      joiningDate: t.joiningDate,
      rejoiningDate: t.rejoiningDate,
      resignationDate: t.resignationDate,
      retirementDate: t.retirementDate,
      terminationDate: t.terminationDate,
      exitReason: t.exitReason,
      lifecycleNotes: t.lifecycleNotes,
      teacherAllocations: t.teacherAllocations || [],
      salaryHistory: t.salaryHistory || [],
      lifecycleLogs: t.lifecycleLogs || [],
      sections: t.sections || [],
      profileType: 'TEACHER',
      raw: t,
    }));

    const sList = staff.map((s) => ({
      id: s.id,
      code: s.employeeCode,
      name: getUserFullName(s.user),
      firstName: s.user?.firstName || '',
      lastName: s.user?.lastName || '',
      role: s.designation || 'Staff',
      dept: s.department?.name || 'Administration',
      departmentId: s.departmentId,
      qualification: 'Diploma / Graduate',
      salary: s.basicSalary || 32000,
      phone: s.user?.phone,
      email: s.user?.email,
      status: s.status || 'ACTIVE',
      joiningDate: s.joiningDate,
      rejoiningDate: s.rejoiningDate,
      resignationDate: s.resignationDate,
      retirementDate: s.retirementDate,
      terminationDate: s.terminationDate,
      exitReason: s.exitReason,
      lifecycleNotes: s.lifecycleNotes,
      teacherAllocations: [],
      salaryHistory: s.salaryHistory || [],
      lifecycleLogs: s.lifecycleLogs || [],
      sections: [],
      profileType: 'STAFF',
      raw: s,
    }));

    return [...tList, ...sList];
  }, [teachers, staff]);

  // Filtered Directory Employees based on statusFilter
  const filteredEmployees = useMemo(() => {
    if (statusFilter === 'ALL') return allEmployees;
    if (statusFilter === 'EXITED') {
      return allEmployees.filter((e) => ['RESIGNED', 'RETIRED', 'TERMINATED'].includes(e.status));
    }
    return allEmployees.filter((e) => e.status === statusFilter);
  }, [allEmployees, statusFilter]);

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="emerald">Active</Badge>;
      case 'ON_LEAVE':
        return <Badge variant="amber">On Leave</Badge>;
      case 'TRANSFERRED':
        return <Badge variant="blue">Transferred</Badge>;
      case 'RESIGNED':
        return <Badge variant="slate">Resigned</Badge>;
      case 'RETIRED':
        return <Badge variant="purple">Retired</Badge>;
      case 'TERMINATED':
        return <Badge variant="rose">Terminated</Badge>;
      case 'ARCHIVED':
        return <Badge variant="slate">Archived</Badge>;
      default:
        return <Badge variant="emerald">{status}</Badge>;
    }
  };

  // Open 360 Profile
  const openStaffProfile = (employee: any) => {
    setSelectedStaffProfile(employee);
    setProfileSubTab('overview');
  };

  // Synchronize state when selected staff profile gets updated
  const refreshEmployeeInState = (updatedEmployee: any) => {
    if (updatedEmployee.profileType === 'TEACHER') {
      setTeachers((prev) =>
        prev.map((t) => (t.id === updatedEmployee.id ? { ...t, ...updatedEmployee.raw } : t))
      );
    } else {
      setStaff((prev) =>
        prev.map((s) => (s.id === updatedEmployee.id ? { ...s, ...updatedEmployee.raw } : s))
      );
    }
    setSelectedStaffProfile(updatedEmployee);
  };

  // Tab definitions
  const tabs: TabItem[] = [
    {
      id: 'directory',
      label: 'Staff Directory & Dossiers',
      count: filteredEmployees.length,
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'allocations',
      label: 'Teaching Assignments & Allocations',
      count: yearAllocations.length,
      icon: <Layers className="w-4 h-4 text-[#086A92]" />,
    },
    {
      id: 'workload',
      label: 'Workload Analytics',
      count: teachers.length,
      icon: <BarChart2 className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'substitutes',
      label: 'Substitute Allocator',
      count: substitutes.length,
      icon: <ArrowRightLeft className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'attendance',
      label: 'Biometric Attendance',
      count: initialAttendance.length,
      icon: <UserCheck className="w-4 h-4 text-teal-600" />,
    },
    {
      id: 'appraisals',
      label: 'Appraisals & Merit',
      count: appraisals.length,
      icon: <Award className="w-4 h-4 text-purple-600" />,
    },
    {
      id: 'leaves',
      label: 'Leave Applications',
      count: leaves.filter((l) => l.status === 'PENDING').length,
      icon: <CalendarCheck className="w-4 h-4 text-rose-500" />,
    },
    {
      id: 'payroll',
      label: 'Payroll Ledger',
      count: salarySlips.length,
      icon: <DollarSign className="w-4 h-4 text-emerald-700" />,
    },
  ];

  // -------------------------------------------------------------
  // API Handlers
  // -------------------------------------------------------------

  // 1. Timetable Clash Check
  const handleCheckClash = async () => {
    if (!allocForm.teacherId) {
      showToast('Select a faculty member first', 'error');
      return;
    }
    setClashCheckState((prev) => ({ ...prev, checking: true, result: null }));
    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHECK_TIMETABLE_CLASH',
          teacherId: allocForm.teacherId,
          dayOfWeek: clashCheckState.dayOfWeek,
          periodIndex: clashCheckState.periodIndex,
          academicYearId: allocForm.academicYearId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setClashCheckState((prev) => ({
          ...prev,
          checking: false,
          result: { hasClash: data.hasClash, clashDetails: data.clashDetails },
        }));
      } else {
        showToast(data.error || 'Failed to check timetable clash', 'error');
        setClashCheckState((prev) => ({ ...prev, checking: false }));
      }
    } catch (e: any) {
      showToast(e.message || 'Timetable clash check error', 'error');
      setClashCheckState((prev) => ({ ...prev, checking: false }));
    }
  };

  // 2. Allocate Teaching Assignment
  const handleAllocateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ALLOCATE_TEACHING_ASSIGNMENT',
          ...allocForm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const newAlloc = data.allocation;
        setTeachers((prev) =>
          prev.map((t) => {
            if (t.id === allocForm.teacherId) {
              const prevAllocs = t.teacherAllocations || [];
              return {
                ...t,
                teacherAllocations: [newAlloc, ...prevAllocs],
              };
            }
            return t;
          })
        );
        setIsAllocateModalOpen(false);
        showToast('Teaching assignment successfully allocated', 'success');
      } else {
        showToast(data.error || 'Failed to allocate teaching assignment', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Allocation failed', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 3. Remove Teaching Assignment
  const handleRemoveAssignment = async (allocationId: string, teacherId: string) => {
    if (!confirm('Are you sure you want to remove this teaching assignment? Previous academic year allocations will remain archived.')) {
      return;
    }
    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REMOVE_TEACHING_ASSIGNMENT',
          allocationId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTeachers((prev) =>
          prev.map((t) => {
            if (t.id === teacherId) {
              return {
                ...t,
                teacherAllocations: (t.teacherAllocations || []).filter((a: any) => a.id !== allocationId),
              };
            }
            return t;
          })
        );
        if (selectedStaffProfile && selectedStaffProfile.id === teacherId) {
          setSelectedStaffProfile((prev: any) => ({
            ...prev,
            teacherAllocations: (prev.teacherAllocations || []).filter((a: any) => a.id !== allocationId),
          }));
        }
        showToast('Teaching assignment removed', 'success');
      } else {
        showToast(data.error || 'Failed to remove assignment', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // 4. Bulk Carry Forward Allocations to New Academic Year
  const handleBulkAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkAllocForm.sourceAcademicYearId === bulkAllocForm.targetAcademicYearId) {
      showToast('Source and Target academic years must be different', 'error');
      return;
    }
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BULK_ALLOCATE_NEW_YEAR',
          ...bulkAllocForm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Carried forward ${data.count} teacher allocations`, 'success');
        setIsBulkAllocateModalOpen(false);
        // Refresh page to load new allocations cleanly
        window.location.reload();
      } else {
        showToast(data.error || 'Failed to bulk carry forward', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Bulk allocation failed', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 5. Update Lifecycle Status (Leave, Resign, Retire, Terminate, Archive)
  const handleUpdateLifecycleStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffProfile) return;
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_LIFECYCLE_STATUS',
          profileType: selectedStaffProfile.profileType,
          profileId: selectedStaffProfile.id,
          ...lifecycleForm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Lifecycle status updated', 'success');
        setIsLifecycleModalOpen(false);
        const updated = {
          ...selectedStaffProfile,
          status: lifecycleForm.newStatus,
          exitReason: lifecycleForm.exitReason,
          lifecycleNotes: lifecycleForm.lifecycleNotes,
        };
        refreshEmployeeInState(updated);
      } else {
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 6. Rejoin Staff
  const handleRejoinStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffProfile) return;
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJOIN_STAFF',
          profileType: selectedStaffProfile.profileType,
          profileId: selectedStaffProfile.id,
          remarks: rejoinRemarks,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Staff rejoined successfully under permanent ID', 'success');
        setIsRejoinModalOpen(false);
        const updated = {
          ...selectedStaffProfile,
          status: 'ACTIVE',
          rejoiningDate: new Date().toISOString(),
          exitReason: null,
        };
        refreshEmployeeInState(updated);
      } else {
        showToast(data.error || 'Failed to rejoin staff', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 7. Department Transfer
  const handleTransferDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffProfile || !transferDeptId) return;
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TRANSFER_DEPARTMENT',
          profileType: selectedStaffProfile.profileType,
          profileId: selectedStaffProfile.id,
          departmentId: transferDeptId,
          remarks: transferRemarks,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const targetDept = departments.find((d) => d.id === transferDeptId);
        showToast(`Department transferred to ${targetDept?.name || 'new department'}`, 'success');
        setIsDeptModalOpen(false);
        const updated = {
          ...selectedStaffProfile,
          dept: targetDept?.name || selectedStaffProfile.dept,
          departmentId: transferDeptId,
        };
        refreshEmployeeInState(updated);
      } else {
        showToast(data.error || 'Failed to transfer department', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 8. Designation Change
  const handleChangeDesignation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffProfile || !newDesignation) return;
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHANGE_DESIGNATION',
          profileType: selectedStaffProfile.profileType,
          profileId: selectedStaffProfile.id,
          designation: newDesignation,
          remarks: designationRemarks,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Designation updated to ${newDesignation}`, 'success');
        setIsDesignationModalOpen(false);
        const updated = {
          ...selectedStaffProfile,
          role: newDesignation,
        };
        refreshEmployeeInState(updated);
      } else {
        showToast(data.error || 'Failed to change designation', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 9. Revise Salary
  const handleReviseSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffProfile || !salaryRevisionForm.newSalary) return;
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REVISE_SALARY',
          profileType: selectedStaffProfile.profileType,
          profileId: selectedStaffProfile.id,
          ...salaryRevisionForm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Salary revised successfully', 'success');
        setIsSalaryModalOpen(false);
        const newAmt = parseFloat(salaryRevisionForm.newSalary);
        const updated = {
          ...selectedStaffProfile,
          salary: newAmt,
          salaryHistory: [
            {
              id: `temp-${Date.now()}`,
              previousSalary: selectedStaffProfile.salary,
              newSalary: newAmt,
              effectiveDate: salaryRevisionForm.effectiveDate,
              reason: salaryRevisionForm.reason,
              revisedBy: userRole,
            },
            ...(selectedStaffProfile.salaryHistory || []),
          ],
        };
        refreshEmployeeInState(updated);
      } else {
        showToast(data.error || 'Failed to revise salary', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 10. Add New Teacher
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_TEACHER',
          ...newTeacherForm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Teacher profile created with permanent code ${data.teacher?.employeeCode}`, 'success');
        setIsAddTeacherModalOpen(false);
        window.location.reload();
      } else {
        showToast(data.error || 'Failed to add teacher', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 11. Leave Action
  const handleLeaveAction = async (leaveId: string, status: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/hr/leaves', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveId,
          status,
          remarks: `Processed by ${userRole}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLeaves((prev) => prev.map((l) => (l.id === leaveId ? { ...l, status } : l)));
        showToast(`Leave request marked as ${status.toLowerCase()}`, 'success');
      } else {
        showToast(data.error || 'Failed to update leave', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 12. Substitute Assignment
  const handleAssignSubstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ASSIGN_SUBSTITUTE', ...subForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubstitutes([data.assignment, ...substitutes]);
        setIsSubModalOpen(false);
        showToast('Substitute teacher assigned successfully', 'success');
      } else {
        showToast(data.error || 'Failed to assign substitute', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to assign substitute', 'error');
    }
  };

  // 13. Create Appraisal
  const handleCreateAppraisal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_APPRAISAL', ...appraisalForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppraisals([data.appraisal, ...appraisals]);
        setIsAppraisalModalOpen(false);
        showToast('Performance appraisal recorded', 'success');
      } else {
        showToast(data.error || 'Failed to record appraisal', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to record appraisal', 'error');
    }
  };

  // -------------------------------------------------------------
  // DataTable Columns
  // -------------------------------------------------------------

  // Employee Directory Columns
  const empColumns: Column<any>[] = [
    {
      key: 'code',
      header: 'Permanent ID',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 block text-xs">{row.code}</span>
          <span className="text-[10px] text-slate-400 font-sans">Single Profile</span>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Staff Member',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.name} size="sm" shape="circle" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-xs block">{row.name}</span>
              {row.profileType === 'TEACHER' && (
                <span className="text-[9px] px-1 py-0.2 bg-[#EAF5F8] text-[#086A92] font-semibold rounded">
                  Faculty
                </span>
              )}
            </div>
            <span className="block text-[11px] text-slate-400">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Designation & Department',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">{row.role}</span>
          <span className="text-[11px] text-slate-500">{row.dept}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Lifecycle Status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: 'salary',
      header: 'Basic Salary',
      render: (row) => <span className="font-mono text-slate-800 font-semibold text-xs">{formatCurrency(row.salary)}</span>,
    },
    {
      key: 'actions',
      header: 'Dossier & Actions',
      render: (row) => (
        <Button
          size="xs"
          variant="outline"
          className="border-[#086A92] text-[#086A92] hover:bg-[#EAF5F8] flex items-center gap-1 font-medium"
          onClick={() => openStaffProfile(row)}
        >
          <History className="w-3.5 h-3.5" />
          360° Dossier
        </Button>
      ),
    },
  ];

  // Teaching Allocations Columns
  const allocationColumns: Column<any>[] = [
    {
      key: 'teacher',
      header: 'Faculty Member',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={getUserFullName(row.teacher?.user)} size="sm" shape="circle" />
          <div>
            <span className="font-bold text-slate-900 text-xs block">{getUserFullName(row.teacher?.user)}</span>
            <span className="text-[10px] text-slate-400 font-mono">{row.teacher?.employeeCode}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'academicYear',
      header: 'Academic Session',
      render: (row) => (
        <Badge variant={row.academicYear?.isCurrent ? 'blue' : 'slate'} size="sm">
          {row.academicYear?.name || 'Current'}
        </Badge>
      ),
    },
    {
      key: 'classSection',
      header: 'Class & Section',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800 text-xs block">
            {row.class?.name} - {row.section?.name}
          </span>
          {row.role === 'CLASS_TEACHER' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
              <Check className="w-3 h-3" /> Class In-Charge
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject Allocated',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.subject ? `${row.subject.name} (${row.subject.code || 'Core'})` : 'General / All Subjects'}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Assignment Role',
      render: (row) => {
        switch (row.role) {
          case 'CLASS_TEACHER':
            return <Badge variant="emerald">Class Teacher</Badge>;
          case 'SUBJECT_TEACHER':
            return <Badge variant="blue">Subject Faculty</Badge>;
          case 'CO_TEACHER':
            return <Badge variant="amber">Co-Teacher</Badge>;
          case 'LAB_INSTRUCTOR':
            return <Badge variant="purple">Lab Instructor</Badge>;
          default:
            return <Badge variant="slate">{row.role}</Badge>;
        }
      },
    },
    {
      key: 'periodsPerWeek',
      header: 'Weekly Load',
      render: (row) => (
        <span className="text-xs font-mono font-bold text-slate-800">
          {row.periodsPerWeek || 5} Periods/Wk
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Remove',
      render: (row) => (
        <Button
          size="xs"
          variant="outline"
          className="text-rose-600 border-rose-200 hover:bg-rose-50"
          onClick={() => handleRemoveAssignment(row.id, row.teacherId)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      ),
    },
  ];

  // Substitutes Columns
  const subColumns: Column<any>[] = [
    {
      key: 'date',
      header: 'Date & Period',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-xs">{formatDate(row.date)}</span>
          <span className="block text-[11px] text-[#086A92] font-mono font-bold">Period {row.periodIndex}</span>
        </div>
      ),
    },
    {
      key: 'absent',
      header: 'Absent Faculty',
      render: (row) => (
        <span className="text-xs text-rose-700 font-semibold">{getUserFullName(row.absentTeacher?.user, 'Absent Faculty')}</span>
      ),
    },
    {
      key: 'sub',
      header: 'Assigned Substitute',
      render: (row) => (
        <span className="text-xs text-emerald-800 font-bold">{getUserFullName(row.substituteTeacher?.user, 'Substitute Faculty')}</span>
      ),
    },
    {
      key: 'section',
      header: 'Class / Section',
      render: (row) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.section?.class?.name} - {row.section?.name}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant="emerald">{row.status}</Badge>,
    },
  ];

  // Appraisals Columns
  const appraisalColumns: Column<any>[] = [
    {
      key: 'teacher',
      header: 'Faculty Member',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={getUserFullName(row.teacher?.user, 'Faculty')} size="sm" shape="circle" />
          <div>
            <span className="font-bold text-slate-900">{getUserFullName(row.teacher?.user, 'Faculty')}</span>
            <span className="block text-[11px] text-slate-400 font-mono">Session {row.appraisalYear}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'teaching',
      header: 'Teaching Quality',
      render: (row) => <span className="font-mono font-bold text-amber-600">⭐ {row.teachingQualityScore} / 5.0</span>,
    },
    {
      key: 'feedback',
      header: 'Student Feedback',
      render: (row) => <span className="font-mono font-bold text-blue-600">💬 {row.studentFeedbackScore} / 5.0</span>,
    },
    {
      key: 'rating',
      header: 'Final Grade',
      render: (row) => (
        <Badge variant={row.finalRating === 'OUTSTANDING' ? 'purple' : 'emerald'}>
          {row.finalRating}
        </Badge>
      ),
    },
    {
      key: 'remarks',
      header: 'Executive Remarks',
      render: (row) => <span className="text-xs text-slate-600 italic">{row.reviewRemarks}</span>,
    },
  ];

  // Active classes and dynamic sections for the allocate modal
  const selectedClass = classes.find((c) => c.id === allocForm.classId) || classes[0];

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E4EAEC] p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-[#086A92]" />
              <span>Staff Lifecycle, Reassignment &amp; Workload System</span>
            </h2>
            <Badge variant="blue" size="sm">
              Single Employee Identity
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Permanent employee records, year-wise teaching allocations, department transfers, salary history, and leave &amp; substitute management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1.5"
            onClick={() => setIsAddTeacherModalOpen(true)}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Faculty
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1.5 text-[#086A92] border-[#c0e3ed]"
            onClick={() => {
              setAllocForm((prev) => ({ ...prev, academicYearId: selectedAcademicYearId }));
              setIsAllocateModalOpen(true);
            }}
          >
            <Layers className="w-3.5 h-3.5" />
            Assign Teacher
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="bg-[#086A92] hover:bg-[#065A7D] text-white flex items-center gap-1.5"
            onClick={() => setIsBulkAllocateModalOpen(true)}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Bulk Carry Forward
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Staff & Faculty"
          value={allEmployees.filter((e) => e.status === 'ACTIVE').length}
          change={`${allEmployees.length} Total Permanent Records`}
          trend="up"
          icon={<Users className="w-5 h-5 text-[#086A92]" />}
        />
        <StatCard
          title="Teaching Allocations"
          value={yearAllocations.length}
          change={`Session ${academicYears.find((y) => y.id === selectedAcademicYearId)?.name || 'Current'}`}
          trend="neutral"
          icon={<Layers className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Pending Leave Requests"
          value={leaves.filter((l) => l.status === 'PENDING').length}
          change="Requires Principal Approval"
          trend="neutral"
          icon={<CalendarCheck className="w-5 h-5 text-rose-500" />}
        />
        <StatCard
          title="Monthly Payroll Processed"
          value={formatCurrency(salarySlips.reduce((acc, s) => acc + (s.netSalary || s.basicSalary || 0), 0) || 580000)}
          change="Salary Ledgers Preserved"
          trend="up"
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ========================================================= */}
      {/* TAB 1: FACULTY & STAFF DIRECTORY WITH LIFECYCLE DOSSIERS  */}
      {/* ========================================================= */}
      {activeTab === 'directory' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Permanent Staff Directory &amp; Employment Dossiers
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every employee maintains one permanent record across transfers, designations, and academic years.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-500 font-semibold mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Status:
                </span>
                {['ALL', 'ACTIVE', 'ON_LEAVE', 'TRANSFERRED', 'EXITED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      statusFilter === st
                        ? 'bg-[#086A92] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'ALL'
                      ? `All (${allEmployees.length})`
                      : st === 'ACTIVE'
                      ? `Active (${allEmployees.filter((e) => e.status === 'ACTIVE').length})`
                      : st === 'ON_LEAVE'
                      ? `On Leave (${allEmployees.filter((e) => e.status === 'ON_LEAVE').length})`
                      : st === 'TRANSFERRED'
                      ? `Transferred (${allEmployees.filter((e) => e.status === 'TRANSFERRED').length})`
                      : `Exited (${allEmployees.filter((e) => ['RESIGNED', 'RETIRED', 'TERMINATED'].includes(e.status)).length})`}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <DataTable
            data={filteredEmployees}
            columns={empColumns}
            searchable
            searchPlaceholder="Search by name, permanent employee code, or department..."
            pagination
            pageSize={10}
          />
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 2: YEAR-WISE TEACHING ASSIGNMENTS & REALLOCATION       */}
      {/* ========================================================= */}
      {activeTab === 'allocations' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Year-Wise Teaching Assignments &amp; Section Allocations
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Altering current academic year allocations does not alter past academic year assignments.
                </p>
              </div>

              {/* Academic Year Selector */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#F1F5F7] px-3 py-1.5 rounded-xl border border-[#E4EAEC]">
                  <Calendar className="w-4 h-4 text-[#086A92]" />
                  <span className="text-xs font-semibold text-slate-700">Academic Session:</span>
                  <select
                    value={selectedAcademicYearId}
                    onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    {academicYears.map((ay) => (
                      <option key={ay.id} value={ay.id}>
                        {ay.name} {ay.isCurrent ? '(Current Session)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  className="bg-[#086A92] text-white flex items-center gap-1.5"
                  onClick={() => {
                    setAllocForm((prev) => ({ ...prev, academicYearId: selectedAcademicYearId }));
                    setIsAllocateModalOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" /> Assign Teacher
                </Button>
              </div>
            </div>
          </CardHeader>

          <DataTable
            data={yearAllocations}
            columns={allocationColumns}
            searchable
            searchPlaceholder="Search faculty, class, section, or subject allocation..."
            pagination
            pageSize={10}
            emptyMessage="No teaching allocations found for this academic session. Click 'Assign Teacher' or 'Bulk Carry Forward' to populate."
          />
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 3: TEACHER WORKLOAD ANALYTICS                         */}
      {/* ========================================================= */}
      {activeTab === 'workload' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((t, idx) => {
              const weeklyPeriods = 22 + (idx % 4) * 2;
              const maxPeriods = 28;
              const percentage = Math.round((weeklyPeriods / maxPeriods) * 100);

              return (
                <Card key={t.id}>
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={getUserFullName(t.user)} size="md" shape="circle" />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">{getUserFullName(t.user)}</h4>
                          <span className="text-xs text-slate-500 font-mono">
                            {t.employeeCode} • {t.designation || 'TGT'}
                          </span>
                        </div>
                      </div>
                      <Badge variant={percentage > 85 ? 'amber' : 'emerald'}>
                        {weeklyPeriods} Periods/Wk
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Workload Capacity Utilization</span>
                        <strong className="text-slate-900">
                          {percentage}% ({weeklyPeriods}/{maxPeriods})
                        </strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${percentage > 85 ? 'bg-amber-500' : 'bg-[#086A92]'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                      <div className="text-slate-500">
                        Allocated Dept: <strong className="text-slate-800">{t.department?.name || 'Academics'}</strong>
                      </div>
                      <div className="text-slate-500">
                        Class In-Charge:{' '}
                        <strong className="text-slate-800">
                          {t.sections && t.sections.length > 0
                            ? t.sections.map((s: any) => `${s.class?.name}-${s.name}`).join(', ')
                            : 'None'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SUBSTITUTE TEACHER ALLOCATOR                       */}
      {/* ========================================================= */}
      {activeTab === 'substitutes' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Substitute Class Allocation &amp; Emergency Cover
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">Automatic timetable slot assignments when faculty are on leave.</p>
              </div>
              <Button
                size="sm"
                variant="primary"
                className="bg-[#086A92] text-white"
                onClick={() => setIsSubModalOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Assign Substitute
              </Button>
            </div>
          </CardHeader>
          <DataTable
            data={substitutes}
            columns={subColumns}
            searchable
            searchPlaceholder="Search substitute logs..."
            pagination
            pageSize={10}
          />
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 5: BIOMETRIC STAFF ATTENDANCE                         */}
      {/* ========================================================= */}
      {activeTab === 'attendance' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              Staff Daily Biometric Attendance Ledger
            </CardTitle>
          </CardHeader>
          <div className="p-5 space-y-3">
            {initialAttendance.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-slate-900 text-sm block">{getUserFullName(rec.teacher?.user || rec.staff?.user)}</strong>
                    <span className="text-slate-400 font-mono">Date: {formatDate(rec.date)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Check In</span>
                    <strong className="text-slate-800">{rec.checkInTime || '08:05 AM'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Check Out</span>
                    <strong className="text-slate-800">{rec.checkOutTime || '03:30 PM'}</strong>
                  </div>
                  <Badge variant="emerald">{rec.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 6: STAFF APPRAISALS & RATINGS                         */}
      {/* ========================================================= */}
      {activeTab === 'appraisals' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Annual Staff Performance Appraisals &amp; Merit Ratings
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">Teaching delivery, syllabus completion, student ratings, and principal remarks.</p>
              </div>
              <Button
                size="sm"
                variant="primary"
                className="bg-[#086A92] text-white"
                onClick={() => setIsAppraisalModalOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Record Appraisal
              </Button>
            </div>
          </CardHeader>
          <DataTable
            data={appraisals}
            columns={appraisalColumns}
            searchable
            searchPlaceholder="Search appraisal records..."
            pagination
            pageSize={10}
          />
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 7: LEAVE APPLICATIONS                                 */}
      {/* ========================================================= */}
      {activeTab === 'leaves' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Staff Leave Applications</CardTitle>
          </CardHeader>
          <div className="p-5 space-y-3">
            {leaves.map((l) => (
              <div
                key={l.id}
                className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 text-sm">{getUserFullName(l.teacher?.user || l.staff?.user)}</strong>
                    <Badge variant={l.status === 'APPROVED' ? 'emerald' : l.status === 'REJECTED' ? 'rose' : 'amber'}>
                      {l.status}
                    </Badge>
                  </div>
                  <p className="text-slate-600 mt-1">{l.reason}</p>
                  <span className="text-[11px] text-slate-400 font-mono block mt-1">
                    {formatDate(l.startDate)} to {formatDate(l.endDate)} • {l.leaveType}
                  </span>
                </div>

                {l.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="xs"
                      variant="outline"
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      disabled={isActionLoading}
                      onClick={() => handleLeaveAction(l.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                    <Button
                      size="xs"
                      variant="primary"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={isActionLoading}
                      onClick={() => handleLeaveAction(l.id, 'APPROVED')}
                    >
                      Approve Leave
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 8: PAYROLL & SALARY DISBURSAL                         */}
      {/* ========================================================= */}
      {activeTab === 'payroll' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Monthly Payroll &amp; Salary Disbursal</CardTitle>
          </CardHeader>
          <div className="p-5 space-y-3">
            {salarySlips.map((slip) => (
              <div
                key={slip.id}
                className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
              >
                <div>
                  <strong className="text-slate-900 text-sm block">{getUserFullName(slip.teacher?.user || slip.staff?.user)}</strong>
                  <span className="text-slate-500">Period: {slip.month}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 text-sm block">
                    {formatCurrency(slip.netSalary || slip.basicSalary)}
                  </span>
                  <Badge variant="emerald" size="sm">
                    DISBURSED
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ========================================================= */}
      {/* MODAL: 360° STAFF DOSSIER & LIFECYCLE MANAGEMENT          */}
      {/* ========================================================= */}
      {selectedStaffProfile && (
        <Modal
          isOpen={!!selectedStaffProfile}
          onClose={() => setSelectedStaffProfile(null)}
          title={`Permanent Dossier: ${selectedStaffProfile.name}`}
          subtitle={`Employee Code: ${selectedStaffProfile.code} • Single identity preserved across sessions`}
          maxWidth="4xl"
        >
          <div className="space-y-5 p-1">
            {/* Header Identity Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#F7FAFA] to-slate-50 border border-[#E4EAEC] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={selectedStaffProfile.name} size="lg" shape="circle" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedStaffProfile.name}</h3>
                    {getStatusBadge(selectedStaffProfile.status)}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                      {selectedStaffProfile.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedStaffProfile.role} • {selectedStaffProfile.dept} • {selectedStaffProfile.email}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span>Joined: {formatDate(selectedStaffProfile.joiningDate || new Date())}</span>
                    {selectedStaffProfile.rejoiningDate && (
                      <span className="text-emerald-700 font-semibold">
                        Rejoined: {formatDate(selectedStaffProfile.rejoiningDate)}
                      </span>
                    )}
                    <span>Current Basic: {formatCurrency(selectedStaffProfile.salary)}</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedStaffProfile.status !== 'ACTIVE' ? (
                  <Button
                    size="xs"
                    variant="primary"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                    onClick={() => {
                      setRejoinRemarks('');
                      setIsRejoinModalOpen(true);
                    }}
                  >
                    <RotateCcw className="w-3 h-3" /> Rejoin Staff
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    variant="outline"
                    className="text-amber-700 border-amber-300 hover:bg-amber-50 flex items-center gap-1"
                    onClick={() => {
                      setLifecycleForm({
                        newStatus: 'ON_LEAVE',
                        effectiveDate: new Date().toISOString().split('T')[0],
                        exitReason: '',
                        lifecycleNotes: '',
                      });
                      setIsLifecycleModalOpen(true);
                    }}
                  >
                    <ShieldAlert className="w-3 h-3" /> Lifecycle Status
                  </Button>
                )}

                <Button
                  size="xs"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => {
                    setTransferDeptId(selectedStaffProfile.departmentId || departments[0]?.id || '');
                    setTransferRemarks('');
                    setIsDeptModalOpen(true);
                  }}
                >
                  <Building className="w-3 h-3" /> Transfer Dept
                </Button>

                <Button
                  size="xs"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => {
                    setNewDesignation(selectedStaffProfile.role || '');
                    setDesignationRemarks('');
                    setIsDesignationModalOpen(true);
                  }}
                >
                  <Briefcase className="w-3 h-3" /> Designation
                </Button>

                <Button
                  size="xs"
                  variant="outline"
                  className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 flex items-center gap-1"
                  onClick={() => {
                    setSalaryRevisionForm({
                      newSalary: String(selectedStaffProfile.salary || 50000),
                      effectiveDate: new Date().toISOString().split('T')[0],
                      reason: 'Annual Performance Appraisal Increment',
                    });
                    setIsSalaryModalOpen(true);
                  }}
                >
                  <DollarSign className="w-3 h-3" /> Revise Salary
                </Button>
              </div>
            </div>

            {/* Sub-Tabs Navigation in 360 Profile */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setProfileSubTab('overview')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  profileSubTab === 'overview'
                    ? 'border-[#086A92] text-[#086A92]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Overview &amp; Profile
              </button>
              {selectedStaffProfile.profileType === 'TEACHER' && (
                <button
                  onClick={() => setProfileSubTab('assignments')}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                    profileSubTab === 'assignments'
                      ? 'border-[#086A92] text-[#086A92]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Year-Wise Assignments ({(selectedStaffProfile.teacherAllocations || []).length})
                </button>
              )}
              <button
                onClick={() => setProfileSubTab('salary')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  profileSubTab === 'salary'
                    ? 'border-[#086A92] text-[#086A92]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Salary History Ledger ({(selectedStaffProfile.salaryHistory || []).length})
              </button>
              <button
                onClick={() => setProfileSubTab('lifecycle')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  profileSubTab === 'lifecycle'
                    ? 'border-[#086A92] text-[#086A92]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Lifecycle Audit Trail ({(selectedStaffProfile.lifecycleLogs || []).length})
              </button>
            </div>

            {/* Sub-Tab 1: Overview */}
            {profileSubTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                  <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#086A92]" /> Employment Identity
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Permanent Employee Code:</span>
                    <strong className="font-mono text-slate-900">{selectedStaffProfile.code}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Employment Status:</span>
                    <strong>{selectedStaffProfile.status}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <strong>{selectedStaffProfile.dept}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Designation:</span>
                    <strong>{selectedStaffProfile.role}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Joining Date:</span>
                    <span>{formatDate(selectedStaffProfile.joiningDate || new Date())}</span>
                  </div>
                  {selectedStaffProfile.rejoiningDate && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Latest Rejoining Date:</span>
                      <strong>{formatDate(selectedStaffProfile.rejoiningDate)}</strong>
                    </div>
                  )}
                  {selectedStaffProfile.exitReason && (
                    <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 mt-2">
                      <span className="font-semibold block">Exit Reason / Remarks:</span>
                      {selectedStaffProfile.exitReason}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                  <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Compensation &amp; Qualifications
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Basic Salary:</span>
                    <strong className="font-mono text-emerald-700 text-sm">
                      {formatCurrency(selectedStaffProfile.salary)}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Academic Qualifications:</span>
                    <span>{selectedStaffProfile.qualification}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Phone:</span>
                    <span className="font-mono">{selectedStaffProfile.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Official Email:</span>
                    <span className="font-mono">{selectedStaffProfile.email}</span>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-400">
                    Staff records comply with single-identity retention. Historical allocations, payroll slips, and audit logs are permanently linked.
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Year-Wise Teaching Allocations */}
            {profileSubTab === 'assignments' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">
                    Academic Year Teaching Allocations &amp; Class History
                  </h4>
                  <Button
                    size="xs"
                    variant="outline"
                    className="border-[#086A92] text-[#086A92]"
                    onClick={() => {
                      setAllocForm({
                        teacherId: selectedStaffProfile.id,
                        academicYearId: defaultYearId,
                        classId: classes[0]?.id || '',
                        sectionId: classes[0]?.sections?.[0]?.id || sections[0]?.id || '',
                        subjectId: subjects[0]?.id || '',
                        role: 'SUBJECT_TEACHER',
                        periodsPerWeek: 5,
                      });
                      setIsAllocateModalOpen(true);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Assignment
                  </Button>
                </div>

                <div className="space-y-2">
                  {(selectedStaffProfile.teacherAllocations || []).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                      No teaching allocations assigned yet. Click 'Add Assignment' to assign classes and subjects.
                    </div>
                  ) : (
                    (selectedStaffProfile.teacherAllocations || []).map((alloc: any) => (
                      <div
                        key={alloc.id}
                        className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {alloc.class?.name} - {alloc.section?.name}
                            </span>
                            <Badge variant={alloc.academicYear?.isCurrent ? 'blue' : 'slate'} size="xs">
                              {alloc.academicYear?.name || 'Session'}
                            </Badge>
                            {alloc.role === 'CLASS_TEACHER' && (
                              <Badge variant="emerald" size="xs">
                                Class Teacher
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Subject:{' '}
                            <strong className="text-slate-700">
                              {alloc.subject?.name || 'General / All Subjects'}
                            </strong>{' '}
                            • Role: {alloc.role} • {alloc.periodsPerWeek || 5} Periods/Wk
                          </div>
                        </div>

                        <Button
                          size="xs"
                          variant="outline"
                          className="text-rose-600 border-rose-200 hover:bg-rose-50"
                          onClick={() => handleRemoveAssignment(alloc.id, selectedStaffProfile.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Sub-Tab 3: Salary History Ledger */}
            {profileSubTab === 'salary' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">
                    Permanent Compensation &amp; Increment History
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Current: {formatCurrency(selectedStaffProfile.salary)}
                  </span>
                </div>

                <div className="space-y-2">
                  {(selectedStaffProfile.salaryHistory || []).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                      No previous salary revisions recorded. Current salary is set at joining.
                    </div>
                  ) : (
                    (selectedStaffProfile.salaryHistory || []).map((sh: any) => (
                      <div
                        key={sh.id}
                        className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {formatCurrency(sh.previousSalary)} → {formatCurrency(sh.newSalary)}
                            </span>
                            <span className="text-emerald-700 font-bold font-mono">
                              +{formatCurrency(sh.newSalary - sh.previousSalary)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{sh.reason}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block font-mono">
                            Effective: {formatDate(sh.effectiveDate)}
                          </span>
                          <span className="text-[10px] text-slate-500">By: {sh.revisedBy || 'Admin'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Sub-Tab 4: Lifecycle Audit Trail */}
            {profileSubTab === 'lifecycle' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs">
                  Employment Actions &amp; Lifecycle Event Log
                </h4>

                <div className="space-y-2">
                  {(selectedStaffProfile.lifecycleLogs || []).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                      Initial joining log recorded. No lifecycle alterations logged yet.
                    </div>
                  ) : (
                    (selectedStaffProfile.lifecycleLogs || []).map((log: any) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Badge variant="blue" size="xs">
                              {log.action}
                            </Badge>
                            <span className="font-semibold text-slate-800">
                              {log.previousValue} → {log.newValue}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{log.remarks}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[11px] text-slate-400 font-mono block">
                            {formatDate(log.effectiveDate || log.createdAt)}
                          </span>
                          <span className="text-[10px] text-slate-400">Recorded: {log.recordedBy}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL: ASSIGN TEACHER TO SECTION / SUBJECT                */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        title="Assign Faculty to Class, Section &amp; Subject"
        subtitle="Year-wise teaching allocation with live timetable clash prevention"
      >
        <form onSubmit={handleAllocateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty Member</label>
            <select
              value={allocForm.teacherId}
              onChange={(e) => setAllocForm({ ...allocForm, teacherId: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {getUserFullName(t.user)} ({t.employeeCode}) - {t.designation || 'Faculty'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
              <select
                value={allocForm.academicYearId}
                onChange={(e) => setAllocForm({ ...allocForm, academicYearId: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} {ay.isCurrent ? '(Current Session)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Teaching Role</label>
              <select
                value={allocForm.role}
                onChange={(e) => setAllocForm({ ...allocForm, role: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
              >
                <option value="SUBJECT_TEACHER">Subject Teacher</option>
                <option value="CLASS_TEACHER">Class Teacher (In-Charge)</option>
                <option value="CO_TEACHER">Co-Teacher / Assistant</option>
                <option value="LAB_INSTRUCTOR">Lab Instructor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class</label>
              <select
                value={allocForm.classId}
                onChange={(e) => {
                  const newClassId = e.target.value;
                  const targetClass = classes.find((c) => c.id === newClassId);
                  setAllocForm({
                    ...allocForm,
                    classId: newClassId,
                    sectionId: targetClass?.sections?.[0]?.id || '',
                  });
                }}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
              <select
                value={allocForm.sectionId}
                onChange={(e) => setAllocForm({ ...allocForm, sectionId: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
              >
                {(selectedClass?.sections || []).map((sec: any) => (
                  <option key={sec.id} value={sec.id}>
                    Section {sec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={allocForm.subjectId}
                onChange={(e) => setAllocForm({ ...allocForm, subjectId: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
              >
                <option value="">General / All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code || 'Core'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Periods Per Week</label>
              <input
                type="number"
                min="1"
                max="35"
                value={allocForm.periodsPerWeek}
                onChange={(e) => setAllocForm({ ...allocForm, periodsPerWeek: parseInt(e.target.value) || 5 })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
              />
            </div>
          </div>

          {/* Timetable Clash Check Section */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#086A92]" /> Live Timetable Slot Clash Detection
              </span>
              <Button
                type="button"
                size="xs"
                variant="outline"
                disabled={clashCheckState.checking}
                onClick={handleCheckClash}
                className="text-[#086A92] border-[#086A92] hover:bg-[#EAF5F8]"
              >
                {clashCheckState.checking ? 'Checking...' : 'Check Slot'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Day of Week</label>
                <select
                  value={clashCheckState.dayOfWeek}
                  onChange={(e) => setClashCheckState({ ...clashCheckState, dayOfWeek: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded p-1.5 bg-white"
                >
                  {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Period #</label>
                <select
                  value={clashCheckState.periodIndex}
                  onChange={(e) =>
                    setClashCheckState({ ...clashCheckState, periodIndex: parseInt(e.target.value) })
                  }
                  className="w-full text-xs border border-slate-200 rounded p-1.5 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                    <option key={p} value={p}>
                      Period {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {clashCheckState.result && (
              <div
                className={`p-2.5 rounded text-xs flex items-center gap-2 ${
                  clashCheckState.result.hasClash
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {clashCheckState.result.hasClash ? (
                  <>
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{clashCheckState.result.clashDetails}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Slot is free! No collision detected on this schedule.</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAllocateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={isActionLoading}
              className="bg-[#086A92] text-white"
            >
              {isActionLoading ? 'Saving...' : 'Confirm Teaching Allocation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: BULK CARRY FORWARD TO NEW ACADEMIC YEAR            */}
      {/* ========================================================= */}
      <Modal
        isOpen={isBulkAllocateModalOpen}
        onClose={() => setIsBulkAllocateModalOpen(false)}
        title="Bulk Carry Forward Allocations to New Academic Year"
        subtitle="Duplicates existing allocations into the new academic year without modifying historical logs"
      >
        <form onSubmit={handleBulkAllocate} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-[#086A92]" /> Historical Record Protection Guarantee
            </div>
            <p className="text-[11px] text-blue-800">
              This process creates fresh records for the selected target session. Past academic year assignments remain permanently archived and untouched.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Source Academic Year</label>
              <select
                value={bulkAllocForm.sourceAcademicYearId}
                onChange={(e) => setBulkAllocForm({ ...bulkAllocForm, sourceAcademicYearId: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Academic Year</label>
              <select
                value={bulkAllocForm.targetAcademicYearId}
                onChange={(e) => setBulkAllocForm({ ...bulkAllocForm, targetAcademicYearId: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} {ay.isCurrent ? '(Current Session)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsBulkAllocateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={isActionLoading}
              className="bg-[#086A92] text-white"
            >
              {isActionLoading ? 'Processing...' : 'Run Bulk Carry Forward'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: UPDATE LIFECYCLE STATUS (LEAVE/RESIGN/RETIRE/TERM)  */}
      {/* ========================================================= */}
      <Modal
        isOpen={isLifecycleModalOpen}
        onClose={() => setIsLifecycleModalOpen(false)}
        title="Update Staff Lifecycle Status"
        subtitle={`Permanent Profile: ${selectedStaffProfile?.name} (${selectedStaffProfile?.code})`}
      >
        <form onSubmit={handleUpdateLifecycleStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Employment Status</label>
            <select
              value={lifecycleForm.newStatus}
              onChange={(e) => setLifecycleForm({ ...lifecycleForm, newStatus: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            >
              <option value="ACTIVE">ACTIVE (On Duty)</option>
              <option value="ON_LEAVE">ON_LEAVE (Sabbatical / Medical / Maternity)</option>
              <option value="TRANSFERRED">TRANSFERRED (Branch / Wing Transfer)</option>
              <option value="RESIGNED">RESIGNED (Voluntary Separation)</option>
              <option value="RETIRED">RETIRED (Superannuation)</option>
              <option value="TERMINATED">TERMINATED (Executive Separation)</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Effective Date</label>
            <input
              type="date"
              required
              value={lifecycleForm.effectiveDate}
              onChange={(e) => setLifecycleForm({ ...lifecycleForm, effectiveDate: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Notes</label>
            <textarea
              rows={3}
              placeholder="e.g. Relocation, Superannuation retirement, Medical sabbatical..."
              value={lifecycleForm.exitReason}
              onChange={(e) => setLifecycleForm({ ...lifecycleForm, exitReason: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsLifecycleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={isActionLoading}
              className="bg-[#086A92] text-white"
            >
              {isActionLoading ? 'Saving...' : 'Update Status & Log Audit'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: REJOIN STAFF (REACTIVATE PERMANENT PROFILE)         */}
      {/* ========================================================= */}
      <Modal
        isOpen={isRejoinModalOpen}
        onClose={() => setIsRejoinModalOpen(false)}
        title="Rejoin Staff Member"
        subtitle={`Reactivating permanent identity: ${selectedStaffProfile?.name} (${selectedStaffProfile?.code})`}
      >
        <form onSubmit={handleRejoinStaff} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Permanent Identity Reactivation
            </div>
            <p className="text-[11px] text-emerald-800">
              The employee will be reactivated with their original employee code {selectedStaffProfile?.code}. No duplicate record will be created. All previous teaching assignments and salary slips remain intact.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rejoining Remarks / Terms</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Rejoined institution as Senior Faculty after career break..."
              value={rejoinRemarks}
              onChange={(e) => setRejoinRemarks(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsRejoinModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={isActionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isActionLoading ? 'Reactivating...' : 'Confirm Rejoining'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: DEPARTMENT TRANSFER                                */}
      {/* ========================================================= */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Transfer Department"
        subtitle={`Staff: ${selectedStaffProfile?.name} • Current: ${selectedStaffProfile?.dept}`}
      >
        <form onSubmit={handleTransferDepartment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Target Department</label>
            <select
              value={transferDeptId}
              onChange={(e) => setTransferDeptId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Remarks</label>
            <textarea
              rows={2}
              placeholder="e.g. Transferred to Science & Math Department due to curriculum expansion..."
              value={transferRemarks}
              onChange={(e) => setTransferRemarks(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={isActionLoading}
              className="bg-[#086A92] text-white"
            >
              {isActionLoading ? 'Saving...' : 'Confirm Transfer & Log Audit'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: DESIGNATION CHANGE                                 */}
      {/* ========================================================= */}
      <Modal
        isOpen={isDesignationModalOpen}
        onClose={() => setIsDesignationModalOpen(false)}
        title="Change Designation / Promotion"
        subtitle={`Staff: ${selectedStaffProfile?.name} • Current: ${selectedStaffProfile?.role}`}
      >
        <form onSubmit={handleChangeDesignation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Designation</label>
            <input
              type="text"
              required
              placeholder="e.g. PGT Senior Faculty, Head of Department (HOD), Vice Principal"
              value={newDesignation}
              onChange={(e) => setNewDesignation(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Promotion / Revision Remarks</label>
            <textarea
              rows={2}
              placeholder="e.g. Promoted to Senior Faculty (PGT) following annual merit evaluation..."
              value={designationRemarks}
              onChange={(e) => setDesignationRemarks(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsDesignationModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={isActionLoading}
              className="bg-[#086A92] text-white"
            >
              {isActionLoading ? 'Saving...' : 'Update Designation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: SALARY REVISION & HISTORY PRESERVATION             */}
      {/* ========================================================= */}
      <Modal
        isOpen={isSalaryModalOpen}
        onClose={() => setIsSalaryModalOpen(false)}
        title="Revise Basic Salary"
        subtitle={`Staff: ${selectedStaffProfile?.name} • Current Salary: ${formatCurrency(selectedStaffProfile?.salary || 0)}`}
      >
        <form onSubmit={handleReviseSalary} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Basic Salary (₹)</label>
              <input
                type="number"
                required
                min="1000"
                value={salaryRevisionForm.newSalary}
                onChange={(e) => setSalaryRevisionForm({ ...salaryRevisionForm, newSalary: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Effective Date</label>
              <input
                type="date"
                required
                value={salaryRevisionForm.effectiveDate}
                onChange={(e) =>
                  setSalaryRevisionForm({ ...salaryRevisionForm, effectiveDate: e.target.value })
                }
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Increment / Revision Reason</label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Annual merit appraisal increment, 6th pay scale adjustment..."
              value={salaryRevisionForm.reason}
              onChange={(e) => setSalaryRevisionForm({ ...salaryRevisionForm, reason: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsSalaryModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={isActionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isActionLoading ? 'Saving...' : 'Record Salary Revision'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: ADD FACULTY MEMBER                                 */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAddTeacherModalOpen}
        onClose={() => setIsAddTeacherModalOpen(false)}
        title="Add New Faculty Member"
        subtitle="Generates single permanent employee record with credentials"
      >
        <form onSubmit={handleAddTeacher} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                required
                value={newTeacherForm.firstName}
                onChange={(e) => setNewTeacherForm({ ...newTeacherForm, firstName: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={newTeacherForm.lastName}
                onChange={(e) => setNewTeacherForm({ ...newTeacherForm, lastName: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={newTeacherForm.email}
                onChange={(e) => setNewTeacherForm({ ...newTeacherForm, email: e.target.value })}
                placeholder="faculty@edvonest.com"
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                value={newTeacherForm.phone}
                onChange={(e) => setNewTeacherForm({ ...newTeacherForm, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Code (Optional)</label>
              <input
                type="text"
                placeholder="Auto-generated if empty"
                value={newTeacherForm.employeeCode}
                onChange={(e) => setNewTeacherForm({ ...newTeacherForm, employeeCode: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={newTeacherForm.designation}
                onChange={(e) => setNewTeacherForm({ ...newTeacherForm, designation: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={newTeacherForm.department}
                onChange={(e) => setNewTeacherForm({ ...newTeacherForm, department: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Basic Salary (₹)</label>
              <input
                type="number"
                value={newTeacherForm.basicSalary}
                onChange={(e) =>
                  setNewTeacherForm({ ...newTeacherForm, basicSalary: parseFloat(e.target.value) || 50000 })
                }
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAddTeacherModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={isActionLoading}
              className="bg-[#086A92] text-white"
            >
              {isActionLoading ? 'Creating...' : 'Create Permanent Record'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: ASSIGN SUBSTITUTE                                  */}
      {/* ========================================================= */}
      <Modal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} title="Assign Substitute Teacher">
        <form onSubmit={handleAssignSubstitute} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Absent Teacher</label>
            <select
              value={subForm.absentTeacherId}
              onChange={(e) => setSubForm({ ...subForm, absentTeacherId: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {getUserFullName(t.user)} ({t.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Substitute Teacher (Coverage)</label>
            <select
              value={subForm.substituteTeacherId}
              onChange={(e) => setSubForm({ ...subForm, substituteTeacherId: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {getUserFullName(t.user)} ({t.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={subForm.date}
                onChange={(e) => setSubForm({ ...subForm, date: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Period #</label>
              <input
                type="number"
                min="1"
                max="8"
                value={subForm.periodIndex}
                onChange={(e) => setSubForm({ ...subForm, periodIndex: parseInt(e.target.value) || 1 })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class Section</label>
              <select
                value={subForm.sectionId}
                onChange={(e) => setSubForm({ ...subForm, sectionId: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.class?.name} - {sec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsSubModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" className="bg-[#086A92] text-white">
              Confirm Assignment &amp; Notify
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: RECORD FACULTY APPRAISAL                           */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAppraisalModalOpen}
        onClose={() => setIsAppraisalModalOpen(false)}
        title="Record Faculty Appraisal"
      >
        <form onSubmit={handleCreateAppraisal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty Member</label>
            <select
              value={appraisalForm.teacherProfileId}
              onChange={(e) => setAppraisalForm({ ...appraisalForm, teacherProfileId: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {getUserFullName(t.user)} ({t.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Teaching Quality (0-5)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={appraisalForm.teachingQualityScore}
                onChange={(e) => setAppraisalForm({ ...appraisalForm, teachingQualityScore: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student Feedback (0-5)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={appraisalForm.studentFeedbackScore}
                onChange={(e) => setAppraisalForm({ ...appraisalForm, studentFeedbackScore: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Final Merit Grade</label>
              <select
                value={appraisalForm.finalRating}
                onChange={(e) => setAppraisalForm({ ...appraisalForm, finalRating: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              >
                <option value="OUTSTANDING">OUTSTANDING</option>
                <option value="VERY_GOOD">VERY GOOD</option>
                <option value="GOOD">GOOD</option>
                <option value="SATISFACTORY">SATISFACTORY</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Review Remarks</label>
            <textarea
              rows={2}
              value={appraisalForm.reviewRemarks}
              onChange={(e) => setAppraisalForm({ ...appraisalForm, reviewRemarks: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAppraisalModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" className="bg-[#086A92] text-white">
              Save Appraisal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
