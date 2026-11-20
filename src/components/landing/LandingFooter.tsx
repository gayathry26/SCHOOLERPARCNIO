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
    <footer id="contact" className="bg-[#17313A] text-white pt-16 pb-10 border-t border-[#043A52]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10 text-xs">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <EdvoNestLogo variant="full" size="md" showTagline={true} className="brightness-125" />
            <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
              Edvonest Model International Academy is an autonomous K-12 educational institution committed to academic rigor, character mentorship, and technological innovation.
            </p>

            <div className="space-y-2 text-slate-300 text-[11.5px] pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#35B84A] shrink-0 mt-0.5" />
                <span>Plot 12, Institutional Area, Sector 62, Noida, UP 201309</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#35B84A] shrink-0" />
                <span>+91 11 4982 3000 • Admissions Helpline</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#35B84A] shrink-0" />
                <span>contact@edvonest-academy.edu.in</span>
              </div>
            </div>
          </div>

          {/* Quick Portals */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-[11px] uppercase tracking-wider text-[#A2E2F8]">
              Authorized Portals
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link href="/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Principal &amp; Admin</span>
                  <span className="text-[10px] text-slate-400">&rarr;</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Teacher Cockpit</span>
                  <span className="text-[10px] text-slate-400">&rarr;</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Parent Portal</span>
                  <span className="text-[10px] text-slate-400">&rarr;</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Student Learning Hub</span>
                  <span className="text-[10px] text-slate-400">&rarr;</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Fee &amp; Accounts Counter</span>
                  <span className="text-[10px] text-slate-400">&rarr;</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Modules */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-[11px] uppercase tracking-wider text-[#A2E2F8]">
              Operating Modules
            </h4>
            <ul className="space-y-2 text-slate-300">
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
          <div className="space-y-3">
            <h4 className="font-bold text-white text-[11px] uppercase tracking-wider text-[#A2E2F8]">
              Compliance &amp; Safety
            </h4>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-[#35B84A] font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>CBSE Board Affiliated</span>
              </div>
              <p className="text-slate-400 text-[10.5px]">
                Affiliation #89410. Regulatory marks recording, CBSE pass certificate issuance, and compliance audit trail.
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-[#086A92] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                <span className="text-cyan-300">Enterprise Security</span>
              </div>
              <p className="text-slate-400 text-[10.5px]">
                AES-256 cloud encryption, offline-first sync, and multi-tenant data isolation.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <div className="flex items-center gap-4">
            <span>&copy; 2026 EdvoNest School ERP System. All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-4 font-semibold">
            <span className="text-[#35B84A] tracking-wider uppercase">
              LEARN • GROW • SUCCEED
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
