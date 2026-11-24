'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  UserPlus,
  Upload,
  ArrowRightLeft,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  Check,
  Users,
  UserCheck,
  Sparkles,
  Shuffle,
  FileText,
  Printer,
  X,
  Calendar,
  Building,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { StepForm } from '@/components/ui/StepForm';
import { Avatar } from '@/components/ui/Avatar';
import { StatCard } from '@/components/ui/StatCard';
import { showToast } from '@/components/ui/Toast';
import { parseCSV, exportToCSV } from '@/lib/export';

export interface StudentRow {
  id: string;
  admissionNumber: string;
  rollNumber: string;
  name: string;
  email: string;
  gender: string;
  dob?: string;
  bloodGroup: string;
  className: string;
  sectionName: string;
  classId?: string;
  sectionId?: string;
  academicYearName?: string;
  parentName: string;
  parentPhone: string;
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
  motherPhone?: string;
  guardianName?: string;
  guardianPhone?: string;
  house: string;
  lifecycleStage?: string;
  isArchived: boolean;
  tcNumber?: string | null;
  documentsCount?: number;
  admissionDate?: string;
}

export interface ClassOption {
  id: string;
  name: string;
  sections: Array<{ id: string; name: string; enrolledCount?: number }>;
}

export interface StudentAnalytics {
  totalStudents: number;
  activeStudents: number;
  newAdmissions: number;
  withdrawals: number;
  transfers: number;
  genderRatio: {
    male: number;
    female: number;
    malePercent: number;
    femalePercent: number;
  };
  classDistribution: Array<{ name: string; total: number }>;
}

