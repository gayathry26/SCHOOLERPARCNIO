'use client';

import React, { useState } from 'react';
import {
  BrainCircuit,
  ShieldCheck,
  DollarSign,
  Compass,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface PillarInfo {
  id: string;
  title: string;
  badge: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  iconBg: string;
  iconColor: string;
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
    badge: 'Modules A • B • C • D',
    color: '#086A92',
    borderColor: '#086A92',
    bgGradient: 'from-[#EAF5F8] via-white to-white',
    iconBg: 'bg-[#EAF5F8]',
    iconColor: 'text-[#086A92]',
    icon: BrainCircuit,
    description:
      'Predictive academic performance, CBSE/ICSE digital syllabus pacing, automated marks gradebook, and adaptive AI student doubts.',
    href: '/dashboard',
    metrics: '94.8% Syllabus On-Track',
    features: [
      'Subject Performance Radar',
      'Adaptive Question Bank',
      'Daily Lesson Plan Tracking',
      'AI Revision Assistant',
    ],
  },
  {
    id: 'safety',
    title: 'Campus Safety & Transport',
    badge: 'Modules E • F • G',
    color: '#008C91',
    borderColor: '#008C91',
    bgGradient: 'from-[#E0F5F5] via-white to-white',
    iconBg: 'bg-[#E0F5F5]',
    iconColor: 'text-[#008C91]',
    icon: ShieldCheck,
    description:
      'Instant encrypted student QR gate passes, live GPS school bus tracking with parent ETA notifications, and clinic health logs.',
    href: '/dashboard',
    metrics: '12/12 Buses En Route GPS',
    features: [
      'QR Student & Visitor Passes',
      'Live Route Deviation Alerts',
      'Student Clinic & Medical Logs',
      'Emergency Parent Broadcasts',
    ],
  },
  {
    id: 'admin',
    title: 'Administration & Finance',
    badge: 'Modules H • K • L',
    color: '#35B84A',
    borderColor: '#35B84A',
    bgGradient: 'from-[#EAF8EC] via-white to-white',
    iconBg: 'bg-[#EAF8EC]',
    iconColor: 'text-[#16A34A]',
    icon: DollarSign,
    description:
      'Online admissions CRM pipeline, multi-head counter fee collection with instant print receipts, and staff biometric attendance.',
    href: '/dashboard',
    metrics: '₹ 48.5L Q3 Fee Realized',
    features: [
      'Instant Printable Receipts',
      'Admission Enquiry Pipeline',
      'Staff Payroll & Biometric Log',
      'Asset Inventory & Labs',
    ],
  },
  {
    id: 'stakeholders',
    title: 'Community & Portals',
    badge: 'Modules I • J • M • N',
    color: '#D97706',
    borderColor: '#D97706',
    bgGradient: 'from-[#FEF3C7]/40 via-white to-white',
    iconBg: 'bg-[#FEF3C7]',
    iconColor: 'text-[#B45309]',
    icon: Compass,
    description:
      'Executive Principal Command Centre, mobile-first parent portal, teacher assignment cockpit, and multi-campus synchronization.',
    href: '/dashboard',
    metrics: '1,248 Active Profiles',
    features: [
      'Principal Command Cockpit',
      'Parent Ward Mobile View',
      'Teacher Assignment Portal',
      'Multi-Branch Institutional Data',
    ],
  },
];

export const SchoolArchitectureDiagram: React.FC<{ compact?: boolean }> = () => {
  const [activePillar, setActivePillar] = useState<string>('academics');
  const selected = PILLARS.find((p) => p.id === activePillar) || PILLARS[0];
  const ActiveIcon = selected.icon;

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#35B84A] animate-pulse" />
          <span className="text-xs font-bold text-[#086A92] uppercase tracking-wider bg-[#EAF5F8] px-3 py-1 rounded-full border border-[#c0e3ed]">
            Unified School OS Architecture
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-[#17313A] tracking-tight">
          Interconnected School Intelligence
        </h3>
        <p className="text-sm text-[#4A5D65] mt-1 leading-relaxed">
          Select an operational pillar below to explore real-time data flows across classrooms, administration, safety, and parents.
        </p>
      </div>

      {/* 4 Interactive Pillar Cards (2x2 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PILLARS.map((pillar) => {
          const PIcon = pillar.icon;
          const isSelected = activePillar === pillar.id;

          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => setActivePillar(pillar.id)}
              className={`text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#086A92] shadow-sm ring-2 ring-[#086A92]/15'
                  : 'bg-white/80 border-[#E4EAEC] hover:bg-white hover:border-[#086A92]/40 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className={`w-9 h-9 rounded-xl ${pillar.iconBg} ${pillar.iconColor} flex items-center justify-center shrink-0`}>
                  <PIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-semibold text-[#6B7C83] bg-[#F7FAFA] px-2 py-0.5 rounded-md border border-[#E4EAEC]">
                  {pillar.badge}
                </span>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#17313A]">
                  {pillar.title}
                </h4>
                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[#F1F5F7] text-xs">
                  <span className="font-semibold text-[#086A92]">{pillar.metrics}</span>
                  <span className="font-bold text-[#16A34A] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                    <span>Active</span>
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Deep-Dive Detail Showcase for Selected Pillar */}
      <div
        className={`rounded-2xl p-5 border border-[#E4EAEC] bg-gradient-to-br ${selected.bgGradient} shadow-2xs space-y-3.5`}
      >
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E4EAEC]/60">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${selected.iconBg} ${selected.iconColor}`}>
              <ActiveIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-[#17313A]">{selected.title}</h4>
              <p className="text-xs font-mono font-semibold text-[#086A92]">{selected.badge}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF8EC] text-[#16A34A] text-xs font-bold border border-[#bbf0c5]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span>100% Operational</span>
          </span>
        </div>

        <p className="text-sm text-[#4A5D65] leading-relaxed">
          {selected.description}
        </p>

        <div>
          <span className="text-xs font-bold text-[#17313A] uppercase tracking-wider block mb-2">
            Included Core Capabilities:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-800">
            {selected.features.map((feat, i) => (
              <div key={i} className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#35B84A] shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
