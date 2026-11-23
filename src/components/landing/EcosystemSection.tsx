'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BrainCircuit,
  ShieldCheck,
  DollarSign,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { EdvoNestLogo } from '@/components/ui/EdvoNestLogo';

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
    <section id="ecosystem" className="py-20 lg:py-28 bg-[#081820] text-white relative overflow-hidden">
      {/* Background Orbit Mesh */}
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-15 pointer-events-none" />
      <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] bg-[#008C91]/20 rounded-full filter blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs sm:text-sm font-bold text-[#75D7D1] uppercase tracking-wider bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block">
            Connected Operating System
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
            Everything connected.{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Nothing complicated.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
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
                    ? 'bg-gradient-to-b from-white/15 to-white/5 border-cyan-400 shadow-xl ring-2 ring-cyan-400/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: pillar.color }}
                    >
                      <PIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-slate-300">
                      {pillar.badge}
                    </span>
                  </div>

                  <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block">
                    {pillar.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    {pillar.title}
                  </h3>
                </div>

                <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-300">{pillar.metric}</span>
                  <span className="text-emerald-400 font-bold">● Active</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Cinematic Expanded Pillar Showcase Panel */}
        <div className="bg-gradient-to-br from-[#0B2632] via-[#081820] to-[#17313A] border border-white/20 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Detail Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: activePillar.color }}
                >
                  <ActiveIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-mono tracking-wider text-cyan-300 font-bold">
                    Operational Pillar 0{pillars.findIndex((p) => p.id === activePillar.id) + 1}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {activePillar.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                {activePillar.desc}
              </p>

              {/* Highlights 2-column checklist */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Key Institutional Capabilities:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {activePillar.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-slate-200 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#35B84A] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Live Simulation Preview */}
            <div className="lg:col-span-5 bg-black/30 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#35B84A] animate-pulse" />
                  <span className="font-bold text-white text-xs sm:text-sm">Real-Time Core Stream</span>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-300 bg-white/10 px-2.5 py-0.5 rounded-md">
                  Status: 100% Operational
                </span>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Current Metric Benchmark</span>
                  <span className="text-[#35B84A] font-bold">Passed Audit</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{activePillar.metric}</div>
                <div className="text-xs text-slate-400">Continuous background sync with zero latency</div>
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
                <span>AES-256 Cloud Backup Verified</span>
                <span className="font-mono text-cyan-300">CBSE Standard #89410</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
