import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule, AppModule } from '@/lib/permissions';

interface ModuleSearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  url: string;
  module: AppModule;
  keywords: string[];
}

const ERP_MODULES: ModuleSearchItem[] = [
  {
    id: 'mod-attendance',
    title: 'Attendance Register',
    subtitle: 'Daily student & staff attendance, leave records',
    category: 'ERP Modules',
    url: '/dashboard/attendance',
    module: 'ATTENDANCE',
    keywords: ['attendance', 'present', 'absent', 'roll call', 'biometric', 'leaves', 'mark attendance'],
  },
  {
    id: 'mod-homework',
    title: 'Homework & Assignments',
    subtitle: 'Class assignments, homework submissions, teacher grading',
    category: 'ERP Modules',
    url: '/dashboard/homework',
    module: 'ACADEMICS',
    keywords: ['homework', 'assignments', 'tasks', 'submissions', 'grading', 'create homework'],
  },
  {
    id: 'mod-fees',
    title: 'Fee Management & Invoices',
    subtitle: 'Collect student fees, offline/online receipts, outstanding balances',
    category: 'ERP Modules',
    url: '/dashboard/fees',
    module: 'FEES_FINANCE',
    keywords: ['fees', 'fee', 'payment', 'invoices', 'receipts', 'counter', 'dues', 'concession', 'record payment'],
  },
  {
    id: 'mod-finance',
    title: 'Financial Accounting & Ledger',
    subtitle: 'Institutional income, expenses, vendor vouchers, bank ledgers',
    category: 'ERP Modules',
    url: '/dashboard/finance',
    module: 'FEES_FINANCE',
    keywords: ['finance', 'accounting', 'ledger', 'expenses', 'income', 'balance sheet', 'vendor'],
  },
  {
    id: 'mod-students',
    title: 'Student Directory & Profiles',
    subtitle: 'Search all enrolled students, admission details, parent contacts',
    category: 'ERP Modules',
    url: '/dashboard/students',
    module: 'STUDENTS',
    keywords: ['students', 'student directory', 'admission', 'enrolled', 'roll number', 'add student'],
  },
  {
    id: 'mod-exams',
    title: 'Examinations & Report Cards',
    subtitle: 'Schedule exam terms, enter marks, generate CBSE report cards',
    category: 'ERP Modules',
    url: '/dashboard/exams',
    module: 'EXAMINATIONS',
    keywords: ['exams', 'examination', 'marks', 'report cards', 'grading', 'terms', 'tests', 'create examination'],
  },
  {
    id: 'mod-timetable',
    title: 'Class Timetable & Schedule',
    subtitle: 'Weekly period schedules, room allocations, teacher timetables',
    category: 'ERP Modules',
    url: '/dashboard/timetable',
    module: 'ACADEMICS',
    keywords: ['timetable', 'schedule', 'periods', 'routine', 'classes', 'substitute'],
  },
  {
    id: 'mod-admissions',
    title: 'Admissions CRM & Enquiries',
    subtitle: 'Prospect pipeline, online registrations, enrollment conversion',
    category: 'ERP Modules',
    url: '/dashboard/admissions',
    module: 'ADMISSIONS',
    keywords: ['admissions', 'enquiry', 'application', 'leads', 'prospects', 'onboarding'],
  },
  {
    id: 'mod-transport',
    title: 'School Transport & Bus Tracking',
    subtitle: 'Live bus GPS tracking, commuter rosters, driver contacts',
    category: 'ERP Modules',
    url: '/dashboard/transport',
    module: 'TRANSPORT',
    keywords: ['transport', 'bus', 'routes', 'gps', 'driver', 'pickup', 'commute'],
  },
  {
    id: 'mod-library',
    title: 'Digital Library & Circulation',
    subtitle: 'Book catalog, ISBN lookup, issuing and returns',
    category: 'ERP Modules',
    url: '/dashboard/library',
    module: 'LIBRARY',
    keywords: ['library', 'books', 'isbn', 'catalog', 'borrow', 'return', 'circulation'],
  },
  {
    id: 'mod-ai-learning',
    title: 'AI Study Assistant & Tutor',
    subtitle: 'Curriculum-grounded doubt solver, spaced repetition revision',
    category: 'ERP Modules',
    url: '/dashboard/ai-learning',
    module: 'AI_LEARNING',
    keywords: ['ai', 'ai tutor', 'doubt', 'study', 'revision', 'ncert', 'cbse'],
  },
  {
    id: 'mod-question-bank',
    title: 'Question Bank & Mock Tests',
    subtitle: 'Chapter question repository, automated paper generator, mocks',
    category: 'ERP Modules',
    url: '/dashboard/question-bank',
    module: 'QUESTION_BANK',
    keywords: ['question bank', 'questions', 'mock tests', 'question papers', 'practice'],
  },
  {
    id: 'mod-portfolio',
    title: 'Student Achievements & Portfolio',
    subtitle: 'Holistic co-curricular awards, sports merits, skill badging',
    category: 'ERP Modules',
    url: '/dashboard/portfolio',
    module: 'STUDENT_PORTFOLIO',
    keywords: ['portfolio', 'achievements', 'awards', 'merit', 'co-curricular', 'sports'],
  },
  {
    id: 'mod-hr',
    title: 'Faculty & HR Management',
    subtitle: 'Staff directory, payroll slips, workload analytics, leave requests',
    category: 'ERP Modules',
    url: '/dashboard/hr',
    module: 'HR_MANAGEMENT',
    keywords: ['hr', 'teachers', 'staff', 'faculty', 'salary', 'payroll', 'appraisal', 'add teacher'],
  },
  {
    id: 'mod-communication',
    title: 'Communication Hub & Circulars',
    subtitle: 'School announcements, circulars to parents/staff, notices',
    category: 'ERP Modules',
    url: '/dashboard/communication',
    module: 'COMMUNICATION',
    keywords: ['communication', 'announcements', 'circulars', 'messages', 'notices', 'sms', 'send announcement'],
  },
  {
    id: 'mod-lifecycle',
    title: 'Academic Year & Lifecycle',
    subtitle: 'Session activation, year-end promotions, batch detention',
    category: 'ERP Modules',
    url: '/dashboard/lifecycle',
    module: 'LIFECYCLE',
    keywords: ['lifecycle', 'academic year', 'promotion', 'session', 'rollover', 'retention'],
  },
  {
    id: 'mod-settings',
    title: 'School Configuration & Settings',
    subtitle: 'Institutional details, CBSE affiliation, grading criteria',
    category: 'ERP Modules',
    url: '/dashboard/settings',
    module: 'SETTINGS',
    keywords: ['settings', 'configuration', 'affiliation', 'cbse', 'grading', 'school profile'],
  },
  {
    id: 'mod-command-centre',
    title: 'Principal Command Centre',
    subtitle: 'Real-time institutional executive cockpit and compliance health',
    category: 'ERP Modules',
    url: '/dashboard/command-centre',
    module: 'COMMAND_CENTRE',
    keywords: ['command centre', 'executive', 'cockpit', 'kpi', 'intelligence', 'overview'],
  },
  {
    id: 'mod-reports',
    title: 'Executive Analytics & Reports',
    subtitle: 'CBSE inspection reports, financial summaries, attendance analytics',
    category: 'ERP Modules',
    url: '/dashboard/reports',
    module: 'REPORTS',
    keywords: ['reports', 'analytics', 'audit', 'exports', 'inspection', 'cbse report', 'generate report'],
  },
  {
    id: 'mod-campus-safety',
    title: 'Campus Safety & Visitors',
    subtitle: 'Gate security, visitor passes, campus incident logs',
    category: 'ERP Modules',
    url: '/dashboard/campus-safety',
    module: 'CAMPUS_SAFETY',
    keywords: ['safety', 'security', 'visitors', 'visitor pass', 'gate', 'incidents'],
  },
  {
    id: 'mod-health',
    title: 'Health Clinic & Medical Records',
    subtitle: 'Student medical checkups, immunization, clinic visit logs',
    category: 'ERP Modules',
    url: '/dashboard/health',
    module: 'HEALTH_CLINIC',
    keywords: ['health', 'medical', 'clinic', 'nurse', 'doctor', 'immunization', 'allergies'],
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lowerQuery = query.toLowerCase();
    const results: Array<{ id: string; title: string; subtitle: string; category: string; url: string }> = [];

    // 1. Match Authorized ERP Modules
    const matchingModules = ERP_MODULES.filter((m) => {
      if (!canAccessModule(user.role, m.module)) return false;
      return (
        m.title.toLowerCase().includes(lowerQuery) ||
        m.subtitle.toLowerCase().includes(lowerQuery) ||
        m.keywords.some((k) => k.includes(lowerQuery))
      );
    });

    matchingModules.slice(0, 4).forEach((m) => {
      results.push({
        id: m.id,
        title: m.title,
        subtitle: m.subtitle,
        category: 'ERP Modules',
        url: m.url,
      });
    });

    // 2. Search Students (if user has STUDENTS permission)
    if (canAccessModule(user.role, 'STUDENTS')) {
      const students = await prisma.studentProfile.findMany({
        where: {
          OR: [
            { admissionNumber: { contains: query } },
            { rollNumber: { contains: query } },
            { user: { firstName: { contains: query } } },
            { user: { lastName: { contains: query } } },
          ],
        },
        include: {
          user: true,
          enrollments: {
            include: { class: true, section: true },
            take: 1,
          },
        },
        take: 4,
      });

      students.forEach((s) => {
        const cls = s.enrollments[0]?.class?.name || '';
        const sec = s.enrollments[0]?.section?.name || '';
        results.push({
          id: s.id,
          title: `${s.user.firstName} ${s.user.lastName}`,
          subtitle: `Adm #${s.admissionNumber} • ${cls ? `${cls} - ${sec}` : 'Unassigned'}`,
          category: 'Students',
          url: `/dashboard/students/${s.id}`,
        });
      });
    }

    // 3. Search Teachers & Staff (if user has HR permission)
    if (canAccessModule(user.role, 'HR_MANAGEMENT')) {
      const teachers = await prisma.teacherProfile.findMany({
        where: {
          OR: [
            { employeeCode: { contains: query } },
            { specialization: { contains: query } },
            { user: { firstName: { contains: query } } },
            { user: { lastName: { contains: query } } },
          ],
        },
        include: { user: true },
        take: 4,
      });

      teachers.forEach((t) => {
        results.push({
          id: t.id,
          title: `${t.user.firstName} ${t.user.lastName}`,
          subtitle: `Code: ${t.employeeCode} • ${t.specialization || 'Teaching Faculty'}`,
          category: 'Teachers & Staff',
          url: `/dashboard/hr`,
        });
      });
    }

    // 4. Search Classes & Wings (if user has ACADEMICS permission)
    if (canAccessModule(user.role, 'ACADEMICS')) {
      const classes = await prisma.class.findMany({
        where: {
          name: { contains: query },
        },
        include: { sections: true },
        take: 3,
      });

      classes.forEach((c) => {
        results.push({
          id: c.id,
          title: c.name,
          subtitle: `${c.sections.length} Sections • ${c.stream || 'General Stream'}`,
          category: 'Classes & Wings',
          url: `/dashboard/academics`,
        });
      });
    }

    // 5. Search Fee Invoices (if user has FEES_FINANCE permission)
    if (canAccessModule(user.role, 'FEES_FINANCE')) {
      const invoices = await prisma.studentFeeInvoice.findMany({
        where: {
          OR: [
            { invoiceNumber: { contains: query } },
            { title: { contains: query } },
          ],
        },
        include: {
          student: { include: { user: true } },
        },
        take: 3,
      });

      invoices.forEach((inv) => {
        results.push({
          id: inv.id,
          title: `${inv.invoiceNumber} - ${inv.title}`,
          subtitle: `Student: ${inv.student.user.firstName} ${inv.student.user.lastName} • Status: ${inv.status}`,
          category: 'Fee Invoices',
          url: `/dashboard/fees`,
        });
      });
    }

    // 6. Search Library Books (if user has LIBRARY permission)
    if (canAccessModule(user.role, 'LIBRARY')) {
      const books = await prisma.libraryBook.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { author: { contains: query } },
            { isbn: { contains: query } },
          ],
        },
        take: 3,
      });

      books.forEach((b) => {
        results.push({
          id: b.id,
          title: b.title,
          subtitle: `By ${b.author} • ISBN: ${b.isbn}`,
          category: 'Library Books',
          url: `/dashboard/library`,
        });
      });
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
