'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  DollarSign,
  BookOpen,
  Award,
  Sparkles,
  HeartHandshake,
  GraduationCap,
  ShieldCheck,
  ClipboardList,
  Compass,
  Menu,
} from 'lucide-react';
import { UserRole } from '@/lib/auth';

interface MobileBottomNavProps {
  currentRole: UserRole;
  onOpenDrawer?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentRole, onOpenDrawer }) => {
  const pathname = usePathname();

  // Role-specific bottom navigation tabs
  const getNavTabs = () => {
    switch (currentRole) {
      case 'PARENT':
        return [
          { label: 'Portal', href: '/dashboard/parent-portal', icon: HeartHandshake },
          { label: 'Fees', href: '/dashboard/fees', icon: DollarSign },
          { label: 'Attendance', href: '/dashboard/attendance', icon: CalendarCheck },
          { label: 'Homework', href: '/dashboard/homework', icon: BookOpen },
          { label: 'Results', href: '/dashboard/exams', icon: Award },
        ];
      case 'STUDENT':
        return [
          { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
          { label: 'AI Tutor', href: '/dashboard/ai-learning', icon: Sparkles },
          { label: 'Homework', href: '/dashboard/homework', icon: BookOpen },
          { label: 'Exams', href: '/dashboard/exams', icon: Award },
          { label: 'Portfolio', href: '/dashboard/portfolio', icon: Compass },
        ];
      case 'TEACHER':
      case 'CLASS_TEACHER':
        return [
          { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Attendance', href: '/dashboard/attendance', icon: CalendarCheck },
          { label: 'Homework', href: '/dashboard/homework', icon: BookOpen },
          { label: 'Lessons', href: '/dashboard/lesson-plans', icon: ClipboardList },
          { label: 'Students', href: '/dashboard/students', icon: GraduationCap },
        ];
      default:
        // Admin, Principal, Accountant, etc.
        return [
          { label: 'HQ', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Fees', href: '/dashboard/fees', icon: DollarSign },
          { label: 'Attendance', href: '/dashboard/attendance', icon: CalendarCheck },
          { label: 'Safety', href: '/dashboard/campus-safety', icon: ShieldCheck },
          { label: 'Menu', href: '#menu', icon: Menu, isAction: true },
        ];
    }
  };

  const tabs = getNavTabs();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E5E5] md:hidden shadow-lg safe-area-pb">
      <div className="flex items-center justify-around h-15 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          if (tab.isAction) {
            return (
              <button
                key={tab.label}
                onClick={onOpenDrawer}
                className="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 hover:text-[#990000] transition-colors cursor-pointer"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium tracking-tight mt-0.5">{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive
                  ? 'text-[#990000] font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#990000]" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-black' : 'font-medium'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
