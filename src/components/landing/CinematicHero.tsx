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
    <section className="relative min-h-[92vh] lg:min-h-screen bg-gradient-to-b from-[#081820] via-[#0B2632] to-[#17313A] text-white flex items-center justify-center overflow-hidden py-16 lg:py-24">
      {/* Background Architectural Mesh & Subtle Glowing Orbs */}
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#086A92]/30 rounded-full filter blur-[120px] pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-[#008C91]/25 rounded-full filter blur-[120px] pointer-events-none animate-pulse-subtle" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#086A92]/10 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Cinematic Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-bold text-[#75D7D1] shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-[#35B84A] animate-pulse" />
              <span>Next-Generation School OS • Session 2026–2027</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl sm:text-6xl lg:text-[4.2rem] font-black text-white tracking-tight leading-[1.08]"
            >
              One Campus.{' '}
              <span className="bg-gradient-to-r from-white via-[#75D7D1] to-[#35B84A] bg-clip-text text-transparent">
                Infinite Possibilities.
              </span>
            </motion.h1>

            {/* Supporting Headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-xl font-normal"
            >
              An intelligent school operating system connecting academics, people, finance, and campus operations in one seamless ecosystem.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <a href="#ecosystem">
                <Button
                  variant="primary"
                  size="lg"
                  className="text-base font-bold px-7 py-3.5 shadow-xl bg-gradient-to-r from-[#086A92] to-[#008C91] hover:brightness-110 cursor-pointer border border-cyan-400/30"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Explore EdvoNest
                </Button>
              </a>

              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base font-bold px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md cursor-pointer"
                >
                  Experience Live Demo
                </Button>
              </Link>
            </motion.div>

            {/* Trust Metrics Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="pt-6 border-t border-white/15 grid grid-cols-3 gap-6"
            >
              <div>
                <p className="text-2xl sm:text-4xl font-black text-[#75D7D1]">96.8%</p>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                  Daily Attendance
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-4xl font-black text-emerald-400">100%</p>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                  CBSE Pass Rate
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-4xl font-black text-cyan-300">1,248</p>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                  Active Students
                </p>
              </div>
            </motion.div>

            {/* Quick Guarantees */}
            <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm text-slate-300 font-medium pt-1">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#35B84A]" />
                <span>Zero IT Setup</span>
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#35B84A]" />
                <span>AES-256 Backups</span>
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#35B84A]" />
                <span>Offline-First PWA</span>
              </span>
            </div>
          </motion.div>

          {/* Right Column: Floating Cinematic SaaS Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 w-full relative"
          >
            {/* Ambient Background Blur Under Card */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#086A92]/40 via-[#008C91]/30 to-[#35B84A]/30 rounded-3xl blur-2xl opacity-70 pointer-events-none" />

            {/* Main Mockup Window Container */}
            <div className="relative bg-[#0F2833]/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden text-slate-200">
              {/* Window Chrome Header */}
              <div className="bg-[#081820]/95 px-4 py-3 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span className="ml-2 text-xs text-slate-400 font-mono hidden sm:inline-block">
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
              <div className="p-5 sm:p-6 space-y-4">
                {/* Cockpit Title Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        Principal Executive Cockpit
                      </h3>
                      <span className="text-xs bg-[#086A92]/40 text-[#75D7D1] font-bold px-2.5 py-0.5 rounded border border-[#086A92]/60">
                        CBSE #89410
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Dr. Sunita Mehra • All 16 Modules Operating Normally
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded bg-white/10 text-white font-bold text-xs border border-white/15">
                    Term 2 Active
                  </span>
                </div>

                {/* 3 Metric KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Daily Attendance</span>
                      <span className="text-[#35B84A] font-bold">+2.4%</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white mt-1">96.8%</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">1,208/1,248 Present</div>
                  </div>

                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Fee Realization</span>
                      <span className="text-cyan-300 font-bold">Q3 Cycle</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[#75D7D1] mt-1">
                      ₹ 48,50,000
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">82.5% Target Collected</div>
                  </div>

                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>CBSE Average</span>
                      <span className="text-amber-300 font-bold">Grade A1</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">88.4%</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Pass Trajectory: 100%</div>
                  </div>
                </div>

                {/* Split Bottom Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Classroom Attendance */}
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between font-bold text-white pb-1.5 border-b border-white/10">
                      <span>Classroom Attendance</span>
                      <span className="text-emerald-400 font-mono text-[11px]">1-Tap Synced</span>
                    </div>
                    <div className="space-y-1.5 text-slate-300 text-[11px]">
                      <div className="flex justify-between">
                        <span>Class 10-A (Form Tutor)</span>
                        <strong className="text-white font-mono">44/45 (97.7%)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Class 10-B (Science)</span>
                        <strong className="text-white font-mono">41/44 (93.1%)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Class 9-A (Mathematics)</span>
                        <strong className="text-white font-mono">42/42 (100%)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Live Campus Ticker */}
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between font-bold text-white pb-1.5 border-b border-white/10">
                      <span>Live Campus Ticker</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <div className="space-y-1 text-slate-300 text-[11px]">
                      <p className="truncate">• Aarav Sharma (10-A) receipt #REC-8891 issued</p>
                      <p className="truncate">• Bus Route #4 North Express entered campus</p>
                      <p className="truncate">• Physics Mock Exam marks locked by Principal</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Pill Accent Badges */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                className="absolute -top-3 -right-3 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#081820]/95 border border-emerald-400/40 shadow-xl text-xs text-white"
              >
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-[#35B84A]">
                  <CalendarCheck className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold">1-Tap Attendance Synced</div>
                  <div className="text-[10px] text-slate-400">0 Offline Queue • Real-time SMS</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-3 -left-3 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#081820]/95 border border-cyan-400/40 shadow-xl text-xs text-white"
              >
                <span className="p-1.5 rounded-lg bg-cyan-500/20 text-[#75D7D1]">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold">AES-256 Cloud Backup Verified</div>
                  <div className="text-[10px] text-slate-400">CBSE Affiliation #89410 Compliant</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
