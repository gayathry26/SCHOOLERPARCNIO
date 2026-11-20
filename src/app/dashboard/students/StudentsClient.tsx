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
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { StepForm } from '@/components/ui/StepForm';
import { Avatar } from '@/components/ui/Avatar';
import { showToast } from '@/components/ui/Toast';
import { parseCSV, exportToCSV } from '@/lib/export';

export interface StudentRow {
  id: string;
  admissionNumber: string;
  rollNumber: string;
  name: string;
  email: string;
  gender: string;
  bloodGroup: string;
  className: string;
  sectionName: string;
  classId?: string;
  sectionId?: string;
  parentName: string;
  parentPhone: string;
  house: string;
  isArchived: boolean;
}

export interface ClassOption {
  id: string;
  name: string;
  sections: Array<{ id: string; name: string }>;
}

export const StudentsClient: React.FC<{
  initialStudents: StudentRow[];
  classes: ClassOption[];
  academicYears: Array<{ id: string; name: string; isCurrent: boolean }>;
}> = ({ initialStudents, classes, academicYears }) => {
  const [students, setStudents] = useState<StudentRow[]>(initialStudents);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<StudentRow[]>([]);
  const router = useRouter();

  // Drawer & Modal states
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);

  // Multi-step state
  const [addStep, setAddStep] = useState(1);
  const steps = [
    { id: 1, title: 'Basic Info' },
    { id: 2, title: 'Parent Info' },
    { id: 3, title: 'Academic' },
    { id: 4, title: 'Address' },
    { id: 5, title: 'Review' },
  ];

  // New Student Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: 'MALE',
    dob: '2012-05-15',
    bloodGroup: 'B+',
    address: 'Sector 62, Noida',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201309',
    emergencyContact: '+91 98100 12345',
    classId: classes[0]?.id || '',
    sectionId: classes[0]?.sections[0]?.id || '',
    rollNumber: '10A20',
    parentName: 'Ramesh Sharma',
    parentPhone: '+91 98100 12345',
    parentEmail: 'parent.ramesh@gmail.com',
    house: 'Emerald',
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

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (selectedClass && s.classId !== selectedClass) return false;
    if (selectedSection && s.sectionId !== selectedSection) return false;
    return true;
  });

  const columns: Column<StudentRow>[] = [
    {
      key: 'admissionNumber',
      header: 'Admission No',
      render: (row) => (
        <span className="font-mono font-bold text-[#086A92]">{row.admissionNumber}</span>
      ),
    },
    {
      key: 'name',
      header: 'Student',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.name} size="sm" house={row.house} />
          <div>
            <Link
              href={`/dashboard/students/${row.id}`}
              className="font-bold text-[#17313A] hover:text-[#086A92] transition-colors"
            >
              {row.name}
            </Link>
            <span className="text-[10.5px] text-[#6B7C83] block">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'className',
      header: 'Class',
      render: (row) => (
        <span className="font-semibold text-[#17313A]">
          {row.className}
        </span>
      ),
    },
    {
      key: 'sectionName',
      header: 'Section',
      render: (row) => (
        <span className="font-medium text-[#6B7C83]">
          {row.sectionName}
        </span>
      ),
    },
    {
      key: 'rollNumber',
      header: 'Roll No',
      render: (row) => <span className="font-mono text-[#17313A] font-semibold">{row.rollNumber}</span>,
    },
    {
      key: 'parentName',
      header: 'Parent / Contact',
      render: (row) => (
        <div>
          <span className="font-medium text-[#17313A] text-xs block">{row.parentName}</span>
          <span className="text-[10.5px] text-[#6B7C83] font-mono">{row.parentPhone}</span>
        </div>
      ),
    },
    {
      key: 'house',
      header: 'House',
      render: (row) => {
        const houseColors: Record<string, string> = {
          Ruby: 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]',
          Emerald: 'bg-[#EAF8EC] text-[#16A34A] border-[#bbf0c5]',
          Sapphire: 'bg-[#EAF5F8] text-[#086A92] border-[#c0e3ed]',
          Topaz: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
        };
        return (
          <span
            className={`px-2 py-0.5 text-[10.5px] font-bold rounded-full border ${houseColors[row.house] || 'bg-[#F1F5F7] text-[#6B7C83] border-[#E4EAEC]'
              }`}
          >
            {row.house}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (row) => (
        <Link href={`/dashboard/students/${row.id}`}>
          <Button variant="outline" size="xs" leftIcon={<Eye className="w-3 h-3 text-[#086A92]" />}>
            View
          </Button>
        </Link>
      ),
    },
  ];

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
            email: formData.email || `${formData.firstName.toLowerCase()}@edvonest.school`,
            gender: formData.gender,
            bloodGroup: formData.bloodGroup,
            className: selectedClassName,
            sectionName: selectedSectionName,
            classId: formData.classId,
            sectionId: formData.sectionId,
            parentName: formData.parentName,
            parentPhone: formData.parentPhone,
            house: formData.house,
            isArchived: false,
          };
          setStudents((prev) => [newRow, ...prev]);
        }
        showToast(`Student ${formData.firstName} ${formData.lastName} enrolled successfully!`, 'success');
        router.refresh();
      } else {
        showToast(data.error || 'Failed to add student', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsSubmitting(false);
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
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-[#E4EAEC] rounded-xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#17313A] tracking-tight flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#086A92]" />
              <span>Students</span>
            </h2>
            <Badge variant="blue" size="sm">
              {filteredStudents.length} Students
            </Badge>
          </div>
          <p className="text-xs text-[#6B7C83] mt-0.5">
            Manage student records, enrollment, parent details, promotions, and batch tools.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {selectedStudents.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPromoteModalOpen(true)}
              leftIcon={<ArrowRightLeft className="w-3.5 h-3.5 text-[#008C91]" />}
            >
              Promote ({selectedStudents.length})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            leftIcon={<Upload className="w-3.5 h-3.5 text-[#6B7C83]" />}
          >
            Import CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setAddStep(1);
              setIsAddDrawerOpen(true);
            }}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          >
            + Add Student
          </Button>
        </div>
      </div>

      {/* Filter Selectors Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E4EAEC] shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-[#17313A] font-bold">
          <Filter className="w-3.5 h-3.5 text-[#086A92]" />
          <span>Filters:</span>
        </div>

        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedSection('');
          }}
          className="bg-[#F7FAFA] border border-[#E4EAEC] rounded-lg px-2.5 py-1.5 text-xs text-[#17313A] font-semibold focus:outline-none focus:ring-1 focus:ring-[#086A92]"
        >
          <option value="">All Classes ({classes.length})</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {selectedClass && (
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="bg-[#F7FAFA] border border-[#E4EAEC] rounded-lg px-2.5 py-1.5 text-xs text-[#17313A] font-semibold focus:outline-none focus:ring-1 focus:ring-[#086A92]"
          >
            <option value="">All Sections</option>
            {classes
              .find((c) => c.id === selectedClass)
              ?.sections.map((s) => (
                <option key={s.id} value={s.id}>
                  Section {s.name}
                </option>
              ))}
          </select>
        )}

        {(selectedClass || selectedSection) && (
          <button
            onClick={() => {
              setSelectedClass('');
              setSelectedSection('');
            }}
            className="text-[#086A92] font-bold hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        )}

        <div className="ml-auto text-[#6B7C83]">
          Showing <span className="font-bold text-[#17313A]">{filteredStudents.length}</span> students
        </div>
      </div>

      {/* Main Student Directory Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        searchPlaceholder="Search students by name, roll no, admission #..."
        exportFilename="edvonest_students_directory"
        selectable={true}
        onSelectionChange={setSelectedStudents}
      />

      {/* ---------------------------------------------------- */}
      {/* STEP-BASED DRAWER: ADD NEW STUDENT */}
      {/* ---------------------------------------------------- */}
      <Drawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title="Add New Student"
        subtitle="Complete the step-by-step form to enroll a new student"
        width="xl"
      >
        <div className="space-y-4">
          <StepForm
            steps={steps}
            currentStep={addStep}
            onStepClick={(step) => setAddStep(step)}
          />

          <form onSubmit={handleAddStudent} className="space-y-4 text-xs pt-2">
            {/* Step 1: Basic Information */}
            {addStep === 1 && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h4 className="font-bold text-sm text-[#17313A] pb-1 border-b border-[#E4EAEC]">
                  Step 1: Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#17313A] mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E4EAEC] rounded-lg focus:outline-none focus:border-[#086A92]"
                      placeholder="Aarav"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#17313A] mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E4EAEC] rounded-lg focus:outline-none focus:border-[#086A92]"
                      placeholder="Verma"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-[#17313A] mb-1">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E4EAEC] rounded-lg focus:outline-none focus:border-[#086A92] bg-white font-semibold"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#17313A] mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E4EAEC] rounded-lg focus:outline-none focus:border-[#086A92]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#17313A] mb-1">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E4EAEC] rounded-lg focus:outline-none focus:border-[#086A92] bg-white"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Parent Information */}
            {addStep === 2 && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h4 className="font-bold text-sm text-[#17313A] pb-1 border-b border-[#E4EAEC]">
                  Step 2: Parent / Guardian Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#17313A] mb-1">Parent Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E4EAEC] rounded-lg focus:outline-none focus:border-[#086A92]"
                      placeholder="Ramesh Verma"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#17313A] mb-1">Parent Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E4EAEC] rounded-lg focus:outline-none focus:border-[#086A92]"
                      placeholder="+91 98100 12345"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-[#17313A] mb-1">Parent Email</label>
                  <input
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E4EAEC] rounded-lg focus:outline-none focus:border-[#086A92]"
                    placeholder="parent@example.com"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Academic Information */}
            {addStep === 3 && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h4 className="font-bold text-sm text-[#17313A] pb-1 border-b border-[#E4EAEC]">
                  Step 3: Academic &amp; Class Placement
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-[#17313A] mb-1">Class *</label>
                    <select
                      value={formData.classId}
                      onChange={(e) => {
                        const cId = e.target.value;
                        const c = classes.find((cls) => cls.id === cId);
                        setFormData({
                          ...formData,
                          classId: cId,
                          sectionId: c?.sections[0]?.id || '',
                        });
                      }}
                      className="w-full px-3 py-2 border border-[#E4EAEC] rounded-lg focus:outline-none focus:border-[#086A92] bg-white font-semibold"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#17313A] mb-1">Section *</label>
                    <select
                      value={formData.sectionId}
                      onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E4EAEC] rounded-lg focus:outline-none focus:border-[#086A92] bg-white font-semibold"
                    >
                      {classes
                        .find((c) => c.id === formData.classId)
                        ?.sections.map((s) => (
                          <option key={s.id} value={s.id}>
                            Section {s.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#17313A] mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E4EAEC] rounded-lg focus:outline-none focus:border-[#086A92]"
                      placeholder="10A05"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Residential Address & House */}
            {addStep === 4 && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h4 className="font-bold text-sm text-[#17313A] pb-1 border-b border-[#E4EAEC]">
                  Step 4: Residential Address &amp; House
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-bold text-[#17313A] mb-1">Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E4EAEC] rounded-lg focus:outline-none focus:border-[#086A92]"
                      placeholder="Plot 12, Sector 62"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#17313A] mb-1">House</label>
                    <select
                      value={formData.house}
                      onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E4EAEC] rounded-lg focus:outline-none focus:border-[#086A92] bg-white font-semibold"
                    >
                      <option value="Emerald">Emerald</option>
                      <option value="Ruby">Ruby</option>
                      <option value="Sapphire">Sapphire</option>
                      <option value="Topaz">Topaz</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review & Confirmation */}
            {addStep === 5 && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h4 className="font-bold text-sm text-[#17313A] pb-1 border-b border-[#E4EAEC]">
                  Step 5: Review Enrollment Details
                </h4>
                <div className="bg-[#F7FAFA] p-4 rounded-xl border border-[#E4EAEC] space-y-2.5">
                  <div className="flex justify-between border-b border-[#E4EAEC] pb-2">
                    <span className="text-[#6B7C83]">Student Name:</span>
                    <span className="font-bold text-[#17313A]">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E4EAEC] pb-2">
                    <span className="text-[#6B7C83]">Class &amp; Section:</span>
                    <span className="font-bold text-[#086A92]">{selectedClassName} - Section {selectedSectionName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E4EAEC] pb-2">
                    <span className="text-[#6B7C83]">Gender / DOB:</span>
                    <span className="font-bold text-[#17313A]">{formData.gender} • {formData.dob}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E4EAEC] pb-2">
                    <span className="text-[#6B7C83]">Parent:</span>
                    <span className="font-bold text-[#17313A]">{formData.parentName} ({formData.parentPhone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7C83]">House:</span>
                    <span className="font-bold text-[#35B84A]">{formData.house}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="pt-4 border-t border-[#E4EAEC] flex items-center justify-between">
              {addStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddStep((s) => Math.max(s - 1, 1))}
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              {addStep < 5 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setAddStep((s) => Math.min(s + 1, 5))}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="success"
                  size="sm"
                  isLoading={isSubmitting}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Save Student
                </Button>
              )}
            </div>
          </form>
        </div>
      </Drawer>

      {/* ---------------------------------------------------- */}
      {/* MODAL: BULK CSV IMPORT */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Bulk Student Import via CSV / Excel"
        subtitle="Import multiple students in one batch"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-[#F7FAFA] border border-dashed border-[#E4EAEC] rounded-xl text-center space-y-2">
            <FileSpreadsheet className="w-8 h-8 text-[#086A92] mx-auto" />
            <div>
              <label className="cursor-pointer font-bold text-[#086A92] hover:underline">
                <span>Select CSV File</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[#6B7C83] text-[11px] mt-0.5">
                Support headers: Student Name, Class, Section, Gender, Parent Name, Phone
              </p>
            </div>
            <button
              onClick={downloadSampleCSV}
              className="text-[11px] text-[#35B84A] hover:underline font-bold cursor-pointer"
            >
              Download Sample CSV Template
            </button>
          </div>

          {importRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[#17313A] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#35B84A]" />
                  <span>Preview ({importRows.length} rows loaded)</span>
                </span>
                <span className="text-[#6B7C83] text-[11px]">Ready to import</span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-[#E4EAEC] rounded-lg">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#F7FAFA] font-bold text-[#6B7C83]">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Class</th>
                      <th className="p-2">Section</th>
                      <th className="p-2">Parent</th>
                      <th className="p-2">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4EAEC]">
                    {importRows.slice(0, 10).map((r, i) => (
                      <tr key={i}>
                        <td className="p-2 font-mono">{i + 1}</td>
                        <td className="p-2 font-bold">{r['Student Name'] || r['name']}</td>
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
            <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-[#DC2626] space-y-1">
              {importErrors.map((err, i) => (
                <p key={i} className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{err}</span>
                </p>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-[#E4EAEC] flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsImportModalOpen(false);
                setImportRows([]);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={importRows.length === 0}
              isLoading={importLoading}
              onClick={handleConfirmImport}
            >
              Confirm &amp; Import ({importRows.length})
            </Button>
          </div>
        </div>
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* MODAL: BULK PROMOTION */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        title="Promote Students"
        subtitle={`Promoting ${selectedStudents.length} selected students`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-[#17313A] mb-1">Target Academic Year *</label>
              <select
                value={targetYearId}
                onChange={(e) => setTargetYearId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E4EAEC] rounded-lg focus:outline-none focus:border-[#086A92] bg-white font-semibold"
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
                <label className="block font-bold text-[#17313A] mb-1">Target Class *</label>
                <select
                  value={targetClassId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    const c = classes.find((cls) => cls.id === cId);
                    setTargetClassId(cId);
                    setTargetSectionId(c?.sections[0]?.id || '');
                  }}
                  className="w-full px-3 py-2 border border-[#E4EAEC] rounded-lg focus:outline-none focus:border-[#086A92] bg-white font-semibold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#17313A] mb-1">Target Section *</label>
                <select
                  value={targetSectionId}
                  onChange={(e) => setTargetSectionId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E4EAEC] rounded-lg focus:outline-none focus:border-[#086A92] bg-white font-semibold"
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

          <div className="pt-3 border-t border-[#E4EAEC] flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPromoteModalOpen(false)}
            >
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
    </div>
  );
};
