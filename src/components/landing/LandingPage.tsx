'use client';

import React from 'react';
import { LandingNavbar } from './LandingNavbar';
import { CinematicHero } from './CinematicHero';
import { ProblemSection } from './ProblemSection';
import { EcosystemSection } from './EcosystemSection';
import { PlatformShowcase } from './PlatformShowcase';
import { FeaturesSection } from './FeaturesSection';
import { TrustSection } from './TrustSection';
import { AdmissionEnquiryCard } from './AdmissionEnquiryCard';
import { FinalCtaSection } from './FinalCtaSection';
import { LandingFooter } from './LandingFooter';
import { GraduationCap, ShieldCheck, Award } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7FAFA] text-[#17313A] flex flex-col font-sans selection:bg-[#086A92] selection:text-white">
      {/* 1. Translucent Sticky Glass Navbar */}
      <LandingNavbar />

      {/* 2. 100vh Cinematic Hero with Motion & 3D Layered SaaS Preview */}
      <CinematicHero />

      {/* 3. Section 1 — The Problem: "Schools deserve better than disconnected systems." */}
      <ProblemSection />

      {/* 4. Section 2 — The Ecosystem: "Everything connected. Nothing complicated." */}
      <EcosystemSection />

      {/* 5. Section 3 — Product Showcase: "One platform. Every perspective." */}
      <PlatformShowcase />

      {/* 6. Section 4 — Intelligent Operations Workflows */}
      <FeaturesSection />

      {/* 7. Section 5 — Institutional Trust, Security & Compliance */}
      <TrustSection />

      {/* 8. Campus Overview & Working Online Admission Enquiry */}
      <section id="about" className="py-20 lg:py-28 bg-white relative border-b border-[#E4EAEC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left side: Institutional Overview */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <span className="text-xs sm:text-sm font-bold text-[#086A92] uppercase tracking-wider bg-[#EAF5F8] px-3.5 py-1.5 rounded-full border border-[#c0e3ed] inline-block">
                  About Our Institution
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#17313A] tracking-tight leading-[1.12]">
                  Edvonest Model International Academy
                </h2>
                <p className="text-base sm:text-lg text-[#4A5D65] leading-relaxed">
                  Established with a vision to nurture intellectually curious, emotionally resilient, and socially responsible global leaders. Affiliated with the Central Board of Secondary Education (CBSE #89410), New Delhi.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-[#F7FAFA] border border-[#E4EAEC] rounded-2xl space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF5F8] text-[#086A92] flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h4 className="font-bold text-[#17313A] text-lg">Academic Distinction</h4>
                  <p className="text-[#4A5D65] text-sm sm:text-base leading-relaxed">
                    Holistic curriculum blending STEM innovation, languages, athletics, and cultural arts under certified senior faculty.
                  </p>
                </div>

                <div className="p-5 bg-[#F7FAFA] border border-[#E4EAEC] rounded-2xl space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF8EC] text-[#16A34A] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h4 className="font-bold text-[#17313A] text-lg">Safe Campus &amp; Fleet</h4>
                  <p className="text-[#4A5D65] text-sm sm:text-base leading-relaxed">
                    GPS-enabled transport fleet, automated gate passes, secure biometric access, and complete student care.
                  </p>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-r from-[#EAF5F8] to-[#F7FAFA] border border-[#c0e3ed] rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#086A92]" />
                  <span className="font-bold text-[#17313A] text-sm sm:text-base">Campus Infrastructure Highlights:</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-[#4A5D65] text-sm sm:text-base font-semibold">
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

      {/* 9. Section 6 — Final Cinematic Call to Action */}
      <FinalCtaSection />

      {/* 10. Deep Institutional Footer */}
      <LandingFooter />
    </div>
  );
};
