'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BrainCircuit,
  ShieldCheck,
  Building2,
  Users2,
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Bus,
  HeartPulse,
  DollarSign,
  UserCheck,
  Award,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { EdvoNestLogo } from './EdvoNestLogo';

interface PillarInfo {
  id: string;
  title: string;
  badge: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  iconBg: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  href: string;
  metrics: string;
  features: string[];
}

const PILLARS: PillarInfo[] = [
  {
    id: 'academics',
    title: 'Academics & AI Learning',
    badge: 'Module A • B • C • D',
    color: '#086A92',
    borderColor: '#086A92',
    bgGradient: 'from-[#EAF5F8] to-white',
    iconBg: 'bg-[#086A92]',
    icon: BrainCircuit,
    description: 'Predictive performance analytics, CBSE/ICSE smart question banks, daily lesson plans, and adaptive AI student tutoring.',
    href: '/dashboard/academic-intelligence',
    metrics: '94% Syllabus On-Track',
    features: ['Subject Performance Radar', 'Adaptive Question Bank', 'Daily Lesson Tracking', 'AI Revision Assistant'],
  },
  {
    id: 'safety',
    title: 'Campus Safety & Transport',
    badge: 'Module E • F • G',
    color: '#008C91',
    borderColor: '#008C91',
    bgGradient: 'from-[#E0F5F5] to-white',
    iconBg: 'bg-[#008C91]',
    icon: ShieldCheck,
    description: 'Instant QR student gate passes, live GPS bus tracking with parent ETA alerts, and digital nurse clinic records.',
    href: '/dashboard/campus-safety',
    metrics: '12/12 Buses Monitored',
    features: ['QR Student & Visitor Passes', 'Live GPS Route Deviation Alerts', 'Student Health & Clinic Logs', 'Emergency Broadcasts'],
  },
  {
    id: 'admin',
    title: 'Administration & Finance',
    badge: 'Module H • K • L',
    color: '#35B84A',
    borderColor: '#35B84A',
    bgGradient: 'from-[#EAF8EC] to-white',
    iconBg: 'bg-[#35B84A]',
    icon: DollarSign,
    description: 'Online admissions CRM pipeline, automated fee invoicing, staff appraisal & payroll, and laboratory inventory tracking.',
    href: '/dashboard/fees',
    metrics: '₹5.6L Term Fees Collected',
    features: ['1-Click Online Fee Receipts', 'Admission CRM Funnel', 'Teacher Workload & Appraisals', 'Asset Depreciation & Labs'],
  },
  {
    id: 'stakeholders',
    title: 'Community & Multi-Campus',
    badge: 'Module I • J • M • N • P',
    color: '#D97706',
    borderColor: '#D97706',
    bgGradient: 'from-[#FEF3C7]/40 to-white',
    iconBg: 'bg-[#D97706]',
    icon: Compass,
    description: 'Executive Principal Command Centre, seamless parent homework tracking, student digital achievement portfolios, and multi-branch isolation.',
    href: '/dashboard/command-centre',
    metrics: '1,248 Verified Profiles',
    features: ['Principal 360° Command Centre', 'Parent Engagement Portal', 'QR-Verified Digital Certificates', 'Multi-Campus Branch Aggregation'],
  },
];

