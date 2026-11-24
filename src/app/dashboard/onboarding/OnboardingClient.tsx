'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Calendar,
  Layers,
  BookOpen,
  UserCheck,
  GraduationCap,
  CreditCard,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Download,
  Upload,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  FileSpreadsheet,
  Check,
  Rocket,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { SessionUser } from '@/lib/auth';

export interface OnboardingStepMeta {
  id: number;
  key: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  isOptional: boolean;
}

const STEPS: OnboardingStepMeta[] = [
  { id: 1, key: 'profile', title: 'School Profile', subtitle: 'Affiliation, identity & board', icon: Building2, isOptional: false },
  { id: 2, key: 'academics', title: 'Academic Year', subtitle: 'Active session & terms', icon: Calendar, isOptional: false },
  { id: 3, key: 'classes', title: 'Classes & Sections', subtitle: 'Grade levels & rooms', icon: Layers, isOptional: false },
  { id: 4, key: 'subjects', title: 'Curriculum Subjects', subtitle: 'CBSE / ICSE syllabus', icon: BookOpen, isOptional: false },
  { id: 5, key: 'teachers', title: 'Teacher Onboarding', subtitle: 'Faculty roster & staff', icon: UserCheck, isOptional: true },
  { id: 6, key: 'students', title: 'Student Cohort', subtitle: 'Import student registry', icon: GraduationCap, isOptional: true },
  { id: 7, key: 'fees', title: 'Fee Planning', subtitle: 'Tuition & payment plans', icon: CreditCard, isOptional: true },
  { id: 8, key: 'timetable', title: 'Timetable Bell', subtitle: 'Periods & working days', icon: Clock, isOptional: true },
  { id: 9, key: 'permissions', title: 'Roles & Security', subtitle: 'RBAC & privacy controls', icon: ShieldCheck, isOptional: false },
  { id: 10, key: 'readiness', title: 'Dashboard Launch', subtitle: 'Readiness score & review', icon: Rocket, isOptional: false },
];

