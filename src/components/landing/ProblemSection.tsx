'use client';

import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, XCircle, ArrowRight, Layers, Zap } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      title: 'Disconnected Software Silos',
      desc: 'Attendance in registers, fees on spreadsheets, homework on WhatsApp, and bus tracking via separate vendors.',
    },
    {
      title: 'Bureaucratic Delays & Human Errors',
      desc: 'Hours wasted transcribing marks into CBSE gradebooks, duplicate fee entries, and manual receipt reconciliation.',
    },
    {
      title: 'Communication Blindspots',
      desc: 'Parents constantly calling school desks for arrival ETAs, attendance disputes, and delayed exam announcements.',
    },
  ];

  const solutions = [
    {
      title: 'Unified Single Source of Truth',
      desc: 'One permanent student & staff identity connecting attendance, gradebook marks, bus GPS, and counter receipts.',
    },
    {
      title: 'Automated Real-Time Workflows',
      desc: '1-tap morning registers, instant UPI receipts with bank reference reconciliation, and automated report card generation.',
    },
    {
      title: 'Continuous Stakeholder Clarity',
      desc: 'Mobile-first transparent parent tracking, instant absence SMS notifications, and board-compliant audit continuity.',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#0B2632] text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#086A92]/15 rounded-full filter blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs sm:text-sm font-bold text-[#75D7D1] uppercase tracking-wider bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block">
            The Fundamental Shift
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
            Schools deserve better than{' '}
            <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-[#75D7D1] bg-clip-text text-transparent">
              disconnected systems.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Traditional schools juggle 5 to 7 fragmented software vendors, manual paper ledgers, and chaotic communication chains. EdvoNest replaces fragmentation with architectural elegance.
          </p>
        </div>

        {/* 2-Column Side-by-Side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Legacy Fragmented Nightmare */}
          <div className="bg-white/5 rounded-3xl p-6 sm:p-8 border border-rose-500/20 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm sm:text-base">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>The Legacy School Experience</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Fragmented tools, manual delays, and zero visibility.
              </h3>

              <div className="space-y-4 pt-2">
                {problems.map((prob, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-slate-200">{prob.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{prob.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-rose-300/80 font-mono">
              <span>Average administrative waste: 2.5 hrs/day</span>
              <span>High error rate</span>
            </div>
          </div>

          {/* EdvoNest Unified Operating System */}
          <div className="bg-gradient-to-br from-[#086A92]/40 via-[#0B2632] to-[#17313A] rounded-3xl p-6 sm:p-8 border border-cyan-400/30 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            {/* Top accent glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#35B84A]/20 rounded-full filter blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2.5 text-[#35B84A] font-bold text-sm sm:text-base">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>The EdvoNest Connected Standard</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                One unified intelligent canvas for all stakeholders.
              </h3>

              <div className="space-y-4 pt-2">
                {solutions.map((sol, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1 backdrop-blur-md">
                    <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#75D7D1]" />
                      <span>{sol.title}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{sol.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs text-[#75D7D1] font-mono font-semibold relative z-10">
              <span>Time saved daily: 45 mins/teacher</span>
              <span>100% Audit Precision</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
