'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCheck,
  GraduationCap,
  BookOpen,
  DollarSign,
  Users,
  User,
  HeartHandshake,
  Bus,
  HeartPulse,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
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
  badgeColor: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'School Admin',
    roleKey: 'SCHOOL_ADMIN',
    email: 'admin@edvonest.com',
    pass: 'password123',
    icon: UserCheck,
    desc: 'Full Operations & System Admin',
    badgeColor: 'bg-[#EAF5F8] text-[#086A92] border-[#c0e3ed]',
  },
  {
    role: 'Principal',
    roleKey: 'PRINCIPAL',
    email: 'principal@edvonest.com',
    pass: 'password123',
    icon: GraduationCap,
    desc: 'Executive Command & Academics',
    badgeColor: 'bg-[#EAF8EC] text-[#16A34A] border-[#bbf0c5]',
  },
  {
    role: 'Teacher (Math)',
    roleKey: 'TEACHER',
    email: 'teacher.math@edvonest.com',
    pass: 'password123',
    icon: BookOpen,
    desc: 'Lesson Plans, Marks & Attendance',
    badgeColor: 'bg-[#E0F5F5] text-[#008C91] border-[#b6e8ea]',
  },
  {
    role: 'Accountant',
    roleKey: 'ACCOUNTANT',
    email: 'accountant@edvonest.com',
    pass: 'password123',
    icon: DollarSign,
    desc: 'Fee Invoices & Vouchers',
    badgeColor: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
  },
  {
    role: 'Parent',
    roleKey: 'PARENT',
    email: 'parent1@edvonest.com',
    pass: 'password123',
    icon: HeartHandshake,
    desc: 'Child Progress, Fees & Bus ETA',
    badgeColor: 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]',
  },
  {
    role: 'Student',
    roleKey: 'STUDENT',
    email: 'student1@edvonest.com',
    pass: 'password123',
    icon: User,
    desc: 'Class 10-A, AI Tutoring & Tests',
    badgeColor: 'bg-[#EAF5F8] text-[#086A92] border-[#c0e3ed]',
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
    <div className="min-h-screen bg-[#F7FAFA] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background soft ambient glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#EAF5F8] rounded-full filter blur-3xl opacity-70 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#EAF8EC] rounded-full filter blur-3xl opacity-70 pointer-events-none" />

      <div className="relative max-w-6xl w-full mx-auto space-y-6">
        {/* Top Bar Branding */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-[#E4EAEC] shadow-2xs">
          <EdvoNestLogo variant="badge" size="sm" showTagline={true} />
          <div className="flex items-center gap-2 text-xs font-semibold text-[#17313A]">
            <span className="w-2 h-2 rounded-full bg-[#35B84A] animate-ping" />
            <span className="text-[#6B7C83]">Institutional Cloud OS:</span>
            <span className="bg-[#EAF5F8] text-[#086A92] px-2 py-0.5 rounded-md font-bold border border-[#c0e3ed]">
              CBSE &amp; ICSE Certified
            </span>
          </div>
        </div>

        {/* Main 2-Column Split: Visual Diagram on Left, Simple Login on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Visual Operating System Architecture Diagram */}
          <div className="lg:col-span-7 space-y-4">
            <SchoolArchitectureDiagram />

            {/* Quick Benefits Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-3 rounded-xl border border-[#E4EAEC] shadow-2xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#35B84A] shrink-0" />
                <span className="font-semibold text-[#17313A]">Zero IT Setup Needed</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#E4EAEC] shadow-2xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#086A92] shrink-0" />
                <span className="font-semibold text-[#17313A]">100% Granular RBAC</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#E4EAEC] shadow-2xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#008C91] shrink-0" />
                <span className="font-semibold text-[#17313A]">Live Instant Audit Logs</span>
              </div>
            </div>
          </div>

          {/* RIGHT: User-Friendly & Simple Sign In Card */}
          <div className="lg:col-span-5 bg-white border border-[#E4EAEC] rounded-2xl p-6 sm:p-7 shadow-md relative">
            <div className="mb-5 pb-3 border-b border-[#E4EAEC] flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#17313A]">Sign In to EdvoNest</h2>
                <p className="text-xs text-[#6B7C83] mt-0.5">Select a role below or enter credentials</p>
              </div>
              <span className="p-2 rounded-xl bg-[#EAF8EC] text-[#35B84A]">
                <ShieldCheck className="w-5 h-5" />
              </span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-xl text-[#DC2626] text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p>{error}</p>
                    <p className="text-[10px] text-[#DC2626]/80 mt-0.5 font-normal">
                      Hint: Click any 1-Click Role below to instantly fill valid credentials.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#17313A] mb-1.5">
                  Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B7C83] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E4EAEC] rounded-xl text-xs text-[#17313A] placeholder-[#6B7C83] focus:outline-none focus:border-[#086A92] focus:ring-1 focus:ring-[#086A92] font-medium"
                    placeholder="admin@edvonest.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17313A] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B7C83] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E4EAEC] rounded-xl text-xs text-[#17313A] placeholder-[#6B7C83] focus:outline-none focus:border-[#086A92] focus:ring-1 focus:ring-[#086A92] font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#6B7C83]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-[#E4EAEC] text-[#086A92] focus:ring-[#086A92]"
                  />
                  <span>Remember me</span>
                </label>
                <span className="text-[#086A92] font-semibold hover:underline cursor-pointer">
                  Need help?
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full py-2.5 text-xs font-bold shadow-sm"
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Sign In to Dashboard
              </Button>
            </form>

            {/* 1-Click Fast Role Sign-In */}
            <div className="mt-5 pt-4 border-t border-[#E4EAEC]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-black text-[#17313A] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#35B84A]" />
                  Instant 1-Click Role Logins
                </span>
                <span className="text-[10px] text-[#086A92] bg-[#EAF5F8] px-2 py-0.5 rounded-full font-bold">
                  Tap to sign in
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  const isSelected = email === acc.email;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => selectDemoAccount(acc, true)}
                      title={`Instant login as ${acc.role}`}
                      className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#EAF5F8] border-[#086A92] text-[#086A92] shadow-2xs'
                          : 'bg-[#F7FAFA] border-[#E4EAEC] text-[#17313A] hover:bg-white hover:border-[#086A92]/40 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1 rounded-md bg-white border border-[#E4EAEC] shadow-2xs shrink-0">
                          <Icon className="w-3.5 h-3.5 text-[#086A92]" />
                        </div>
                        <span className="text-xs font-bold truncate">{acc.role}</span>
                      </div>
                      <p className="text-[10px] text-[#6B7C83] truncate">{acc.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
