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
      color: 'text-[#990000]',
      bg: 'bg-red-50',
      description:
        'Complete centralized student dossiers: academic trajectories, verified admission documents, medical history, house tags, and gate verification QR codes.',
      points: ['CBSE Roll & Admission Tracking', 'Document Vault & TC Issuance', 'Parent Contact Linkage'],
      badge: 'Core ERP',
    },
    {
      title: 'Digital 1-Tap Attendance',
      category: 'Classroom Daily',
      icon: CalendarCheck,
      color: 'text-[#990000]',
      bg: 'bg-red-50',
      description:
        'Fast classroom register marking in under 60 seconds with "All Present" quick-toggle, instant parent SMS notifications, and offline queue auto-sync.',
      points: ['Offline-First Background Queue', 'Instant Parent Absence Alerts', 'Biometric Staff Integration'],
      badge: 'Teacher Favorite',
    },
    {
      title: 'Fee Ledger & Instant Receipts',
      category: 'Finance Counter',
      icon: CreditCard,
      color: 'text-[#990000]',
      bg: 'bg-red-50',
      description:
        'Counter collection via cash, cheque, or UPI with idempotency protection. Generates print-ready formal receipts and automates late fee computations.',
      points: ['Printable Formal Receipts', 'Sibling & Merit Concessions', 'Automated SMS Reminders'],
      badge: 'Zero Defaulters',
    },
    {
      title: 'Examinations & Report Cards',
      category: 'Academic Assessment',
      icon: FileCheck2,
      color: 'text-[#990000]',
      bg: 'bg-red-50',
      description:
        'Schedule term exams, enter subject marks with automatic grade calculations, lock records securely, and generate regulatory CBSE report cards in seconds.',
      points: ['Keyboard-Fast Marks Drawer', 'Auto-Grade Calculation (A1-E)', '1-Click Parent Result Publishing'],
      badge: 'CBSE Compliant',
    },
    {
      title: 'Live School Bus GPS Tracking',
      category: 'Campus Safety',
      icon: Bus,
      color: 'text-[#990000]',
      bg: 'bg-red-50',
      description:
        'Real-time bus route tracking with driver credentials, stop manifest verification, live arrival ETAs, and geofence alerts directly on parents’ mobile phones.',
      points: ['Real-Time GPS En Route Tracking', 'Driver & Attendant Manifests', 'Parent Mobile ETA Notifications'],
      badge: 'Student Safety',
    },
    {
      title: 'AI Curriculum Study Assistant',
      category: 'Next-Gen Learning',
      icon: Sparkles,
      color: 'text-[#990000]',
      bg: 'bg-red-50',
      description:
        'Curriculum study assistant grounded in CBSE syllabi: resolves complex STEM doubts, provides chapter summaries, and paces homework.',
      points: ['Curriculum-Grounded Doubts', 'Step-by-Step Problem Solving', 'Instant Student Guidance'],
      badge: 'AI Powered',
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs sm:text-sm font-bold text-[#990000] uppercase tracking-wider bg-red-50 px-3.5 py-1.5 rounded-full border border-red-200">
            Integrated School Operations
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#171717] tracking-tight">
            Designed for Real School Workflows
          </h2>
          <p className="text-base sm:text-lg text-[#525252] leading-relaxed">
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
                className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs hover:shadow-md hover:border-red-200 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl ${f.bg} ${f.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-[#990000] bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                      {f.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#525252] font-mono font-semibold block">
                      {f.category}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-[#171717] mt-1 group-hover:text-[#990000] transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#525252] leading-relaxed mt-2">
                      {f.description}
                    </p>
                  </div>

                  {/* Bullet Points */}
                  <ul className="space-y-2 pt-3 border-t border-[#E5E5E5] text-sm">
                    {f.points.map((pt, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-[#171717] font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#990000] shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 mt-4 border-t border-[#E5E5E5] flex items-center justify-between text-sm">
                  <span className="text-[#990000] font-bold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    <span>Explore Workflow</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                  <span className="text-xs text-[#525252] font-mono font-medium">Live in v2.4</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
