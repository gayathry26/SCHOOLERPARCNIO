'use client';

import React from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Award,
  ArrowRight,
} from 'lucide-react';
import { EdvoNestLogo } from '@/components/ui/EdvoNestLogo';

export const LandingFooter: React.FC = () => {
  return (
    <footer id="contact" className="bg-[#171717] text-white pt-16 pb-12 border-t border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#262626] text-sm">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <EdvoNestLogo variant="full" size="md" showTagline={true} />
            <p className="text-[#A3A3A3] text-sm sm:text-base leading-relaxed max-w-sm">
              Edvonest Model International Academy is an autonomous K-12 educational institution committed to academic rigor, character mentorship, and technological innovation.
            </p>

            <div className="space-y-2.5 text-[#A3A3A3] text-xs sm:text-sm pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 sm:w-5 h-5 text-[#990000] shrink-0 mt-0.5" />
                <span>Plot 12, Institutional Area, Sector 62, Noida, UP 201309</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 sm:w-5 h-5 text-[#990000] shrink-0" />
                <span>+91 11 4982 3000 • Admissions Helpline</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 sm:w-5 h-5 text-[#990000] shrink-0" />
                <span>contact@edvonest-academy.edu.in</span>
              </div>
            </div>
          </div>

          {/* Quick Portals */}
          <div className="space-y-3.5">
            <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-white">
              Authorized Portals
            </h4>
            <ul className="space-y-2.5 text-[#A3A3A3] text-xs sm:text-sm">
              <li>
                <Link href="/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Principal &amp; Admin</span>
                  <span className="text-xs text-[#737373]">&rarr;</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Teacher Cockpit</span>
                  <span className="text-xs text-[#737373]">&rarr;</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Parent Portal</span>
                  <span className="text-xs text-[#737373]">&rarr;</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Transport &amp; Campus Safety</span>
                  <span className="text-xs text-[#737373]">&rarr;</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Fee &amp; Accounts Counter</span>
                  <span className="text-xs text-[#737373]">&rarr;</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Modules */}
          <div className="space-y-3.5">
            <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-white">
              Operating Modules
            </h4>
            <ul className="space-y-2.5 text-[#A3A3A3] text-xs sm:text-sm">
              <li>Student 360° Directory</li>
              <li>1-Tap Daily Attendance</li>
              <li>Fee Ledger &amp; Counter Payments</li>
              <li>CBSE Examinations &amp; Gradebooks</li>
              <li>Live School Bus GPS Tracking</li>
              <li>Weekly Lesson Pacing &amp; Syllabus</li>
              <li>Staff HR &amp; Biometric Clock</li>
            </ul>
          </div>

          {/* Institutional Compliance */}
          <div className="space-y-3.5">
            <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-white">
              Compliance &amp; Safety
            </h4>
            <div className="p-3.5 bg-[#262626]/50 rounded-xl border border-[#333333] space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-[#990000] font-bold">
                <Award className="w-4 h-4 shrink-0 text-[#990000]" />
                <span className="text-white">CBSE Board Affiliated</span>
              </div>
              <p className="text-[#A3A3A3] text-xs leading-relaxed">
                Affiliation #89410. Regulatory marks recording, CBSE pass certificate issuance, and compliance audit trail.
              </p>
            </div>

            <div className="p-3.5 bg-[#262626]/50 rounded-xl border border-[#333333] space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-[#990000] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#990000] shrink-0" />
                <span className="text-white">Enterprise Security</span>
              </div>
              <p className="text-[#A3A3A3] text-xs leading-relaxed">
                AES-256 cloud encryption, offline-first sync, and multi-tenant data isolation.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-[#737373] gap-4">
          <div className="flex items-center gap-4">
            <span>&copy; 2026 EdvoNest School ERP System. All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-4 font-semibold">
            <span className="text-[#990000] tracking-wider uppercase font-bold">
              LEARN • GROW • SUCCEED
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
