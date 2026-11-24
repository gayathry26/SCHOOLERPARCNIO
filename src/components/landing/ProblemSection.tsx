'use client';

import React from 'react';
import { CheckCircle2, XCircle, Zap } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      title: 'Disconnected Software Silos',
      desc: 'Attendance in registers, fees on spreadsheets, homework on messaging apps, and bus tracking via separate vendors.',
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
    <section className="py-20 lg:py-28 bg-white text-[#171717] relative overflow-hidden border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs sm:text-sm font-bold text-[#990000] uppercase tracking-wider bg-red-50 px-4 py-1.5 rounded-full border border-red-200 inline-block">
            The Fundamental Shift
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#171717] tracking-tight leading-[1.12]">
            Schools deserve better than{' '}
            <span className="bg-gradient-to-r from-[#990000] via-[#C00000] to-[#E00000] bg-clip-text text-transparent">
              disconnected systems.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#525252] leading-relaxed max-w-2xl mx-auto">
            Traditional schools juggle 5 to 7 fragmented software vendors, manual paper ledgers, and chaotic communication chains. EdvoNest replaces fragmentation with architectural elegance.
          </p>
        </div>

        {/* 2-Column Side-by-Side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Legacy Fragmented Nightmare */}
          <div className="bg-[#F5F5F5] rounded-3xl p-6 sm:p-8 border border-[#E5E5E5] shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-[#525252] font-bold text-sm sm:text-base">
                <XCircle className="w-5 h-5 shrink-0 text-neutral-500" />
                <span>The Legacy School Experience</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#171717]">
                Fragmented tools, manual delays, and zero visibility.
              </h3>

              <div className="space-y-3.5 pt-2">
                {problems.map((prob, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white border border-[#E5E5E5] shadow-2xs space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-[#171717]">{prob.title}</h4>
                    <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">{prob.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-between text-xs text-[#525252] font-mono font-semibold">
              <span>Average administrative waste: 2.5 hrs/day</span>
              <span className="bg-neutral-200 px-2 py-0.5 rounded text-[#171717]">High Error Rate</span>
            </div>
          </div>

          {/* EdvoNest Unified Operating System */}
          <div className="bg-red-50/50 rounded-3xl p-6 sm:p-8 border border-red-200 shadow-md flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2.5 text-[#990000] font-bold text-sm sm:text-base">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#990000]" />
                <span>The EdvoNest Connected Standard</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#171717]">
                One unified intelligent canvas for all stakeholders.
              </h3>

              <div className="space-y-3.5 pt-2">
                {solutions.map((sol, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white border border-red-100 shadow-2xs space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-[#171717] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#990000]" />
                      <span>{sol.title}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">{sol.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-red-200 flex items-center justify-between text-xs text-[#990000] font-mono font-bold">
              <span>Automated real-time processing: Instant</span>
              <span className="bg-red-100 px-2 py-0.5 rounded text-[#990000]">Zero Redundancy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
