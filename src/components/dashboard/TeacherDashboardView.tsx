'use client';

import React from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  ClipboardList,
  Clock,
  BookOpen,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  BookMarked,
  Sparkles,
  Users,
  CheckCircle2,
  PlusCircle,
  MessageSquare,
  GraduationCap,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/formatters';

export interface TeacherDashboardProps {
  recentExams: any[];
  announcements: any[];
}

export const TeacherDashboardView: React.FC<TeacherDashboardProps> = ({
  recentExams,
  announcements,
}) => {
  return (
    <div className="space-y-6">
      {/* Teacher Profile & Greeting Banner */}
      <div className="bg-gradient-to-r from-[#086A92] to-[#043A52] text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            name="Teacher Faculty"
            size="xl"
            shape="rounded"
            status="online"
            className="ring-2 ring-white/30 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold">Faculty Teaching Cockpit</h2>
              <span className="text-xs bg-emerald-500/20 text-[#35B84A] px-2.5 py-0.5 rounded-full font-bold border border-emerald-400/30">
                Active Session
              </span>
            </div>
            <p className="text-sm text-[#EAF5F8] mt-0.5">
              Form Tutor • Class 10-A • Mathematics &amp; Science Department
            </p>
            <p className="text-xs text-[#A2E2F8] mt-0.5 font-medium">
              Academic Session 2026–2027 • CBSE Curriculum Grounded
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs uppercase tracking-wider text-cyan-200 font-mono block">Today&apos;s Schedule</span>
          <span className="text-base font-bold text-white">4 Teaching Periods Allocated</span>
        </div>
      </div>

      {/* 3 Teacher Daily Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Today's Teaching Periods"
          value="4 Periods"
          subtitle="Class 10-A • 9-B • 10-B • 11-A"
          icon={<Clock className="w-5 h-5" />}
          variant="blue"
        />
        <StatCard
          title="Class 10-A Attendance"
          value="42 / 45"
          subtitle="93.3% Present • Form Tutor"
          icon={<CalendarCheck className="w-5 h-5" />}
          variant="green"
        />
        <StatCard
          title="Homework To Grade"
          value="18 Pending"
          subtitle="Quadratic Equations &amp; Vectors"
          icon={<ClipboardList className="w-5 h-5" />}
          variant="amber"
        />
      </div>

      {/* Teacher Quick Action Bar */}
      <div className="bg-white border border-[#E4EAEC] rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[#17313A] uppercase tracking-wider">
            Teacher Everyday Workflows
          </h3>
          <span className="text-[11px] text-[#6B7C83]">Fast Action Bar</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/dashboard/attendance">
            <Button variant="primary" size="sm" className="w-full" leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}>
              Mark Class Attendance
            </Button>
          </Link>
          <Link href="/dashboard/homework">
            <Button variant="outline" size="sm" className="w-full" leftIcon={<BookMarked className="w-3.5 h-3.5" />}>
              Assign Homework
            </Button>
          </Link>
          <Link href="/dashboard/exams">
            <Button variant="outline" size="sm" className="w-full" leftIcon={<FileCheck2 className="w-3.5 h-3.5" />}>
              Enter Exam Marks
            </Button>
          </Link>
          <Link href="/dashboard/lesson-plans">
            <Button variant="outline" size="sm" className="w-full" leftIcon={<ClipboardList className="w-3.5 h-3.5" />}>
              Update Lesson Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* Schedule Grid & Lesson Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Today's Class Period Schedule */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#086A92]" />
                <span>Today&apos;s Class Periods</span>
              </CardTitle>
              <Link href="/dashboard/timetable">
                <Button variant="ghost" size="xs">Full Timetable</Button>
              </Link>
            </CardHeader>
            <div className="space-y-2.5">
              <div className="p-3 bg-[#EAF8EC] border border-[#bbf0c5] rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#35B84A] text-white font-bold px-2 py-0.5 rounded-full">
                      08:30 – 09:15 AM
                    </span>
                    <Badge variant="green" size="xs">Current / Active</Badge>
                  </div>
                  <h4 className="text-xs font-bold text-[#17313A] mt-1">Mathematics • Class 10-A</h4>
                  <p className="text-[11px] text-[#6B7C83]">Room 1001 • Class Form Teacher</p>
                </div>
                <Link href="/dashboard/attendance">
                  <Button variant="success" size="xs">Mark Done</Button>
                </Link>
              </div>

              <div className="p-3 bg-[#F7FAFA] border border-[#E4EAEC] rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] bg-[#F1F5F7] text-[#6B7C83] font-bold px-2 py-0.5 rounded-full">
                    10:15 – 11:00 AM
                  </span>
                  <h4 className="text-xs font-bold text-[#17313A] mt-1">Algebraic Proofs • Class 9-B</h4>
                  <p className="text-[11px] text-[#6B7C83]">Room 902 • Subject Teacher</p>
                </div>
                <Badge variant="slate" size="xs">Upcoming</Badge>
              </div>

              <div className="p-3 bg-[#F7FAFA] border border-[#E4EAEC] rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] bg-[#F1F5F7] text-[#6B7C83] font-bold px-2 py-0.5 rounded-full">
                    11:30 – 12:15 PM
                  </span>
                  <h4 className="text-xs font-bold text-[#17313A] mt-1">Trigonometry Lab • Class 10-B</h4>
                  <p className="text-[11px] text-[#6B7C83]">Math Lab 2</p>
                </div>
                <Badge variant="slate" size="xs">Upcoming</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Lesson Plan Progress & Syllabus Tracker */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#008C91]" />
                <span>Active Lesson Plans</span>
              </CardTitle>
              <Link href="/dashboard/lesson-plans">
                <Button variant="ghost" size="xs">All Plans</Button>
              </Link>
            </CardHeader>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F7FAFA] border border-[#E4EAEC] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#17313A]">Class 10-A: Coordinate Geometry</span>
                  <span className="text-[10px] text-emerald-700 font-bold">85% Complete</span>
                </div>
                <div className="w-full bg-[#E4EAEC] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#35B84A] h-full rounded-full" style={{ width: '85%' }} />
                </div>
                <p className="text-[10px] text-[#6B7C83]">Next: Section Formula &amp; Distance Problems</p>
              </div>

              <div className="p-3 bg-[#F7FAFA] border border-[#E4EAEC] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#17313A]">Class 9-B: Polynomials</span>
                  <span className="text-[10px] text-[#086A92] font-bold">70% Complete</span>
                </div>
                <div className="w-full bg-[#E4EAEC] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#086A92] h-full rounded-full" style={{ width: '70%' }} />
                </div>
                <p className="text-[10px] text-[#6B7C83]">Next: Remainder Theorem &amp; Factorization</p>
              </div>
            </div>
          </Card>

          {/* Student Alerts for Class 10-A */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Student Watchlist (Class 10-A)</span>
              </CardTitle>
            </CardHeader>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#17313A]">Rohan Joshi (Roll #14)</p>
                  <p className="text-[10px] text-amber-800">Missed 3 consecutive days without leave letter</p>
                </div>
                <Link href="/dashboard/students">
                  <Button variant="outline" size="xs">Call Parent</Button>
                </Link>
              </div>
              <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#17313A]">Sneha Patel (Roll #22)</p>
                  <p className="text-[10px] text-amber-800">2 Homework assignments unsubmitted</p>
                </div>
                <Link href="/dashboard/homework">
                  <Button variant="outline" size="xs">Remind</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Upcoming Exams & School Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#086A92]" />
              <span>Upcoming Exams &amp; Marks Entry</span>
            </CardTitle>
            <Link href="/dashboard/exams">
              <Button variant="ghost" size="xs">All Exams</Button>
            </Link>
          </CardHeader>
          <div className="space-y-2.5">
            {recentExams.map((ex) => (
              <div key={ex.id} className="p-3 bg-[#F7FAFA] border border-[#E4EAEC] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-[#17313A]">{ex.name}</h4>
                  <p className="text-[10px] text-[#6B7C83]">
                    {formatDate(ex.startDate)} to {formatDate(ex.endDate)}
                  </p>
                </div>
                <Badge variant={ex.isLocked ? 'rose' : 'green'} size="xs">
                  {ex.isLocked ? 'Locked' : 'Marks Entry Open'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#35B84A]" />
              <span>Staff &amp; Campus Notices</span>
            </CardTitle>
            <Link href="/dashboard/communication">
              <Button variant="ghost" size="xs">Notices</Button>
            </Link>
          </CardHeader>
          <div className="space-y-2.5">
            {announcements.slice(0, 3).map((ann) => (
              <div key={ann.id} className="p-2.5 bg-[#F7FAFA] rounded-xl border border-[#E4EAEC] text-xs">
                <div className="flex items-center justify-between text-[10px] text-[#6B7C83]">
                  <span className="font-bold text-[#086A92]">{ann.targetAudience}</span>
                  <span>{formatDate(ann.publishedAt, 'dd MMM')}</span>
                </div>
                <p className="font-bold text-[#17313A] mt-0.5">{ann.title}</p>
                <p className="text-[11px] text-[#6B7C83] line-clamp-1">{ann.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
