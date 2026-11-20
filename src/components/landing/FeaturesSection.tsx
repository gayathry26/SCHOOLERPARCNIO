'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  CalendarCheck,
  CreditCard,
  FileCheck2,
  Bus,
  BookOpen,
  Library,
  Sparkles,
  Users,
  Shield,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: 'Student 360° Directory',
      category: 'Enrollment & Records',
      icon: GraduationCap,
      color: 'text-[#086A92]',
      bg: 'bg-[#EAF5F8]',
      description:
        'Complete centralized student dossiers: academic trajectories, verified admission documents, medical history, house tags, and gate verification QR codes.',
      points: ['CBSE Roll & Admission Tracking', 'Document Vault & TC Issuance', 'Parent Contact Linkage'],
      badge: 'Core ERP',
    },
    {
      title: 'Digital 1-Tap Attendance',
      category: 'Classroom Daily',
      icon: CalendarCheck,
      color: 'text-[#16A34A]',
      bg: 'bg-[#EAF8EC]',
      description:
        'Fast classroom register marking in under 60 seconds with "All Present" quick-toggle, instant parent SMS notifications, and offline queue auto-sync.',
      points: ['Offline-First Background Queue', 'Instant Parent Absence Alerts', 'Biometric Staff Integration'],
      badge: 'Teacher Favorite',
    },
    {
      title: 'Fee Ledger & Instant Receipts',
      category: 'Finance Counter',
      icon: CreditCard,
      color: 'text-[#008C91]',
      bg: 'bg-[#E0F5F5]',
      description:
        'Counter collection via cash, cheque, or UPI with idempotency protection. Generates print-ready formal receipts and automates late fee computations.',
      points: ['Printable Formal Receipts', 'Sibling & Merit Concessions', 'Automated SMS Reminders'],
      badge: 'Zero Defaulters',
    },
    {
      title: 'Examinations & Report Cards',
      category: 'Academic Assessment',
      icon: FileCheck2,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      description:
        'Schedule term exams, enter subject marks with automatic grade calculations, lock records securely, and generate regulatory CBSE report cards in seconds.',
      points: ['Keyboard-Fast Marks Drawer', 'Auto-Grade Calculation (A1-E)', '1-Click Parent Result Publishing'],
      badge: 'CBSE Compliant',
    },
    {
      title: 'Live School Bus GPS Tracking',
      category: 'Campus Safety',
      icon: Bus,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      description:
        'Real-time bus route tracking with driver credentials, stop manifest verification, live arrival ETAs, and geofence alerts directly on parents’ mobile phones.',
      points: ['Real-Time GPS En Route Tracking', 'Driver & Attendant Manifests', 'Parent Mobile ETA Notifications'],
      badge: 'Student Safety',
    },
    {
      title: 'AI Curriculum Study Assistant',
      category: 'Next-Gen Learning',
      icon: Sparkles,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      description:
        'Gemini-powered classroom study assistant grounded in CBSE syllabi: resolves complex STEM doubts, provides chapter summaries, and paces homework.',
      points: ['Curriculum-Grounded Doubts', 'Step-by-Step Problem Solving', 'Instant Student Guidance'],
      badge: 'AI Powered',
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-[#F7FAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold text-[#086A92] uppercase tracking-wider bg-[#EAF5F8] px-3 py-1 rounded-full border border-[#c0e3ed]">
            Integrated School Operations
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#17313A] tracking-tight">
            Designed for Real School Workflows
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7C83] leading-relaxed">
            Every feature in EdvoNest is built to eliminate bureaucratic friction and give administrators, teachers, and parents instant clarity.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-white border border-[#E4EAEC] rounded-2xl p-6 shadow-2xs hover:shadow-md hover:border-[#cbd7da] transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-xl ${f.bg} ${f.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-[#086A92] bg-[#EAF5F8] px-2 py-0.5 rounded-full border border-[#c0e3ed]">
                      {f.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10.5px] uppercase tracking-wider text-[#6B7C83] font-mono block">
                      {f.category}
                    </span>
                    <h3 className="text-base font-bold text-[#17313A] mt-0.5 group-hover:text-[#086A92] transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs text-[#6B7C83] leading-relaxed mt-2">
                      {f.description}
                    </p>
                  </div>

                  {/* Bullet Points */}
                  <ul className="space-y-1.5 pt-2 border-t border-[#E4EAEC]/60 text-xs">
                    {f.points.map((pt, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#35B84A] shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 mt-4 border-t border-[#E4EAEC]/60 flex items-center justify-between text-xs">
                  <span className="text-[#086A92] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Explore Workflow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Live in v2.4</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
