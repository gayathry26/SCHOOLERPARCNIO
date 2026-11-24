'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  CalendarCheck,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  Award,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  BarChart2,
  FileText,
  DollarSign,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/formatters';

export interface PrincipalDashboardProps {
  totalStudents: number;
  totalTeachers: number;
  presentCount: number;
  absentCount: number;
  totalCollected: number;
  totalPending: number;
  recentExams: any[];
  upcomingEvents: any[];
  announcements: any[];
}

export const PrincipalDashboardView: React.FC<PrincipalDashboardProps> = ({
  totalStudents,
  totalTeachers,
  presentCount,
  absentCount,
  totalCollected,
  totalPending,
  recentExams,
  upcomingEvents,
  announcements,
}) => {
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / (presentCount + absentCount || 1)) * 100) : 94;

  return (
    <div className="space-y-6">
      {/* Principal Executive Briefing Banner */}
      <div className="bg-gradient-to-r from-[#800000] via-[#990000] to-[#C00000] text-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              Executive Command Briefing
            </span>
            <span className="text-xs sm:text-sm text-white/90">• Session 2026–2027 • CBSE #89410</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Institutional Academics &amp; Campus Oversight
          </h2>
          <p className="text-sm text-white/95 max-w-xl leading-relaxed">
            Overall campus morning attendance is holding strong at <span className="font-bold text-[#FDE68A]">{attendanceRate}%</span> with 45 active class registers verified and 100% cloud disaster backups synced.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link href="/dashboard/academic-intelligence">
            <Button variant="outline" size="md" className="bg-white text-[#990000] hover:bg-white/90 border-transparent font-bold text-sm">
              Academic Intelligence
            </Button>
          </Link>
          <Link href="/dashboard/command-centre">
            <Button variant="secondary" size="md" className="bg-[#171717] text-white hover:bg-[#171717]/90 border-transparent font-bold text-sm">
              Command HQ
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Core Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${attendanceRate}%`}
          subtitle="98% CBSE Compliance target"
          icon={<CalendarCheck className="w-5 h-5" />}
          variant="green"
        />
        <StatCard
          title="Syllabus Completion"
          value="82.4%"
          subtitle="Term 2 Mid-point milestone"
          icon={<BookOpen className="w-5 h-5" />}
          variant="blue"
        />
        <StatCard
          title="Academic Pass Index"
          value="96.2%"
          subtitle="Based on recent Term 1 exams"
          icon={<Award className="w-5 h-5" />}
          variant="teal"
        />
        <StatCard
          title="Fee Inflow Status"
          value={formatCurrency(totalCollected)}
          subtitle={`${formatCurrency(totalPending)} outstanding`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="amber"
        />
      </div>

      {/* Class-wise Performance & Syllabus Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Class-Wise Attendance & Readiness */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#990000]" />
                <span>Class Attendance &amp; Academic Health</span>
              </CardTitle>
              <Link href="/dashboard/attendance">
                <Button variant="ghost" size="xs">View Matrix</Button>
              </Link>
            </CardHeader>
            <div className="space-y-3">
              {[
                { class: 'Class 10-A (Secondary)', attendance: 95, syllabus: 88, risk: 1, teacher: 'Mr. Vikram Verma' },
                { class: 'Class 10-B (Secondary)', attendance: 92, syllabus: 85, risk: 3, teacher: 'Ms. Sunita Rao' },
                { class: 'Class 9-A (Secondary)', attendance: 94, syllabus: 80, risk: 2, teacher: 'Mr. Rajesh Sharma' },
                { class: 'Class 12-Science (Senior)', attendance: 97, syllabus: 91, risk: 0, teacher: 'Dr. Sen Gupta' },
                { class: 'Class 12-Commerce (Senior)', attendance: 89, syllabus: 78, risk: 4, teacher: 'Mrs. Neha Mehta' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#171717]">{item.class}</span>
                      {item.risk > 0 && (
                        <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold border border-rose-200">
                          {item.risk} At Risk
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#737373] mt-0.5">Class Teacher: {item.teacher}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-[#737373]">Attendance</span>
                      <p className="font-bold text-emerald-700">{item.attendance}%</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#737373]">Syllabus</span>
                      <p className="font-bold text-[#990000]">{item.syllabus}%</p>
                    </div>
                    <Link href="/dashboard/academic-intelligence">
                      <Button variant="outline" size="xs">Audit</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Academic Risk Students & Action Items */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Academic Intervention Watchlist</span>
              </CardTitle>
              <Badge variant="rose" size="xs">High Priority</Badge>
            </CardHeader>
            <div className="space-y-2.5">
              {[
                { name: 'Karan Malhotra', class: 'Class 10-B', issue: 'Math score dropped to 38%', tag: 'Needs Remedial' },
                { name: 'Riya Singhania', class: 'Class 9-A', issue: 'Attendance 68% (< 75% CBSE)', tag: 'Parent Call' },
                { name: 'Devendra Patel', class: 'Class 12-Commerce', issue: 'Failed Unit Test 2 Accountancy', tag: 'Doubt Clearing' },
              ].map((student, idx) => (
                <div key={idx} className="p-3 bg-rose-50/40 border border-rose-100 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#171717]">{student.name}</p>
                    <p className="text-[11px] text-rose-700 font-medium">{student.issue}</p>
                    <p className="text-[10px] text-[#737373] mt-0.5">{student.class}</p>
                  </div>
                  <Badge variant="rose" size="xs">{student.tag}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Pending Executive Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C00000]" />
                <span>Pending Approvals</span>
              </CardTitle>
              <Badge variant="teal" size="xs">3 Pending</Badge>
            </CardHeader>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#171717]">Staff Medical Leave (2 Days)</p>
                  <p className="text-[10px] text-[#737373]">Mrs. Anjali Rao • Biology Dept</p>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="success" size="xs">Approve</Button>
                </div>
              </div>
              <div className="p-2.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#171717]">Science Lab Reagents Purchase</p>
                  <p className="text-[10px] text-[#737373]">Voucher #VCH-2025-081 • ₹14,200</p>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="success" size="xs">Approve</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Examination Schedules & Major Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#990000]" />
              <span>Examination Schedules &amp; Status</span>
            </CardTitle>
            <Link href="/dashboard/exams">
              <Button variant="ghost" size="xs">Exam Management</Button>
            </Link>
          </CardHeader>
          <div className="space-y-2.5">
            {recentExams.length === 0 ? (
              <p className="text-xs text-[#737373] py-4 text-center">No exams currently configured.</p>
            ) : (
              recentExams.map((ex) => (
                <div key={ex.id} className="p-3 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-[#171717]">{ex.name}</h4>
                    <p className="text-[10px] text-[#737373]">
                      {formatDate(ex.startDate)} to {formatDate(ex.endDate)}
                    </p>
                  </div>
                  <Badge variant={ex.isLocked ? 'rose' : 'green'} size="xs">
                    {ex.isLocked ? 'Locked / Finalized' : 'Marks Entry Open'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#35B84A]" />
              <span>Upcoming School Events &amp; Inspections</span>
            </CardTitle>
            <Link href="/dashboard/events">
              <Button variant="ghost" size="xs">Full Calendar</Button>
            </Link>
          </CardHeader>
          <div className="space-y-2.5">
            {upcomingEvents.map((evt) => (
              <div key={evt.id} className="p-3 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-[#171717]">{evt.title}</h4>
                  <p className="text-[10px] text-[#737373]">
                    {formatDate(evt.startDate)} • {evt.category || 'General'}
                  </p>
                </div>
                <Badge variant="blue" size="xs">{evt.category || 'Institutional'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
