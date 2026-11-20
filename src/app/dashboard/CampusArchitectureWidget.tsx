'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BrainCircuit,
  ShieldCheck,
  Building2,
  Users2,
  DollarSign,
  Bus,
  HeartPulse,
  Award,
  Sparkles,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Compass,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface EcosystemNode {
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  accentBg: string;
  borderColor: string;
  metric: string;
  status: string;
  link: string;
  description: string;
}

const NODES: EcosystemNode[] = [
  {
    title: 'Academic Intelligence',
    category: 'Module A • Academics',
    icon: BrainCircuit,
    color: '#086A92',
    accentBg: 'bg-[#EAF5F8]',
    borderColor: 'border-[#c0e3ed]',
    metric: '94.2% Class Average',
    status: 'Radar & Risks Active',
    link: '/dashboard/academic-intelligence',
    description: 'Subject-wise performance tracking, weak student alerts, and exam trend analytics.',
  },
  {
    title: 'AI Learning Assistant',
    category: 'Module B • AI Tutoring',
    icon: Sparkles,
    color: '#35B84A',
    accentBg: 'bg-[#EAF8EC]',
    borderColor: 'border-[#bbf0c5]',
    metric: '18 Chapters Generated',
    status: 'CBSE Adaptive Ready',
    link: '/dashboard/ai-learning',
    description: 'Personalized practice questions, revision plans, and automated doubt solving.',
  },
  {
    title: 'Smart Campus Safety',
    category: 'Module E • Security',
    icon: ShieldCheck,
    color: '#008C91',
    accentBg: 'bg-[#E0F5F5]',
    borderColor: 'border-[#b6e8ea]',
    metric: '98.4% QR Scanned',
    status: 'Gate Passes Active',
    link: '/dashboard/campus-safety',
    description: 'QR student entry/exit tracking, visitor security approval, and parent pickup alerts.',
  },
  {
    title: 'Live Transport GPS',
    category: 'Module F • Fleet',
    icon: Bus,
    color: '#D97706',
    accentBg: 'bg-[#FEF3C7]',
    borderColor: 'border-[#FDE68A]',
    metric: '12 / 12 Buses Live',
    status: 'Zero Deviations',
    link: '/dashboard/transport',
    description: 'Real-time vehicle GPS tracking, route deviation alerts, and parent arrival notifications.',
  },
  {
    title: 'Health & Clinic Logs',
    category: 'Module G • Medical',
    icon: HeartPulse,
    color: '#E11D48',
    accentBg: 'bg-[#FFE4E6]',
    borderColor: 'border-[#FECDD3]',
    metric: '14 Checkups Logged',
    status: 'Clinic Ready',
    link: '/dashboard/health',
    description: 'Confidential student medical profiles, emergency allergy alerts, and nurse visits.',
  },
  {
    title: 'Admissions CRM',
    category: 'Module H • Growth',
    icon: TrendingUp,
    color: '#7E22CE',
    accentBg: 'bg-[#F3E8FF]',
    borderColor: 'border-[#E9D5FF]',
    metric: '32 Active Leads',
    status: 'Pipeline Active',
    link: '/dashboard/admissions',
    description: 'Online application funnel, document verification, interview scheduling & enrollment.',
  },
  {
    title: 'Parent Engagement',
    category: 'Module J • Community',
    icon: Users2,
    color: '#086A92',
    accentBg: 'bg-[#EAF5F8]',
    borderColor: 'border-[#c0e3ed]',
    metric: '92% Parent Activity',
    status: 'Live Feed Connected',
    link: '/dashboard/parent-portal',
    description: 'Homework tracking, fee payment receipts, attendance alerts, and direct teacher messaging.',
  },
  {
    title: 'Multi-Campus Hub',
    category: 'Module P • Governance',
    icon: Building2,
    color: '#008C91',
    accentBg: 'bg-[#E0F5F5]',
    borderColor: 'border-[#b6e8ea]',
    metric: '2 Branches Linked',
    status: 'Synchronized',
    link: '/dashboard/multi-campus',
    description: 'Central management dashboard, branch-level academic benchmarks, and tenant isolation.',
  },
];

export const CampusArchitectureWidget: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'academics' | 'safety' | 'admin'>('all');

  const filteredNodes = NODES.filter((n) => {
    if (filter === 'academics') return n.category.includes('Academics') || n.category.includes('AI');
    if (filter === 'safety') return n.category.includes('Security') || n.category.includes('Fleet') || n.category.includes('Medical');
    if (filter === 'admin') return n.category.includes('Growth') || n.category.includes('Community') || n.category.includes('Governance');
    return true;
  });

  return (
    <div className="bg-white border border-[#E4EAEC] rounded-2xl p-5 shadow-2xs space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4EAEC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#35B84A] animate-pulse" />
            <h3 className="text-sm font-black text-[#17313A] uppercase tracking-wider">
              EdvoNest Smart Operating Ecosystem
            </h3>
            <span className="text-[10px] bg-[#EAF8EC] text-[#16A34A] font-bold px-2 py-0.5 rounded-full border border-[#bbf0c5]">
              16 Modules Active
            </span>
          </div>
          <p className="text-xs text-[#6B7C83] mt-0.5">
            Instant bird&apos;s-eye access to your connected campus modules and operational health.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#F7FAFA] p-1 rounded-xl border border-[#E4EAEC]">
          {(['all', 'academics', 'safety', 'admin'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${
                filter === cat
                  ? 'bg-white shadow-2xs text-[#086A92] border border-[#c0e3ed]'
                  : 'text-[#6B7C83] hover:text-[#17313A]'
              }`}
            >
              {cat === 'all' ? 'All Hubs' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Interactive Hub Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredNodes.map((node) => {
          const Icon = node.icon;
          return (
            <Link
              key={node.title}
              href={node.link}
              className={`p-3.5 rounded-xl border bg-white hover:bg-[#F7FAFA] transition-all duration-200 group flex flex-col justify-between hover:shadow-xs hover:-translate-y-0.5 ${node.borderColor}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${node.accentBg}`}
                    style={{ color: node.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-bold text-[#6B7C83] bg-[#F7FAFA] px-1.5 py-0.5 rounded border border-[#E4EAEC]">
                    {node.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#17313A] group-hover:text-[#086A92] transition-colors leading-tight">
                    {node.title}
                  </h4>
                  <p className="text-[10px] text-[#6B7C83] mt-0.5 line-clamp-2 leading-relaxed">
                    {node.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#F1F5F7] flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#17313A]" style={{ color: node.color }}>
                  {node.metric}
                </span>
                <span className="text-[11px] font-bold text-[#086A92] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Open <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
