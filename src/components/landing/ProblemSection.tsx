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
    <section className="py-20 lg:py-28 bg-white text-[#17313A] relative overflow-hidden border-b border-[#E4EAEC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs sm:text-sm font-bold text-[#086A92] uppercase tracking-wider bg-[#EAF5F8] px-4 py-1.5 rounded-full border border-[#c0e3ed] inline-block">
            The Fundamental Shift
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#17313A] tracking-tight leading-[1.12]">
            Schools deserve better than{' '}
            <span className="bg-gradient-to-r from-rose-600 via-amber-600 to-[#086A92] bg-clip-text text-transparent">
              disconnected systems.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#4A5D65] leading-relaxed max-w-2xl mx-auto">
            Traditional schools juggle 5 to 7 fragmented software vendors, manual paper ledgers, and chaotic communication chains. EdvoNest replaces fragmentation with architectural elegance.
          </p>
        </div>

        {/* 2-Column Side-by-Side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Legacy Fragmented Nightmare */}
          <div className="bg-rose-50/50 rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-rose-700 font-bold text-sm sm:text-base">
                <XCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>The Legacy School Experience</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#17313A]">
                Fragmented tools, manual delays, and zero visibility.
              </h3>

              <div className="space-y-3.5 pt-2">
                {problems.map((prob, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white border border-rose-100 shadow-2xs space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">{prob.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{prob.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-rose-200 flex items-center justify-between text-xs text-rose-800 font-mono font-semibold">
              <span>Average administrative waste: 2.5 hrs/day</span>
              <span className="bg-rose-100 px-2 py-0.5 rounded">High Error Rate</span>
            </div>
          </div>

          {/* EdvoNest Unified Operating System */}
          <div className="bg-[#EAF5F8] rounded-3xl p-6 sm:p-8 border border-[#c0e3ed] shadow-md flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2.5 text-[#16A34A] font-bold text-sm sm:text-base">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#35B84A]" />
                <span>The EdvoNest Connected Standard</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#17313A]">
                One unified intelligent canvas for all stakeholders.
              </h3>

              <div className="space-y-3.5 pt-2">
                {solutions.map((sol, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white border border-[#c0e3ed] shadow-2xs space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-[#17313A] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#086A92]" />
                      <span>{sol.title}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-[#4A5D65] leading-relaxed">{sol.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#c0e3ed] flex items-center justify-between text-xs text-[#086A92] font-mono font-bold relative z-10">
              <span>Time saved daily: 45 mins/teacher</span>
              <span className="bg-[#EAF8EC] text-[#16A34A] px-2 py-0.5 rounded border border-[#bbf0c5]">
                100% Audit Precision
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
