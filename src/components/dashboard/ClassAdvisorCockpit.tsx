'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CalendarCheck,
  FileCheck2,
  BookOpen,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatters';

export const ClassAdvisorCockpit: React.FC<{ initialSectionId?: string }> = ({ initialSectionId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'roster' | 'homework' | 'exams'>('roster');

  const fetchContext = async (sectionId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = sectionId
        ? `/api/classes/advisor-context?sectionId=${sectionId}`
        : '/api/classes/advisor-context';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load advisor context (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Error fetching advisor context');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContext(initialSectionId);
  }, [initialSectionId]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-[#E5E5E5] flex items-center justify-center gap-3 text-sm text-[#525252]">
        <div className="w-5 h-5 border-2 border-[#990000] border-t-transparent rounded-full animate-spin" />
        <span>Loading Class Advisor Cockpit...</span>
      </div>
    );
  }

  if (error || !data || !data.isAdvisor) {
    return null; // Not an advisor or no section assigned
  }

  const { section, stats, studentRoster, pendingHomeworks, upcomingExams, announcements } = data;

  return (
    <div className="space-y-6">
      {/* Advisor Header Banner */}
      <div className="bg-gradient-to-r from-[#800000] via-[#990000] to-[#C00000] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              Class Advisor Cockpit
            </span>
            <span className="text-xs text-red-100 font-mono">• Room: {section.roomNo || 'Room 101'}</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {section.className} — Section {section.name}
          </h2>
          <p className="text-xs sm:text-sm text-red-100/90 max-w-xl">
            You are the designated Form Tutor for this class. You have administrative jurisdiction to mark morning registers, publish section notices, verify parent communication, and track student marks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href={`/dashboard/attendance?sectionId=${section.id}`}>
            <Button
              variant="outline"
              size="md"
              className="bg-white text-[#990000] hover:bg-neutral-100 font-bold border-transparent text-xs sm:text-sm shadow-xs"
              leftIcon={<CalendarCheck className="w-4 h-4" />}
            >
              Mark Morning Register
            </Button>
          </Link>
          <Link href={`/dashboard/homework`}>
            <Button
              variant="secondary"
              size="md"
              className="bg-[#171717] text-white hover:bg-neutral-800 font-bold border-transparent text-xs sm:text-sm shadow-xs"
              leftIcon={<BookOpen className="w-4 h-4" />}
            >
              Post Homework
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Advisor Vital KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students Enrolled"
          value={stats.totalStudents}
          subtitle={`Capacity: ${stats.capacity} (${stats.availableSeats} seats open)`}
          icon={<Users className="w-5 h-5" />}
          variant="red"
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          subtitle={`${stats.attendancePercentage}% Daily Attendance Rate`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="green"
        />
        <StatCard
          title="Absent / Unmarked"
          value={`${stats.absentToday} Absent`}
          subtitle={`${stats.unmarkedToday} students unmarked`}
          icon={<AlertCircle className="w-5 h-5" />}
          variant="rose"
        />
        <StatCard
          title="Pending Homework & Exams"
          value={stats.pendingHomeworkCount}
          subtitle={`${stats.upcomingExamsCount} upcoming CBSE exams`}
          icon={<FileCheck2 className="w-5 h-5" />}
          variant="amber"
        />
      </div>

      {/* Interactive Tabs */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'roster'
                  ? 'bg-[#990000] text-white shadow-xs'
                  : 'bg-[#F5F5F5] text-[#525252] hover:text-[#171717]'
              }`}
            >
              Class Roster ({studentRoster.length})
            </button>
            <button
              onClick={() => setActiveTab('homework')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'homework'
                  ? 'bg-[#990000] text-white shadow-xs'
                  : 'bg-[#F5F5F5] text-[#525252] hover:text-[#171717]'
              }`}
            >
              Section Homework ({pendingHomeworks.length})
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'exams'
                  ? 'bg-[#990000] text-white shadow-xs'
                  : 'bg-[#F5F5F5] text-[#525252] hover:text-[#171717]'
              }`}
            >
              Upcoming Examinations ({upcomingExams.length})
            </button>
          </div>

          <span className="text-xs text-[#525252] font-semibold hidden sm:inline">
            Class Advisor: <strong className="text-[#171717]">{section.advisorName}</strong>
          </span>
        </div>

        {/* TAB 1: STUDENT ROSTER WITH ATTENDANCE & PARENT CONTACTS */}
        {activeTab === 'roster' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F5F5] text-[#525252] font-bold border-b border-[#E5E5E5]">
                <tr>
                  <th className="p-3">Roll #</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Admission #</th>
                  <th className="p-3">Today Status</th>
                  <th className="p-3">Parent / Guardian</th>
                  <th className="p-3">Emergency Phone</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {studentRoster.map((student: any) => (
                  <tr key={student.id} className="hover:bg-[#F5F5F5]/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#171717]">{student.rollNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-[#171717]">{student.name}</div>
                      <div className="text-[11px] text-[#525252]">{student.email}</div>
                    </td>
                    <td className="p-3 font-mono text-[#525252]">{student.admissionNumber}</td>
                    <td className="p-3">
                      {student.todayStatus === 'PRESENT' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          PRESENT
                        </span>
                      ) : student.todayStatus === 'ABSENT' ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-50 text-[#990000] font-bold border border-red-200">
                          ABSENT
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                          UNMARKED
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-medium text-[#171717]">{student.parentName}</td>
                    <td className="p-3 font-mono text-[#525252] flex items-center gap-1.5 pt-4">
                      <Phone className="w-3.5 h-3.5 text-[#990000]" />
                      <span>{student.parentPhone}</span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/dashboard/students/${student.id}`}
                        className="text-xs font-bold text-[#990000] hover:underline"
                      >
                        Dossier &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PENDING HOMEWORK */}
        {activeTab === 'homework' && (
          <div className="space-y-3">
            {pendingHomeworks.length === 0 ? (
              <p className="text-xs text-[#525252] py-6 text-center">
                No active homework tasks assigned for this section.
              </p>
            ) : (
              pendingHomeworks.map((hw: any) => (
                <div
                  key={hw.id}
                  className="p-3.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#171717] text-sm">{hw.title}</span>
                      <span className="bg-red-50 text-[#990000] font-bold px-2 py-0.5 rounded border border-red-200 text-[10px]">
                        {hw.subject?.name}
                      </span>
                    </div>
                    <p className="text-[#525252]">{hw.description}</p>
                    <p className="text-[#737373] text-[11px]">
                      Due: {formatDate(hw.dueDate)} • Max Marks: {hw.maxMarks}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="font-mono font-bold text-[#990000]">
                      {hw._count?.submissions || 0} Submitted
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: UPCOMING EXAMS */}
        {activeTab === 'exams' && (
          <div className="space-y-3">
            {upcomingExams.length === 0 ? (
              <p className="text-xs text-[#525252] py-6 text-center">
                No upcoming term examinations scheduled for this class.
              </p>
            ) : (
              upcomingExams.map((ex: any) => (
                <div
                  key={ex.id}
                  className="p-3.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#171717] text-sm">{ex.name}</span>
                      <span className="bg-red-50 text-[#990000] font-bold px-2 py-0.5 rounded border border-red-200 text-[10px]">
                        Term {ex.term}
                      </span>
                    </div>
                    <p className="text-[#525252]">
                      Window: {formatDate(ex.startDate)} to {formatDate(ex.endDate)}
                    </p>
                  </div>

                  <Link href={`/dashboard/exams`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      View Syllabus
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