export const StudentsClient: React.FC<{
  initialStudents: StudentRow[];
  classes: ClassOption[];
  academicYears: Array<{ id: string; name: string; isCurrent: boolean }>;
  analytics: StudentAnalytics;
  userRole?: string;
}> = ({ initialStudents, classes, academicYears, analytics, userRole = 'SCHOOL_ADMIN' }) => {
  const [students, setStudents] = useState<StudentRow[]>(initialStudents);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');
  const [selectedStudents, setSelectedStudents] = useState<StudentRow[]>([]);
  const router = useRouter();

  // Drawer & Modal states
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);

  // Section Transfer Modal
  const [transferTargetStudent, setTransferTargetStudent] = useState<StudentRow | null>(null);
  const [transferSectionId, setTransferSectionId] = useState('');
  const [transferReason, setTransferReason] = useState('Academic realignment');
  const [transferLoading, setTransferLoading] = useState(false);

  // Transfer Certificate (TC) Modal
  const [tcTargetStudent, setTcTargetStudent] = useState<StudentRow | null>(null);
  const [tcReason, setTcReason] = useState('Parent Relocation / Transfer');
  const [tcConduct, setTcConduct] = useState('EXCELLENT');
  const [tcDuesCleared, setTcDuesCleared] = useState(true);
  const [tcRemarks, setTcRemarks] = useState('All school property returned in good standing.');
  const [tcLoading, setTcLoading] = useState(false);
  const [issuedTc, setIssuedTc] = useState<any | null>(null);

  // Multi-step Registration Drawer
  const [addStep, setAddStep] = useState(1);
  const steps = [
    { id: 1, title: 'Student Info' },
    { id: 2, title: 'Parents & Guardian' },
    { id: 3, title: 'Academic Class' },
    { id: 4, title: 'Address & Contact' },
    { id: 5, title: 'Review & Enroll' },
  ];

  // New Student Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: 'MALE',
    dob: '2012-05-15',
    bloodGroup: 'B+',
    address: 'Sector 62, City Center',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201309',
    emergencyContact: '+91 98100 12345',
    admissionDate: new Date().toISOString().split('T')[0],
    previousSchool: 'St. Mary Senior School',
    classId: classes[0]?.id || '',
    sectionId: classes[0]?.sections[0]?.id || '',
    rollNumber: '10A20',
    house: 'Ruby',
    // Parent details
    fatherName: 'Ramesh Sharma',
    fatherPhone: '+91 98100 12345',
    fatherEmail: 'ramesh.sharma@example.com',
    fatherOccupation: 'Senior Engineer',
    motherName: 'Sunita Sharma',
    motherPhone: '+91 98100 54321',
    motherEmail: 'sunita.sharma@example.com',
    motherOccupation: 'Educator',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianRelation: '',
    guardianOccupation: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CSV Import state
  const [importRows, setImportRows] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importLoading, setImportLoading] = useState(false);

  // Promotion state
  const [targetYearId, setTargetYearId] = useState(academicYears[0]?.id || '');
  const [targetClassId, setTargetClassId] = useState(classes[0]?.id || '');
  const [targetSectionId, setTargetSectionId] = useState(classes[0]?.sections[0]?.id || '');
  const [promoteLoading, setPromoteLoading] = useState(false);

  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SCHOOL_ADMIN';

  // Multi-attribute Filter Pipeline
  const filteredStudents = students.filter((s) => {
    if (selectedClass && s.classId !== selectedClass) return false;
    if (selectedSection && s.sectionId !== selectedSection) return false;
    if (selectedStatus === 'ACTIVE' && (s.isArchived || s.lifecycleStage === 'TC_ISSUED' || s.lifecycleStage === 'WITHDRAWN')) return false;
    if (selectedStatus === 'PROMOTED' && s.lifecycleStage !== 'PROMOTED') return false;
    if (selectedStatus === 'TC_ISSUED' && s.lifecycleStage !== 'TC_ISSUED' && !s.tcNumber) return false;
    if (selectedStatus === 'ARCHIVED' && !s.isArchived) return false;
    return true;
  });

  const columns: Column<StudentRow>[] = [
    {
      key: 'admissionNumber',
      header: 'Admission No',
      render: (row) => (
        <span className="font-mono font-bold text-[#990000]">{row.admissionNumber}</span>
      ),
    },
    {
      key: 'name',
      header: 'Student Name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.name} size="sm" house={row.house} />
          <div>
            <Link
              href={`/dashboard/students/${row.id}`}
              className="font-bold text-[#171717] hover:text-[#990000] transition-colors"
            >
              {row.name}
            </Link>
            <span className="text-[10.5px] text-[#737373] block">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'className',
      header: 'Class',
      render: (row) => (
        <span className="font-semibold text-[#171717]">{row.className}</span>
      ),
    },
    {
      key: 'sectionName',
      header: 'Section',
      render: (row) => (
        <span className="font-medium text-[#737373]">
          Section {row.sectionName}
        </span>
      ),
    },
    {
      key: 'rollNumber',
      header: 'Roll No',
      render: (row) => (
        <span className="font-mono text-[#171717] font-semibold">{row.rollNumber}</span>
      ),
    },
    {
      key: 'parentName',
      header: 'Parent / Guardian',
      render: (row) => (
        <div>
          <span className="font-medium text-[#171717] text-xs block">{row.parentName}</span>
          <span className="text-[10.5px] text-[#737373] font-mono">{row.parentPhone}</span>
        </div>
      ),
    },
    {
      key: 'lifecycleStage',
      header: 'Status',
      render: (row) => {
        if (row.lifecycleStage === 'TC_ISSUED' || row.tcNumber) {
          return <Badge variant="rose" size="xs">TC Issued</Badge>;
        }
        if (row.lifecycleStage === 'PROMOTED') {
          return <Badge variant="amber" size="xs">Promoted</Badge>;
        }
        if (row.isArchived) {
          return <Badge variant="slate" size="xs">Archived</Badge>;
        }
        return <Badge variant="red" size="xs">Active</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Link href={`/dashboard/students/${row.id}`}>
            <Button variant="outline" size="xs" leftIcon={<Eye className="w-3 h-3 text-[#990000]" />}>
              Profile
            </Button>
          </Link>
          {isAdmin && !row.isArchived && row.lifecycleStage !== 'TC_ISSUED' && (
            <>
              <button
                onClick={() => {
                  setTransferTargetStudent(row);
                  const cls = classes.find((c) => c.id === row.classId);
                  const otherSec = cls?.sections.find((s) => s.id !== row.sectionId);
                  setTransferSectionId(otherSec?.id || '');
                }}
                title="Transfer Section"
                className="p-1.5 rounded-lg border border-[#E5E5E5] hover:bg-neutral-50 text-neutral-700 hover:text-[#990000] cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setTcTargetStudent(row);
                  setIssuedTc(null);
                }}
                title="Issue Transfer Certificate"
                className="p-1.5 rounded-lg border border-[#E5E5E5] hover:bg-neutral-50 text-neutral-700 hover:text-[#990000] cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  // ----------------------------------------------------
  // SUBMISSIONS & HANDLERS
  // ----------------------------------------------------
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAddDrawerOpen(false);
        setAddStep(1);
        if (data.student) {
          const newRow: StudentRow = {
            id: data.student.id,
            admissionNumber: data.student.admissionNumber,
            rollNumber: data.student.rollNumber || formData.rollNumber || '01',
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email || `student.${data.student.admissionNumber.toLowerCase()}@edvonest.com`,
            gender: formData.gender,
            dob: formData.dob,
            bloodGroup: formData.bloodGroup,
            className: selectedClassName,
            sectionName: selectedSectionName,
            classId: formData.classId,
            sectionId: formData.sectionId,
            parentName: formData.fatherName || formData.motherName || 'Guardian',
            parentPhone: formData.fatherPhone || formData.motherPhone || formData.emergencyContact,
            fatherName: formData.fatherName,
            fatherPhone: formData.fatherPhone,
            motherName: formData.motherName,
            motherPhone: formData.motherPhone,
            house: formData.house,
            lifecycleStage: 'ACTIVE_ENROLLMENT',
            isArchived: false,
            admissionDate: formData.admissionDate,
          };
          setStudents((prev) => [newRow, ...prev]);
        }
        showToast(`Student ${formData.firstName} ${formData.lastName} enrolled successfully!`, 'success');
        router.refresh();
      } else {
        showToast(data.error || 'Failed to enroll student', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteSectionTransfer = async () => {
    if (!transferTargetStudent || !transferSectionId) return;
    setTransferLoading(true);
    try {
      const res = await fetch('/api/students/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SECTION_TRANSFER',
          studentId: transferTargetStudent.id,
          targetSectionId: transferSectionId,
          reason: transferReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        const targetCls = classes.find((c) => c.id === transferTargetStudent.classId);
        const targetSec = targetCls?.sections.find((s) => s.id === transferSectionId);
        setStudents((prev) =>
          prev.map((s) =>
            s.id === transferTargetStudent.id
              ? { ...s, sectionId: transferSectionId, sectionName: targetSec?.name || s.sectionName }
              : s
          )
        );
        setTransferTargetStudent(null);
        router.refresh();
      } else {
        showToast(data.error || 'Failed to transfer section', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleIssueTransferCertificate = async () => {
    if (!tcTargetStudent) return;
    setTcLoading(true);
    try {
      const res = await fetch('/api/students/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GENERATE_TC',
          studentId: tcTargetStudent.id,
          reasonForLeaving: tcReason,
          conduct: tcConduct,
          duesCleared: tcDuesCleared,
          remarks: tcRemarks,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIssuedTc(data.tc);
        showToast(data.message, 'success');
        setStudents((prev) =>
          prev.map((s) =>
            s.id === tcTargetStudent.id
              ? { ...s, lifecycleStage: 'TC_ISSUED', isArchived: true, tcNumber: data.tc.tcNumber }
              : s
          )
        );
        router.refresh();
      } else {
        showToast(data.error || 'Failed to issue TC', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setTcLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseCSV(file);
      setImportRows(rows);
      setImportErrors([]);
      showToast(`Parsed ${rows.length} rows from CSV file`, 'info');
    } catch (err: any) {
      setImportErrors([`CSV Parsing Error: ${err.message}`]);
      showToast(`CSV Parsing Error: ${err.message}`, 'error');
    }
  };

  const handleConfirmImport = async () => {
    if (importRows.length === 0) return;
    setImportLoading(true);
    try {
      const res = await fetch('/api/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: importRows }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Successfully imported ${data.importedCount} student records!`, 'success');
        setIsImportModalOpen(false);
        router.refresh();
      } else {
        setImportErrors([data.error || 'Import failed']);
        showToast(data.error || 'Import failed', 'error');
      }
    } catch (err: any) {
      setImportErrors([err.message]);
      showToast(err.message, 'error');
    } finally {
      setImportLoading(false);
    }
  };

  const handlePromoteStudents = async () => {
    if (selectedStudents.length === 0) return;
    setPromoteLoading(true);
    try {
      const res = await fetch('/api/students/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: selectedStudents.map((s) => s.id),
          targetAcademicYearId: targetYearId,
          targetClassId,
          targetSectionId,
          action: 'PROMOTE',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Successfully promoted ${data.count} students!`, 'success');
        setIsPromoteModalOpen(false);
        router.refresh();
      } else {
        showToast(data.error || 'Promotion failed', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setPromoteLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sample = [
      {
        'Student Name': 'Aanya Sengupta',
        Class: 'Class 10',
        Section: 'A',
        Gender: 'FEMALE',
        'Parent Name': 'Subhash Sengupta',
        Phone: '+91 98110 54321',
      },
      {
        'Student Name': 'Devansh Bhatia',
        Class: 'Class 10',
        Section: 'B',
        Gender: 'MALE',
        'Parent Name': 'Rajeev Bhatia',
        Phone: '+91 98110 98765',
      },
    ];
    exportToCSV(sample, 'edvonest_student_import_sample.csv');
  };

  const selectedClassName = classes.find((c) => c.id === formData.classId)?.name || 'Class 10';
  const selectedSectionName =
    classes.find((c) => c.id === formData.classId)?.sections.find((s) => s.id === formData.sectionId)?.name || 'A';

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & MAIN CONTROLS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#171717] tracking-tight flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-[#990000]" />
              <span>Student Information System (SIS)</span>
            </h2>
            <Badge variant="rose" size="sm">
              {filteredStudents.length} Students Active
            </Badge>
          </div>
          <p className="text-xs text-[#737373] mt-1">
            Centralized register for student enrollment, digital profiles, parent contacts, section allocation, and lifecycle events.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {selectedStudents.length > 0 && isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPromoteModalOpen(true)}
              leftIcon={<ArrowRightLeft className="w-3.5 h-3.5 text-[#990000]" />}
            >
              Promote ({selectedStudents.length})
            </Button>
          )}

          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              leftIcon={<Upload className="w-3.5 h-3.5 text-[#737373]" />}
            >
              Import CSV
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(filteredStudents, 'edvonest_students_export.csv')}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-[#737373]" />}
          >
            Export CSV
          </Button>

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setAddStep(1);
                setIsAddDrawerOpen(true);
              }}
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            >
              + Register Student
            </Button>
          )}
        </div>
      </div>

      {/* 2. REAL-TIME DATABASE ANALYTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={analytics.totalStudents}
          subtitle={`${analytics.activeStudents} active enrollments`}
          icon={<Users className="w-5 h-5 text-[#990000]" />}
          variant="red"
        />
        <StatCard
          title="New Admissions"
          value={analytics.newAdmissions}
          subtitle="Enrolled this academic session"
          icon={<UserPlus className="w-5 h-5 text-[#C00000]" />}
          variant="red"
        />
        <StatCard
          title="Gender Balance"
          value={`${analytics.genderRatio.malePercent}% M / ${analytics.genderRatio.femalePercent}% F`}
          subtitle={`${analytics.genderRatio.male} Boys • ${analytics.genderRatio.female} Girls`}
          icon={<Users className="w-5 h-5 text-[#171717]" />}
          variant="slate"
        />
        <StatCard
          title="Transfers & TC Issued"
          value={analytics.withdrawals + analytics.transfers}
          subtitle={`${analytics.transfers} Section Transfers • ${analytics.withdrawals} Exited`}
          icon={<ArrowRightLeft className="w-5 h-5 text-[#B45309]" />}
          variant="amber"
        />
      </div>

      {/* 3. MULTI-FILTER PIPELINE */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-[#171717] font-bold">
          <Filter className="w-3.5 h-3.5 text-[#990000]" />
          <span>Filters:</span>
        </div>

        {/* Class Filter */}
        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedSection('');
          }}
          className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg px-3 py-1.5 text-xs text-[#171717] font-semibold focus:outline-none focus:border-[#990000]"
        >
          <option value="">All Classes ({classes.length})</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Section Filter */}
        {selectedClass && (
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg px-3 py-1.5 text-xs text-[#171717] font-semibold focus:outline-none focus:border-[#990000]"
          >
            <option value="">All Sections</option>
            {classes
              .find((c) => c.id === selectedClass)
              ?.sections.map((s) => (
                <option key={s.id} value={s.id}>
                  Section {s.name} ({s.enrolledCount ?? 0} students)
                </option>
              ))}
          </select>
        )}

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg px-3 py-1.5 text-xs text-[#171717] font-semibold focus:outline-none focus:border-[#990000]"
        >
          <option value="ACTIVE">Active Students</option>
          <option value="ALL">All Records</option>
          <option value="PROMOTED">Promoted</option>
          <option value="TC_ISSUED">TC Issued</option>
          <option value="ARCHIVED">Archived / Withdrawn</option>
        </select>

        {(selectedClass || selectedSection || selectedStatus !== 'ACTIVE') && (
          <button
            onClick={() => {
              setSelectedClass('');
              setSelectedSection('');
              setSelectedStatus('ACTIVE');
            }}
            className="text-[#990000] font-bold hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        )}

        <div className="ml-auto text-[#737373]">
          Showing <span className="font-bold text-[#171717]">{filteredStudents.length}</span> students
        </div>
      </div>

      {/* 4. MAIN STUDENTS DIRECTORY DATA TABLE */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        searchPlaceholder="Search by student name, roll number, admission #..."
        exportFilename="edvonest_student_directory"
        selectable={isAdmin}
        onSelectionChange={setSelectedStudents}
      />

      {/* ---------------------------------------------------- */}
      {/* 5. MULTI-STEP DRAWER: REGISTER NEW STUDENT */}
      {/* ---------------------------------------------------- */}
      <Drawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title="Register New Student"
        subtitle="Complete the institutional enrollment procedure"
        width="xl"
      >
        <div className="space-y-4">
          <StepForm
            steps={steps}
            currentStep={addStep}
            onStepClick={(step) => setAddStep(step)}
          />

          <form onSubmit={handleAddStudent} className="space-y-4 text-xs pt-2">
            {/* Step 1: Student Information */}
            {addStep === 1 && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h4 className="font-bold text-sm text-[#171717] pb-1 border-b border-[#E5E5E5]">
                  Step 1: Student Demographics &amp; Identity
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#171717] mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
                      placeholder="e.g. Aarav"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#171717] mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
                      placeholder="e.g. Verma"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-[#171717] mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#171717] mb-1">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000]"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#171717] mb-1">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000]"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#171717] mb-1">Admission Date</label>
                    <input
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#171717] mb-1">Previous School Attended</label>
                    <input
                      type="text"
                      value={formData.previousSchool}
                      onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                      placeholder="e.g. Greenwood International School"
                      className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="button" variant="primary" size="sm" onClick={() => setAddStep(2)}>
                    Next: Parent Info <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Parent & Guardian Details */}
            {addStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <h4 className="font-bold text-sm text-[#171717] pb-1 border-b border-[#E5E5E5]">
                  Step 2: Parent &amp; Guardian Information
                </h4>

                <div className="p-3 bg-[#F5F5F5] rounded-xl space-y-2 border border-[#E5E5E5]">
                  <span className="font-bold text-[#990000] block">Father Details</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#171717] mb-0.5">Full Name</label>
                      <input
                        type="text"
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                        placeholder="Father's full name"
                        className="w-full px-2.5 py-1.5 border border-[#E5E5E5] bg-white rounded-md focus:outline-none focus:border-[#990000]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#171717] mb-0.5">Phone Number *</label>
                      <input
                        type="tel"
                        value={formData.fatherPhone}
                        onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-2.5 py-1.5 border border-[#E5E5E5] bg-white rounded-md focus:outline-none focus:border-[#990000]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#171717] mb-0.5">Email Address</label>
                      <input
                        type="email"
                        value={formData.fatherEmail}
                        onChange={(e) => setFormData({ ...formData, fatherEmail: e.target.value })}
                        placeholder="father@example.com"
                        className="w-full px-2.5 py-1.5 border border-[#E5E5E5] bg-white rounded-md focus:outline-none focus:border-[#990000]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#171717] mb-0.5">Occupation</label>
                      <input
                        type="text"
                        value={formData.fatherOccupation}
                        onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                        placeholder="e.g. Chartered Accountant"
                        className="w-full px-2.5 py-1.5 border border-[#E5E5E5] bg-white rounded-md focus:outline-none focus:border-[#990000]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#F5F5F5] rounded-xl space-y-2 border border-[#E5E5E5]">
                  <span className="font-bold text-[#171717] block">Mother Details</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#171717] mb-0.5">Full Name</label>
                      <input
                        type="text"
                        value={formData.motherName}
                        onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                        placeholder="Mother's full name"
                        className="w-full px-2.5 py-1.5 border border-[#E5E5E5] bg-white rounded-md focus:outline-none focus:border-[#990000]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#171717] mb-0.5">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.motherPhone}
                        onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                        placeholder="+91 98765 00000"
                        className="w-full px-2.5 py-1.5 border border-[#E5E5E5] bg-white rounded-md focus:outline-none focus:border-[#990000]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <Button type="button" variant="outline" size="sm" onClick={() => setAddStep(1)}>
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                  </Button>
                  <Button type="button" variant="primary" size="sm" onClick={() => setAddStep(3)}>
                    Next: Academic <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Academic Allocation */}
            {addStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <h4 className="font-bold text-sm text-[#171717] pb-1 border-b border-[#E5E5E5]">
                  Step 3: Centralized Class &amp; Section Allocation
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#171717] mb-1">Class *</label>
                    <select
                      value={formData.classId}
                      onChange={(e) => {
                        const newClassId = e.target.value;
                        const c = classes.find((cls) => cls.id === newClassId);
                        setFormData({
                          ...formData,
                          classId: newClassId,
                          sectionId: c?.sections[0]?.id || '',
                        });
                      }}
                      className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000] font-semibold"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-[#171717]">Section Allocation *</label>
                      <span className="text-[10px] font-bold text-[#990000] bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                        Admin Only
                      </span>
                    </div>
                    <select
                      disabled={!isAdmin}
                      value={formData.sectionId}
                      onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000] font-semibold disabled:bg-neutral-100 disabled:text-neutral-500"
                    >
                      {classes
                        .find((c) => c.id === formData.classId)
                        ?.sections.map((s) => (
                          <option key={s.id} value={s.id}>
                            Section {s.name} ({s.enrolledCount ?? 0}/40 Enrolled)
                          </option>
                        ))}
                    </select>
                    {!isAdmin && (
                      <p className="text-[11px] text-[#737373] mt-1 font-medium">
                        Section allocation is managed exclusively by the School Administrator.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#171717] mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      placeholder="e.g. 10A21"
                      className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#171717] mb-1">House Allocation</label>
                    <select
                      value={formData.house}
                      onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000]"
                    >
                      {['Ruby', 'Emerald', 'Sapphire', 'Topaz'].map((h) => (
                        <option key={h} value={h}>{h} House</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <Button type="button" variant="outline" size="sm" onClick={() => setAddStep(2)}>
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                  </Button>
                  <Button type="button" variant="primary" size="sm" onClick={() => setAddStep(4)}>
                    Next: Address <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Contact & Address */}
            {addStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <h4 className="font-bold text-sm text-[#171717] pb-1 border-b border-[#E5E5E5]">
                  Step 4: Residential Address &amp; Emergency Contact
                </h4>
                <div>
                  <label className="block font-bold text-[#171717] mb-1">Street Address *</label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-[#171717] mb-1">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#171717] mb-1">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#171717] mb-1">PIN Code *</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#171717] mb-1">Emergency Contact Number *</label>
                  <input
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
                  />
                </div>

                <div className="pt-2 flex justify-between">
                  <Button type="button" variant="outline" size="sm" onClick={() => setAddStep(3)}>
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                  </Button>
                  <Button type="button" variant="primary" size="sm" onClick={() => setAddStep(5)}>
                    Next: Review <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Review & Confirm */}
            {addStep === 5 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <h4 className="font-bold text-sm text-[#171717] pb-1 border-b border-[#E5E5E5]">
                  Step 5: Review &amp; Confirm Registration
                </h4>
                <div className="bg-[#F5F5F5] p-4 rounded-xl border border-[#E5E5E5] space-y-2 text-xs">
                  <div className="flex justify-between border-b border-[#E5E5E5] pb-1.5">
                    <span className="text-[#737373]">Full Name:</span>
                    <span className="font-bold text-[#171717]">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E5E5E5] pb-1.5">
                    <span className="text-[#737373]">Allocated Class &amp; Section:</span>
                    <span className="font-bold text-[#990000]">{selectedClassName} - Section {selectedSectionName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E5E5E5] pb-1.5">
                    <span className="text-[#737373]">Date of Birth / Gender:</span>
                    <span className="font-semibold text-[#171717]">{formData.dob} ({formData.gender})</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E5E5E5] pb-1.5">
                    <span className="text-[#737373]">Father Details:</span>
                    <span className="font-semibold text-[#171717]">{formData.fatherName} ({formData.fatherPhone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Address:</span>
                    <span className="font-semibold text-[#171717]">{formData.address}, {formData.city}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <Button type="button" variant="outline" size="sm" onClick={() => setAddStep(4)}>
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                  </Button>
                  <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                    Confirm &amp; Enroll Student
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </Drawer>

      {/* ---------------------------------------------------- */}
      {/* 6. MODAL: SECTION TRANSFER */}
      {/* ---------------------------------------------------- */}
      {transferTargetStudent && (
        <Modal
          isOpen={!!transferTargetStudent}
          onClose={() => setTransferTargetStudent(null)}
          title="Transfer Student Section"
          subtitle={`Reallocate ${transferTargetStudent.name} (${transferTargetStudent.className})`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <span className="font-bold text-[#171717] block">Current Allocation:</span>
              <p className="text-neutral-600 mt-0.5">
                {transferTargetStudent.className} — Current Section: <strong>{transferTargetStudent.sectionName}</strong>
              </p>
            </div>

            <div>
              <label className="block font-bold text-[#171717] mb-1">Target Section *</label>
              <select
                value={transferSectionId}
                onChange={(e) => setTransferSectionId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000] font-semibold"
              >
                {classes
                  .find((c) => c.id === transferTargetStudent.classId)
                  ?.sections.map((s) => (
                    <option key={s.id} value={s.id} disabled={s.id === transferTargetStudent.sectionId}>
                      Section {s.name} {s.id === transferTargetStudent.sectionId ? '(Current)' : `(${s.enrolledCount ?? 0}/40)`}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#171717] mb-1">Reason for Reallocation *</label>
              <input
                type="text"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
                placeholder="e.g. Balance section strength, language elective adjustment"
              />
            </div>

            <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setTransferTargetStudent(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={transferLoading}
                onClick={handleExecuteSectionTransfer}
              >
                Execute Transfer
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------------------------------------------- */}
      {/* 7. MODAL: ISSUE TRANSFER CERTIFICATE (TC) */}
      {/* ---------------------------------------------------- */}
      {tcTargetStudent && (
        <Modal
          isOpen={!!tcTargetStudent}
          onClose={() => setTcTargetStudent(null)}
          title="Issue Transfer Certificate (TC)"
          subtitle={`Official withdrawal & certificate generation for ${tcTargetStudent.name}`}
          maxWidth="lg"
        >
          {issuedTc ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-[#990000] mx-auto" />
                <h3 className="font-bold text-[#990000] text-sm">Transfer Certificate Issued!</h3>
                <p className="font-mono font-bold text-[#171717] text-base">{issuedTc.tcNumber}</p>
                <p className="text-[#737373] text-[11px]">
                  Student record has been archived and marked as TC_ISSUED.
                </p>
              </div>

              <div className="border border-[#E5E5E5] rounded-xl p-4 bg-white space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-[#737373]">Student:</span>
                  <span className="font-bold text-[#171717]">{issuedTc.studentName}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-[#737373]">Admission No:</span>
                  <span className="font-mono font-bold text-[#990000]">{issuedTc.admissionNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-[#737373]">Class Leaving:</span>
                  <span className="font-bold text-[#171717]">{issuedTc.classLeaving}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-[#737373]">Reason:</span>
                  <span className="font-medium text-[#171717]">{issuedTc.reasonForLeaving}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Conduct:</span>
                  <span className="font-bold text-neutral-800">{issuedTc.conduct}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                >
                  Print Certificate
                </Button>
                <Button variant="primary" size="sm" onClick={() => setTcTargetStudent(null)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl space-y-1">
                <span className="font-bold block">Important Notice:</span>
                <p className="text-[11px] leading-relaxed">
                  Issuing a Transfer Certificate will mark this student as <strong>TC_ISSUED</strong> and automatically archive their active enrollment in the current academic session.
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#171717] mb-1">Reason for Leaving School *</label>
                <input
                  type="text"
                  required
                  value={tcReason}
                  onChange={(e) => setTcReason(e.target.value)}
                  placeholder="e.g. Parent Relocation, Course Completed"
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#171717] mb-1">Student Conduct</label>
                  <select
                    value={tcConduct}
                    onChange={(e) => setTcConduct(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#990000]"
                  >
                    <option value="EXCELLENT">Excellent</option>
                    <option value="VERY_GOOD">Very Good</option>
                    <option value="GOOD">Good</option>
                    <option value="SATISFACTORY">Satisfactory</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-[#171717]">
                    <input
                      type="checkbox"
                      checked={tcDuesCleared}
                      onChange={(e) => setTcDuesCleared(e.target.checked)}
                      className="w-4 h-4 text-[#990000] rounded focus:ring-[#990000]"
                    />
                    <span>All School Dues Cleared</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#171717] mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={tcRemarks}
                  onChange={(e) => setTcRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setTcTargetStudent(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={tcLoading}
                  onClick={handleIssueTransferCertificate}
                >
                  Generate Official TC
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ---------------------------------------------------- */}
      {/* 8. MODAL: BULK PROMOTION */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        title="Promote Students"
        subtitle={`Promoting ${selectedStudents.length} selected students to next session`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-[#171717] mb-1">Target Academic Year *</label>
              <select
                value={targetYearId}
                onChange={(e) => setTargetYearId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000] bg-white font-semibold"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} {ay.isCurrent ? '(Current Session)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#171717] mb-1">Target Class *</label>
                <select
                  value={targetClassId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    const c = classes.find((cls) => cls.id === cId);
                    setTargetClassId(cId);
                    setTargetSectionId(c?.sections[0]?.id || '');
                  }}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000] bg-white font-semibold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#171717] mb-1">Target Section *</label>
                <select
                  value={targetSectionId}
                  onChange={(e) => setTargetSectionId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#990000] bg-white font-semibold"
                >
                  {classes
                    .find((c) => c.id === targetClassId)
                    ?.sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        Section {s.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsPromoteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={promoteLoading}
              onClick={handlePromoteStudents}
            >
              Promote Students
            </Button>
          </div>
        </div>
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* 9. MODAL: BULK CSV IMPORT */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Bulk Import Students"
        subtitle="Upload CSV or Excel file containing student records"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 border-2 border-dashed border-[#E5E5E5] rounded-xl text-center bg-[#F5F5F5] space-y-2">
            <Upload className="w-8 h-8 text-[#990000] mx-auto" />
            <p className="font-semibold text-[#171717]">Drag &amp; Drop CSV file here, or click to browse</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="text-xs text-[#737373] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#990000] file:text-white file:font-semibold hover:file:bg-[#C00000]"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#737373]">Need the spreadsheet structure?</span>
            <Button variant="outline" size="xs" onClick={downloadSampleCSV}>
              Download Sample Template
            </Button>
          </div>

          {importRows.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-[#171717]">Preview Parsed Records ({importRows.length}):</span>
              <div className="max-h-40 overflow-y-auto border border-[#E5E5E5] rounded-lg">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#F5F5F5] sticky top-0 font-bold border-b">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Class</th>
                      <th className="p-2">Section</th>
                      <th className="p-2">Parent</th>
                      <th className="p-2">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importRows.slice(0, 10).map((r, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-2 font-semibold">{r['Student Name'] || r['name']}</td>
                        <td className="p-2">{r['Class'] || r['class']}</td>
                        <td className="p-2">{r['Section'] || r['section']}</td>
                        <td className="p-2">{r['Parent Name'] || r['parentName']}</td>
                        <td className="p-2 font-mono">{r['Phone'] || r['phone']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {importErrors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg space-y-1">
              {importErrors.map((err, i) => (
                <p key={i} className="text-[11px] font-semibold">{err}</p>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={importRows.length === 0}
              isLoading={importLoading}
              onClick={handleConfirmImport}
            >
              Confirm Import ({importRows.length})
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
