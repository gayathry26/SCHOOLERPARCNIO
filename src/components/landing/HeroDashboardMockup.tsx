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
      <div className="absolute -inset-1.5 bg-gradient-to-r from-[#990000] to-[#35B84A] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>

      {/* Main SaaS Browser Window Mockup */}
      <div className="relative bg-white rounded-2xl border border-[#E5E5E5] shadow-2xl overflow-hidden select-none">
        {/* Browser Chrome Header */}
        <div className="bg-[#171717] px-4 py-3 flex items-center justify-between border-b border-[#171717]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/90 inline-block" />
            <span className="ml-2 text-xs text-slate-300 font-mono hidden sm:inline-block">
              edvonest.school/dashboard
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-[#35B84A] font-bold text-xs border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-[#35B84A] animate-ping" />
              <span>Campus Live Synced</span>
            </span>
          </div>
        </div>

        {/* Dashboard Shell Interior */}
        <div className="flex bg-[#F5F5F5] min-h-[380px] sm:min-h-[420px]">
          {/* Left Mini Rail Navigation */}
          <div className="w-14 sm:w-16 bg-white border-r border-[#E5E5E5] py-4 flex flex-col items-center justify-between shrink-0">
            <div className="space-y-3.5 flex flex-col items-center">
              <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#990000] flex items-center justify-center font-black shadow-2xs">
                <EdvoNestLogo variant="icon-only" size="sm" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#990000] text-white flex items-center justify-center shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>

            <div className="w-7 h-7 rounded-full bg-[#35B84A]/20 text-[#16A34A] flex items-center justify-center text-xs font-bold">
              ✓
            </div>
          </div>

          {/* Main Dashboard Canvas */}
          <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-hidden">
            {/* Top Internal Cockpit Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E5E5]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#171717] text-sm sm:text-base">
                    Principal Executive Cockpit
                  </span>
                  <span className="text-xs bg-[#EAF8EC] text-[#16A34A] font-bold px-2 py-0.5 rounded-md border border-[#bbf0c5]">
                    2026-27 CBSE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#525252] mt-0.5 font-medium">
                  Dr. Sunita Mehra • All 16 Modules Operating Normally
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#990000] font-bold bg-[#FEF2F2] px-2.5 py-1 rounded-md border border-[#FECACA]">
                  Term 2 Active
                </span>
              </div>
            </div>

            {/* 3 Metric Stat KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1: Attendance */}
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E5E5E5] shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#525252] font-semibold">Daily Attendance</span>
                  <span className="text-xs font-bold text-[#16A34A] bg-[#EAF8EC] px-1.5 py-0.5 rounded">
                    +2.4%
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#171717]">94.8%</div>
                <div className="text-xs text-[#525252] font-medium">1,184 / 1,248 Present</div>
                <div className="w-full bg-[#E5E5E5] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#35B84A] h-full rounded-full" style={{ width: '94.8%' }} />
                </div>
              </div>

              {/* Card 2: Fee Collections */}
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E5E5E5] shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#525252] font-semibold">Fee Collections</span>
                  <span className="text-xs font-bold text-[#990000] bg-[#FEF2F2] px-1.5 py-0.5 rounded">
                    Q3 Cycle
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#171717]">₹ 48,50,000</div>
                <div className="text-xs text-[#525252] font-medium">82.5% Target Collected</div>
                <div className="w-full bg-[#E5E5E5] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#990000] h-full rounded-full" style={{ width: '82.5%' }} />
                </div>
              </div>

              {/* Card 3: Academics */}
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E5E5E5] shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#525252] font-semibold">CBSE Pre-Board Avg</span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    Grade A1
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#171717]">88.4%</div>
                <div className="text-xs text-[#525252] font-medium">Pass Trajectory: 100%</div>
                <div className="w-full bg-[#E5E5E5] h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '88.4%' }} />
                </div>
              </div>
            </div>

            {/* Split Content: Class Attendance Pacing & Real-time Live Ticker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Class Pacing */}
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E5E5E5] space-y-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#171717]">
                  <span>Classroom Attendance</span>
                  <span className="text-xs text-[#990000] font-semibold">1-Tap Fast Sync</span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
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
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E5E5E5] space-y-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#171717]">
                  <span>Live Campus Ticker</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-[#525252]">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#990000] shrink-0" />
                    <span className="truncate">Aarav Sharma (10-A) receipt #REC-8891 issued</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#35B84A] shrink-0" />
                    <span className="truncate">Bus Route #4 North Express entered campus</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="truncate">Physics Mock Exam marks finalized by Principal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Layered UI Badge 1 (Top Right) */}
      <div className="hidden sm:flex absolute -top-5 -right-5 bg-white/95 backdrop-blur-md border border-[#FECACA] p-3 rounded-2xl shadow-xl items-center gap-3 animate-float z-10">
        <div className="w-9 h-9 rounded-xl bg-[#EAF8EC] text-[#16A34A] flex items-center justify-center font-bold">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-[#171717] block text-xs sm:text-sm">1-Tap Attendance Synced</span>
          <span className="text-xs text-emerald-700 font-semibold">0 Offline Queue • Real-time SMS</span>
        </div>
      </div>

      {/* Floating Layered UI Badge 2 (Bottom Left) */}
      <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-[#171717] text-white border border-[#171717] p-3 rounded-2xl shadow-xl items-center gap-3 animate-float-delayed z-10">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-[#35B84A] flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-white block text-xs sm:text-sm">AES-256 Cloud Backup Verified</span>
          <span className="text-xs text-[#FFFFFF] font-semibold">CBSE Affiliation #89410 Compliant</span>
        </div>
      </div>
    </div>
  );
};
