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
      color: '#990000',
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
      color: '#C00000',
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
      color: '#990000',
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
      color: '#171717',
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
    <section id="ecosystem" className="py-20 lg:py-28 bg-[#F5F5F5] text-[#171717] relative overflow-hidden border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs sm:text-sm font-bold text-[#990000] uppercase tracking-wider bg-red-50 px-4 py-1.5 rounded-full border border-red-200 inline-block">
            Connected Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#171717] tracking-tight leading-[1.12]">
            Everything connected.{' '}
            <span className="bg-gradient-to-r from-[#990000] via-[#C00000] to-[#E00000] bg-clip-text text-transparent">
              Nothing complicated.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#525252] leading-relaxed max-w-2xl mx-auto">
            Explore how EdvoNest links every campus department into one continuous, high-performance operational continuum.
          </p>
        </div>

        {/* 4 Interactive Pillar Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            const isSelected = pillar.id === activePillarId;

            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setActivePillarId(pillar.id)}
                className={`text-left p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-[#990000] shadow-md ring-2 ring-red-100'
                    : 'bg-white border-[#E5E5E5] hover:border-red-200 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#990000] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#525252] bg-[#F5F5F5] px-2 py-0.5 rounded border border-[#E5E5E5]">
                      {pillar.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#171717]">{pillar.title}</h3>
                  <p className="text-xs text-[#525252] mt-1 font-semibold">{pillar.category}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                  <span className="font-bold text-[#990000]">{pillar.metric}</span>
                  <span className="text-[#990000] font-bold text-xs flex items-center gap-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Deep Dive Panel */}
        <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-[#990000]">
                <Sparkles className="w-3.5 h-3.5 text-[#990000]" />
                <span>Deep Dive Architecture</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[#171717]">
                {activePillar.title}
              </h3>

              <p className="text-sm sm:text-base text-[#525252] leading-relaxed">
                {activePillar.desc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {activePillar.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#171717]">
                    <CheckCircle2 className="w-4 h-4 text-[#990000] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#F5F5F5] rounded-2xl p-6 border border-[#E5E5E5] text-center space-y-3">
              <div className="w-14 h-14 bg-red-50 text-[#990000] rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                <ActiveIcon className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-[#171717] text-base">{activePillar.category}</h4>
              <p className="text-xs text-[#525252] leading-relaxed">
                Synchronized continuously with the central relational database to eliminate data latency.
              </p>
              <div className="pt-2 text-xs font-mono font-bold text-[#990000] bg-white py-1.5 px-3 rounded-lg border border-[#E5E5E5] inline-block">
                Status: Operational • 0 Errors
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
