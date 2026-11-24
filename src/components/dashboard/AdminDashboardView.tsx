'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  DollarSign,
  CalendarCheck,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Clock,
  Bus,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Download,
  CreditCard,
  MessageSquare,
  UserPlus,
  PlusCircle,
  BellRing,
  AlertCircle,
  ChevronRight,
  BookMarked,
  ShieldAlert,
  Sparkles,
  Building,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { RoleDashboardCharts } from '@/app/dashboard/RoleDashboardCharts';
import { CampusArchitectureWidget } from '@/app/dashboard/CampusArchitectureWidget';

export interface AdminDashboardProps {
  totalStudents: number;
  totalStaff: number;
  totalTeachers: number;
  totalCollected: number;
  totalPending: number;
  totalExpenses: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  recentInvoices: any[];
  recentExams: any[];
  upcomingEvents: any[];
  announcements: any[];
  todayAttendance: any[];
}

export const AdminDashboardView: React.FC<AdminDashboardProps> = ({
  totalStudents,
  totalStaff,
  totalTeachers,
  totalCollected,
  totalPending,
  totalExpenses,
  presentCount,
  absentCount,
  leaveCount,
  recentInvoices,
  recentExams,
  upcomingEvents,
  announcements,
  todayAttendance,
}) => {
  const totalMarked = presentCount + absentCount + leaveCount;
  const attendanceRate = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 94;

  return (
    <div className="space-y-6">
      {/* 4 Core Vital Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents.toLocaleString()}
          subtitle="45 active classrooms • CBSE"
          icon={<GraduationCap className="w-5 h-5" />}
          variant="blue"
        />
        <StatCard
          title="Teaching Staff"
          value={totalTeachers.toLocaleString()}
          subtitle={`${totalStaff} total campus staff`}
          icon={<Users className="w-5 h-5" />}
          variant="teal"
        />
        <StatCard
          title="Today's Attendance"
          value={`${attendanceRate}%`}
          subtitle={`${presentCount} Present • ${absentCount} Absent`}
          icon={<CalendarCheck className="w-5 h-5" />}
          variant="green"
        />
        <StatCard
          title="Fee Collection (YTD)"
          value={formatCurrency(totalCollected)}
          subtitle={`${formatCurrency(totalPending)} outstanding`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="amber"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
            Administrative Fast-Actions
          </h3>
          <span className="text-[11px] text-[#737373]">1-Tap Operations</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Link href="/dashboard/students">
            <button className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] hover:bg-[#FEF2F2] hover:border-[#FECACA] text-xs font-semibold text-[#990000] transition-all cursor-pointer">
              <UserPlus className="w-4 h-4 text-[#990000]" />
              <span>+ Add Student</span>
            </button>
          </Link>
          <Link href="/dashboard/attendance">
            <button className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] hover:bg-[#EAF8EC] hover:border-[#bbf0c5] text-xs font-semibold text-[#16A34A] transition-all cursor-pointer">
              <CalendarCheck className="w-4 h-4 text-[#35B84A]" />
              <span>Mark Attendance</span>
            </button>
          </Link>
          <Link href="/dashboard/fees">
            <button className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] hover:bg-[#FEF3C7] hover:border-[#FDE68A] text-xs font-semibold text-[#B45309] transition-all cursor-pointer">
              <DollarSign className="w-4 h-4 text-[#D97706]" />
              <span>Collect Fee</span>
            </button>
          </Link>
          <Link href="/dashboard/communication">
            <button className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] hover:bg-[#FEF2F2] hover:border-[#FECACA] text-xs font-semibold text-[#990000] transition-all cursor-pointer">
              <MessageSquare className="w-4 h-4 text-[#990000]" />
              <span>Announcement</span>
            </button>
          </Link>
          <Link href="/dashboard/exams">
            <button className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] hover:bg-[#FEF2F2] hover:border-[#b6e8ea] text-xs font-semibold text-[#C00000] transition-all cursor-pointer">
              <FileCheck2 className="w-4 h-4 text-[#C00000]" />
              <span>Create Exam</span>
            </button>
          </Link>
          <Link href="/dashboard/homework">
            <button className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] hover:bg-[#EAF8EC] hover:border-[#bbf0c5] text-xs font-semibold text-[#16A34A] transition-all cursor-pointer">
              <BookMarked className="w-4 h-4 text-[#35B84A]" />
              <span>Add Homework</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Interactive School Operating System Architecture Hub */}
      <CampusArchitectureWidget />

      {/* 2 Visual Interactive Data Charts */}
      <RoleDashboardCharts
        totalCollected={totalCollected}
        totalPending={totalPending}
        totalExpenses={totalExpenses}
        attendancePresent={presentCount}
        attendanceAbsent={absentCount}
        attendanceLeave={leaveCount}
      />

      {/* Needs Attention & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Needs Attention / Alerts */}
        <div className="lg:col-span-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                <span>Needs Attention</span>
              </CardTitle>
              <Badge variant="amber" size="xs">4 Action Items</Badge>
            </CardHeader>
            <div className="space-y-2.5">
              <div className="p-3 bg-[#FEF3C7]/40 border border-[#FDE68A] rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-[#FEF3C7] text-[#D97706] shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#171717] truncate">12 students have low attendance</p>
                    <p className="text-[10px] text-[#737373]">Attendance below 75% CBSE threshold</p>
                  </div>
                </div>
                <Link href="/dashboard/attendance">
                  <Button variant="outline" size="xs">View Students</Button>
                </Link>
              </div>

              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-[#d5eef5] text-[#990000] shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#171717] truncate">28 students have pending fees</p>
                    <p className="text-[10px] text-[#737373]">Q3 Term fee due this week</p>
                  </div>
                </div>
                <Link href="/dashboard/fees">
                  <Button variant="outline" size="xs">Collect Fees</Button>
                </Link>
              </div>

              <div className="p-3 bg-[#F1F5F7] border border-[#E5E5E5] rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-white text-[#737373] shrink-0 border border-[#E5E5E5]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#171717] truncate">3 teachers haven&apos;t submitted attendance</p>
                    <p className="text-[10px] text-[#737373]">Class 8-B, 9-A, 11-Science</p>
                  </div>
                </div>
                <Link href="/dashboard/attendance">
                  <Button variant="outline" size="xs">Send Reminder</Button>
                </Link>
              </div>

              <div className="p-3 bg-[#EAF8EC] border border-[#bbf0c5] rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-[#d2f5d9] text-[#16A34A] shrink-0">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#171717] truncate">2 exams scheduled this week</p>
                    <p className="text-[10px] text-[#737373]">Mid Term Mathematics &amp; Science</p>
                  </div>
                </div>
                <Link href="/dashboard/exams">
                  <Button variant="outline" size="xs">View Exams</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity Timeline */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#990000]" />
                <span>Recent Institutional Activity</span>
              </CardTitle>
              <Link href="/dashboard/audit-logs">
                <Button variant="ghost" size="xs" rightIcon={<ArrowRight className="w-3 h-3" />}>
                  Audit Log
                </Button>
              </Link>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#35B84A] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#171717]">Student admission completed</p>
                  <p className="text-[11px] text-[#737373]">Aarav Verma enrolled in Class 10-A (#EDV-2025-0142)</p>
                </div>
                <span className="text-[10px] text-[#737373] shrink-0">10m ago</span>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#990000] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#171717]">Fee payment received</p>
                  <p className="text-[11px] text-[#737373]">₹18,500 received online for Ananya Sharma (Receipt #RCP-8821)</p>
                </div>
                <span className="text-[10px] text-[#737373] shrink-0">25m ago</span>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#C00000] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#171717]">Attendance submitted</p>
                  <p className="text-[11px] text-[#737373]">Class 10-A attendance submitted by Mr. Vikram Verma (42 Present)</p>
                </div>
                <span className="text-[10px] text-[#737373] shrink-0">1h ago</span>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#D97706] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#171717]">New announcement published</p>
                  <p className="text-[11px] text-[#737373]">Annual Sports Day registration open for all grades</p>
                </div>
                <span className="text-[10px] text-[#737373] shrink-0">2h ago</span>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#35B84A] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#171717]">Exam results published</p>
                  <p className="text-[11px] text-[#737373]">Unit Test 1 Marks finalized for Class 9 Physics</p>
                </div>
                <span className="text-[10px] text-[#737373] shrink-0">3h ago</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Grid: Recent Invoices & School Calendar Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#990000]" />
              <span>Recent Fee Invoices</span>
            </CardTitle>
            <Link href="/dashboard/fees">
              <Button variant="ghost" size="xs">View All</Button>
            </Link>
          </CardHeader>
          <div className="divide-y divide-[#E5E5E5]">
            {recentInvoices.length === 0 ? (
              <p className="text-xs text-[#737373] py-4 text-center">No fee invoices recorded yet.</p>
            ) : (
              recentInvoices.map((inv) => (
                <div key={inv.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#171717]">
                      {inv.student.user.firstName} {inv.student.user.lastName}
                    </p>
                    <p className="text-[10px] text-[#737373]">Invoice #{inv.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#171717]">{formatCurrency(inv.totalAmount)}</p>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#35B84A]" />
              <span>Upcoming Campus Events</span>
            </CardTitle>
            <Link href="/dashboard/events">
              <Button variant="ghost" size="xs">Full Calendar</Button>
            </Link>
          </CardHeader>
          <div className="space-y-2.5">
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-[#737373] py-4 text-center">No upcoming events scheduled.</p>
            ) : (
              upcomingEvents.map((evt) => (
                <div key={evt.id} className="p-3 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#171717]">{evt.title}</h4>
                    <p className="text-[10px] text-[#737373]">
                      {formatDate(evt.startDate)} • {evt.category || 'General'}
                    </p>
                  </div>
                  <Badge variant="blue" size="xs">{evt.category || 'Campus'}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
