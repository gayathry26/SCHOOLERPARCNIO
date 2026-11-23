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
      color: 'text-[#086A92]',
      bg: 'bg-[#EAF5F8]',
    },
    {
      icon: Layers,
      metric: '16+ Core Modules',
      detail: 'Unified Operating System',
      description: 'Attendance, fees, exams, timetable, transport, library, and HR',
      color: 'text-[#16A34A]',
      bg: 'bg-[#EAF8EC]',
    },
    {
      icon: Users,
      metric: '1:20 Ratio',
      detail: 'Personalized Mentorship',
      description: 'Dedicated form tutors, parent transparent communication, and student portfolios',
      color: 'text-[#008C91]',
      bg: 'bg-[#E0F5F5]',
    },
    {
      icon: WifiOff,
      metric: 'Offline-First PWA',
      detail: 'Background Auto-Sync',
      description: 'Take attendance and record marks even during campus internet drops',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: ShieldCheck,
      metric: 'AES-256 Encrypted',
      detail: 'Data Sovereignty',
      description: 'Scheduled automated database backups and strict role-based access',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  return (
    <section className="bg-white border-y border-[#E4EAEC] py-14 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#086A92]">
            Verified School &amp; Technology Standards
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#17313A]">
            Built with Institutional Integrity &amp; Zero Compromises
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {trustMetrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#F7FAFA] border border-[#E4EAEC] rounded-2xl p-5 transition-all duration-200 hover:border-[#cbd7da] hover:shadow-2xs space-y-3"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17313A]">{item.metric}</h3>
                  <p className="text-xs sm:text-sm font-bold text-[#086A92] mt-0.5">{item.detail}</p>
                  <p className="text-xs sm:text-sm text-[#4A5D65] mt-1.5 leading-relaxed">
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
