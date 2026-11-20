'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  Home,
  Star,
  Zap,
  Plus,
  CalendarCheck,
  DollarSign,
  MessageSquare,
  FileDown,
} from 'lucide-react';
import { UserRole } from '@/lib/auth';
import { triggerQuickAction } from './QuickActionLauncher';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  academics: 'Academics',
  'academic-intelligence': 'Academic Intelligence',
  'lesson-plans': 'Lesson Plans',
  'ai-learning': 'AI Study Assistant',
  'question-bank': 'Question Bank & Mocks',
  timetable: 'Class Timetable',
  homework: 'Homework & Assignments',
  attendance: 'Attendance',
  exams: 'Examinations & Marks',
  students: 'Student Directory',
  admissions: 'Admissions CRM',
  portfolio: 'Student Portfolio',
  lifecycle: 'School Lifecycle & Sessions',
  certificates: 'Certificates & TC',
  'id-cards': 'ID Card Studio',
  fees: 'Fee Management & Invoices',
  finance: 'Financial Accounting & Ledger',
  inventory: 'Campus Inventory',
  hr: 'Staff Directory & HR',
  transport: 'School Transport Live',
  library: 'Digital Library',
  health: 'Health Clinic',
  'campus-safety': 'Campus Safety & Visitors',
  communication: 'Announcements & Messages',
  'parent-portal': 'Parent Portal',
  events: 'School Events & Calendar',
  settings: 'School Settings',
  'platform-admin': 'Platform SaaS Admin',
  'audit-logs': 'System Audit Trail',
  'command-centre': 'Command Centre HQ',
  reports: 'Executive Reports',
  'ai-assistant': 'AI Copilot Assistant',
  'multi-campus': 'Multi-Campus Network',
};

