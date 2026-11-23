'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserCheck,
  GraduationCap,
  BookOpen,
  DollarSign,
  User,
  HeartHandshake,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EdvoNestLogo } from '@/components/ui/EdvoNestLogo';
import { SchoolArchitectureDiagram } from '@/components/ui/SchoolArchitectureDiagram';

interface DemoAccount {
  role: string;
  roleKey: string;
  email: string;
  pass: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  badgeBg: string;
  iconColor: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'School Admin',
    roleKey: 'SCHOOL_ADMIN',
    email: 'admin@edvonest.com',
    pass: 'password123',
    icon: UserCheck,
    desc: 'Full Operations & System Admin',
    badgeBg: 'bg-[#EAF5F8]',
    iconColor: 'text-[#086A92]',
  },
  {
    role: 'Principal',
    roleKey: 'PRINCIPAL',
    email: 'principal@edvonest.com',
    pass: 'password123',
    icon: GraduationCap,
    desc: 'Executive Command & Academics',
    badgeBg: 'bg-[#EAF8EC]',
    iconColor: 'text-[#16A34A]',
  },
  {
    role: 'Teacher (Math)',
    roleKey: 'TEACHER',
    email: 'teacher.math@edvonest.com',
    pass: 'password123',
    icon: BookOpen,
    desc: 'Lesson Plans, Marks & Attendance',
    badgeBg: 'bg-[#E0F5F5]',
    iconColor: 'text-[#008C91]',
  },
  {
    role: 'Accountant',
    roleKey: 'ACCOUNTANT',
    email: 'accountant@edvonest.com',
    pass: 'password123',
    icon: DollarSign,
    desc: 'Fee Invoices & Vouchers',
    badgeBg: 'bg-[#FEF3C7]',
    iconColor: 'text-[#B45309]',
  },
  {
    role: 'Parent',
    roleKey: 'PARENT',
    email: 'parent1@edvonest.com',
    pass: 'password123',
    icon: HeartHandshake,
    desc: 'Child Progress, Fees & Bus ETA',
    badgeBg: 'bg-[#F3E8FF]',
    iconColor: 'text-[#7E22CE]',
  },
  {
    role: 'Student',
    roleKey: 'STUDENT',
    email: 'student1@edvonest.com',
    pass: 'password123',
    icon: User,
    desc: 'Class 10-A, AI Tutoring & Tests',
    badgeBg: 'bg-[#EAF5F8]',
    iconColor: 'text-[#086A92]',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('admin@edvonest.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      let data: any = null;
      try {
        const text = await res.text();
        if (text && text.trim().length > 0) {
          data = JSON.parse(text);
        }
      } catch (parseErr) {
        console.warn('Response parsing warning:', parseErr);
      }

      if (!res.ok) {
        const errMsg = data?.error || `Unable to sign in (${res.status}). Please check credentials.`;
        throw new Error(errMsg);
      }

      // Successful login
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('network')) {
        setError('Server is reconnecting. Please wait 2 seconds and click Sign In again.');
      } else {
        setError(err.message || 'Login failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const selectDemoAccount = (acc: DemoAccount, autoSubmit = false) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError(null);
    if (autoSubmit) {
      performLogin(acc.email, acc.pass);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF5F8]/40 via-[#F7FAFA] to-[#EAF8EC]/30 flex flex-col justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full mx-auto space-y-5">
        {/* Sleek Top Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-[#E4EAEC] shadow-2xs">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <EdvoNestLogo variant="full" size="md" showTagline={true} />
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-[#17313A] bg-[#F7FAFA] px-3.5 py-1.5 rounded-full border border-[#E4EAEC]">
              <span className="w-2 h-2 rounded-full bg-[#35B84A] animate-pulse" />
              <span className="text-[#6B7C83]">Institutional Cloud OS:</span>
              <span className="text-[#086A92] font-bold">CBSE &amp; ICSE Certified (#89410)</span>
            </div>

            <Link href="/">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm font-semibold gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Main 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT: Operating System Architecture Showcase */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E4EAEC] p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            <SchoolArchitectureDiagram />

            {/* Quick Benefits Trust Band */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E4EAEC]">
              <div className="bg-[#F7FAFA] p-3 rounded-xl border border-[#E4EAEC] flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#35B84A] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-[#17313A]">Zero IT Setup Needed</span>
              </div>
              <div className="bg-[#F7FAFA] p-3 rounded-xl border border-[#E4EAEC] flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#086A92] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-[#17313A]">100% Granular RBAC</span>
              </div>
              <div className="bg-[#F7FAFA] p-3 rounded-xl border border-[#E4EAEC] flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#008C91] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-[#17313A]">Live Instant Audit Logs</span>
              </div>
            </div>
          </div>

          {/* RIGHT: High-Converting, Clean Sign In Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E4EAEC] p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              {/* Header */}
              <div className="mb-5 pb-4 border-b border-[#E4EAEC] flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#17313A]">
                    Sign In to EdvoNest
                  </h2>
                  <p className="text-sm text-[#4A5D65] mt-0.5">
                    Select a role below or enter credentials
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#EAF8EC] text-[#35B84A] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p>{error}</p>
                      <p className="text-xs text-rose-600/90 mt-0.5 font-normal">
                        Tip: Click any 1-Click Role below to instantly load and test verified credentials.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-[#17313A] mb-1.5">
                    Email / Username
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-[#6B7C83] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[#F7FAFA] border border-[#E4EAEC] rounded-xl text-sm sm:text-base text-[#17313A] placeholder-[#6B7C83] focus:bg-white focus:outline-none focus:border-[#086A92] focus:ring-2 focus:ring-[#086A92]/20 font-medium transition-all"
                      placeholder="admin@edvonest.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#17313A] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-[#6B7C83] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[#F7FAFA] border border-[#E4EAEC] rounded-xl text-sm sm:text-base text-[#17313A] placeholder-[#6B7C83] focus:bg-white focus:outline-none focus:border-[#086A92] focus:ring-2 focus:ring-[#086A92]/20 font-medium transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-[#4A5D65] pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-[#E4EAEC] text-[#086A92] focus:ring-[#086A92]"
                    />
                    <span className="font-medium">Remember me</span>
                  </label>
                  <span className="text-[#086A92] font-semibold hover:underline cursor-pointer">
                    Need help?
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  className="w-full py-3.5 text-base font-bold shadow-md cursor-pointer"
                  rightIcon={<ArrowRight className="w-5 h-5 ml-1" />}
                >
                  Sign In to Dashboard
                </Button>
              </form>
            </div>

            {/* 1-Click Fast Role Sign-In */}
            <div className="pt-4 border-t border-[#E4EAEC]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-bold text-[#17313A] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#35B84A]" />
                  <span>Instant 1-Click Role Logins</span>
                </span>
                <span className="text-xs text-[#086A92] bg-[#EAF5F8] px-2.5 py-1 rounded-full font-bold border border-[#c0e3ed]">
                  Tap to sign in
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  const isSelected = email === acc.email;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => selectDemoAccount(acc, true)}
                      title={`Instant login as ${acc.role}`}
                      className={`text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#EAF5F8] border-[#086A92] text-[#086A92] shadow-2xs ring-1 ring-[#086A92]'
                          : 'bg-[#F7FAFA] border-[#E4EAEC] text-[#17313A] hover:bg-white hover:border-[#086A92]/40 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`p-1.5 rounded-lg ${acc.badgeBg} ${acc.iconColor} shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold truncate">{acc.role}</span>
                      </div>
                      <p className="text-xs text-[#6B7C83] leading-snug line-clamp-1">{acc.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer security note */}
            <div className="pt-2 text-center text-xs text-[#6B7C83] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>AES-256 cloud encryption • CBSE regulatory standards • v2.4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
