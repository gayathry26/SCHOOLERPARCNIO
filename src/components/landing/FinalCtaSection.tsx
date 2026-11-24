'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const FinalCtaSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-[#F5F5F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-r from-[#800000] via-[#990000] to-[#A30000] rounded-3xl p-10 sm:p-16 text-white text-center shadow-xl relative overflow-hidden space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs sm:text-sm font-bold text-red-100">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
            <span>Transforming Institutional Operations • Session 2026–2027</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Your school&apos;s next chapter starts here.
          </h2>

          <p className="text-base sm:text-lg text-red-100/90 leading-relaxed max-w-2xl mx-auto font-normal">
            Empower your principals, educators, accountants, parents, and students with one intelligent, unified school operating system.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button
                variant="primary"
                size="lg"
                className="text-base sm:text-lg font-bold px-8 py-3.5 bg-white text-[#990000] hover:bg-neutral-100 shadow-md cursor-pointer"
                rightIcon={<ArrowRight className="w-5 h-5 ml-1" />}
              >
                Enter EdvoNest ERP
              </Button>
            </Link>

            <a href="#admissions">
              <Button
                variant="outline"
                size="lg"
                className="text-base sm:text-lg font-bold px-8 py-3.5 bg-transparent text-white border-white/40 hover:bg-white/10 cursor-pointer"
              >
                Apply for Admission
              </Button>
            </a>
          </div>

          {/* Guarantees */}
          <div className="pt-8 border-t border-white/15 flex flex-wrap items-center justify-center gap-8 text-xs sm:text-sm text-red-100/80 font-medium">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Zero Server Maintenance</span>
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>CBSE &amp; ICSE Compliant</span>
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Immediate Onboarding Support</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
