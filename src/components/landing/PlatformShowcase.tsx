'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  GraduationCap,
  HeartHandshake,
  DollarSign,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Bus,
  Sparkles,
  CreditCard,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const PlatformShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'admin' | 'teacher' | 'parent' | 'student' | 'finance'>('admin');

  const tabs = [
    { id: 'admin', label: 'Principal & Admin', icon: LayoutDashboard },
    { id: 'teacher', label: 'Teacher Cockpit', icon: CalendarCheck },
    { id: 'parent', label: 'Parent Portal', icon: HeartHandshake },
    { id: 'student', label: 'Student Experience', icon: GraduationCap },
    { id: 'finance', label: 'Fee Counter', icon: DollarSign },
  ] as const;

  return (
    <section id="showcase" className="py-16 md:py-24 bg-white border-y border-[#E4EAEC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs sm:text-sm font-bold text-[#086A92] uppercase tracking-wider bg-[#EAF5F8] px-3.5 py-1.5 rounded-full border border-[#c0e3ed]">
            Role-Aware Experience
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#17313A] tracking-tight">
            One System. Tailored for Every User.
          </h2>
          <p className="text-base sm:text-lg text-[#4A5D65]">
            EdvoNest automatically adapts its interface based on the signed-in role, ensuring every user sees only what they need to act quickly.
          </p>
        </div>

        {/* Tab Buttons Bar */}
        <div className="flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto pb-4 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm sm:text-base font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#086A92] text-white shadow-xs'
                    : 'bg-[#F7FAFA] text-[#4A5D65] hover:text-[#17313A] hover:bg-[#EAF5F8] border border-[#E4EAEC]'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Role Showcase Panel */}
        <div className="mt-8 bg-[#F7FAFA] border border-[#E4EAEC] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xs">
          {/* TAB 1: PRINCIPAL & ADMIN */}
          {activeTab === 'admin' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <Badge variant="blue" size="md">
                  Institutional Governance
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-black text-[#17313A]">
                  Executive Operational Cockpit for Principals &amp; Directors
                </h3>
                <p className="text-sm sm:text-base text-[#4A5D65] leading-relaxed">
                  Real-time visibility across student attendance, counter fee collections, teacher periods, campus safety, and multi-campus sync without asking for manual reports.
                </p>

                <div className="space-y-3 pt-2 text-sm sm:text-base">
                  <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#35B84A] shrink-0" />
                    <span>Real-time morning student &amp; faculty headcount (94.8% Present)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#35B84A] shrink-0" />
                    <span>Automated AES-256 cloud disaster recovery backups</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#35B84A] shrink-0" />
                    <span>1-click finalize &amp; lock CBSE board examination gradebooks</span>
                  </div>
                </div>

                <div className="pt-3">
                  <Link href="/login">
                    <Button variant="primary" size="lg" className="text-base font-bold">
                      Sign In as Principal &rarr;
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Visual Mockup Container */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4EAEC] p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4EAEC]">
                  <div>
                    <h4 className="font-bold text-[#17313A] text-sm sm:text-base">Campus Vitals Live Stream</h4>
                    <span className="text-xs text-slate-500 font-medium">CBSE Affiliation #89410 • 1,248 Active Students</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#EAF8EC] text-[#16A34A] font-bold text-xs border border-[#bbf0c5]">
                    Healthy
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-sm">
                  <div className="p-3.5 bg-[#F7FAFA] rounded-xl border border-[#E4EAEC]">
                    <span className="text-xs text-slate-500 font-medium">Student Attendance</span>
                    <div className="text-2xl font-black text-emerald-700 mt-1">94.8%</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">1,184 Present Today</div>
                  </div>
                  <div className="p-3.5 bg-[#F7FAFA] rounded-xl border border-[#E4EAEC]">
                    <span className="text-xs text-slate-500 font-medium">Q3 Fee Realized</span>
                    <div className="text-2xl font-black text-[#086A92] mt-1">₹ 48.5L</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">82.5% Target Achieved</div>
                  </div>
                </div>

                <div className="p-3.5 bg-[#EAF5F8] border border-[#c0e3ed] rounded-xl flex items-center justify-between text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#086A92]" />
                    <span className="font-bold text-[#17313A]">System Compliance Audit:</span>
                  </div>
                  <span className="font-mono text-xs sm:text-sm text-[#086A92] font-bold">100% Passed</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEACHER COCKPIT */}
          {activeTab === 'teacher' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <Badge variant="green" size="md">
                  Classroom Efficiency
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-black text-[#17313A]">
                  Fast 1-Tap Attendance &amp; Frictionless Gradebooks
                </h3>
                <p className="text-sm sm:text-base text-[#4A5D65] leading-relaxed">
                  Teachers save up to 45 minutes daily. Mark class attendance in 60 seconds, publish homework assignments with attachments, and enter exam marks with automated grade computation.
                </p>

                <div className="space-y-3 pt-2 text-sm sm:text-base">
                  <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#35B84A] shrink-0" />
                    <span>&ldquo;Mark All Present&rdquo; button with fast absence toggles</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#35B84A] shrink-0" />
                    <span>Offline queue keeps working during Wi-Fi drops</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#35B84A] shrink-0" />
                    <span>Direct substitute teacher coverage when on leave</span>
                  </div>
                </div>

                <div className="pt-3">
                  <Link href="/login">
                    <Button variant="primary" size="lg" className="text-base font-bold">
                      Sign In as Teacher &rarr;
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Visual Mockup Container */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4EAEC] p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4EAEC]">
                  <div>
                    <h4 className="font-bold text-[#17313A] text-sm sm:text-base">Class 10-A Attendance Register</h4>
                    <span className="text-xs text-slate-500 font-medium">Form Tutor: Mr. Vikram Verma • Today&apos;s Session</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                    43/45 Present
                  </span>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="p-3 bg-[#F7FAFA] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block text-sm sm:text-base">01. Aarav Sharma</span>
                      <span className="text-xs text-slate-500 font-mono">EDV-2025-0101</span>
                    </div>
                    <span className="px-3 py-1.5 rounded bg-[#35B84A] text-white font-bold text-xs sm:text-sm">
                      Present
                    </span>
                  </div>
                  <div className="p-3 bg-[#F7FAFA] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block text-sm sm:text-base">02. Ananya Deshmukh</span>
                      <span className="text-xs text-slate-500 font-mono">EDV-2025-0102</span>
                    </div>
                    <span className="px-3 py-1.5 rounded bg-[#35B84A] text-white font-bold text-xs sm:text-sm">
                      Present
                    </span>
                  </div>
                  <div className="p-3 bg-[#F7FAFA] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block text-sm sm:text-base">03. Devansh Bhatia</span>
                      <span className="text-xs text-slate-500 font-mono">EDV-2025-0103</span>
                    </div>
                    <span className="px-3 py-1.5 rounded bg-rose-600 text-white font-bold text-xs sm:text-sm">
                      Absent (SMS Sent)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PARENT PORTAL */}
          {activeTab === 'parent' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <Badge variant="amber" size="md">
                  Parent Peace of Mind
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-black text-[#17313A]">
                  Mobile-First Ward Tracking, 1-Tap Fees &amp; Bus GPS
                </h3>
                <p className="text-sm sm:text-base text-[#4A5D65] leading-relaxed">
                  Parents stay informed without phone calls. View attendance percentage, pay tuition fees via UPI with instant receipt downloads, and track the school bus live on its route.
                </p>

                <div className="space-y-3 pt-2 text-sm sm:text-base">
                  <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#35B84A] shrink-0" />
                    <span>Real-time bus arrival notifications &amp; driver contact</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#35B84A] shrink-0" />
                    <span>Instant fee payments via UPI with official print receipts</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#35B84A] shrink-0" />
                    <span>Multi-child ward switcher for families with multiple students</span>
                  </div>
                </div>

                <div className="pt-3">
                  <Link href="/login">
                    <Button variant="primary" size="lg" className="text-base font-bold">
                      Sign In as Parent &rarr;
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Visual Mockup Container */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4EAEC] p-5 sm:p-6 shadow-sm space-y-4">
                <div className="bg-[#086A92] text-white p-4 sm:p-5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-cyan-200">Student Ward</span>
                    <h4 className="text-base sm:text-lg font-bold mt-0.5">Aarav Sharma • Class 10-A</h4>
                    <p className="text-xs sm:text-sm text-cyan-100">Attendance: 94.8% (Eligible for CBSE Exams)</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-cyan-200 uppercase font-bold block">Term Dues</span>
                    <span className="text-base sm:text-lg font-black text-amber-300">₹ 0 (Paid)</span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5">
                    <Bus className="w-5 h-5 text-amber-800 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-900 block text-sm sm:text-base">Bus Route #4 North Express</span>
                      <span className="text-xs text-amber-700">Driver: Mr. Ramesh Yadav (+91 98765 43210)</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-white text-amber-800 font-bold text-xs shadow-2xs shrink-0">
                    ETA 10 Mins
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STUDENT EXPERIENCE */}
          {activeTab === 'student' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <Badge variant="purple" size="md">
                  Active Learning
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-black text-[#17313A]">
                  Today&apos;s Class Schedule, Homework &amp; AI Doubt Solver
                </h3>
                <p className="text-sm sm:text-base text-[#4A5D65] leading-relaxed">
                  Students log in to a clean, focused dashboard. Check upcoming class periods, submit homework assignments online, view exam dates, and resolve doubts with an AI study assistant.
                </p>

                <div className="space-y-3 pt-2 text-sm sm:text-base">
                  <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#35B84A] shrink-0" />
                    <span>Period timetable with room numbers and teacher names</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#35B84A] shrink-0" />
                    <span>Homework submission with photo or document attachment</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#35B84A] shrink-0" />
                    <span>AI Study Assistant grounded in textbook curriculum</span>
                  </div>
                </div>

                <div className="pt-3">
                  <Link href="/login">
                    <Button variant="primary" size="lg" className="text-base font-bold">
                      Sign In as Student &rarr;
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Visual Mockup Container */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4EAEC] p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4EAEC]">
                  <span className="font-bold text-slate-900 text-sm sm:text-base">Today&apos;s Schedule • Wednesday</span>
                  <span className="text-xs text-[#086A92] font-bold">4 Periods Remaining</span>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800">08:30 – 09:15 AM</span>
                      <h5 className="font-bold text-slate-900 mt-0.5 text-sm sm:text-base">Mathematics (Quadratic Equations)</h5>
                      <p className="text-xs text-slate-500">Mr. Vikram Verma • Room 1001</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-xs rounded">
                      In Progress
                    </span>
                  </div>

                  <div className="p-3 bg-[#F7FAFA] border border-[#E4EAEC] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-500">09:15 – 10:00 AM</span>
                      <h5 className="font-bold text-slate-900 mt-0.5 text-sm sm:text-base">Physics Lab (Optics &amp; Prisms)</h5>
                      <p className="text-xs text-slate-500">Dr. Sen Gupta • Science Wing</p>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-200 text-slate-700 font-bold text-xs rounded">
                      Next
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FEE COUNTER */}
          {activeTab === 'finance' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <Badge variant="blue" size="md">
                  Accounting Rigor
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-black text-[#17313A]">
                  Precision Counter Collection, Refunds &amp; Ledger Auditing
                </h3>
                <p className="text-sm sm:text-base text-[#4A5D65] leading-relaxed">
                  Engineered specifically for school fee accountants. Collect fees across multiple heads, handle sibling concessions, compute late fees automatically, and print official regulatory receipts.
                </p>

                <div className="space-y-3 pt-2 text-sm sm:text-base">
                  <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#35B84A] shrink-0" />
                    <span>Instant printable receipts with school affiliation headers</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#35B84A] shrink-0" />
                    <span>Idempotent payment processing with bank reference tags</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#35B84A] shrink-0" />
                    <span>One-click CSV financial exports for annual audits</span>
                  </div>
                </div>

                <div className="pt-3">
                  <Link href="/login">
                    <Button variant="primary" size="lg" className="text-base font-bold">
                      Sign In as Accountant &rarr;
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Visual Mockup Container */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4EAEC] p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4EAEC]">
                  <div>
                    <h4 className="font-bold text-[#17313A] text-sm sm:text-base">Fee Counter Ledger</h4>
                    <span className="text-xs text-slate-500 font-medium">Cash, Cheque, and Online UPI Inflow</span>
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    Counter: Open
                  </span>
                </div>

                <div className="p-3.5 bg-[#F7FAFA] border border-[#E4EAEC] rounded-xl flex items-center justify-between text-sm">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Receipt #REC-8891</span>
                    <h5 className="font-bold text-slate-900 text-sm sm:text-base">Aarav Sharma (Class 10-A)</h5>
                    <span className="text-xs text-slate-500 font-mono">UPI Ref: 48921049281 • HDFC Bank</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">₹ 18,000</div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      PAID
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
