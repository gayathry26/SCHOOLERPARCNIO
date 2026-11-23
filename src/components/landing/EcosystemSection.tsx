'use client';

import React, { useState } from 'react';
import {
  BrainCircuit,
  ShieldCheck,
  DollarSign,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface Pillar {
  id: string;
  title: string;
  category: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  metric: string;
  desc: string;
  highlights: string[];
}

export const EcosystemSection: React.FC = () => {
  const [activePillarId, setActivePillarId] = useState<string>('academics');

  const pillars: Pillar[] = [
    {
      id: 'academics',
      title: 'Academic Intelligence',
      category: 'Curriculum & Grading',
      badge: 'CBSE Compliant',
      icon: BrainCircuit,
      color: '#086A92',
      metric: '94.8% Syllabus On-Track',
      desc: 'Predictive performance analytics, adaptive question banks, CBSE/ICSE smart syllabus tracking, and automated term gradebooks.',
      highlights: [
        'Automated A1–E grade computations',
        '1-click CBSE report card printing',
        'Subject-wise performance radars',
        'AI Study Assistant doubt resolution',
      ],
    },
    {
      id: 'safety',
      title: 'Campus Safety & Fleet',
      category: 'Transport & Security',
      badge: 'Zero Incidents',
      icon: ShieldCheck,
      color: '#008C91',
      metric: '12/12 Live GPS Routes',
      desc: 'Live school bus GPS tracking with parent ETA notifications, geofence deviation alerts, encrypted student gate passes, and clinic health logs.',
      highlights: [
        'Real-time GPS en route bus tracking',
        'Driver credential manifests & contacts',
        'RFID/QR student gate passes',
        'Digital clinic nurse treatment logs',
      ],
    },
    {
      id: 'finance',
      title: 'Financial Operations',
      category: 'Counter & Invoicing',
      badge: '100% Reconciliation',
      icon: DollarSign,
      color: '#35B84A',
      metric: '₹ 48.5L Q3 Realized',
      desc: 'Counter collections via Cash, Cheque, and UPI with idempotency protection. Instant printable receipts, fee concession rules, and cash-book balancing.',
      highlights: [
        'Printable regulatory receipts with headers',
        'Automated sibling & merit concessions',
        'Real-time UPI bank reference tags',
        'One-click annual audit CSV exports',
      ],
    },
    {
      id: 'community',
      title: 'Parent & Student Community',
      category: 'Engagement & Mentorship',
      badge: '1,248 Active Profiles',
      icon: HeartHandshake,
      color: '#D97706',
      metric: '98.2% Parent Satisfaction',
      desc: 'Mobile-first parent portal with multi-child ward switching, timetable reviews, online homework submissions, and PTM appointment scheduling.',
      highlights: [
        'Multi-child family ward switcher',
        'Direct teacher PTM slot reservation',
        'Online homework file attachments',
        'Digital achievement student portfolios',
      ],
    },
  ];

  const activePillar = pillars.find((p) => p.id === activePillarId) || pillars[0];
  const ActiveIcon = activePillar.icon;

  return (
    <section id="ecosystem" className="py-20 lg:py-28 bg-[#F7FAFA] text-[#17313A] relative overflow-hidden border-b border-[#E4EAEC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs sm:text-sm font-bold text-[#086A92] uppercase tracking-wider bg-[#EAF5F8] px-4 py-1.5 rounded-full border border-[#c0e3ed] inline-block">
            Connected Operating System
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#17313A] tracking-tight leading-[1.12]">
            Everything connected.{' '}
            <span className="bg-gradient-to-r from-[#086A92] via-[#008C91] to-[#35B84A] bg-clip-text text-transparent">
              Nothing complicated.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#4A5D65] leading-relaxed max-w-2xl mx-auto">
            EdvoNest unifies the 4 foundational pillars of a high-achieving institution into one synchronized data fabric.
          </p>
        </div>

        {/* 4 Pillars Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {pillars.map((pillar) => {
            const PIcon = pillar.icon;
            const isSelected = activePillarId === pillar.id;

            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setActivePillarId(pillar.id)}
                className={`text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-[#086A92] shadow-md ring-2 ring-[#086A92]/20'
                    : 'bg-white/80 border-[#E4EAEC] hover:bg-white hover:border-[#086A92]/40 hover:shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: pillar.color }}
                    >
                      <PIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#F7FAFA] border border-[#E4EAEC] text-[#4A5D65]">
                      {pillar.badge}
                    </span>
                  </div>

                  <span className="text-xs uppercase font-mono tracking-wider text-[#6B7C83] font-semibold block">
                    {pillar.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#17313A] mt-1">
                    {pillar.title}
                  </h3>
                </div>

                <div className="pt-4 mt-3 border-t border-[#F1F5F7] flex items-center justify-between text-xs">
                  <span className="font-bold text-[#086A92]">{pillar.metric}</span>
                  <span className="text-[#16A34A] font-bold">● Active</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Cinematic Expanded Pillar Showcase Panel */}
        <div className="bg-white border border-[#E4EAEC] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Detail Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: activePillar.color }}
                >
                  <ActiveIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-mono tracking-wider text-[#086A92] font-bold">
                    Operational Pillar 0{pillars.findIndex((p) => p.id === activePillar.id) + 1}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#17313A]">
                    {activePillar.title}
                  </h3>
                </div>
              </div>

              <p className="text-base text-[#4A5D65] leading-relaxed max-w-xl">
                {activePillar.desc}
              </p>

              {/* Highlights 2-column checklist */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-[#17313A] uppercase tracking-wider block mb-2">
                  Key Institutional Capabilities:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {activePillar.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-slate-800 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#35B84A] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Live Simulation Preview */}
            <div className="lg:col-span-5 bg-[#F7FAFA] border border-[#E4EAEC] rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4EAEC]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#35B84A] animate-pulse" />
                  <span className="font-bold text-[#17313A] text-xs sm:text-sm">Real-Time Core Stream</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#086A92] bg-[#EAF5F8] px-2.5 py-0.5 rounded-md border border-[#c0e3ed]">
                  100% Operational
                </span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#E4EAEC] space-y-2 shadow-2xs">
                <div className="flex justify-between items-center text-xs text-[#6B7C83]">
                  <span>Current Metric Benchmark</span>
                  <span className="text-[#16A34A] font-bold">Passed Audit</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#17313A]">{activePillar.metric}</div>
                <div className="text-xs text-[#4A5D65]">Continuous background sync with zero latency</div>
              </div>

              <div className="text-xs text-[#6B7C83] flex items-center justify-between pt-1">
                <span>AES-256 Cloud Backup Verified</span>
                <span className="font-mono text-[#086A92] font-semibold">CBSE Standard #89410</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
