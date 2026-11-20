'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck,
  Award,
  BookOpen,
  Users,
  Building,
  GraduationCap,
  Bus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LandingNavbar } from './LandingNavbar';
import { HeroDashboardMockup } from './HeroDashboardMockup';
import { TrustSection } from './TrustSection';
import { FeaturesSection } from './FeaturesSection';
import { PlatformShowcase } from './PlatformShowcase';
import { AdmissionEnquiryCard } from './AdmissionEnquiryCard';
import { LandingFooter } from './LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7FAFA] text-[#17313A] flex flex-col font-sans selection:bg-[#086A92] selection:text-white">
      {/* Sticky Responsive Navigation Bar */}
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
        {/* Soft background ambient gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#EAF5F8] rounded-full filter blur-3xl opacity-70 pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#EAF8EC] rounded-full filter blur-3xl opacity-70 pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EAF8EC] border border-[#bbf0c5] rounded-full text-xs font-bold text-[#16A34A] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#35B84A]" />
                <span>Admissions Open for Session 2026–27 • CBSE #89410</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black text-[#17313A] tracking-tight leading-[1.12]">
                One simple, unified platform for modern schools.
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base text-[#6B7C83] leading-relaxed max-w-xl">
                EdvoNest connects school administration, teachers, accountants, parents, and students with effortless 1-tap attendance, instant online fee collections, gradebook marks entry, and complete institutional oversight.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href="/login">
                  <Button
                    variant="primary"
                    size="lg"
                    className="text-sm font-bold shadow-md cursor-pointer"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Access EdvoNest ERP
                  </Button>
                </Link>
                <a href="#admissions">
                  <Button variant="outline" size="lg" className="text-sm font-bold bg-white">
                    Apply for Admission
                  </Button>
                </a>
              </div>

              {/* Trust Indicators / Badges */}
              <div className="pt-6 border-t border-[#E4EAEC] grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-black text-[#086A92]">100%</p>
                  <p className="text-[11px] sm:text-xs text-[#6B7C83] font-medium mt-0.5">
                    CBSE Pass Rate
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#008C91]">1:20</p>
                  <p className="text-[11px] sm:text-xs text-[#6B7C83] font-medium mt-0.5">
                    Faculty Ratio
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#35B84A]">16+ Modules</p>
                  <p className="text-[11px] sm:text-xs text-[#6B7C83] font-medium mt-0.5">
                    Unified ERP Suite
                  </p>
                </div>
              </div>

              {/* System capabilities checklist */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium pt-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#35B84A]" />
                  <span>Offline-First PWA</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#35B84A]" />
                  <span>AES-256 Encrypted Backups</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#35B84A]" />
                  <span>Role-Based Access</span>
                </span>
              </div>
            </div>

            {/* Right Column: High-Fidelity Interactive SaaS Mockup */}
            <div className="lg:col-span-6 w-full">
              <HeroDashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Credibility Section */}
      <TrustSection />

      {/* Features Showcase Section */}
      <FeaturesSection />

      {/* Role-Aware Platform Showcase */}
      <PlatformShowcase />

      {/* About School & Online Admissions Section */}
      <section id="about" className="py-16 md:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left side: Institutional Overview */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#086A92] uppercase tracking-wider bg-[#EAF5F8] px-3 py-1 rounded-full border border-[#c0e3ed]">
                  About Our Institution
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-[#17313A] tracking-tight">
                  Edvonest Model International Academy
                </h2>
                <p className="text-xs sm:text-sm text-[#6B7C83] leading-relaxed">
                  Established with a vision to nurture intellectually curious, emotionally resilient, and socially responsible global leaders. Affiliated with the Central Board of Secondary Education (CBSE #89410), New Delhi.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#F7FAFA] border border-[#E4EAEC] rounded-2xl space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF5F8] text-[#086A92] flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-[#17313A] text-sm">Academic Distinction</h4>
                  <p className="text-[#6B7C83] text-[11px] leading-relaxed">
                    Holistic curriculum blending STEM innovation, languages, athletics, and cultural arts under certified senior faculty.
                  </p>
                </div>

                <div className="p-4 bg-[#F7FAFA] border border-[#E4EAEC] rounded-2xl space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF8EC] text-[#16A34A] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-[#17313A] text-sm">Safe Campus &amp; Fleet</h4>
                  <p className="text-[#6B7C83] text-[11px] leading-relaxed">
                    GPS-enabled transport fleet, automated gate passes, secure biometric access, and complete student care.
                  </p>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-r from-[#EAF5F8] to-[#F7FAFA] border border-[#c0e3ed] rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#086A92]" />
                  <span className="font-bold text-[#17313A]">Campus Infrastructure Highlights:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#6B7C83] text-[11px] font-medium">
                  <span>• Advanced Physics &amp; Chemistry Labs</span>
                  <span>• AI &amp; Robotics STEM Center</span>
                  <span>• Modern Indoor Sports Complex</span>
                  <span>• Digital Library &amp; ISBN Vault</span>
                </div>
              </div>
            </div>

            {/* Right side: Admission Enquiry Card (Working Form) */}
            <div className="lg:col-span-6">
              <AdmissionEnquiryCard />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};
