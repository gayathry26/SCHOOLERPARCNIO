'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const FinalCtaSection: React.FC = () => {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-[#0B2632] via-[#081820] to-[#040C10] text-white relative overflow-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#086A92]/25 to-[#35B84A]/20 rounded-full filter blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-15 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-bold text-[#75D7D1] shadow-2xs">
          <Sparkles className="w-4 h-4 text-[#35B84A] animate-pulse" />
          <span>Transforming Institutional Operations • Session 2026–2027</span>
        </div>

        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
          Your school&apos;s next chapter{' '}
          <span className="bg-gradient-to-r from-white via-[#75D7D1] to-[#35B84A] bg-clip-text text-transparent">
            starts here.
          </span>
        </h2>

        <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
          Empower your principals, educators, accountants, parents, and students with one intelligent, unified school operating system.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/login">
            <Button
              variant="primary"
              size="lg"
              className="text-base sm:text-lg font-bold px-9 py-4 shadow-2xl bg-gradient-to-r from-[#086A92] via-[#008C91] to-[#35B84A] hover:brightness-110 cursor-pointer border border-white/20"
              rightIcon={<ArrowRight className="w-5 h-5 ml-1" />}
            >
              Enter EdvoNest
            </Button>
          </Link>

          <a href="#admissions">
            <Button
              variant="outline"
              size="lg"
              className="text-base sm:text-lg font-bold px-8 py-4 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md cursor-pointer"
            >
              Apply for Admission
            </Button>
          </a>
        </div>

        {/* Guarantees */}
        <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-xs sm:text-sm text-slate-400 font-medium">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#35B84A]" />
            <span>Zero Server Maintenance</span>
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#35B84A]" />
            <span>CBSE &amp; ICSE Compliant</span>
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#35B84A]" />
            <span>Immediate Onboarding Support</span>
          </span>
        </div>
      </div>
    </section>
  );
};
