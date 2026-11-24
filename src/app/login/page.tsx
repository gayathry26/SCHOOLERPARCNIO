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
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  FileCheck2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { EdvoNestLogo } from '@/components/ui/EdvoNestLogo';

interface DemoAccount {
  role: string;
  roleKey: string;
  email: string;
  pass: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'Admin',
    roleKey: 'SCHOOL_ADMIN',
    email: 'admin@edvonest.com',
    pass: 'password123',
    icon: UserCheck,
  },
  {
    role: 'Principal',
    roleKey: 'PRINCIPAL',
    email: 'principal@edvonest.com',
    pass: 'password123',
    icon: GraduationCap,
  },
  {
    role: 'Teacher',
    roleKey: 'TEACHER',
    email: 'teacher.math@edvonest.com',
    pass: 'password123',
    icon: BookOpen,
  },
  {
    role: 'Accountant',
    roleKey: 'ACCOUNTANT',
    email: 'accountant@edvonest.com',
    pass: 'password123',
    icon: DollarSign,
  },
  {
    role: 'Parent',
    roleKey: 'PARENT',
    email: 'parent1@edvonest.com',
    pass: 'password123',
    icon: HeartHandshake,
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('admin@edvonest.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Admin');
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
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword(acc.pass);
    setError(null);
    if (autoSubmit) {
      performLogin(acc.email, acc.pass);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#0A0A0A] font-sans selection:bg-[#990000] selection:text-white">
      {/* =========================================================================
          LEFT SIDE: Solid Dark / Pitch Black Presentation (Matches CampusCorpo Reference)
          ========================================================================= */}
      <div className="bg-[#0A0A0A] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-[#262626] relative overflow-hidden">
        {/* Top: Logo & Institution Meta */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm shrink-0">
            <EdvoNestLogo variant="icon-only" size="sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-tight">EdvoNest</span>
              <span className="bg-[#262626] text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-[#333333]">
                HUB
              </span>
            </div>
            <p className="text-xs text-[#A3A3A3] mt-0.5 font-normal">
              Next-Gen School Operating System • CBSE #89410
            </p>
          </div>
        </div>

        {/* Center: Core Value Proposition & Minimal Cards */}
        <div className="my-12 lg:my-0 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171717] border border-[#262626] text-xs font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-[#990000]" />
            <span>Unified Campus &amp; Academic Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.14]">
            Empowering Connected School Operations
          </h1>

          <p className="text-sm sm:text-base text-[#A3A3A3] leading-relaxed font-normal">
            Unified operating system for school management, educators, accountants, and parents connecting academics, classroom registers, fees, and safety pipelines.
          </p>

          {/* 2 Minimal Cards on Solid Dark Background */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] flex items-center gap-3 text-white">
              <Layers className="w-5 h-5 text-[#990000] shrink-0" />
              <span className="text-sm font-semibold tracking-tight">16+ Core ERP Modules</span>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] flex items-center gap-3 text-white">
              <FileCheck2 className="w-5 h-5 text-[#990000] shrink-0" />
              <span className="text-sm font-semibold tracking-tight">CBSE Examination &amp; Gradebooks</span>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Links */}
        <div className="flex items-center justify-between text-xs text-[#737373] pt-6 border-t border-[#262626]">
          <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5 font-medium">
            <span>&larr; Public Website</span>
          </Link>
          <span className="hidden sm:inline font-mono">
            CBSE Affiliation #89410
          </span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE: Pure White Minimalist Login Form (50% Split)
          ========================================================================= */}
      <div className="bg-white text-[#171717] min-h-full flex flex-col justify-center px-8 sm:px-14 lg:px-16 xl:px-24 py-12">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Top Link */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#525252] hover:text-[#990000] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to EdvoNest Website</span>
            </Link>
          </div>

          {/* Role Experience Switcher */}
          <div>
            <label className="block text-[11px] font-bold text-[#525252] uppercase tracking-wider mb-2">
              PORTAL EXPERIENCE
            </label>

            <div className="bg-[#F5F5F5] p-1 rounded-xl grid grid-cols-3 sm:grid-cols-5 gap-1 border border-[#E5E5E5]">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                const isActive = selectedRole === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => selectDemoAccount(acc, false)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#990000] text-white shadow-xs'
                        : 'text-[#171717] hover:bg-white hover:text-[#990000]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{acc.role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Heading */}
          <div className="pt-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
              Sign In to EdvoNest
            </h2>
            <p className="text-xs sm:text-sm text-[#525252] mt-1">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[#990000] text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                <p className="text-xs text-red-700/80 mt-0.5">
                  Click any role button above to reset to verified credentials.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 pt-1">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-bold text-[#525252] uppercase tracking-wider mb-2">
                EMAIL OR USERNAME
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#525252] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#E5E5E5] bg-white text-sm text-[#171717] placeholder-slate-400 font-medium focus:border-[#990000] focus:ring-1 focus:ring-[#990000] focus:outline-none transition-all"
                  placeholder="name@school.edu"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-bold text-[#525252] uppercase tracking-wider mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#525252] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-11 rounded-xl border border-[#E5E5E5] bg-white text-sm text-[#171717] placeholder-slate-400 font-medium focus:border-[#990000] focus:ring-1 focus:ring-[#990000] focus:outline-none transition-all"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#990000] cursor-pointer p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Need Help */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#525252]">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-[#E5E5E5] text-[#990000] focus:ring-[#990000] cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setEmail('admin@edvonest.com');
                  setPassword('password123');
                  setSelectedRole('Admin');
                }}
                className="text-xs font-semibold text-[#525252] hover:text-[#990000] hover:underline cursor-pointer"
              >
                Need help?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#990000] hover:bg-[#800000] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Institutional Compliance Tagline */}
          <div className="pt-4 text-center text-xs text-[#525252] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#990000] shrink-0" />
            <span>Institutional Cloud OS • CBSE Affiliation #89410</span>
          </div>
        </div>
      </div>
    </div>
  );
}
