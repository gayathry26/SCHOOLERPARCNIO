'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Users,
  CreditCard,
  CalendarDays,
  GraduationCap,
  ClipboardCheck,
  ShieldCheck,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface WalkthroughStep {
  title: string;
  description: string;
  tip?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const ROLE_WALKTHROUGHS: Record<string, { roleTitle: string; steps: WalkthroughStep[] }> = {
  PRINCIPAL: {
    roleTitle: 'Principal & Executive Leadership',
    steps: [
      {
        title: 'Institutional Command Centre',
        description: 'Your real-time executive dashboard tracks daily student attendance rates, faculty presence, and key campus operations at a glance.',
        tip: 'Click Command Centre in the sidebar for live biometric radar and transport tracking.',
        icon: Compass,
        accentColor: '#990000',
      },
      {
        title: 'Academic Performance & Board Results',
        description: 'Monitor class-wise performance trajectories, pre-board exam pass percentages, and syllabus completion without shuffling paper marksheets.',
        tip: 'Use Examinations in the menu to publish board result sheets and CBSE compliant scorecards.',
        icon: GraduationCap,
        accentColor: '#7C3AED',
      },
      {
        title: 'Fee Collections & Financial Health',
        description: 'Keep track of daily collections, overdue tuition balances, and head-wise school revenues directly from your mobile or desktop.',
        tip: 'Check Finance & Fees for comprehensive daily collection ledgers and bank reconciliations.',
        icon: CreditCard,
        accentColor: '#16A34A',
      },
      {
        title: 'Global Search & Quick Actions',
        description: 'Need to find a student, teacher, or jump to any module? Press Ctrl+K (or Cmd+K) anywhere to instantly execute operations.',
        tip: 'Click Quick Actions in the header to add students, record payments, or post campus circulars.',
        icon: Zap,
        accentColor: '#D97706',
      },
    ],
  },
  TEACHER: {
    roleTitle: 'Teacher & Faculty Guide',
    steps: [
      {
        title: 'Fast Class Attendance Marking',
        description: 'Mark your classroom attendance in under 30 seconds with 1-click "Mark All Present" and individual absentee toggles.',
        tip: 'Navigate to Attendance to record daily periods or view attendance analytics.',
        icon: ClipboardCheck,
        accentColor: '#16A34A',
      },
      {
        title: 'Homework & Assignment Dispatch',
        description: 'Create daily assignments, attach reference worksheets, set strict submission deadlines, and review student digital submissions.',
        tip: 'Students and parents receive instant in-app alerts when new homework is published.',
        icon: BookOpen,
        accentColor: '#990000',
      },
      {
        title: 'Examination Marks Entry',
        description: 'Enter theory and practical assessment scores directly into digital grade sheets with automatic percentage and grading rules.',
        tip: 'Save drafts anytime or submit marks for administrative verification.',
        icon: Sparkles,
        accentColor: '#7C3AED',
      },
      {
        title: 'Your Period Schedule & Timetable',
        description: 'View your weekly periods, room assignments, substitution notices, and upcoming parent meetings directly from the Events & Timetable view.',
        tip: 'Check your master calendar for scheduled athletics meets and school holidays.',
        icon: CalendarDays,
        accentColor: '#C00000',
      },
    ],
  },
  ACCOUNTANT: {
    roleTitle: 'Finance & Fee Counter Guide',
    steps: [
      {
        title: 'Fee Collection & Instant Receipts',
        description: 'Collect student tuition, transport, and examination fees via UPI, Cards, Net Banking, Cash, or Cheque with automatic 3-part digital receipts.',
        tip: 'Receipts can be printed or sent via WhatsApp/SMS to parents with a single click.',
        icon: CreditCard,
        accentColor: '#16A34A',
      },
      {
        title: 'Defaulter Tracking & Automated Reminders',
        description: 'Filter overdue student balances by class and section. Trigger batch payment reminder notices to parents before due dates.',
        tip: 'Fee structures automatically calculate late fee penalties after grace periods.',
        icon: Users,
        accentColor: '#D97706',
      },
      {
        title: 'Daily Collection Daybook & Ledgers',
        description: 'Reconcile cash-in-hand, bank deposits, and online payment gateway transactions with complete audit trail integrity.',
        tip: 'Check Finance Vouchers to log vendor expenses, petty cash, and purchase orders.',
        icon: ShieldCheck,
        accentColor: '#990000',
      },
      {
        title: 'Financial Statements & Audits',
        description: 'Export monthly balance sheets, class-wise revenue summaries, and CBSE fee compliance reports in Excel or PDF format.',
        tip: 'All transactions use ACID database transactions with complete idempotency protection.',
        icon: Zap,
        accentColor: '#7C3AED',
      },
    ],
  },
  PARENT: {
    roleTitle: 'Parent & Guardian Companion',
    steps: [
      {
        title: 'Your Child’s Daily Attendance & Progress',
        description: 'Monitor your ward’s daily attendance, morning punch-in times, and classroom remarks from home or while on the go.',
        tip: 'You will receive immediate notifications if your child is marked absent.',
        icon: Users,
        accentColor: '#990000',
      },
      {
        title: 'Hassle-Free Online Fee Payments',
        description: 'View pending tuition invoices, upcoming installment due dates, and pay safely using UPI, debit/credit cards, or net banking.',
        tip: 'Instant fee receipts are generated with digital verification codes.',
        icon: CreditCard,
        accentColor: '#16A34A',
      },
      {
        title: 'Homework Tracker & Report Cards',
        description: 'Review assigned homework, teacher instructions, term test marks, and download verified CBSE progress report cards.',
        tip: 'Keep track of upcoming pre-board examinations and syllabus datesheets.',
        icon: BookOpen,
        accentColor: '#7C3AED',
      },
      {
        title: 'School Bus ETA & Parent-Teacher Meetings',
        description: 'Track your child’s school bus location in real-time, book one-on-one discussion slots with class teachers, and sign trip consent letters.',
        tip: 'Visit the PTM section to select your preferred discussion time slot.',
        icon: CalendarDays,
        accentColor: '#C00000',
      },
    ],
  },
  STUDENT: {
    roleTitle: 'Student Learning Portal',
    steps: [
      {
        title: 'Your Daily Learning Hub',
        description: 'Welcome to EdvoNest! See your daily class timetable, subject periods, classroom room numbers, and attendance streak all in one place.',
        tip: 'Keep your attendance above 75% to stay in the green zone for CBSE board clearance.',
        icon: GraduationCap,
        accentColor: '#990000',
      },
      {
        title: 'Homework & Assignment Submissions',
        description: 'Check today’s homework across all subjects, download reference PDFs, and submit your homework notes before the deadline.',
        tip: 'Check the homework portal daily after 3:00 PM for new teacher updates.',
        icon: BookOpen,
        accentColor: '#16A34A',
      },
      {
        title: 'Examination Datesheets & Results',
        description: 'View upcoming test dates, maximum marks, syllabus blueprints, and see your published report cards online.',
        tip: 'Check the Question Bank module for mock tests and previous year practice papers.',
        icon: Sparkles,
        accentColor: '#7C3AED',
      },
      {
        title: 'Campus Events & Sports Competitions',
        description: 'Explore upcoming science exhibitions, athletics meets, and inter-house debates. Register your participation with one click!',
        tip: 'Check the School Events tab to see registered teams and photo galleries.',
        icon: CalendarDays,
        accentColor: '#C00000',
      },
    ],
  },
};

export const UserWalkthrough: React.FC<{ userRole: string }> = ({ userRole }) => {
  // Normalize role to one of the 5 walkthrough keys
  let normalizedKey = 'STUDENT';
  if (['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(userRole)) {
    normalizedKey = 'PRINCIPAL';
  } else if (['TEACHER', 'CLASS_TEACHER'].includes(userRole)) {
    normalizedKey = 'TEACHER';
  } else if (['ACCOUNTANT', 'HR_MANAGER'].includes(userRole)) {
    normalizedKey = 'ACCOUNTANT';
  } else if (userRole === 'PARENT') {
    normalizedKey = 'PARENT';
  } else {
    normalizedKey = 'STUDENT';
  }

  const walkthroughData = ROLE_WALKTHROUGHS[normalizedKey] || ROLE_WALKTHROUGHS.STUDENT;
  const storageKey = `edvonest_walkthrough_${normalizedKey.toLowerCase()}_completed`;

  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Check if previously dismissed / completed on first load
  useEffect(() => {
    try {
      const isCompleted = localStorage.getItem(storageKey);
      if (!isCompleted) {
        // Automatically show on first login
        const timer = setTimeout(() => setIsOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // ignore
    }
  }, [storageKey]);

  // Listen for global restart walkthrough event
  useEffect(() => {
    const handleStartTour = () => {
      setCurrentStepIndex(0);
      setIsOpen(true);
    };

    window.addEventListener('start-walkthrough', handleStartTour);
    return () => window.removeEventListener('start-walkthrough', handleStartTour);
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch (e) {}
  };

  const handleNext = () => {
    if (currentStepIndex < walkthroughData.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  const currentStep = walkthroughData.steps[currentStepIndex];
  const StepIcon = currentStep.icon;
  const isLastStep = currentStepIndex === walkthroughData.steps.length - 1;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden ring-1 ring-black/5">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#990000] to-[#800000] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-300 animate-spin-slow" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200 block">
                Guided Walkthrough
              </span>
              <h4 className="text-xs font-bold leading-tight text-white">{walkthroughData.roleTitle}</h4>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-white/80 px-2 py-0.5 rounded-full bg-white/10">
              {currentStepIndex + 1} of {walkthroughData.steps.length}
            </span>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
              title="Close Walkthrough"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Line */}
        <div className="h-1 bg-slate-100 w-full overflow-hidden">
          <div
            className="h-full bg-[#35B84A] transition-all duration-300 ease-out"
            style={{
              width: `${((currentStepIndex + 1) / walkthroughData.steps.length) * 100}%`,
            }}
          />
        </div>

        {/* Step Body */}
        <div className="p-5 space-y-3.5">
          <div className="flex items-start gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: `${currentStep.accentColor}15`, color: currentStep.accentColor }}
            >
              <StepIcon className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h5 className="text-sm font-bold text-slate-900 leading-snug">{currentStep.title}</h5>
              <p className="text-xs text-slate-600 leading-relaxed">{currentStep.description}</p>
            </div>
          </div>

          {/* Contextual Tip */}
          {currentStep.tip && (
            <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200/70 text-[11px] text-[#990000] flex items-start gap-2">
              <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#990000]" />
              <span className="leading-snug">{currentStep.tip}</span>
            </div>
          )}

          {/* Step Dots & Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {/* Step navigation dots */}
            <div className="flex items-center gap-1.5">
              {walkthroughData.steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStepIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentStepIndex
                      ? 'w-5 bg-[#990000]'
                      : i < currentStepIndex
                      ? 'bg-[#35B84A]'
                      : 'bg-slate-200'
                  }`}
                  aria-label={`Jump to step ${i + 1}`}
                />
              ))}
            </div>

            {/* Back, Next, Finish Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDismiss}
                className="text-xs text-slate-400 hover:text-slate-700 font-semibold px-2 py-1 transition"
              >
                Skip Tour
              </button>

              {currentStepIndex > 0 && (
                <Button size="xs" variant="outline" onClick={handlePrev} className="text-slate-700">
                  <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Back
                </Button>
              )}

              <Button
                size="xs"
                variant="primary"
                onClick={handleNext}
                className="bg-[#990000] hover:bg-[#800000] text-white flex items-center gap-1"
              >
                <span>{isLastStep ? 'Got it, Finish!' : 'Next'}</span>
                {!isLastStep && <ChevronRight className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