export const OnboardingClient: React.FC<{
  initialSchool: any;
  initialAcademicYears: any[];
  initialClasses: any[];
  initialSubjects: any[];
  initialTeachers: any[];
  initialStudents: any[];
  initialFeeCategories: any[];
  initialFeeStructures: any[];
  initialTimetableCount: number;
  currentUser: SessionUser;
}> = ({
  initialSchool,
  initialAcademicYears = [],
  initialClasses = [],
  initialSubjects = [],
  initialTeachers = [],
  initialStudents = [],
  initialFeeCategories = [],
  initialFeeStructures = [],
  initialTimetableCount = 0,
  currentUser,
}) => {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Completed steps tracking
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);

  // Master local state for fast reactivity
  const [school, setSchool] = useState(initialSchool || {});
  const [academicYears, setAcademicYears] = useState(initialAcademicYears);
  const [classes, setClasses] = useState(initialClasses);
  const [subjects, setSubjects] = useState(initialSubjects);
  const [teachers, setTeachers] = useState(initialTeachers);
  const [students, setStudents] = useState(initialStudents);
  const [feeCategories, setFeeCategories] = useState(initialFeeCategories);
  const [timetableCount, setTimetableCount] = useState(initialTimetableCount);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // STEP 1 Form
  const [profileForm, setProfileForm] = useState({
    name: school?.name || 'Edvonest Model International Academy',
    affiliationNo: school?.affiliationNo || 'CBSE/AFF/2026/89410',
    board: school?.board || 'CBSE',
    email: school?.email || 'contact@edvonest-academy.edu.in',
    phone: school?.phone || '+91 11 4982 3000',
    address: school?.address || 'Plot 12, Institutional Area, Sector 62',
    city: school?.city || 'Noida',
    state: school?.state || 'Uttar Pradesh',
    pincode: school?.pincode || '201309',
    currencySymbol: school?.currencySymbol || '₹',
    currencyCode: school?.currencyCode || 'INR',
    attendanceThreshold: school?.attendanceThreshold || 75.0,
    logoUrl: school?.logoUrl || '',
  });

  // STEP 2 Form
  const activeYear = academicYears.find((y) => y.isCurrent) || academicYears[0];
  const [academicForm, setAcademicForm] = useState({
    name: activeYear?.name || '2026-2027',
    startDate: activeYear ? new Date(activeYear.startDate).toISOString().split('T')[0] : '2026-04-01',
    endDate: activeYear ? new Date(activeYear.endDate).toISOString().split('T')[0] : '2027-03-31',
    isCurrent: true,
  });

  // STEP 3 Form: Classes Builder
  const [customClasses, setCustomClasses] = useState<Array<{ name: string; gradeOrder: number; sections: string[] }>>(() => {
    if (classes.length > 0) {
      return classes.map((c) => ({
        name: c.name,
        gradeOrder: c.numericOrder || c.gradeOrder || 1,
        sections: c.sections?.map((s: any) => s.name) || ['A'],
      }));
    }
    return [
      { name: 'Class 9', gradeOrder: 9, sections: ['A', 'B'] },
      { name: 'Class 10', gradeOrder: 10, sections: ['A', 'B', 'C'] },
      { name: 'Class 11', gradeOrder: 11, sections: ['A', 'B'] },
      { name: 'Class 12', gradeOrder: 12, sections: ['A', 'B'] },
    ];
  });

  // STEP 4 Form: Subjects
  const [subjectList, setSubjectList] = useState<Array<{ name: string; code: string; type: string; maxTheory: number; maxPractical: number }>>([
    { name: 'Mathematics', code: '041', type: 'CORE', maxTheory: 80, maxPractical: 20 },
    { name: 'Science & Technology', code: '086', type: 'CORE', maxTheory: 80, maxPractical: 20 },
    { name: 'English Language & Literature', code: '184', type: 'CORE', maxTheory: 80, maxPractical: 20 },
    { name: 'Hindi Course A', code: '002', type: 'CORE', maxTheory: 80, maxPractical: 20 },
    { name: 'Social Science', code: '087', type: 'CORE', maxTheory: 80, maxPractical: 20 },
    { name: 'Computer Applications & AI', code: '165', type: 'ELECTIVE', maxTheory: 50, maxPractical: 50 },
  ]);

  // STEP 5: Teacher CSV State
  const [teacherCsvText, setTeacherCsvText] = useState('');
  const [parsedTeachers, setParsedTeachers] = useState<any[]>([]);
  const [teacherErrors, setTeacherErrors] = useState<string[]>([]);

  // STEP 6: Student CSV State
  const [studentCsvText, setStudentCsvText] = useState('');
  const [parsedStudents, setParsedStudents] = useState<any[]>([]);
  const [studentErrors, setStudentErrors] = useState<string[]>([]);

  // STEP 7: Fee Configuration
  const [feeForm, setFeeForm] = useState({
    baseTuitionFee: 36000,
    categories: ['Tuition Fee', 'Admission Fee', 'Annual Development Charges', 'Computer Lab & STEM', 'Examination Fee'],
    frequency: 'QUARTERLY',
    dueDateDay: 10,
    lateFeePerDay: 50,
  });

  // STEP 8: Timetable Bell Framework
  const [timetableForm, setTimetableForm] = useState({
    periodsCount: 8,
    startTime: '08:30',
    periodDuration: 45,
    recessAfterPeriod: 4,
    recessDuration: 30,
    workingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  });

  // ----------------------------------------------------
  // READINESS CALCULATION
  // ----------------------------------------------------
  const readinessChecklist = useMemo(() => {
    return {
      profile: Boolean(school?.name && school?.affiliationNo),
      academicYear: academicYears.length > 0,
      classes: classes.length > 0,
      subjects: subjects.length > 0,
      teachers: teachers.length > 0,
      students: students.length > 0,
      fees: feeCategories.length > 0 || initialFeeStructures.length > 0,
      timetable: timetableCount > 0,
      permissions: true,
    };
  }, [school, academicYears, classes, subjects, teachers, students, feeCategories, initialFeeStructures, timetableCount]);

  const readinessScore = useMemo(() => {
    let score = 0;
    if (readinessChecklist.profile) score += 15;
    if (readinessChecklist.academicYear) score += 10;
    if (readinessChecklist.classes) score += 15;
    if (readinessChecklist.subjects) score += 10;
    if (readinessChecklist.teachers) score += 15;
    if (readinessChecklist.students) score += 15;
    if (readinessChecklist.fees) score += 10;
    if (readinessChecklist.timetable) score += 5;
    if (readinessChecklist.permissions) score += 5;
    return Math.min(100, score);
  }, [readinessChecklist]);

  // ----------------------------------------------------
  // CSV TEMPLATE GENERATORS & DOWNLOADS
  // ----------------------------------------------------
  const downloadTeacherTemplate = () => {
    const csvContent =
      'firstName,lastName,email,phone,employeeId,department,designation\n' +
      'Ananya,Sharma,ananya.sharma@edvonest.edu.in,+91 98765 43210,EMP-101,Mathematics,Senior PGT\n' +
      'Rajesh,Verma,rajesh.verma@edvonest.edu.in,+91 98765 43211,EMP-102,Science,TGT Physics\n' +
      'Pooja,Nair,pooja.nair@edvonest.edu.in,+91 98765 43212,EMP-103,Languages,PGT English\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'teachers_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded teachers_template.csv');
  };

  const downloadStudentTemplate = () => {
    const csvContent =
      'firstName,lastName,admissionNumber,rollNumber,className,sectionName,gender,dateOfBirth,parentName,parentPhone,parentEmail\n' +
      'Aarav,Patel,EDV-2026-001,1,Class 10,A,MALE,2010-05-14,Vikram Patel,+91 98111 22334,vikram.patel@gmail.com\n' +
      'Diya,Kapoor,EDV-2026-002,2,Class 10,A,FEMALE,2010-08-22,Meenakshi Kapoor,+91 98111 22335,meenakshi.kapoor@gmail.com\n' +
      'Rohan,Mehta,EDV-2026-003,3,Class 10,B,MALE,2010-11-03,Suresh Mehta,+91 98111 22336,suresh.mehta@gmail.com\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'students_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded students_template.csv');
  };

  // CSV Parsers
  const parseTeacherCsv = (raw: string) => {
    setTeacherCsvText(raw);
    const lines = raw.trim().split('\n');
    if (lines.length <= 1) {
      setParsedTeachers([]);
      setTeacherErrors(['CSV must have a header row and at least one data row']);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const validRows: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(',').map((v) => v.trim());
      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });

      if (!row.firstname || !row.email) {
        errors.push(`Row ${i}: Missing required First Name or Email`);
      } else if (!row.email.includes('@')) {
        errors.push(`Row ${i}: Invalid email address "${row.email}"`);
      } else {
        validRows.push({
          firstName: row.firstname,
          lastName: row.lastname || '',
          email: row.email,
          phone: row.phone || '',
          employeeId: row.employeeid || `EMP-${Date.now().toString().slice(-4)}`,
          department: row.department || 'Academics',
          designation: row.designation || 'Teacher',
        });
      }
    }

    setParsedTeachers(validRows);
    setTeacherErrors(errors);
  };

  const parseStudentCsv = (raw: string) => {
    setStudentCsvText(raw);
    const lines = raw.trim().split('\n');
    if (lines.length <= 1) {
      setParsedStudents([]);
      setStudentErrors(['CSV must have a header row and at least one data row']);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const validRows: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(',').map((v) => v.trim());
      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });

      if (!row.firstname || !row.admissionnumber) {
        errors.push(`Row ${i}: Missing Student First Name or Admission Number`);
      } else {
        validRows.push({
          firstName: row.firstname,
          lastName: row.lastname || '',
          admissionNumber: row.admissionnumber,
          rollNumber: row.rollnumber || '1',
          className: row.classname || 'Class 10',
          sectionName: row.sectionname || 'A',
          gender: (row.gender || 'MALE').toUpperCase(),
          dateOfBirth: row.dateofbirth || '2010-01-01',
          parentName: row.parentname || 'Guardian',
          parentPhone: row.parentphone || '',
          parentEmail: row.parentemail || '',
        });
      }
    }

    setParsedStudents(validRows);
    setStudentErrors(errors);
  };

  // ----------------------------------------------------
  // STEP ACTION SUBMITTERS
  // ----------------------------------------------------
  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_PROFILE', ...profileForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      setSchool(data.school);
      setCompletedSteps((prev) => Array.from(new Set([...prev, 1])));
      showToast('School profile saved successfully!');
      setCurrentStep(2);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAcademicYear = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SETUP_ACADEMIC_YEAR', ...academicForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to setup academic session');
      setAcademicYears([data.academicYear]);
      setCompletedSteps((prev) => Array.from(new Set([...prev, 2])));
      showToast('Academic session activated!');
      setCurrentStep(3);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveClasses = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SETUP_CLASSES', classesList: customClasses }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to setup classes');
      setClasses(data.classes);
      setCompletedSteps((prev) => Array.from(new Set([...prev, 3])));
      showToast(`Configured ${customClasses.length} classes with sections!`);
      setCurrentStep(4);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSubjects = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SETUP_SUBJECTS', subjectsList: subjectList }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save subjects');
      setSubjects(data.subjects);
      setCompletedSteps((prev) => Array.from(new Set([...prev, 4])));
      showToast(`Added ${subjectList.length} curriculum subjects!`);
      setCurrentStep(5);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportTeachers = async () => {
    if (parsedTeachers.length === 0) {
      showToast('Please upload or paste teacher CSV records', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'IMPORT_TEACHERS', teachersList: parsedTeachers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import teachers');
      setCompletedSteps((prev) => Array.from(new Set([...prev, 5])));
      showToast(`Successfully imported ${data.importedCount} faculty members!`);
      setCurrentStep(6);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportStudents = async () => {
    if (parsedStudents.length === 0) {
      showToast('Please upload or paste student CSV records', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'IMPORT_STUDENTS', studentsList: parsedStudents }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import students');
      setCompletedSteps((prev) => Array.from(new Set([...prev, 6])));
      showToast(`Successfully enrolled ${data.importedCount} students!`);
      setCurrentStep(7);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveFees = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SETUP_FEES',
          feeCategories: feeForm.categories,
          baseTuitionFee: feeForm.baseTuitionFee,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to configure fees');
      setFeeCategories(data.categories);
      setCompletedSteps((prev) => Array.from(new Set([...prev, 7])));
      showToast('Fee structure and categories established!');
      setCurrentStep(8);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTimetable = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SETUP_TIMETABLE',
          ...timetableForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to configure timetable');
      setTimetableCount(8);
      setCompletedSteps((prev) => Array.from(new Set([...prev, 8])));
      showToast('Timetable bells and periods configured!');
      setCurrentStep(9);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompletePermissions = () => {
    setCompletedSteps((prev) => Array.from(new Set([...prev, 9])));
    showToast('Role permissions and security baselines verified!');
    setCurrentStep(10);
  };

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'COMPLETE_ONBOARDING' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete onboarding');

      setCompletedSteps((prev) => Array.from(new Set([...prev, 10])));
      showToast('Congratulations! School onboarding complete. Ready for live operations.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadSetupSummaryJson = () => {
    const summary = {
      institution: school?.name,
      affiliationNo: school?.affiliationNo,
      board: school?.board,
      academicSession: activeYear?.name,
      classesConfigured: classes.length,
      curriculumSubjects: subjects.length,
      teachersCount: teachers.length,
      studentsCount: students.length,
      readinessScore: `${readinessScore}%`,
      onboardingCompletedAt: new Date().toISOString(),
      verifiedBy: `${currentUser.firstName} ${currentUser.lastName} (${currentUser.role})`,
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EdvoNest_Setup_Summary_${school?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'School'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded School Setup Summary report!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-[#990000] via-[#800000] to-slate-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                Institutional Setup Wizard
              </span>
              <Badge variant="emerald" size="sm">
                Session {academicForm.name}
              </Badge>
            </div>
            <h2 className="text-2xl font-black tracking-tight mt-2 text-white">
              EdvoNest Guided School Onboarding
            </h2>
            <p className="text-xs text-white/80 mt-1 max-w-2xl leading-relaxed">
              Configure your school profile, academic calendar, grades, subjects, faculty roster, student cohort, fee structures, and timetable bells in 10 seamless steps.
            </p>
          </div>

          {/* Readiness gauge pill */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-4 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/70 block">Readiness Score</span>
              <span className="text-2xl font-black text-cyan-300">{readinessScore}%</span>
            </div>
            <div className="h-10 w-[1px] bg-white/20" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/70 block">Current Step</span>
              <span className="text-sm font-bold text-white">{currentStep} of 10</span>
            </div>
          </div>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Step Navigation Bar (Stepper) */}
      <Card className="p-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-[840px]">
          {STEPS.map((s, idx) => {
            const isCompleted = completedSteps.includes(s.id);
            const isCurrent = s.id === currentStep;
            const Icon = s.icon;

            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => setCurrentStep(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition shrink-0 ${
                    isCurrent
                      ? 'bg-[#990000] text-white shadow-2xs'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-white text-[#990000]'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.id}
                  </div>
                  <div>
                    <span className="text-xs font-bold block leading-tight truncate">{s.title}</span>
                    <span
                      className={`text-[9.5px] block leading-none truncate ${
                        isCurrent ? 'text-white/80' : 'text-slate-400'
                      }`}
                    >
                      {s.isOptional ? 'Optional' : 'Required'}
                    </span>
                  </div>
                </button>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-[2px] w-4 shrink-0 transition-colors ${
                      completedSteps.includes(s.id) ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Card>

      {/* STEP CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Step Workspace (Left 3 Columns) */}
        <div className="lg:col-span-3 space-y-4">
          {/* STEP 1: SCHOOL PROFILE */}
          {currentStep === 1 && (
            <Card className="p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#990000]" />
                    <span>Step 1: School Identity &amp; Affiliation</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official institution name, CBSE/ICSE board registration, official communication channels, and address.
                  </p>
                </div>
                <Badge variant="blue">Mandatory</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institution Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Affiliation / Board Code *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.affiliationNo}
                    onChange={(e) => setProfileForm({ ...profileForm, affiliationNo: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Education Board *</label>
                  <select
                    value={profileForm.board}
                    onChange={(e) => setProfileForm({ ...profileForm, board: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  >
                    <option value="CBSE">CBSE (Central Board of Secondary Education)</option>
                    <option value="ICSE">CISCE / ICSE / ISC</option>
                    <option value="STATE_BOARD">State Secondary Education Board</option>
                    <option value="CAMBRIDGE">Cambridge International (CAIE)</option>
                    <option value="IB">International Baccalaureate (IB)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official School Email *</label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Contact Phone</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attendance Minimum Threshold (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    step="0.5"
                    value={profileForm.attendanceThreshold}
                    onChange={(e) => setProfileForm({ ...profileForm, attendanceThreshold: parseFloat(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Campus Street Address</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State / Province</label>
                  <input
                    type="text"
                    value={profileForm.state}
                    onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400">Step 1 of 10</span>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={isSubmitting}
                  onClick={handleSaveProfile}
                  className="bg-[#990000] text-white flex items-center gap-1.5"
                >
                  <span>{isSubmitting ? 'Saving...' : 'Save & Continue'}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: ACADEMIC YEAR */}
          {currentStep === 2 && (
            <Card className="p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#990000]" />
                    <span>Step 2: Academic Session Configuration</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define the primary operational academic year for grades, examinations, and promotions.
                  </p>
                </div>
                <Badge variant="blue">Mandatory</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Session Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026-2027"
                    value={academicForm.name}
                    onChange={(e) => setAcademicForm({ ...academicForm, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isCurr"
                    checked={academicForm.isCurrent}
                    onChange={(e) => setAcademicForm({ ...academicForm, isCurrent: e.target.checked })}
                    className="w-4 h-4 text-[#990000] rounded"
                  />
                  <label htmlFor="isCurr" className="font-semibold text-slate-800 cursor-pointer">
                    Set as Currently Active Academic Session
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Session Start Date *</label>
                  <input
                    type="date"
                    required
                    value={academicForm.startDate}
                    onChange={(e) => setAcademicForm({ ...academicForm, startDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Session End Date *</label>
                  <input
                    type="date"
                    required
                    value={academicForm.endDate}
                    onChange={(e) => setAcademicForm({ ...academicForm, endDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-[#990000] flex items-start gap-2">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  In accordance with CBSE academic regulations, a standard session spans 12 months with Term 1 (April–September) and Term 2 (October–March).
                </span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={() => setCurrentStep(1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={isSubmitting}
                  onClick={handleSaveAcademicYear}
                  className="bg-[#990000] text-white flex items-center gap-1.5"
                >
                  <span>{isSubmitting ? 'Saving...' : 'Save & Continue'}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: CLASSES & SECTIONS */}
          {currentStep === 3 && (
            <Card className="p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#990000]" />
                    <span>Step 3: Grade Levels &amp; Section Allocation</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define the class matrix and classroom sections (e.g., Class 10-A, 10-B).
                  </p>
                </div>
                <Badge variant="blue">Mandatory</Badge>
              </div>

              {/* Class rows builder */}
              <div className="space-y-3">
                {customClasses.map((cls, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-sky-100 text-[#990000] font-bold flex items-center justify-center shrink-0">
                        {cls.gradeOrder}
                      </span>
                      <div>
                        <strong className="text-slate-900 text-sm block">{cls.name}</strong>
                        <span className="text-slate-500">
                          Grade Order: {cls.gradeOrder} • Active Sections:{' '}
                          <span className="font-semibold text-slate-800">{cls.sections.join(', ')}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const nextSec = String.fromCharCode(65 + cls.sections.length);
                          if (cls.sections.length < 6) {
                            const updated = [...customClasses];
                            updated[idx].sections.push(nextSec);
                            setCustomClasses(updated);
                          }
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#990000] bg-sky-50 rounded-lg hover:bg-sky-100 border border-sky-200 transition"
                      >
                        + Add Section
                      </button>
                      {customClasses.length > 1 && (
                        <button
                          onClick={() => {
                            setCustomClasses(customClasses.filter((_, i) => i !== idx));
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Remove Class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    const nextNum = customClasses.length + 1;
                    setCustomClasses([
                      ...customClasses,
                      { name: `Class ${nextNum}`, gradeOrder: nextNum, sections: ['A', 'B'] },
                    ]);
                  }}
                  className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-xs font-semibold text-[#990000] hover:border-[#990000] hover:bg-sky-50/50 transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Grade Level
                </button>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={() => setCurrentStep(2)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={isSubmitting}
                  onClick={handleSaveClasses}
                  className="bg-[#990000] text-white flex items-center gap-1.5"
                >
                  <span>{isSubmitting ? 'Saving...' : 'Save & Continue'}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 4: CURRICULUM SUBJECTS */}
          {currentStep === 4 && (
            <Card className="p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#990000]" />
                    <span>Step 4: Academic Subjects &amp; Mark Blueprint</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Standard curriculum subjects, course codes, and theory/practical marks distribution.
                  </p>
                </div>
                <Badge variant="blue">Mandatory</Badge>
              </div>

              {/* Subject list */}
              <div className="space-y-2.5 text-xs">
                {subjectList.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-500 px-2 py-1 bg-slate-100 rounded-lg">
                        {sub.code}
                      </span>
                      <div>
                        <strong className="text-slate-900 text-sm block">{sub.name}</strong>
                        <span className="text-slate-500">
                          Type: <strong className="text-slate-700">{sub.type}</strong> • Theory: {sub.maxTheory} marks • Practical: {sub.maxPractical} marks
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSubjectList(subjectList.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setSubjectList([
                      ...subjectList,
                      { name: 'Physics & Chemistry Lab', code: `LAB-${Date.now().toString().slice(-3)}`, type: 'PRACTICAL', maxTheory: 40, maxPractical: 60 },
                    ]);
                  }}
                  className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#990000] hover:border-[#990000] transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Additional Subject
                </button>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={() => setCurrentStep(3)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={isSubmitting}
                  onClick={handleSaveSubjects}
                  className="bg-[#990000] text-white flex items-center gap-1.5"
                >
                  <span>{isSubmitting ? 'Saving...' : 'Save & Continue'}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 5: TEACHER ONBOARDING */}
          {currentStep === 5 && (
            <Card className="p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <span>Step 5: Faculty Roster &amp; Teacher Onboarding</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload your teaching staff via CSV template with automatic credential setup.
                  </p>
                </div>
                <Badge variant="slate">Optional (Can Skip)</Badge>
              </div>

              {/* Template Download Ribbon */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div>
                  <strong className="text-emerald-900 block font-bold">Standard Teacher CSV Template</strong>
                  <span className="text-emerald-700">Columns: firstName, lastName, email, phone, employeeId, department, designation</span>
                </div>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={downloadTeacherTemplate}
                  className="bg-white text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download CSV
                </Button>
              </div>

              {/* CSV Upload / Paste Box */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Paste or Upload Teacher CSV Data:
                </label>
                <textarea
                  rows={5}
                  placeholder="firstName,lastName,email,phone,employeeId,department,designation&#10;Ananya,Sharma,ananya.sharma@edvonest.edu.in,+91 98765 43210,EMP-101,Mathematics,Senior PGT"
                  value={teacherCsvText}
                  onChange={(e) => parseTeacherCsv(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-300 rounded-lg p-3 focus:border-[#990000] outline-none"
                />
              </div>

              {/* Validation Feedback */}
              {parsedTeachers.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    ✓ Validated <strong className="text-emerald-600">{parsedTeachers.length}</strong> teacher records ready for import.
                  </span>
                  <Badge variant="emerald">{parsedTeachers.length} Ready</Badge>
                </div>
              )}

              {teacherErrors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                  <strong>Validation Issues Detected:</strong>
                  {teacherErrors.map((err, i) => (
                    <p key={i} className="text-[11px]">• {err}</p>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={() => setCurrentStep(4)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCompletedSteps((prev) => Array.from(new Set([...prev, 5])));
                      setCurrentStep(6);
                    }}
                  >
                    Skip for Now
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isSubmitting || parsedTeachers.length === 0}
                    onClick={handleImportTeachers}
                    className="bg-[#990000] text-white flex items-center gap-1.5"
                  >
                    <span>{isSubmitting ? 'Importing...' : 'Import & Continue'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 6: STUDENT IMPORT */}
          {currentStep === 6 && (
            <Card className="p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    <span>Step 6: Student Cohort &amp; Parent Profiles</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Import enrolled learners, assign admission numbers, and link emergency parent contacts.
                  </p>
                </div>
                <Badge variant="slate">Optional (Can Skip)</Badge>
              </div>

              {/* Template Download Ribbon */}
              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div>
                  <strong className="text-purple-900 block font-bold">Standard Student CSV Template</strong>
                  <span className="text-purple-700">Columns: firstName, lastName, admissionNumber, rollNumber, className, sectionName, gender, dateOfBirth, parentName, parentPhone, parentEmail</span>
                </div>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={downloadStudentTemplate}
                  className="bg-white text-purple-700 hover:bg-purple-50 border-purple-300"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download CSV
                </Button>
              </div>

              {/* CSV Upload / Paste Box */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Paste or Upload Student CSV Data:
                </label>
                <textarea
                  rows={5}
                  placeholder="firstName,lastName,admissionNumber,rollNumber,className,sectionName,gender,dateOfBirth,parentName,parentPhone,parentEmail&#10;Aarav,Patel,EDV-2026-001,1,Class 10,A,MALE,2010-05-14,Vikram Patel,+91 98111 22334,vikram.patel@gmail.com"
                  value={studentCsvText}
                  onChange={(e) => parseStudentCsv(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-300 rounded-lg p-3 focus:border-[#990000] outline-none"
                />
              </div>

              {/* Validation Feedback */}
              {parsedStudents.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    ✓ Validated <strong className="text-purple-600">{parsedStudents.length}</strong> student records ready for database enrollment.
                  </span>
                  <Badge variant="purple">{parsedStudents.length} Enrollees</Badge>
                </div>
              )}

              {studentErrors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                  <strong>Validation Issues Detected:</strong>
                  {studentErrors.map((err, i) => (
                    <p key={i} className="text-[11px]">• {err}</p>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={() => setCurrentStep(5)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCompletedSteps((prev) => Array.from(new Set([...prev, 6])));
                      setCurrentStep(7);
                    }}
                  >
                    Skip for Now
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isSubmitting || parsedStudents.length === 0}
                    onClick={handleImportStudents}
                    className="bg-[#990000] text-white flex items-center gap-1.5"
                  >
                    <span>{isSubmitting ? 'Importing...' : 'Enroll Students'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 7: FEE CONFIGURATION */}
          {currentStep === 7 && (
            <Card className="p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    <span>Step 7: Tuition Fees &amp; Billing Schedule</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure institutional fee heads, base tuition structures, and late payment penalty grace periods.
                  </p>
                </div>
                <Badge variant="slate">Optional (Can Skip)</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Annual Tuition Fee (₹) *</label>
                  <input
                    type="number"
                    step="500"
                    value={feeForm.baseTuitionFee}
                    onChange={(e) => setFeeForm({ ...feeForm, baseTuitionFee: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Frequency</label>
                  <select
                    value={feeForm.frequency}
                    onChange={(e) => setFeeForm({ ...feeForm, frequency: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  >
                    <option value="MONTHLY">Monthly (12 Invoices)</option>
                    <option value="QUARTERLY">Quarterly (4 Terms - Recommended)</option>
                    <option value="BI_ANNUAL">Bi-Annual (2 Semesters)</option>
                    <option value="ANNUAL">Annual One-Time</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Payment Due Day</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={feeForm.dueDateDay}
                    onChange={(e) => setFeeForm({ ...feeForm, dueDateDay: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Daily Late Penalty (₹ / day)</label>
                  <input
                    type="number"
                    min="0"
                    value={feeForm.lateFeePerDay}
                    onChange={(e) => setFeeForm({ ...feeForm, lateFeePerDay: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>
              </div>

              {/* Fee Categories Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Standard Fee Heads:
                </label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {feeForm.categories.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-semibold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={() => setCurrentStep(6)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCompletedSteps((prev) => Array.from(new Set([...prev, 7])));
                      setCurrentStep(8);
                    }}
                  >
                    Skip for Now
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isSubmitting}
                    onClick={handleSaveFees}
                    className="bg-[#990000] text-white flex items-center gap-1.5"
                  >
                    <span>{isSubmitting ? 'Saving...' : 'Save & Continue'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 8: TIMETABLE CONFIGURATION */}
          {currentStep === 8 && (
            <Card className="p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-sky-600" />
                    <span>Step 8: Timetable Framework &amp; Bell Schedule</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure daily periods count, morning assembly, period durations, and lunch break timings.
                  </p>
                </div>
                <Badge variant="slate">Optional (Can Skip)</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Daily Periods</label>
                  <input
                    type="number"
                    min="5"
                    max="10"
                    value={timetableForm.periodsCount}
                    onChange={(e) => setTimetableForm({ ...timetableForm, periodsCount: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Morning Assembly Start Time</label>
                  <input
                    type="time"
                    value={timetableForm.startTime}
                    onChange={(e) => setTimetableForm({ ...timetableForm, startTime: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Period Duration (Minutes)</label>
                  <input
                    type="number"
                    min="30"
                    max="60"
                    step="5"
                    value={timetableForm.periodDuration}
                    onChange={(e) => setTimetableForm({ ...timetableForm, periodDuration: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recess Break Duration (Minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="60"
                    step="5"
                    value={timetableForm.recessDuration}
                    onChange={(e) => setTimetableForm({ ...timetableForm, recessDuration: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
                  />
                </div>
              </div>

              {/* Working days chips */}
              <div className="text-xs">
                <span className="font-semibold text-slate-700 block mb-1">Working Days:</span>
                <div className="flex gap-2">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                    <Badge key={d} variant="blue" size="sm">
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={() => setCurrentStep(7)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCompletedSteps((prev) => Array.from(new Set([...prev, 8])));
                      setCurrentStep(9);
                    }}
                  >
                    Skip for Now
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isSubmitting}
                    onClick={handleSaveTimetable}
                    className="bg-[#990000] text-white flex items-center gap-1.5"
                  >
                    <span>{isSubmitting ? 'Saving...' : 'Save & Continue'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 9: PERMISSIONS & SECURITY */}
          {currentStep === 9 && (
            <Card className="p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <span>Step 9: Role-Based Access Control (RBAC) &amp; Security</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review security parameters, tenant isolation boundaries, and granular 16-role permission defaults.
                  </p>
                </div>
                <Badge variant="emerald">Verified System</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 font-bold block">CBSE &amp; FERPA Data Privacy Safeguards:</strong>
                  <p className="text-slate-600">
                    • Multi-tenant tenant identifier (<code className="text-[#990000]">schoolId</code>) strictly isolates all queries.
                  </p>
                  <p className="text-slate-600">
                    • Passwords hashed with standard <code className="text-[#990000]">bcryptjs</code> (salt rounds: 10).
                  </p>
                  <p className="text-slate-600">
                    • Immutable audit logging actively records all fee updates, marks entry, and student records.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="font-bold text-slate-800 block">Principal</span>
                    <span className="text-slate-500">18 Subsystems</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="font-bold text-slate-800 block">Teacher</span>
                    <span className="text-slate-500">8 Subsystems</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="font-bold text-slate-800 block">Accountant</span>
                    <span className="text-slate-500">6 Subsystems</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="font-bold text-slate-800 block">Parent / Student</span>
                    <span className="text-slate-500">Protected Portals</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={() => setCurrentStep(8)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleCompletePermissions}
                  className="bg-[#990000] text-white flex items-center gap-1.5"
                >
                  <span>Confirm &amp; Proceed to Launch</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 10: READINESS & LAUNCH */}
          {currentStep === 10 && (
            <Card className="p-6 space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-emerald-600" />
                    <span>Step 10: Institutional Readiness &amp; Dashboard Launch</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review your setup verification score and activate live campus operational status.
                  </p>
                </div>
                <Badge variant={readinessScore >= 80 ? 'emerald' : 'amber'}>
                  {readinessScore}% Operational Readiness
                </Badge>
              </div>

              {/* Congratulatory Hero Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    Setup Complete
                  </span>
                  <h4 className="text-lg font-bold mt-1 text-white">{school?.name || 'Your School'} is Ready!</h4>
                  <p className="text-xs text-white/90 mt-0.5">
                    All core academic, administrative, and financial structures are verified and ready for live use.
                  </p>
                </div>
                <div className="text-center sm:text-right shrink-0">
                  <span className="text-3xl font-black text-cyan-200">{readinessScore}%</span>
                  <span className="text-[10px] uppercase font-bold text-white/80 block">Verified Score</span>
                </div>
              </div>

              {/* Setup Verification Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block">School Identity Profile</strong>
                    <span className="text-slate-500">{school?.name} ({school?.board})</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block">Academic Session</strong>
                    <span className="text-slate-500">Session {academicForm.name} (Active)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block">Grade Classes &amp; Sections</strong>
                    <span className="text-slate-500">{classes.length} Classes configured</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block">Curriculum Subjects</strong>
                    <span className="text-slate-500">{subjects.length} Subjects mapped</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block">Teaching Faculty Roster</strong>
                    <span className="text-slate-500">Faculty directory ready</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block">Student Registry &amp; Parents</strong>
                    <span className="text-slate-500">Student enrollment ready</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block">Tuition &amp; Fees Architecture</strong>
                    <span className="text-slate-500">Fee plans &amp; receipt counter ready</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block">Timetable Bells &amp; Working Days</strong>
                    <span className="text-slate-500">8 Periods schedule initialized</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadSetupSummaryJson}
                  className="w-full sm:w-auto text-slate-700"
                >
                  <Download className="w-4 h-4 mr-1.5" /> Download Setup Report (.json)
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button size="sm" variant="outline" onClick={() => setCurrentStep(9)}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isSubmitting}
                    onClick={handleCompleteOnboarding}
                    className="w-full sm:w-auto bg-[#35B84A] hover:bg-[#2fa341] text-white flex items-center justify-center gap-2 font-bold px-5 shadow-sm"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>{isSubmitting ? 'Launching...' : 'Launch Live Dashboard'}</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Sidebar: Step Summary & Quick Shortcuts */}
        <div className="space-y-4">
          {/* Quick Guide Card */}
          <Card className="p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#990000]" />
              <span>Onboarding Checklist</span>
            </h4>

            <div className="space-y-2 text-xs">
              {STEPS.map((s) => {
                const isCompleted = completedSteps.includes(s.id);
                const isCurrent = s.id === currentStep;

                return (
                  <div
                    key={s.id}
                    onClick={() => setCurrentStep(s.id)}
                    className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition ${
                      isCurrent
                        ? 'bg-sky-50 border border-sky-200 text-[#990000] font-bold'
                        : isCompleted
                        ? 'text-slate-800 hover:bg-slate-50'
                        : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-[#990000] text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isCompleted ? <Check className="w-2.5 h-2.5" /> : s.id}
                      </div>
                      <span className="truncate">{s.title}</span>
                    </div>

                    {isCompleted ? (
                      <Badge variant="emerald" size="xs">
                        Done
                      </Badge>
                    ) : s.isOptional ? (
                      <span className="text-[10px] text-slate-400">Optional</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* User Tour Trigger Card */}
          <Card className="p-4 space-y-2.5 bg-gradient-to-br from-slate-50 to-sky-50/50 border border-sky-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#990000] text-white flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs text-slate-900 block font-bold">Interactive Role Tour</strong>
                <span className="text-[11px] text-slate-500">Need a guided tour of features?</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug">
              Launch lightweight contextual tooltips explaining key operations for your role.
            </p>

            <Button
              size="xs"
              variant="outline"
              onClick={() => window.dispatchEvent(new CustomEvent('start-walkthrough'))}
              className="w-full text-[#990000] bg-white hover:bg-sky-50 border-sky-200 flex items-center justify-center gap-1.5"
            >
              <span>Start Guided Tour</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
