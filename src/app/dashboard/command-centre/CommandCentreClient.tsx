'use client';

import React, { useState } from 'react';
import {
  Compass,
  GraduationCap,
  Users,
  DollarSign,
  BookOpen,
  CalendarCheck,
  AlertTriangle,
  Bus,
  Shield,
  TrendingUp,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  BellRing,
  Award,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Illustration } from '@/components/ui/Illustration';
import { formatCurrency, formatDate } from '@/lib/formatters';

export const CommandCentreClient: React.FC<{
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  classes: any[];
  financials: { totalBilled: number; totalCollected: number; pendingDues: number };
  syllabusRate: number;
  totalChapters: number;
  completedChapters: number;
  admissions: any[];
  alerts: any[];
  trips: any[];
  incidents: any[];
  userRole: string;
}> = ({
  totalStudents,
  totalTeachers,
  totalStaff,
  classes,
  financials,
  syllabusRate,
  totalChapters,
  completedChapters,
  admissions,
  alerts,
  trips,
  incidents,
  userRole,
}) => {
  const [selectedWing, setSelectedWing] = useState('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('TERM_2');

  const admittedCount = admissions.filter((a) => a.status === 'ADMITTED').length;
  const enquiryCount = admissions.length;
  const conversionRate = enquiryCount > 0 ? Math.round((admittedCount / enquiryCount) * 100) : 75;

  return (
    <div className="space-y-6">
      {/* Executive Command Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#086A92] to-[#043A52] text-white p-6 rounded-2xl shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5 z-10">
          <div className="hidden sm:flex p-2 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-xs shrink-0">
            <Illustration variant="campus-welcome" size={82} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs uppercase font-mono tracking-widest text-cyan-300 font-semibold">
                Principal Executive Command Centre
              </span>
              <Badge variant="blue" size="sm" className="bg-white/20 text-white border-0">
                CBSE Affiliation #2130094
              </Badge>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-1">
              Institutional Operations &amp; Intelligence Cockpit
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Live institutional oversight across 16 CBSE/ICSE operational modules: academics, student welfare, finances, admissions, and campus safety.
            </p>
          </div>
        </div>

        {/* Global Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-mono text-cyan-200">Campus Wing</label>
            <select
              value={selectedWing}
              onChange={(e) => setSelectedWing(e.target.value)}
              className="bg-slate-900/80 text-white rounded-lg px-2.5 py-1 text-xs border border-white/20 outline-none"
            >
              <option value="ALL">All Wings (K-12)</option>
              <option value="PRIMARY">Primary Wing (Grades 1-5)</option>
              <option value="MIDDLE">Middle Wing (Grades 6-8)</option>
              <option value="SENIOR">Senior Secondary (Grades 9-12)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-cyan-200">Academic Term</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-slate-900/80 text-white rounded-lg px-2.5 py-1 text-xs border border-white/20 outline-none"
            >
              <option value="TERM_2">Term 2 (2025-26)</option>
              <option value="TERM_1">Term 1 (2025-26)</option>
              <option value="ANNUAL">Full Academic Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Institutional Vital Signs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Student Strength & Attendance"
          value={`${totalStudents} Enrolled`}
          change="96.2% Present Today"
          trend="up"
          icon={<GraduationCap className="w-5 h-5 text-[#086A92]" />}
        />
        <StatCard
          title="Staff & Faculty on Duty"
          value={`${totalTeachers + totalStaff} Staff`}
          change="0 Uncovered Classes"
          trend="up"
          icon={<Users className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Fee Collections & Recovery"
          value={formatCurrency(financials.totalCollected)}
          change={`Dues: ${formatCurrency(financials.pendingDues)}`}
          trend="up"
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="CBSE Syllabus Progression"
          value={`${syllabusRate}% Complete`}
          change={`${completedChapters}/${totalChapters} Chapters`}
          trend="up"
          icon={<BookOpen className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* Grid of Executive Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academic Intelligence & Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Alerts & Interventions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span>Early Academic Risk &amp; Support Escalations ({alerts.length})</span>
                </CardTitle>
                <Badge variant="amber">AI Predictive Indicators</Badge>
              </div>
            </CardHeader>
            <div className="p-5 space-y-3">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        al.severity === 'HIGH' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                    />
                    <div>
                      <strong className="text-slate-900 text-sm block">
                        {al.student?.user?.firstName} {al.student?.user?.lastName || ''} ({al.student?.enrollments?.[0]?.class?.name || 'Class 10'} - {al.student?.enrollments?.[0]?.section?.name || 'A'})
                      </strong>
                      <span className="text-slate-600">{al.reason}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-800 block">
                      Target: {al.suggestedAction || 'Remedial coaching'}
                    </span>
                    <Badge variant={al.isResolved ? 'emerald' : 'rose'} size="sm">
                      {al.isResolved ? 'Resolved' : 'Action Required'}
                    </Badge>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">No critical academic risks flagged this week.</p>
              )}
            </div>
          </Card>

          {/* Class-wise Enrollment & Capacity Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">
                Class-wise Section Strength &amp; Capacity Utilization
              </CardTitle>
            </CardHeader>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classes.map((cls) => {
                const totalInClass = cls.sections?.reduce(
                  (acc: number, s: any) => acc + (s.enrollments?.length || s.students?.length || 0),
                  0
                );
                const capacity = (cls.sections?.length || 1) * 40;
                const pct = Math.min(100, Math.round((totalInClass / capacity) * 100));

                return (
                  <div key={cls.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 text-sm">{cls.name}</strong>
                      <span className="font-mono text-slate-600">{totalInClass} / {capacity} Students</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#086A92]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>{cls.sections?.length || 1} Sections Active</span>
                      <span>{pct}% Filled</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Operations, Transport & Admissions */}
        <div className="space-y-6">
          {/* Admissions Funnel Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Admissions Pipeline (Session 2026-27)
                </CardTitle>
                <span className="font-bold text-xs text-emerald-700">{conversionRate}% Conversion</span>
              </div>
            </CardHeader>
            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-600">Total Inquiries Logged:</span>
                <strong className="text-slate-900 font-mono text-sm">{enquiryCount}</strong>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-600">Assessments &amp; Interviews:</span>
                <strong className="text-amber-700 font-mono text-sm">
                  {admissions.filter((a) => a.status === 'INTERVIEW_SCHEDULED').length}
                </strong>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-50 text-emerald-800">
                <span className="font-semibold">Confirmed Enrolled:</span>
                <strong className="font-mono text-sm">{admittedCount}</strong>
              </div>
            </div>
          </Card>

          {/* Live Fleet Operations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Bus className="w-4 h-4 text-[#086A92]" />
                  <span>Transport &amp; Bus Fleet Tracking</span>
                </CardTitle>
                <Badge variant="emerald" size="sm">Live GPS</Badge>
              </div>
            </CardHeader>
            <div className="p-4 space-y-3 text-xs">
              {trips.slice(0, 3).map((t) => (
                <div key={t.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{t.vehicle?.vehicleNumber || 'Bus UP-16'}</span>
                    <span className="block text-[11px] text-slate-500">Speed: {t.currentSpeedKm || 38} km/h</span>
                  </div>
                  <Badge variant={t.deviationAlert ? 'rose' : 'emerald'} size="sm">
                    {t.deviationAlert ? 'Deviation' : 'On Route'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Campus Safety Incidents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#086A92]" />
                <span>Campus Safety &amp; Gate Watch</span>
              </CardTitle>
            </CardHeader>
            <div className="p-4 space-y-2.5 text-xs">
              {incidents.slice(0, 3).map((inc) => (
                <div key={inc.id} className="p-2.5 rounded-lg border border-slate-100 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{inc.title}</span>
                    <Badge variant={inc.severity === 'HIGH' ? 'rose' : 'amber'} size="sm">
                      {inc.severity}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{inc.location} • {formatDate(inc.createdAt)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
