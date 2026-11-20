'use client';

import React from 'react';
import {
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Users,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Clock,
  Zap,
  Sparkles,
  Layers,
  FileCheck2,
  Bus,
} from 'lucide-react';
import { EdvoNestLogo } from '@/components/ui/EdvoNestLogo';

export const HeroDashboardMockup: React.FC = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-none">
      {/* Outer ambient glow */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-[#086A92] to-[#35B84A] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>

      {/* Main SaaS Browser Window Mockup */}
      <div className="relative bg-white rounded-2xl border border-[#E4EAEC] shadow-2xl overflow-hidden text-xs select-none">
        {/* Browser Chrome Header */}
        <div className="bg-[#17313A] px-4 py-3 flex items-center justify-between border-b border-[#043A52]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/90 inline-block" />
            <span className="ml-2 text-[10px] text-slate-400 font-mono hidden sm:inline-block">
              edvonest.school/dashboard
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#35B84A] font-bold text-[10px] border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#35B84A] animate-ping" />
              <span>Campus Live Synced</span>
            </span>
          </div>
        </div>

        {/* Dashboard Shell Interior */}
        <div className="flex bg-[#F7FAFA] min-h-[380px] sm:min-h-[420px]">
          {/* Left Mini Rail Navigation */}
          <div className="w-12 sm:w-14 bg-white border-r border-[#E4EAEC] py-3 flex flex-col items-center justify-between shrink-0">
            <div className="space-y-3 flex flex-col items-center">
              <div className="w-8 h-8 rounded-lg bg-[#EAF5F8] text-[#086A92] flex items-center justify-center font-black">
                <EdvoNestLogo variant="icon-only" size="sm" />
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#086A92] text-white flex items-center justify-center shadow-2xs">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center">
                <CalendarCheck className="w-3.5 h-3.5" />
              </div>
              <div className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <div className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center">
                <FileCheck2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="w-6 h-6 rounded-full bg-[#35B84A]/20 text-[#16A34A] flex items-center justify-center text-[9px] font-bold">
              ✓
            </div>
          </div>

          {/* Main Dashboard Canvas */}
          <div className="flex-1 p-3.5 sm:p-5 space-y-3.5 overflow-hidden">
            {/* Top Internal Cockpit Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E4EAEC]">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#17313A] text-xs sm:text-sm">
                    Principal Executive Cockpit
                  </span>
                  <span className="text-[9px] bg-[#EAF8EC] text-[#16A34A] font-bold px-1.5 py-0.5 rounded border border-[#bbf0c5]">
                    2026-27 CBSE
                  </span>
                </div>
                <p className="text-[10px] text-[#6B7C83]">
                  Dr. Sunita Mehra • All 16 Modules Operating Normally
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[10.5px]">
                <span className="text-[#086A92] font-semibold bg-[#EAF5F8] px-2 py-1 rounded-md border border-[#c0e3ed]">
                  Term 2 Active
                </span>
              </div>
            </div>

            {/* 3 Metric Stat KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Card 1: Attendance */}
              <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-[#E4EAEC] shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#6B7C83] font-medium">Daily Attendance</span>
                  <span className="text-[9px] font-bold text-[#16A34A] bg-[#EAF8EC] px-1.5 py-0.5 rounded">
                    +2.4%
                  </span>
                </div>
                <div className="text-base sm:text-lg font-black text-[#17313A]">94.8%</div>
                <div className="text-[9.5px] text-[#6B7C83]">1,184 / 1,248 Present</div>
                <div className="w-full bg-[#E4EAEC] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#35B84A] h-full rounded-full" style={{ width: '94.8%' }} />
                </div>
              </div>

              {/* Card 2: Fee Collections */}
              <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-[#E4EAEC] shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#6B7C83] font-medium">Fee Collections</span>
                  <span className="text-[9px] font-bold text-[#086A92] bg-[#EAF5F8] px-1.5 py-0.5 rounded">
                    Q3 Cycle
                  </span>
                </div>
                <div className="text-base sm:text-lg font-black text-[#17313A]">₹ 48,50,000</div>
                <div className="text-[9.5px] text-[#6B7C83]">82.5% Target Collected</div>
                <div className="w-full bg-[#E4EAEC] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#086A92] h-full rounded-full" style={{ width: '82.5%' }} />
                </div>
              </div>

              {/* Card 3: Academics */}
              <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-[#E4EAEC] shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#6B7C83] font-medium">CBSE Pre-Board Avg</span>
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    Grade A1
                  </span>
                </div>
                <div className="text-base sm:text-lg font-black text-[#17313A]">88.4%</div>
                <div className="text-[9.5px] text-[#6B7C83]">Pass Trajectory: 100%</div>
                <div className="w-full bg-[#E4EAEC] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '88.4%' }} />
                </div>
              </div>
            </div>

            {/* Split Content: Class Attendance Pacing & Real-time Live Ticker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Class Pacing */}
              <div className="bg-white p-3 rounded-xl border border-[#E4EAEC] space-y-2">
                <div className="flex items-center justify-between text-[10.5px] font-bold text-[#17313A]">
                  <span>Classroom Attendance</span>
                  <span className="text-[9px] text-[#086A92]">1-Tap Fast Sync</span>
                </div>

                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Class 10-A (Form Tutor)</span>
                    <span className="font-mono font-bold text-emerald-700">43/45 (95.5%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Class 10-B (Science)</span>
                    <span className="font-mono font-bold text-emerald-700">41/44 (93.1%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Class 9-A (Mathematics)</span>
                    <span className="font-mono font-bold text-emerald-700">40/42 (95.2%)</span>
                  </div>
                </div>
              </div>

              {/* Real-time Activity Ticker */}
              <div className="bg-white p-3 rounded-xl border border-[#E4EAEC] space-y-2">
                <div className="flex items-center justify-between text-[10.5px] font-bold text-[#17313A]">
                  <span>Live Campus Ticker</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>

                <div className="space-y-1.5 text-[9.5px] text-[#6B7C83]">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-1 h-1 rounded-full bg-[#086A92]" />
                    <span className="truncate">Aarav Sharma (10-A) receipt #REC-8891 issued</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-1 h-1 rounded-full bg-[#35B84A]" />
                    <span className="truncate">Bus Route #4 North Express entered campus</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-1 h-1 rounded-full bg-amber-500" />
                    <span className="truncate">Physics Mock Exam marks finalized by Principal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Layered UI Badge 1 (Top Right) */}
      <div className="hidden sm:flex absolute -top-4 -right-4 bg-white/95 backdrop-blur-md border border-[#c0e3ed] p-2.5 rounded-xl shadow-xl items-center gap-2.5 animate-float z-10 text-xs">
        <div className="w-8 h-8 rounded-lg bg-[#EAF8EC] text-[#16A34A] flex items-center justify-center font-bold">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-[#17313A] block text-[11px]">1-Tap Attendance Synced</span>
          <span className="text-[9.5px] text-emerald-600 font-medium">0 Offline Queue • Real-time SMS</span>
        </div>
      </div>

      {/* Floating Layered UI Badge 2 (Bottom Left) */}
      <div className="hidden sm:flex absolute -bottom-4 -left-4 bg-[#17313A] text-white border border-[#043A52] p-2.5 rounded-xl shadow-xl items-center gap-2.5 animate-float-delayed z-10 text-xs">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-[#35B84A] flex items-center justify-center">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-white block text-[11px]">AES-256 Cloud Backup Verified</span>
          <span className="text-[9.5px] text-[#A2E2F8]">CBSE Affiliation #89410 Compliant</span>
        </div>
      </div>
    </div>
  );
};