export const SchoolArchitectureDiagram: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [activePillar, setActivePillar] = useState<string>('academics');

  const selected = PILLARS.find((p) => p.id === activePillar) || PILLARS[0];
  const Icon = selected.icon;

  return (
    <div className="w-full bg-white rounded-2xl border border-[#E4EAEC] p-4 sm:p-6 shadow-sm overflow-hidden relative">
      {/* Decorative gradient aura */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-[#EAF5F8] to-[#EAF8EC] rounded-full filter blur-3xl opacity-60 pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-[#E4EAEC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#35B84A] animate-pulse" />
            <h3 className="text-xs sm:text-sm font-black text-[#17313A] uppercase tracking-wider">
              EdvoNest Unified Operating System Architecture
            </h3>
          </div>
          <p className="text-[11px] text-[#6B7C83] mt-0.5">
            Interconnected school intelligence connecting Academics, Safety, Operations, and Parents in real-time.
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#F7FAFA] p-1 rounded-lg border border-[#E4EAEC]">
          {PILLARS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePillar(p.id)}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                activePillar === p.id
                  ? 'bg-white shadow-2xs text-[#086A92] border border-[#c0e3ed]'
                  : 'text-[#6B7C83] hover:text-[#17313A]'
              }`}
            >
              {p.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Hub Diagram Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left: 4 Interconnected Core Nodes surrounding Central Hub */}
        <div className="lg:col-span-7 relative min-h-[300px] flex items-center justify-center p-2">
          {/* Animated SVG Connection Lines connecting all 4 corners to center */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lineGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#086A92" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#35B84A" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {/* Top-Left to Center */}
            <line x1="25%" y1="25%" x2="50%" y2="50%" stroke="url(#lineGradBlue)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
            {/* Top-Right to Center */}
            <line x1="75%" y1="25%" x2="50%" y2="50%" stroke="url(#lineGradBlue)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
            {/* Bottom-Left to Center */}
            <line x1="25%" y1="75%" x2="50%" y2="50%" stroke="url(#lineGradBlue)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
            {/* Bottom-Right to Center */}
            <line x1="75%" y1="75%" x2="50%" y2="50%" stroke="url(#lineGradBlue)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
            {/* Orbit Circle */}
            <circle cx="50%" cy="50%" r="22%" stroke="#E4EAEC" strokeWidth="1.5" strokeDasharray="6 6" fill="none" />
          </svg>

          {/* 4 Interactive Pillar Node Cards */}
          <div className="w-full grid grid-cols-2 gap-3 relative z-10">
            {PILLARS.map((pillar) => {
              const PIcon = pillar.icon;
              const isSelected = activePillar === pillar.id;

              return (
                <div
                  key={pillar.id}
                  onClick={() => setActivePillar(pillar.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer transform hover:-translate-y-0.5 ${
                    isSelected
                      ? `bg-white border-[${pillar.borderColor}] shadow-md ring-2 ring-[${pillar.borderColor}]/20`
                      : 'bg-white/90 border-[#E4EAEC] hover:border-[#086A92]/40 hover:shadow-xs'
                  }`}
                  style={{ borderColor: isSelected ? pillar.borderColor : undefined }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${pillar.iconBg}`}
                    >
                      <PIcon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-[11px] font-black text-[#17313A] truncate leading-tight">
                        {pillar.title}
                      </p>
                      <span className="text-[9.5px] font-bold text-[#6B7C83]">{pillar.badge}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F7]">
                    <span className="text-[10px] font-bold text-[#086A92]">{pillar.metrics}</span>
                    <span className="text-[10px] text-[#35B84A] font-bold">● Active</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Central Core Emblem (Overlay in the center) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-[#086A92] shadow-lg flex items-center justify-center p-1.5 ring-4 ring-[#EAF5F8]">
              <EdvoNestLogo variant="icon-only" size="sm" />
            </div>
          </div>
        </div>

        {/* Right: Selected Node Details & Action */}
        <div
          className={`lg:col-span-5 rounded-xl p-4 border bg-gradient-to-br ${selected.bgGradient} border-[#E4EAEC] shadow-2xs space-y-3`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg text-white ${selected.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#17313A]">{selected.title}</h4>
                <p className="text-[10px] font-bold text-[#086A92]">{selected.badge}</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white text-[#17313A] border border-[#E4EAEC] shadow-2xs">
              Live Core
            </span>
          </div>

          <p className="text-xs text-[#4A5D65] leading-relaxed">
            {selected.description}
          </p>

          <div className="space-y-1.5 pt-1">
            <p className="text-[10.5px] font-bold text-[#17313A] uppercase tracking-wider">
              Included Capabilities:
            </p>
            <div className="grid grid-cols-1 gap-1">
              {selected.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#17313A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#35B84A] shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-black/5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7C83]">
              Status: <span className="font-bold text-[#35B84A]">100% Operational</span>
            </span>
            <Link
              href={selected.href}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#086A92] hover:text-[#008C91] bg-white px-2.5 py-1 rounded-md border border-[#E4EAEC] hover:border-[#086A92] transition-colors"
            >
              <span>Explore Module</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
