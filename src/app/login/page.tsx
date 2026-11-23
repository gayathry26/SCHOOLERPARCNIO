'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
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
  Eye,
  EyeOff,
  BrainCircuit,
  Compass,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EdvoNestLogo } from '@/components/ui/EdvoNestLogo';

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
    desc: 'System Configuration & Records',
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
    desc: '1-Tap Register & Gradebook',
    badgeBg: 'bg-[#E0F5F5]',
    iconColor: 'text-[#008C91]',
  },
  {
    role: 'Accountant',
    roleKey: 'ACCOUNTANT',
    email: 'accountant@edvonest.com',
    pass: 'password123',
    icon: DollarSign,
    desc: 'Counter Fees & Instant Receipts',
    badgeBg: 'bg-[#FEF3C7]',
    iconColor: 'text-[#B45309]',
  },
  {
    role: 'Parent',
    roleKey: 'PARENT',
    email: 'parent1@edvonest.com',
    pass: 'password123',
    icon: HeartHandshake,
    desc: 'Ward Progress & Bus GPS ETA',
    badgeBg: 'bg-[#F3E8FF]',
    iconColor: 'text-[#7E22CE]',
  },
  {
    role: 'Student',
    roleKey: 'STUDENT',
    email: 'student1@edvonest.com',
    pass: 'password123',
    icon: User,
    desc: 'Class 10-A, Timetable & AI Tutor',
    badgeBg: 'bg-[#EAF5F8]',
    iconColor: 'text-[#086A92]',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('admin@edvonest.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [activePillar, setActivePillar] = useState<'academics' | 'safety' | 'finance' | 'community'>('academics');
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

  const pillars = [
    {
      id: 'academics',
      title: 'Academic Intelligence',
      badge: 'Modules A–D',
      icon: BrainCircuit,
      color: 'text-[#75D7D1]',
      desc: 'Predictive performance analytics, CBSE/ICSE syllabus pacing, and automated term gradebooks.',
      metric: '94.8% Syllabus On-Track',
    },
    {
      id: 'safety',
      title: 'Campus Safety & Fleet',
      badge: 'Modules E–G',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      desc: 'Live school bus GPS tracking with parent arrival notifications and RFID/QR gate passes.',
      metric: '12/12 Live GPS Routes',
    },
    {
      id: 'finance',
      title: 'Financial Operations',
      badge: 'Modules H–L',
      icon: DollarSign,
      color: 'text-teal-300',
      desc: 'Counter collections, automated UPI receipt generation, and annual audit cash balancing.',
      metric: '₹ 48.5L Fee Realized',
    },
    {
      id: 'community',
      title: 'Parent & Student Hub',
      badge: 'Modules I–N',
      icon: Compass,
      color: 'text-amber-300',
      desc: 'Mobile-first ward tracking, homework pacing, digital certificates, and PTM booking.',
      metric: '1,248 Active Profiles',
    },
  ] as const;

  return (
    <div className="min-h-screen bg-[#081820] text-slate-100 flex flex-col justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Cinematic Ambient Glows */}
      <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-[#086A92]/25 rounded-full filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-[600px] h-[600px] bg-[#008C91]/20 rounded-full filter blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-15 pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto space-y-6 relative z-10">
        {/* Top Floating Glass Navigation Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 shadow-2xl">
          <Link href="/" className="flex items-center brightness-125 hover:opacity-90 transition-opacity">
            <EdvoNestLogo variant="full" size="md" showTagline={true} />
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-300 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#35B84A] animate-pulse" />
              <span className="text-slate-400">Institutional Cloud OS:</span>
              <span className="text-[#75D7D1] font-bold">CBSE &amp; ICSE Certified (#89410)</span>
            </div>

            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm font-semibold gap-1.5 bg-white/10 hover:bg-white/20 text-white border-white/15 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Main 2-Column Split Master Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT: Cinematic Architectural System Ecosystem */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#0B2632] via-[#081820] to-[#17313A] rounded-3xl border border-white/15 p-6 sm:p-8 lg:p-10 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            {/* Top Ecosystem Header */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-[#75D7D1]">
                <Sparkles className="w-3.5 h-3.5 text-[#35B84A]" />
                <span>Connected School Intelligence Fabric</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Architectural elegance for modern school operations.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                One unified institutional identity connecting classroom gradebooks, morning attendance registers, bus GPS routes, and counter fees.
              </p>
            </div>

            {/* 4 Interactive System Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pillars.map((pil) => {
                const PIcon = pil.icon;
                const isSelected = activePillar === pil.id;

                return (
                  <button
                    key={pil.id}
                    type="button"
                    onClick={() => setActivePillar(pil.id)}
                    className={`text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white/15 border-cyan-400 shadow-xl ring-2 ring-cyan-400/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-xl bg-white/10 ${pil.color}`}>
                          <PIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-300 bg-black/20 px-2 py-0.5 rounded-md">
                          {pil.badge}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white">{pil.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {pil.desc}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className={`font-bold ${pil.color}`}>{pil.metric}</span>
                      <span className="text-emerald-400 font-bold">● Active</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom 3 Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#35B84A] shrink-0" />
                <span className="font-semibold">Zero IT Setup Needed</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#75D7D1] shrink-0" />
                <span className="font-semibold">100% Granular RBAC</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">Live Instant Audit Logs</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Minimal, High-Precision Sign-In Card */}
          <div className="lg:col-span-5 bg-white text-[#17313A] rounded-3xl border border-[#E4EAEC] p-6 sm:p-8 lg:p-10 shadow-2xl flex flex-col justify-between space-y-6">
            <div>
              {/* Header */}
              <div className="mb-6 pb-4 border-b border-[#E4EAEC] flex items-center justify-between">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#17313A]">Sign In</h3>
                  <p className="text-sm text-[#4A5D65] mt-0.5">
                    Select a 1-click role below or enter credentials
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#EAF8EC] text-[#35B84A] flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              {/* Form */}
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
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 bg-[#F7FAFA] border border-[#E4EAEC] rounded-xl text-sm sm:text-base text-[#17313A] placeholder-[#6B7C83] focus:bg-white focus:outline-none focus:border-[#086A92] focus:ring-2 focus:ring-[#086A92]/20 font-medium transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
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
                  className="w-full py-3.5 text-base font-bold shadow-md cursor-pointer bg-gradient-to-r from-[#086A92] to-[#008C91] hover:brightness-110"
                  rightIcon={<ArrowRight className="w-5 h-5 ml-1" />}
                >
                  Sign In to Dashboard
                </Button>
              </form>
            </div>

            {/* 1-Click Role Access Grid */}
            <div className="pt-5 border-t border-[#E4EAEC]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-bold text-[#17313A] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#35B84A]" />
                  <span>Instant 1-Click Demo Logins</span>
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