export interface BreadcrumbsProps {
  customItems?: { label: string; href?: string }[];
  className?: string;
  userRole?: UserRole;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  customItems,
  className = '',
  userRole = 'SCHOOL_ADMIN',
}) => {
  const pathname = usePathname();
  const [isPinned, setIsPinned] = useState(false);

  // Sync pin state with localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('edvonest_pinned_nav');
      if (saved) {
        const list: string[] = JSON.parse(saved);
        setIsPinned(list.includes(pathname));
      }
    } catch (e) {
      // ignore
    }
  }, [pathname]);

  const togglePinCurrentPage = () => {
    try {
      const saved = localStorage.getItem('edvonest_pinned_nav');
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (list.includes(pathname)) {
        list = list.filter((p) => p !== pathname);
        setIsPinned(false);
      } else {
        list = [...list, pathname];
        setIsPinned(true);
      }
      localStorage.setItem('edvonest_pinned_nav', JSON.stringify(list));
      // Trigger storage event for sidebar syncing
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      // ignore
    }
  };

  // Determine contextual action based on route and role
  const getContextualAction = () => {
    if (
      pathname.startsWith('/dashboard/students') &&
      ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'RECEPTIONIST'].includes(userRole)
    ) {
      return {
        label: 'Add Student',
        icon: Plus,
        onClick: () => triggerQuickAction('ADD_STUDENT'),
      };
    }

    if (
      pathname.startsWith('/dashboard/attendance') &&
      ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'CLASS_TEACHER'].includes(userRole)
    ) {
      return {
        label: 'Quick Register',
        icon: CalendarCheck,
        onClick: () => triggerQuickAction('MARK_ATTENDANCE'),
      };
    }

    if (
      pathname.startsWith('/dashboard/fees') &&
      ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PRINCIPAL'].includes(userRole)
    ) {
      return {
        label: 'Record Payment',
        icon: DollarSign,
        onClick: () => triggerQuickAction('RECORD_PAYMENT'),
      };
    }

    if (
      pathname.startsWith('/dashboard/homework') &&
      ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'CLASS_TEACHER'].includes(userRole)
    ) {
      return {
        label: 'Create Homework',
        icon: Plus,
        onClick: () => triggerQuickAction('CREATE_HOMEWORK'),
      };
    }

    if (
      pathname.startsWith('/dashboard/exams') &&
      ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'].includes(userRole)
    ) {
      return {
        label: 'Schedule Exam',
        icon: Plus,
        onClick: () => triggerQuickAction('CREATE_EXAM'),
      };
    }

    if (
      pathname.startsWith('/dashboard/communication') &&
      ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'].includes(userRole)
    ) {
      return {
        label: 'Broadcast Notice',
        icon: MessageSquare,
        onClick: () => triggerQuickAction('SEND_ANNOUNCEMENT'),
      };
    }

    if (
      pathname.startsWith('/dashboard/reports') &&
      ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'HR_MANAGER'].includes(userRole)
    ) {
      return {
        label: 'Generate Report',
        icon: FileDown,
        onClick: () => triggerQuickAction('GENERATE_REPORT'),
      };
    }

    if (
      pathname.startsWith('/dashboard/hr') &&
      ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'HR_MANAGER'].includes(userRole)
    ) {
      return {
        label: 'Add Faculty',
        icon: Plus,
        onClick: () => triggerQuickAction('ADD_TEACHER'),
      };
    }

    return null;
  };

  const contextualAction = getContextualAction();

  // If custom items passed, render them
  if (customItems && customItems.length > 0) {
    return (
      <div className={`flex items-center justify-between text-xs py-1 gap-3 flex-wrap ${className}`}>
        <nav aria-label="Breadcrumb" className="flex items-center text-[#6B7C83]">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li className="flex items-center gap-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-1 text-[#6B7C83] hover:text-[#086A92] transition-colors"
              >
                <Home className="w-3.5 h-3.5 text-[#086A92]" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </li>
            {customItems.map((item, index) => {
              const isLast = index === customItems.length - 1;
              return (
                <li key={index} className="flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#c8d5d9]" />
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="text-[#6B7C83] hover:text-[#086A92] transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-[#17313A] truncate max-w-[200px] sm:max-w-none">
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Right side Contextual Action Buttons */}
        <div className="flex items-center gap-2">
          {contextualAction && (
            <button
              onClick={contextualAction.onClick}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#086A92] hover:bg-[#086A92]/90 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <contextualAction.icon className="w-3.5 h-3.5" />
              <span>{contextualAction.label}</span>
            </button>
          )}

          <button
            onClick={togglePinCurrentPage}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              isPinned
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-white text-[#6B7C83] border-[#E4EAEC] hover:text-[#086A92]'
            }`}
            title={isPinned ? 'Remove from Pinned Modules' : 'Pin module to navigation sidebar'}
          >
            <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400 text-amber-500' : 'text-[#6B7C83]'}`} />
            <span className="hidden sm:inline">{isPinned ? 'Pinned' : 'Pin'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Auto-generate from pathname
  const segments = pathname.split('/').filter(Boolean);

  // If just /dashboard
  if (segments.length <= 1) {
    return (
      <div className={`flex items-center justify-between text-xs py-1 gap-3 flex-wrap ${className}`}>
        <nav aria-label="Breadcrumb" className="flex items-center text-[#6B7C83]">
          <div className="flex items-center gap-1.5 text-xs text-[#6B7C83]">
            <span className="flex items-center gap-1 font-semibold text-[#086A92]">
              <Home className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </span>
            <ChevronRight className="w-3 h-3 text-[#c8d5d9]" />
            <span className="font-semibold text-[#17313A]">Overview &amp; Executive Cockpit</span>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerQuickAction('LAUNCHER')}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#EAF5F8] hover:bg-[#086A92] text-[#086A92] hover:text-white rounded-lg text-xs font-bold transition-all shadow-2xs border border-[#c0e3ed] cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-[#35B84A]" />
            <span>Quick Actions</span>
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbs = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/');
    const label = ROUTE_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
    return {
      href,
      label,
      isLast: idx === segments.length - 1,
    };
  });

  return (
    <div className={`flex items-center justify-between text-xs py-1 gap-3 flex-wrap ${className}`}>
      {/* Left side: Hierarchical Breadcrumbs Trail */}
      <nav aria-label="Breadcrumb" className="flex items-center text-[#6B7C83]">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-[#6B7C83] hover:text-[#086A92] transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-[#086A92]" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </li>
          {breadcrumbs.slice(1).map((b) => (
            <li key={b.href} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-[#c8d5d9]" />
              {b.isLast ? (
                <span className="font-bold text-[#17313A] truncate max-w-[200px] sm:max-w-none">
                  {b.label}
                </span>
              ) : (
                <Link
                  href={b.href}
                  className="text-[#6B7C83] hover:text-[#086A92] transition-colors truncate max-w-[150px] sm:max-w-none"
                >
                  {b.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Right side: Contextual Actions & Pin Toggle */}
      <div className="flex items-center gap-2">
        {contextualAction && (
          <button
            onClick={contextualAction.onClick}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#086A92] hover:bg-[#086A92]/90 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <contextualAction.icon className="w-3.5 h-3.5" />
            <span>{contextualAction.label}</span>
          </button>
        )}

        <button
          onClick={togglePinCurrentPage}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            isPinned
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-white text-[#6B7C83] border-[#E4EAEC] hover:text-[#086A92]'
          }`}
          title={isPinned ? 'Remove from Pinned Modules' : 'Pin module to navigation sidebar'}
        >
          <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400 text-amber-500' : 'text-[#6B7C83]'}`} />
          <span className="hidden sm:inline">{isPinned ? 'Pinned' : 'Pin'}</span>
        </button>
      </div>
    </div>
  );
};
