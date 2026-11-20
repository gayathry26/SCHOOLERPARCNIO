'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck,
  ClipboardList,
  Clock,
  BookOpen,
  FileCheck2,
  Award,
  Sparkles,
  ArrowRight,
  BookMarked,
  Download,
  Search,
  CheckCircle2,
  BellRing,
  HelpCircle,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/formatters';

export interface StudentDashboardProps {
  studentData: any;
  announcements: any[];
}

export const StudentDashboardView: React.FC<StudentDashboardProps> = ({
  studentData,
  announcements,
}) => {
  const router = useRouter();
  const [aiDoubtQuery, setAiDoubtQuery] = useState('');

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiDoubtQuery.trim()) return;
    router.push(`/dashboard/ai-learning?q=${encodeURIComponent(aiDoubtQuery)}`);
  };

  return (
    <div className="space-y-6">
      {/* Student Profile Card */}
      <div className="bg-[#086A92] text-white rounded-2xl p-5 sm:p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="flex items-center gap-3.5 md:col-span-2">
          <Avatar
            name={`${studentData?.user?.firstName || 'Student'} ${studentData?.user?.lastName || ''}`}
            size="xl"
            shape="rounded"
            status="online"
            className="ring-2 ring-white/30 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold">
                {studentData?.user?.firstName || 'Student'} {studentData?.user?.lastName || ''}
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-[#35B84A] px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
                Active
              </span>
            </div>
            <p className="text-xs text-[#EAF5F8]">
              Admission #{studentData?.admissionNumber || 'EDV-2025-0101'} • Roll No: {studentData?.rollNumber || '01'}
            </p>
            <p className="text-xs text-[#35B84A] font-bold mt-0.5">
              Class 10 - Section A • House: {studentData?.house || 'Emerald'}
            </p>
          </div>
        </div>

        <div className="bg-white/10 p-3 rounded-xl border border-white/20">
          <p className="text-[10px] text-[#EAF5F8] uppercase tracking-wider font-semibold">Attendance Rate</p>
          <p className="text-xl font-black text-[#35B84A] mt-0.5">94.2%</p>
          <p className="text-[10px] text-[#EAF5F8]">CBSE Board Exam Eligible</p>
        </div>

        <div className="bg-white/10 p-3 rounded-xl border border-white/20">
          <p className="text-[10px] text-[#EAF5F8] uppercase tracking-wider font-semibold">Academic Rank</p>
          <p className="text-xl font-black text-[#FDE68A] mt-0.5">#4 in Class</p>
          <Link href="/dashboard/portfolio" className="text-[10px] text-white underline font-semibold">
            View Student Portfolio &rarr;
          </Link>
        </div>
      </div>

      {/* AI Study Assistant Quick Doubt Bar */}
      <div className="bg-gradient-to-r from-[#EAF8EC] via-[#EAF5F8] to-[#E0F5F5] border border-[#bbf0c5] rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#16A34A]" />
            <h3 className="text-xs font-bold text-[#17313A] uppercase tracking-wider">
              AI Study Assistant — Instant Doubt Solver
            </h3>
          </div>
          <span className="text-[10px] font-bold text-[#16A34A] bg-white px-2 py-0.5 rounded-full border border-[#bbf0c5]">
            Powered by Gemini
          </span>
        </div>
        <form onSubmit={handleAskAi} className="flex gap-2">
          <input
            type="text"
            value={aiDoubtQuery}
            onChange={(e) => setAiDoubtQuery(e.target.value)}
            placeholder="Ask any math formula, physics theorem, English grammar question..."
            className="flex-1 bg-white border border-[#E4EAEC] rounded-xl px-3.5 py-2 text-xs text-[#17313A] placeholder:text-[#6B7C83] focus:outline-none focus:ring-2 focus:ring-[#086A92]/20"
          />
          <Button variant="primary" size="sm" type="submit" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Explain
          </Button>
        </form>
      </div>

      {/* 3 Core Student Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Attendance"
          value="94.2%"
          subtitle="2 Absences this term"
          icon={<CalendarCheck className="w-5 h-5" />}
          variant="green"
        />
        <StatCard
          title="Homework Due"
          value="3 Assignments"
          subtitle="Next due: Tomorrow, 5:00 PM"
          icon={<ClipboardList className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Upcoming Exam"
          value="Mathematics"
          subtitle="This Friday • Mid-Term"
          icon={<FileCheck2 className="w-5 h-5" />}
          variant="blue"
        />
      </div>

      {/* Timetable & Homework List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Today's Timetable */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#086A92]" />
                <span>Today&apos;s Class Schedule</span>
              </CardTitle>
              <Link href="/dashboard/timetable">
                <Button variant="ghost" size="xs">Weekly Grid</Button>
              </Link>
            </CardHeader>
            <div className="space-y-2.5">
              <div className="p-3 bg-[#EAF8EC] border border-[#bbf0c5] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] bg-[#35B84A] text-white font-bold px-2 py-0.5 rounded-full">
                    08:30 – 09:15 AM
                  </span>
                  <h4 className="text-xs font-bold text-[#17313A] mt-1.5">Mathematics (Algebra)</h4>
                  <p className="text-[10px] text-[#6B7C83]">Mr. Vikram Verma • Room 1001</p>
                </div>
                <Badge variant="green" size="xs">In Progress</Badge>
              </div>

              <div className="p-3 bg-[#F7FAFA] border border-[#E4EAEC] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] bg-[#F1F5F7] text-[#6B7C83] font-bold px-2 py-0.5 rounded-full">
                    09:15 – 10:00 AM
                  </span>
                  <h4 className="text-xs font-bold text-[#17313A] mt-1.5">Physics Lab</h4>
                  <p className="text-[10px] text-[#6B7C83]">Dr. Sen Gupta • Science Wing</p>
                </div>
                <Badge variant="slate" size="xs">Next</Badge>
              </div>

              <div className="p-3 bg-[#F7FAFA] border border-[#E4EAEC] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] bg-[#F1F5F7] text-[#6B7C83] font-bold px-2 py-0.5 rounded-full">
                    10:15 – 11:00 AM
                  </span>
                  <h4 className="text-xs font-bold text-[#17313A] mt-1.5">English Literature</h4>
                  <p className="text-[10px] text-[#6B7C83]">Ms. Shweta Kapoor • Room 1001</p>
                </div>
                <Badge variant="slate" size="xs">Upcoming</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Homework Assignments */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#D97706]" />
                <span>Homework &amp; Assignments</span>
              </CardTitle>
              <Link href="/dashboard/homework">
                <Button variant="ghost" size="xs">Submit Homework</Button>
              </Link>
            </CardHeader>
            <div className="space-y-2.5">
              <div className="p-3 bg-[#FEF3C7]/40 border border-[#FDE68A] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#17313A]">Quadratic Formula Exercises 4.2</h4>
                    <Badge variant="amber" size="xs">Due Tomorrow</Badge>
                  </div>
                  <p className="text-[10px] text-[#6B7C83] mt-0.5">Mathematics • Solve Q1 to Q10 in homework notebook</p>
                </div>
                <Link href="/dashboard/homework">
                  <Button variant="primary" size="xs">Submit</Button>
                </Link>
              </div>

              <div className="p-3 bg-[#F7FAFA] border border-[#E4EAEC] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#17313A]">Light Ray Diagram Worksheet</h4>
                    <Badge variant="slate" size="xs">Due in 3 Days</Badge>
                  </div>
                  <p className="text-[10px] text-[#6B7C83] mt-0.5">Science • Complete diagrams for concave mirrors</p>
                </div>
                <Link href="/dashboard/homework">
                  <Button variant="outline" size="xs">View</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* School Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[#35B84A]" />
            <span>School Announcements</span>
          </CardTitle>
          <Link href="/dashboard/communication">
            <Button variant="ghost" size="xs">All Notices</Button>
          </Link>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {announcements.slice(0, 2).map((ann) => (
            <div key={ann.id} className="p-3 bg-[#F7FAFA] rounded-xl border border-[#E4EAEC] text-xs">
              <div className="flex items-center justify-between text-[10px] text-[#6B7C83]">
                <span className="font-bold text-[#086A92]">{ann.targetAudience}</span>
                <span>{formatDate(ann.publishedAt, 'dd MMM')}</span>
              </div>
              <p className="font-bold text-[#17313A] mt-1">{ann.title}</p>
              <p className="text-[11px] text-[#6B7C83] mt-0.5 line-clamp-2">{ann.content}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
