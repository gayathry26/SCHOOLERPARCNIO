'use client';

import React from 'react';
import {
  Award,
  ShieldCheck,
  Users,
  Layers,
  WifiOff,
  Server,
} from 'lucide-react';

export const TrustSection: React.FC = () => {
  const trustMetrics = [
    {
      icon: Award,
      metric: 'CBSE Affiliated',
      detail: 'Affiliation No. 89410',
      description: 'Senior Secondary K-12 curriculum with automated CBSE report cards',
      color: 'text-[#990000]',
      bg: 'bg-red-50',
    },
    {
      icon: Layers,
      metric: '16+ Core Modules',
      detail: 'Unified Operating System',
      description: 'Attendance, fees, exams, timetable, transport, library, and HR',
      color: 'text-[#990000]',
      bg: 'bg-red-50',
    },
    {
      icon: Users,
      metric: '1:20 Ratio',
      detail: 'Personalized Mentorship',
      description: 'Dedicated form tutors, parent transparent communication, and student portfolios',
      color: 'text-[#990000]',
      bg: 'bg-red-50',
    },
    {
      icon: WifiOff,
      metric: 'Offline-First PWA',
      detail: 'Background Auto-Sync',
      description: 'Take attendance and record marks even during campus internet drops',
      color: 'text-[#990000]',
      bg: 'bg-red-50',
    },
    {
      icon: ShieldCheck,
      metric: 'AES-256 Encrypted',
      detail: 'Data Sovereignty',
      description: 'Scheduled automated database backups and strict role-based access',
      color: 'text-[#990000]',
      bg: 'bg-red-50',
    },
  ];

  return (
    <section className="bg-white border-y border-[#E5E5E5] py-14 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#990000]">
            Verified School &amp; Technology Standards
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#171717]">
            Built with Institutional Integrity &amp; Zero Compromises
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {trustMetrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl p-5 transition-all duration-200 hover:border-red-200 hover:shadow-2xs space-y-3"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#171717]">{item.metric}</h3>
                  <p className="text-xs sm:text-sm font-bold text-[#990000] mt-0.5">{item.detail}</p>
                  <p className="text-xs sm:text-sm text-[#525252] mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
