'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { EdvoNestLogo } from '@/components/ui/EdvoNestLogo';
import { Button } from '@/components/ui/Button';

export const LandingNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Ecosystem', href: '#ecosystem' },
    { label: 'Workflows', href: '#features' },
    { label: 'Role Previews', href: '#showcase' },
    { label: 'Admissions', href: '#admissions' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      {/* Top Notification Strip */}
      <div className="bg-[#051117] text-slate-300 text-xs sm:text-sm py-2 px-4 border-b border-white/10 relative z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-5 text-xs sm:text-sm">
            <span className="flex items-center gap-2 font-medium">
              <Phone className="w-4 h-4 text-[#35B84A]" /> +91 11 4982 3000
            </span>
            <span className="hidden md:flex items-center gap-2 font-medium">
              <Mail className="w-4 h-4 text-[#35B84A]" /> admissions@edvonest-academy.edu.in
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="bg-white/10 px-2.5 py-1 rounded-md text-[#75D7D1] font-bold border border-white/15">
              CBSE Affiliation #89410
            </span>
            <Link
              href="/login"
              className="bg-[#35B84A] hover:bg-[#2da040] text-white font-bold px-3 py-1 rounded-md text-xs sm:text-sm transition-colors shadow-2xs"
            >
              Staff &amp; Student Portal &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Glass Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled
          ? 'bg-[#081820]/90 backdrop-blur-xl border-b border-white/15 shadow-xl'
          : 'bg-[#081820]/80 backdrop-blur-lg border-b border-white/10'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center brightness-125">
            <EdvoNestLogo variant="full" size="md" showTagline={true} />
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-8 text-sm sm:text-base font-semibold text-slate-300">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors py-1 relative group"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#75D7D1] transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <a href="#admissions">
              <Button
                variant="outline"
                size="md"
                className="text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Enquire Now
              </Button>
            </a>
            <Link href="/login">
              <Button
                variant="primary"
                size="md"
                className="text-sm font-bold bg-gradient-to-r from-[#086A92] to-[#008C91] hover:brightness-110 shadow-md border border-cyan-400/30"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                ERP Login
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#081820] border-b border-white/15 px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-2 text-base font-semibold text-slate-200">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full font-bold text-sm">
                  ERP Portal Login &rarr;
                </Button>
              </Link>
              <a href="#admissions" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="md" className="w-full text-sm bg-white/10 text-white border-white/20">
                  Online Admission Enquiry
                </Button>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
