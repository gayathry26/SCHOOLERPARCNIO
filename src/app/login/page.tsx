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
  ArrowLeft,
  Eye,
  EyeOff,
  BrainCircuit,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { EdvoNestLogo } from '@/components/ui/EdvoNestLogo';

interface DemoAccount {
  role: string;
  roleKey: string;
  email: string;
  pass: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'School Admin',
    roleKey: 'SCHOOL_ADMIN',
    email: 'admin@edvonest.com',
    pass: 'password123',
    icon: UserCheck,
    desc: 'System Configuration',
  },
  {
    role: 'Principal',
    roleKey: 'PRINCIPAL',
    email: 'principal@edvonest.com',
    pass: 'password123',
    icon: GraduationCap,
    desc: 'Executive Command',
  },
  {
    role: 'Teacher',
    roleKey: 'TEACHER',
    email: 'teacher.math@edvonest.com',
    pass: 'password123',
    icon: BookOpen,
    desc: 'Attendance & Marks',
  },
  {
    role: 'Accountant',
    roleKey: 'ACCOUNTANT',
    email: 'accountant@edvonest.com',
    pass: 'password123',
    icon: DollarSign,
    desc: 'Fees & Receipts',
  },
  {
    role: 'Parent',
    roleKey: 'PARENT',
    email: 'parent1@edvonest.com',
    pass: 'password123',
    icon: HeartHandshake,
    desc: 'Ward Progress & Portal',
  },
  {
    role: 'Student',
    roleKey: 'STUDENT',
    email: 'student1@edvonest.com',
    pass: 'password123',
    icon: User,
    desc: 'Academics & Timetable',
  },
];

const FEATURES = [
  {
    title: 'Academic Intelligence',
    desc: 'Curriculum pacing, automated CBSE gradebooks, and examination marks management.',
    icon: BrainCircuit,
  },
  {
    title: 'Campus Safety & Fleet',
    desc: 'Real-time GPS bus tracking, student gate passes, and arrival ETA alerts.',
    icon: ShieldCheck,
  },
  {
    title: 'Financial Operations',
    desc: 'Multi-mode counter fee collection, automated receipts, and reconciliation.',
    icon: DollarSign,
  },
  {
    title: 'Connected Community',
    desc: 'Transparent parent portal, multi-child switching, and direct PTM bookings.',
    icon: Users,
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('admin@edvonest.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
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
        setError('Server is reconnecting. Please wait a moment and try again.');
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
    <div className="min-h-screen bg-[#0B1B22] text-slate-100 flex flex-col justify-between selection:bg-[#00A6A6] selection:text-white">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center brightness-125 hover:opacity-90 transition-opacity">
          <EdvoNestLogo variant="full" size="md" showTagline={false} />
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/[0.08]">
            <span className="w-2 h-2 rounded-full bg-[#00A6A6]" />
            <span className="text-slate-400">Institutional OS:</span>
            <span className="text-slate-200 font-semibold">CBSE &amp; ICSE Certified (#89410)</span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-1.5 rounded-lg border border-white/[0.08]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Website</span>
          </Link>
        </div>
      </header>

      {/* Main Two-Column Container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 flex-1 flex items-center">
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-stretch gap-10 lg:gap-14 xl:gap-16">
          {/* Left Section: 55% Width Product Introduction */}
          <div className="w-full lg:w-[55%] flex flex-col justify-between py-2">
            <div>
              {/* Category Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-[#75D7D1] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A6A6]" />
                <span>Enterprise School Operating System</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-bold text-white tracking-tight leading-[1.18]">
                Architectural elegance for modern school operations.
              </h2>

              {/* Short Description */}
              <p className="text-sm sm:text-base text-slate-300/80 leading-relaxed max-w-xl mt-3 font-normal">
                One unified platform connecting classroom academics, morning attendance registers, bus GPS routes, and financial fee collections in real time.
              </p>

              {/* 2x2 Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8">
                {FEATURES.map((item) => {
                  const FIcon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] flex flex-col justify-between space-y-2.5 transition-colors hover:bg-white/[0.05]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#00A6A6]/10 text-[#00A6A6] flex items-center justify-center">
                        <FIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white tracking-normal">{item.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Institutional Assurance */}
            <div className="pt-8 mt-8 border-t border-white/[0.06] flex flex-wrap items-center gap-5 sm:gap-8 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A6A6] shrink-0" />
                <span>Zero IT Setup</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A6A6] shrink-0" />
                <span>100% Granular RBAC</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A6A6] shrink-0" />
                <span>AES-256 Encrypted Backups</span>
              </span>
            </div>
          </div>

          {/* Right Section: 45% Width Minimalist Login Panel */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center">
            <div className="bg-white text-slate-900 rounded-2xl shadow-2xl shadow-black/30 border border-slate-200/90 p-7 sm:p-9 transition-all">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-[1.65rem] font-bold text-slate-900 tracking-tight">
                  Sign In
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Enter your credentials or choose a 1-click demo role below.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{error}</p>
                      <p className="text-xs text-rose-600/90 mt-0.5">
                        Tip: Click any 1-Click Role below to test verified credentials instantly.
                      </p>
                    </div>
                  </div>
                )}

                {/* Email / Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email / Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-slate-50/70 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20 transition-all"
                      placeholder="admin@edvonest.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 bg-slate-50/70 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Need Help */}
                <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-slate-300 text-[#00A6A6] focus:ring-[#00A6A6] focus:ring-offset-0 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@edvonest.com');
                      setPassword('password123');
                    }}
                    className="text-xs font-semibold text-[#008C91] hover:text-[#00A6A6] hover:underline cursor-pointer"
                  >
                    Need help?
                  </button>
                </div>

                {/* Full-Width Sign In Button with Subtle Teal Gradient */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-[#008C91] to-[#00A6A6] hover:from-[#007D82] hover:to-[#009696] text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </span>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Roles Section */}
              <div className="pt-5 mt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Instant 1-Click Demo Roles
                  </span>
                  <span className="text-[11px] text-[#008C91] font-medium">
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
                        className={`text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-teal-50/70 border-[#00A6A6] text-slate-900 shadow-2xs ring-1 ring-[#00A6A6]/20'
                            : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#00A6A6]/15 text-[#008C91]' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900 truncate text-xs">{acc.role}</div>
                          <div className="text-[11px] text-slate-500 truncate leading-tight">{acc.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security Footer Note */}
              <div className="pt-4 mt-3 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>AES-256 Cloud Encryption • CBSE Regulatory Standards • v2.4</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/[0.06]">
        <span>&copy; {new Date().getFullYear()} EdvoNest Model International Academy. All rights reserved.</span>
        <span>Secure Institutional Portal • CBSE Affiliation #89410</span>
      </footer>
    </div>
  );
}
