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
    { label: 'About School', href: '#about' },
    { label: 'ERP Features', href: '#features' },
    { label: 'Live Showcase', href: '#showcase' },
    { label: 'Admissions', href: '#admissions' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      {/* Top Notification Strip */}
      <div className="bg-[#086A92] text-white text-xs py-2 px-4 border-b border-[#065575] relative z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-[#35B84A]" /> +91 11 4982 3000
            </span>
            <span className="hidden md:flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-[#35B84A]" /> admissions@edvonest-academy.edu.in
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] sm:text-xs">
            <span className="bg-white/10 px-2 py-0.5 rounded text-[#EAF5F8] font-bold border border-white/20">
              CBSE Affiliation #89410
            </span>
            <Link
              href="/login"
              className="bg-[#35B84A] hover:bg-[#2da040] text-white font-bold px-2.5 py-0.5 rounded text-[11px] transition-colors shadow-2xs"
            >
              Staff &amp; Student Portal &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-[#E4EAEC] shadow-xs'
            : 'bg-white border-b border-[#E4EAEC]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center">
            <EdvoNestLogo variant="full" size="md" showTagline={true} />
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-[#6B7C83]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#086A92] transition-colors py-1 relative group"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#086A92] transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <a href="#admissions">
              <Button variant="outline" size="sm" className="text-xs">
                Enquire Now
              </Button>
            </a>
            <Link href="/login">
              <Button
                variant="primary"
                size="sm"
                className="text-xs font-bold"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                ERP Login
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#17313A] hover:bg-[#F7FAFA] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#E4EAEC] px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-2 text-sm font-semibold text-[#17313A]">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-[#EAF5F8] hover:text-[#086A92] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-[#E4EAEC] flex flex-col gap-2">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full font-bold">
                  ERP Portal Login &rarr;
                </Button>
              </Link>
              <a href="#admissions" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="md" className="w-full">
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
