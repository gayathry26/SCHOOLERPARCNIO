'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  DollarSign,
  Users,
  MessageSquareText,
  Bus,
  Library,
  Award,
  Contact,
  BarChart3,
  Settings,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  LogOut,
  BellRing,
  HeartPulse,
  Building2,
  Boxes,
  HeartHandshake,
  Shield,
  Receipt,
  UserPlus,
  ClipboardList,
  Compass,
} from 'lucide-react';
import { UserRole, SessionUser } from '@/lib/auth';
import { EdvoNestLogo } from '@/components/ui/EdvoNestLogo';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { subscribeToPushNotifications } from '@/lib/offline-sync';
import { canAccessModule, AppModule } from '@/lib/permissions';
import { triggerQuickAction } from './QuickActionLauncher';
import { Zap, ArrowRight } from 'lucide-react';

interface MobileDrawerNavProps {
  isOpen: boolean;
  onClose: () => void;
  user: SessionUser;
}

interface DrawerCategory {
  category: string;
  items: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: UserRole[];
    module?: AppModule;
  }>;
}

const DRAWER_CATEGORIES: DrawerCategory[] = [
  {
    category: 'OVERVIEW',
    items: [
      { label: 'Dashboard HQ', href: '/dashboard', icon: LayoutDashboard, module: 'DASHBOARD' },
      { label: 'Events & Calendar', href: '/dashboard/events', icon: CalendarCheck, module: 'EVENTS' },
      { label: 'Communication', href: '/dashboard/communication', icon: MessageSquareText, module: 'COMMUNICATION' },
    ],
  },
  {
    category: 'ACADEMICS',
    items: [
      { label: 'Classes & Wings', href: '/dashboard/academics', icon: BookOpen, module: 'ACADEMICS' },
      { label: 'Class Timetable', href: '/dashboard/timetable', icon: CalendarCheck, module: 'ACADEMICS' },
      { label: 'Daily Attendance', href: '/dashboard/attendance', icon: CalendarCheck, module: 'ATTENDANCE' },
      { label: 'Lesson Plans', href: '/dashboard/lesson-plans', icon: ClipboardList, module: 'LESSON_PLANS' },
      { label: 'Homework & Tasks', href: '/dashboard/homework', icon: BookOpen, module: 'ACADEMICS' },
      { label: 'Examinations', href: '/dashboard/exams', icon: FileCheck2Icon, module: 'EXAMINATIONS' },
      { label: 'Academic Intelligence', href: '/dashboard/academic-intelligence', icon: BarChart3, module: 'ACADEMIC_INTELLIGENCE' },
      { label: 'AI Study Assistant', href: '/dashboard/ai-learning', icon: Sparkles, module: 'AI_LEARNING' },
    ],
  },
  {
    category: 'STUDENTS',
    items: [
      { label: 'Student Directory', href: '/dashboard/students', icon: GraduationCap, module: 'STUDENTS' },
      { label: 'Admissions CRM', href: '/dashboard/admissions', icon: UserPlus, module: 'ADMISSIONS' },
      { label: 'Student Portfolio', href: '/dashboard/portfolio', icon: Compass, module: 'STUDENT_PORTFOLIO' },
      { label: 'Lifecycle & Promotion', href: '/dashboard/lifecycle', icon: RefreshCw, module: 'LIFECYCLE' },
      { label: 'Certificates & TC', href: '/dashboard/certificates', icon: Award, module: 'CERTIFICATES' },
    ],
  },
  {
    category: 'FINANCE',
    items: [
      { label: 'Fee Management', href: '/dashboard/fees', icon: DollarSign, module: 'FEES_FINANCE' },
      { label: 'Expenses & Ledger', href: '/dashboard/finance', icon: Receipt, module: 'FEES_FINANCE', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PRINCIPAL'] },
      { label: 'Asset Inventory', href: '/dashboard/inventory', icon: Boxes, module: 'INVENTORY' },
    ],
  },
  {
    category: 'STAFF',
    items: [
      { label: 'Staff Directory & HR', href: '/dashboard/hr', icon: Users, module: 'HR_MANAGEMENT' },
    ],
  },
  {
    category: 'CAMPUS',
    items: [
      { label: 'Live Transport', href: '/dashboard/transport', icon: Bus, module: 'TRANSPORT' },
      { label: 'Digital Library', href: '/dashboard/library', icon: Library, module: 'LIBRARY' },
      { label: 'Health Clinic', href: '/dashboard/health', icon: HeartPulse, module: 'HEALTH_CLINIC' },
      { label: 'Campus Safety & Visitors', href: '/dashboard/campus-safety', icon: Shield, module: 'CAMPUS_SAFETY' },
    ],
  },
  {
    category: 'COMMUNICATION',
    items: [
      { label: 'Parent Portal', href: '/dashboard/parent-portal', icon: HeartHandshake, module: 'PARENT_PORTAL', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PARENT'] },
      { label: 'Announcements & Messages', href: '/dashboard/communication', icon: MessageSquareText, module: 'COMMUNICATION' },
    ],
  },
  {
    category: 'SETTINGS',
    items: [
      { label: 'School Settings', href: '/dashboard/settings', icon: Settings, module: 'SETTINGS' },
      { label: 'Platform SaaS Admin', href: '/dashboard/platform-admin', icon: Building2, module: 'PLATFORM_ADMIN', roles: ['SUPER_ADMIN'] },
      { label: 'System Audit Trail', href: '/dashboard/audit-logs', icon: ShieldCheck, module: 'AUDIT_LOGS' },
      { label: 'Command Centre HQ', href: '/dashboard/command-centre', icon: Compass, module: 'COMMAND_CENTRE' },
    ],
  },
];

function FileCheck2Icon(props: { className?: string }) {
  return <Award {...props} />;
}

export const MobileDrawerNav: React.FC<MobileDrawerNavProps> = ({ isOpen, onClose, user }) => {
  const pathname = usePathname();

  if (!isOpen) return null;

  const handlePushEnable = async () => {
    const res = await subscribeToPushNotifications();
    alert(res.message);
  };

  const filteredCategories = DRAWER_CATEGORIES.map((cat) => {
    const visibleItems = cat.items.filter((item) => {
      if (item.roles && !item.roles.includes(user.role)) return false;
      if (item.module && !canAccessModule(user.role, item.module)) return false;
      return true;
    });
    return {
      category: cat.category,
      items: visibleItems,
    };
  }).filter((cat) => cat.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
      {/* Dark backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        {/* Top Drawer Header */}
        <div className="p-4 border-b border-[#E5E5E5] bg-[#F5F5F5] flex items-center justify-between">
          <EdvoNestLogo variant="full" size="sm" showTagline={true} />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3.5 bg-gradient-to-r from-[#990000]/10 to-[#C00000]/10 border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar name={`${user.firstName} ${user.lastName}`} size="md" shape="circle" />
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {user.firstName} {user.lastName}
              </p>
              <span className="text-[10px] text-[#990000] font-semibold">{user.role.replace(/_/g, ' ')}</span>
            </div>
          </div>
          <Badge variant="teal">Online</Badge>
        </div>

        {/* Quick Action Launcher Trigger */}
        <div className="p-2.5 border-b border-[#E5E5E5] bg-[#F5F5F5]">
          <button
            onClick={() => {
              onClose();
              triggerQuickAction('LAUNCHER');
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-[#FECACA] text-[#990000] font-bold text-xs shadow-2xs hover:bg-[#FEF2F2] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#35B84A]" />
              <span>⚡ Quick Actions</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#990000]" />
          </button>
        </div>

        {/* Navigation Categories Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {filteredCategories.map((group) => (
            <div key={group.category} className="space-y-1">
              <p className="px-2 text-[10px] font-black uppercase tracking-wider text-[#737373]">
                {group.category}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${isActive
                        ? 'bg-[#990000] text-white font-bold shadow-xs'
                        : 'text-[#171717] hover:bg-[#FEF2F2] hover:text-[#990000]'
                        }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#737373]'}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Drawer Actions */}
        <div className="p-3 border-t border-[#E5E5E5] bg-[#F5F5F5] space-y-2">
          <button
            onClick={handlePushEnable}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-[#990000] bg-[#FEF2F2] rounded-xl hover:bg-[#D4ECF2] transition-colors cursor-pointer"
          >
            <BellRing className="w-4 h-4" />
            Enable Push Notifications
          </button>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
