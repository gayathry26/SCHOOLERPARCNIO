'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
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
import { EdvoNestLogo } from '@/components/ui/EdvoNestLogo';

export const CinematicHero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#F7FAFA] text-[#17313A] py-16 sm:py-20 lg:py-24 border-b border-[#E4EAEC]">
      {/* Background Soft Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#EAF5F8] rounded-full filter blur-3xl opacity-80 pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#EAF8EC] rounded-full filter blur-3xl opacity-75 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: High-Contrast Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#EAF8EC] border border-[#bbf0c5] rounded-full text-xs sm:text-sm font-bold text-[#16A34A] shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#35B84A]" />
              <span>Next-Gen School Operating System • Session 2026–27</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.8rem] font-black text-[#17313A] tracking-tight leading-[1.12]">
              One Campus.{' '}
              <span className="bg-gradient-to-r from-[#086A92] via-[#008C91] to-[#35B84A] bg-clip-text text-transparent">
                Infinite Possibilities.
              </span>
            </h1>

            {/* Supporting Headline */}
            <p className="text-base sm:text-lg lg:text-xl text-[#4A5D65] leading-relaxed max-w-xl font-normal">
              An intelligent school operating system connecting academics, people, finance, and campus operations in one seamless ecosystem.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a href="#ecosystem">
                <Button
                  variant="primary"
                  size="lg"
                  className="text-base font-bold px-7 py-3.5 shadow-md bg-[#086A92] hover:bg-[#07597b] text-white cursor-pointer"
                  rightIcon={<ArrowRight className="w-5 h-5 ml-1" />}
                >
                  Explore EdvoNest
                </Button>
              </a>

              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base font-bold px-7 py-3.5 bg-white text-[#17313A] border-[#E4EAEC] hover:bg-[#F7FAFA] shadow-xs cursor-pointer"
                >
                  Experience Live Demo
                </Button>
              </Link>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-6 border-t border-[#E4EAEC] grid grid-cols-3 gap-6">
              <div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#086A92]">96.8%</p>
                <p className="text-xs sm:text-sm text-[#4A5D65] font-semibold mt-1">
                  Daily Attendance
                </p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#16A34A]">100%</p>
                <p className="text-xs sm:text-sm text-[#4A5D65] font-semibold mt-1">
                  CBSE Pass Rate
                </p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#17313A]">1,248</p>
                <p className="text-xs sm:text-sm text-[#4A5D65] font-semibold mt-1">
                  Active Students
                </p>
              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="flex flex-wrap items-center gap-5 text-sm sm:text-base text-slate-700 font-semibold pt-1">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#35B84A]" />
                <span>Zero IT Setup</span>
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#35B84A]" />
                <span>AES-256 Backups</span>
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#35B84A]" />
                <span>Offline-First PWA</span>
              </span>
            </div>
          </div>

          {/* Right Column: High-Contrast SaaS Dashboard Mockup Preview */}
          <div className="lg:col-span-6 w-full relative">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#086A92]/20 via-[#008C91]/20 to-[#35B84A]/20 rounded-3xl blur-xl opacity-70 pointer-events-none" />

            {/* Mockup Window Container */}
            <div className="relative bg-white rounded-2xl border border-[#E4EAEC] shadow-2xl overflow-hidden select-none">
              {/* Window Chrome Header */}
              <div className="bg-[#17313A] px-4 py-3 flex items-center justify-between border-b border-[#043A52]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span className="ml-2 text-xs text-slate-300 font-mono hidden sm:inline-block">
                    edvonest.school/dashboard
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-[#35B84A] font-bold text-xs border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-[#35B84A] animate-ping" />
                    <span>Live Synced</span>
                  </span>
                </div>
              </div>

              {/* Interior Canvas */}
              <div className="p-5 sm:p-6 space-y-4 bg-[#F7FAFA]">
                {/* Cockpit Title Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E4EAEC]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-[#17313A]">
                        Principal Executive Cockpit
                      </h3>
                      <span className="text-xs bg-[#EAF8EC] text-[#16A34A] font-bold px-2 py-0.5 rounded-md border border-[#bbf0c5]">
                        2026–27 CBSE
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#4A5D65] mt-0.5 font-medium">
                      Dr. Sunita Mehra • All 16 Modules Operating Normally
                    </p>
                  </div>

                  <span className="text-xs font-bold text-[#086A92] bg-[#EAF5F8] px-2.5 py-1 rounded-md border border-[#c0e3ed]">
                    Term 2 Active
                  </span>
                </div>

                {/* 3 Metric KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white rounded-xl border border-[#E4EAEC] shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-[#4A5D65] font-semibold">
                      <span>Daily Attendance</span>
                      <span className="text-[#16A34A] font-bold">+2.4%</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">96.8%</div>
                    <div className="text-xs text-[#6B7C83] mt-0.5 font-medium">1,208/1,248 Present</div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-[#E4EAEC] shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-[#4A5D65] font-semibold">
                      <span>Fee Realization</span>
                      <span className="text-[#086A92] font-bold">Q3 Cycle</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[#086A92] mt-1">
                      ₹ 48,50,000
                    </div>
                    <div className="text-xs text-[#6B7C83] mt-0.5 font-medium">82.5% Target Collected</div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-[#E4EAEC] shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-[#4A5D65] font-semibold">
                      <span>CBSE Average</span>
                      <span className="text-amber-600 font-bold">Grade A1</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">88.4%</div>
                    <div className="text-xs text-[#6B7C83] mt-0.5 font-medium">Pass Trajectory: 100%</div>
                  </div>
                </div>

                {/* Split Bottom Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Classroom Attendance */}
                  <div className="p-3.5 bg-white rounded-xl border border-[#E4EAEC] space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-[#17313A] pb-1.5 border-b border-[#E4EAEC]">
                      <span>Classroom Attendance</span>
                      <span className="text-[#16A34A] font-mono text-xs font-bold">1-Tap Synced</span>
                    </div>
                    <div className="space-y-1.5 text-slate-700 text-xs">
                      <div className="flex justify-between">
                        <span>Class 10-A (Form Tutor)</span>
                        <strong className="text-slate-900 font-mono">44/45 (97.7%)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Class 10-B (Science)</span>
                        <strong className="text-slate-900 font-mono">41/44 (93.1%)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Class 9-A (Mathematics)</span>
                        <strong className="text-slate-900 font-mono">42/42 (100%)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Live Campus Ticker */}
                  <div className="p-3.5 bg-white rounded-xl border border-[#E4EAEC] space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-[#17313A] pb-1.5 border-b border-[#E4EAEC]">
                      <span>Live Campus Ticker</span>
                      <span className="w-2 h-2 rounded-full bg-[#35B84A] animate-ping" />
                    </div>
                    <div className="space-y-1.5 text-slate-600 text-xs">
                      <p className="truncate">• Aarav Sharma (10-A) receipt #REC-8891 issued</p>
                      <p className="truncate">• Bus Route #4 North Express entered campus</p>
                      <p className="truncate">• Physics Mock Exam marks locked by Principal</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Pill Accent Badges */}
              <div className="absolute -top-3 -right-3 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-[#bbf0c5] shadow-xl text-xs text-[#17313A]">
                <span className="p-1.5 rounded-lg bg-[#EAF8EC] text-[#16A34A]">
                  <CalendarCheck className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold text-[#17313A]">1-Tap Attendance Synced</div>
                  <div className="text-xs text-[#4A5D65]">0 Offline Queue • Real-time SMS</div>
                </div>
              </div>

              <div className="absolute -bottom-3 -left-3 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#17313A] border border-[#043A52] shadow-xl text-xs text-white">
                <span className="p-1.5 rounded-lg bg-white/10 text-[#75D7D1]">
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
