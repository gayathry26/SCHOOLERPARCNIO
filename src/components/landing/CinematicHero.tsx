'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck,
  TrendingUp,
  CreditCard,
  Users,
  Bus,
  Layers,
  GraduationCap,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const CinematicHero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-white text-[#171717] py-16 sm:py-20 lg:py-24 border-b border-[#E5E5E5]">
      {/* Background Soft Red Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-red-50/60 rounded-full filter blur-3xl opacity-80 pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-red-50/40 rounded-full filter blur-3xl opacity-75 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: High-Contrast Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-red-50 border border-red-200 rounded-full text-xs sm:text-sm font-bold text-[#990000] shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#990000]" />
              <span>Next-Gen School Operating System • Session 2026–27</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.8rem] font-black text-[#171717] tracking-tight leading-[1.12]">
              One Campus.{' '}
              <span className="bg-gradient-to-r from-[#990000] via-[#C00000] to-[#E00000] bg-clip-text text-transparent">
                Infinite Possibilities.
              </span>
            </h1>

            {/* Supporting Headline */}
            <p className="text-base sm:text-lg lg:text-xl text-[#525252] leading-relaxed max-w-xl font-normal">
              An intelligent school operating system connecting academics, people, finance, and campus operations in one seamless ecosystem.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a href="#ecosystem">
                <Button
                  variant="primary"
                  size="lg"
                  className="text-base font-bold px-7 py-3.5 shadow-sm bg-[#990000] hover:bg-[#800000] text-white cursor-pointer"
                  rightIcon={<ArrowRight className="w-5 h-5 ml-1" />}
                >
                  Explore EdvoNest
                </Button>
              </a>

              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base font-bold px-7 py-3.5 bg-white text-[#171717] border-[#E5E5E5] hover:bg-[#F5F5F5] shadow-xs cursor-pointer"
                >
                  Experience Live Demo
                </Button>
              </Link>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-6 border-t border-[#E5E5E5] grid grid-cols-3 gap-6">
              <div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#990000]">96.8%</p>
                <p className="text-xs sm:text-sm text-[#525252] font-semibold mt-1">
                  Daily Attendance
                </p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#C00000]">100%</p>
                <p className="text-xs sm:text-sm text-[#525252] font-semibold mt-1">
                  CBSE Pass Rate
                </p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#171717]">1,248</p>
                <p className="text-xs sm:text-sm text-[#525252] font-semibold mt-1">
                  Active Students
                </p>
              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="flex flex-wrap items-center gap-5 text-sm sm:text-base text-[#171717] font-semibold pt-1">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#990000]" />
                <span>Zero IT Setup</span>
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#990000]" />
                <span>AES-256 Backups</span>
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#990000]" />
                <span>Offline-First PWA</span>
              </span>
            </div>
          </div>

          {/* Right Column: High-Contrast SaaS Dashboard Mockup Preview */}
          <div className="lg:col-span-6 w-full relative">
            <div className="relative bg-white rounded-2xl border border-[#E5E5E5] shadow-xl overflow-hidden select-none">
              {/* Window Chrome Header */}
              <div className="bg-[#171717] px-4 py-3 flex items-center justify-between border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span className="ml-2 text-xs text-slate-300 font-mono hidden sm:inline-block">
                    edvonest.school/dashboard
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 font-bold text-xs border border-red-500/30">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                    <span>Live Synced</span>
                  </span>
                </div>
              </div>

              {/* Interior Canvas */}
              <div className="p-5 sm:p-6 space-y-4 bg-[#F5F5F5]">
                {/* Cockpit Title Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-[#171717]">
                        Principal Executive Cockpit
                      </h3>
                      <span className="text-xs bg-red-50 text-[#990000] font-bold px-2 py-0.5 rounded-md border border-red-200">
                        2026–27 CBSE
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#525252] mt-0.5 font-medium">
                      Dr. Sunita Mehra • All 16 Modules Operating Normally
                    </p>
                  </div>

                  <span className="text-xs font-bold text-[#990000] bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                    Term 2 Active
                  </span>
                </div>

                {/* 3 Metric KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white rounded-xl border border-[#E5E5E5] shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-[#525252] font-semibold">
                      <span>Daily Attendance</span>
                      <span className="text-[#990000] font-bold">+2.4%</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[#990000] mt-1">96.8%</div>
                    <div className="text-xs text-[#525252] mt-0.5 font-medium">1,208/1,248 Present</div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-[#E5E5E5] shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-[#525252] font-semibold">
                      <span>Fee Realization</span>
                      <span className="text-[#C00000] font-bold">Q3 Cycle</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[#C00000] mt-1">
                      ₹ 48,50,000
                    </div>
                    <div className="text-xs text-[#525252] mt-0.5 font-medium">82.5% Target Collected</div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-[#E5E5E5] shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-[#525252] font-semibold">
                      <span>CBSE Average</span>
                      <span className="text-[#990000] font-bold">Grade A1</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[#171717] mt-1">88.4%</div>
                    <div className="text-xs text-[#525252] mt-0.5 font-medium">Pass Trajectory: 100%</div>
                  </div>
                </div>

                {/* Split Bottom Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Classroom Attendance */}
                  <div className="p-3.5 bg-white rounded-xl border border-[#E5E5E5] space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-[#171717] pb-1.5 border-b border-[#E5E5E5]">
                      <span>Classroom Attendance</span>
                      <span className="text-[#990000] font-mono text-xs font-bold">1-Tap Synced</span>
                    </div>
                    <div className="space-y-1.5 text-[#171717] text-xs">
                      <div className="flex justify-between">
                        <span>Class 10-A (Form Tutor)</span>
                        <strong className="text-[#171717] font-mono">44/45 (97.7%)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Class 10-B (Science)</span>
                        <strong className="text-[#171717] font-mono">41/44 (93.1%)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Class 9-A (Mathematics)</span>
                        <strong className="text-[#171717] font-mono">42/42 (100%)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Live Campus Ticker */}
                  <div className="p-3.5 bg-white rounded-xl border border-[#E5E5E5] space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-[#171717] pb-1.5 border-b border-[#E5E5E5]">
                      <span>Live Campus Ticker</span>
                      <span className="w-2 h-2 rounded-full bg-[#990000] animate-ping" />
                    </div>
                    <div className="space-y-1.5 text-[#525252] text-xs">
                      <p className="truncate">• Aarav Sharma (10-A) receipt #REC-8891 issued</p>
                      <p className="truncate">• Bus Route #4 North Express entered campus</p>
                      <p className="truncate">• Physics Mock Exam marks locked by Principal</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Pill Accent Badges */}
              <div className="absolute -top-3 -right-3 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-red-200 shadow-lg text-xs text-[#171717]">
                <span className="p-1.5 rounded-lg bg-red-50 text-[#990000]">
                  <CalendarCheck className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold text-[#171717]">1-Tap Attendance Synced</div>
                  <div className="text-xs text-[#525252]">0 Offline Queue • Real-time SMS</div>
                </div>
              </div>

              <div className="absolute -bottom-3 -left-3 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#171717] border border-neutral-700 shadow-lg text-xs text-white">
                <span className="p-1.5 rounded-lg bg-white/10 text-red-300">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold">AES-256 Cloud Backup Verified</div>
                  <div className="text-xs text-slate-300">CBSE Affiliation #89410 Compliant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
