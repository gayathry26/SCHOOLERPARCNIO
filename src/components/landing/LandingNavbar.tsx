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
      <div className="bg-[#990000] text-white text-xs sm:text-sm py-2 px-4 border-b border-[#800000] relative z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-5 text-xs sm:text-sm">
            <span className="flex items-center gap-2 font-medium">
              <Phone className="w-3.5 h-3.5 text-white" /> +91 11 4982 3000
            </span>
            <span className="hidden md:flex items-center gap-2 font-medium">
              <Mail className="w-3.5 h-3.5 text-white" /> admissions@edvonest-academy.edu.in
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="bg-white/15 px-2.5 py-0.5 rounded-md text-white font-bold border border-white/20">
              CBSE Affiliation #89410
            </span>
            <Link
              href="/login"
              className="bg-white text-[#990000] hover:bg-slate-100 font-bold px-3 py-1 rounded-md text-xs sm:text-sm transition-colors shadow-2xs"
            >
              Staff &amp; Parent Portal &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] shadow-xs'
            : 'bg-white border-b border-[#E5E5E5]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center">
            <EdvoNestLogo variant="full" size="md" showTagline={true} />
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-8 text-sm sm:text-base font-bold text-[#171717]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#990000] transition-colors py-1 relative group"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#990000] transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <a href="#admissions">
              <Button
                variant="outline"
                size="md"
                className="text-sm font-semibold bg-white text-[#171717] border-[#E5E5E5] hover:bg-[#F5F5F5]"
              >
                Enquire Now
              </Button>
            </a>
            <Link href="/login">
              <Button
                variant="primary"
                size="md"
                className="text-sm font-bold bg-[#990000] hover:bg-[#800000] text-white shadow-sm cursor-pointer"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                ERP Login
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#171717] hover:bg-[#F5F5F5] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#E5E5E5] px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-2 text-base font-bold text-[#171717]">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#990000] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-[#E5E5E5] flex flex-col gap-2">
              <a href="#admissions" className="w-full">
                <Button variant="outline" size="md" className="w-full justify-center bg-white text-[#171717] border-[#E5E5E5]">
                  Enquire Now
                </Button>
              </a>
              <Link href="/login" className="w-full">
                <Button variant="primary" size="md" className="w-full justify-center bg-[#990000] text-white">
                  ERP Login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
