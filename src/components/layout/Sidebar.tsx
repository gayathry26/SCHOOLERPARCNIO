'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  FileCheck2,
  DollarSign,
  Users,
  MessageSquareText,
  Bus,
  Library,
  Award,
  Contact,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CalendarDays,
  Receipt,
  UserPlus,
  ClipboardList,
  Compass,
  HeartPulse,
  Building2,
  Boxes,
  Shield,
  HeartHandshake,
  RefreshCw,
  Search,
  Star,
  Pin,
  Clock,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
} from 'lucide-react';
import { UserRole } from '@/lib/auth';
import { EdvoNestLogo } from '@/components/ui/EdvoNestLogo';
import { canAccessModule, AppModule } from '@/lib/permissions';
import { triggerQuickAction } from './QuickActionLauncher';
import { RecentPage } from './OmniSearch';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  module?: AppModule;
  badge?: string;
  badgeColor?: string;
  description: string;
}

export interface NavCategory {
  name: string;
  items: NavItem[];
}

const NAVIGATION_GROUPS: NavCategory[] = [
  {
    name: 'OVERVIEW',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, module: 'DASHBOARD', description: 'Institutional overview, KPIs, and role-tailored alerts' },
      { label: 'Events & Calendar', href: '/dashboard/events', icon: CalendarDays, module: 'EVENTS', description: 'Annual events, sports day, term dates, and holidays' },
      { label: 'Communication Hub', href: '/dashboard/communication', icon: MessageSquareText, module: 'COMMUNICATION', description: 'Broadcast circulars, notices to parents, and SMS alerts' },
    ],
  },
  {
    name: 'ACADEMICS',
    items: [
      { label: 'Classes & Wings', href: '/dashboard/academics', icon: BookOpen, module: 'ACADEMICS', description: 'Primary, middle, and senior secondary grade wings' },
      { label: 'Class Timetable', href: '/dashboard/timetable', icon: CalendarCheck, module: 'ACADEMICS', description: 'Weekly period schedules and teacher routines' },
      { label: 'Attendance Records', href: '/dashboard/attendance', icon: CalendarCheck, module: 'ATTENDANCE', description: 'Daily classroom register and staff biometric logs' },
      { label: 'Lesson Plans', href: '/dashboard/lesson-plans', icon: ClipboardList, module: 'LESSON_PLANS', description: 'Curriculum pacing and weekly syllabus tracking' },
      { label: 'Homework & Tasks', href: '/dashboard/homework', icon: BookOpen, module: 'ACADEMICS', description: 'Publish assignments, collect homework, and record marks' },
      { label: 'Examinations & Marks', href: '/dashboard/exams', icon: FileCheck2, module: 'EXAMINATIONS', description: 'Term exams, mark entry, and CBSE report cards' },
      { label: 'Academic Intelligence', href: '/dashboard/academic-intelligence', icon: BarChart3, module: 'ACADEMIC_INTELLIGENCE', description: 'Predictive performance analytics and benchmarks' },
      { label: 'AI Study Assistant', href: '/dashboard/ai-learning', icon: Sparkles, module: 'AI_LEARNING', badge: 'AI', badgeColor: 'bg-[#EAF8EC] text-[#16A34A] border-[#bbf0c5]', description: 'Curriculum-grounded doubt solver and spaced revision' },
      { label: 'Question Bank & Mocks', href: '/dashboard/question-bank', icon: Boxes, module: 'QUESTION_BANK', description: 'Chapter question repository and automated paper generator' },
    ],
  },
  {
    name: 'STUDENTS',
    items: [
      { label: 'Student Directory', href: '/dashboard/students', icon: GraduationCap, module: 'STUDENTS', description: 'Student profiles, admission details, and parent contacts' },
      { label: 'Admissions CRM', href: '/dashboard/admissions', icon: UserPlus, module: 'ADMISSIONS', description: 'Enquiry pipeline and online application tracking' },
      { label: 'Student Portfolio', href: '/dashboard/portfolio', icon: Compass, module: 'STUDENT_PORTFOLIO', description: 'Co-curricular awards, athletic merits, and skill badges' },
      { label: 'Lifecycle & Promotion', href: '/dashboard/lifecycle', icon: RefreshCw, module: 'LIFECYCLE', badge: 'Pro', badgeColor: 'bg-[#EAF5F8] text-[#086A92] border-[#c0e3ed]', description: 'Year-end grade promotions and section transfers' },
      { label: 'Certificates & TC', href: '/dashboard/certificates', icon: Award, module: 'CERTIFICATES', description: 'Transfer Certificates and bonafide letters' },
      { label: 'ID Card Studio', href: '/dashboard/id-cards', icon: Contact, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'], description: 'Print student, faculty, and visitor smart ID cards' },
    ],
  },
  {
    name: 'FINANCE',
    items: [
      { label: 'Fee Management', href: '/dashboard/fees', icon: DollarSign, module: 'FEES_FINANCE', description: 'Collect student fees, offline receipts, and track dues' },
      { label: 'Expenses & Ledger', href: '/dashboard/finance', icon: Receipt, module: 'FEES_FINANCE', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PRINCIPAL'], description: 'Income, expense ledgers, and vendor purchase records' },
      { label: 'Asset Inventory', href: '/dashboard/inventory', icon: Boxes, module: 'INVENTORY', description: 'Classroom equipment and campus inventory' },
    ],
  },
  {
    name: 'STAFF',
    items: [
      { label: 'Staff Directory & HR', href: '/dashboard/hr', icon: Users, module: 'HR_MANAGEMENT', description: 'Faculty directory, payroll slips, and leave management' },
    ],
  },
  {
    name: 'CAMPUS',
    items: [
      { label: 'Live Transport', href: '/dashboard/transport', icon: Bus, module: 'TRANSPORT', description: 'Real-time school bus GPS tracking and manifests' },
      { label: 'Digital Library', href: '/dashboard/library', icon: Library, module: 'LIBRARY', description: 'Book catalog, ISBN lookup, and borrowing records' },
      { label: 'Health Clinic', href: '/dashboard/health', icon: HeartPulse, module: 'HEALTH_CLINIC', description: 'Student medical checkups and clinic visit logs' },
      { label: 'Campus Safety & Visitors', href: '/dashboard/campus-safety', icon: Shield, module: 'CAMPUS_SAFETY', description: 'Gate passes, visitor logs, and incident registers' },
      { label: 'Multi-Campus Network', href: '/dashboard/multi-campus', icon: Building2, module: 'MULTI_CAMPUS', description: 'Inter-branch synchronization and network reporting' },
    ],
  },
  {
    name: 'COMMUNICATION',
    items: [
      { label: 'Announcements & Chat', href: '/dashboard/communication', icon: MessageSquareText, module: 'COMMUNICATION', description: 'Notice board and two-way parent messaging' },
      { label: 'PTM & Appointments', href: '/dashboard/ptm', icon: Users, module: 'PTM_MANAGEMENT', badge: 'Active', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', description: 'Parent-teacher conferences, slot booking, and follow-up notes' },
      { label: 'Parent Portal', href: '/dashboard/parent-portal', icon: HeartHandshake, module: 'PARENT_PORTAL', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PARENT'], description: 'Wards academic progress, fee receipts, and bus alerts' },
      { label: 'School Calendar', href: '/dashboard/events', icon: CalendarDays, module: 'EVENTS', description: 'Monthly calendar view with academic checkpoints' },
    ],
  },
  {
    name: 'SETTINGS',
    items: [
      { label: 'UI Component Library', href: '/dashboard/components-showcase', icon: Layers, module: 'SETTINGS', badge: '16 Primitives', badgeColor: 'bg-sky-100 text-[#086A92] border-sky-200', description: 'Design system primitives and interactive showcase' },
      { label: 'School Onboarding Wizard', href: '/dashboard/onboarding', icon: Sparkles, module: 'SETTINGS', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'], badge: 'Setup', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', description: 'Guided 10-step institutional lifecycle setup wizard' },
      { label: 'School Settings', href: '/dashboard/settings', icon: Settings, module: 'SETTINGS', description: 'School profile, CBSE affiliation, and grading rules' },
      { label: 'Platform SaaS Admin', href: '/dashboard/platform-admin', icon: Building2, module: 'PLATFORM_ADMIN', roles: ['SUPER_ADMIN'], badge: 'SaaS', badgeColor: 'bg-purple-100 text-purple-700 border-purple-200', description: 'Tenant management and subscription configurations' },
      { label: 'System Audit Trail', href: '/dashboard/audit-logs', icon: ShieldCheck, module: 'AUDIT_LOGS', description: 'Security audit logs and compliance history' },
      { label: 'Command Centre HQ', href: '/dashboard/command-centre', icon: Compass, module: 'COMMAND_CENTRE', badge: 'HQ', badgeColor: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]', description: 'Executive operational cockpit and campus health' },
      { label: 'Executive Reports', href: '/dashboard/reports', icon: BarChart3, module: 'REPORTS', description: 'Annual regulatory reports, audits, and exports' },
    ],
  },
];

export interface SidebarProps {
  currentRole: UserRole;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAVIGATION_GROUPS.forEach((g) => {
      const hasActiveChild = g.items.some((item) => item.href === pathname);
      // Keep OVERVIEW and whichever group contains the active route expanded; collapse others to prevent 40-item clutter
      if (g.name !== 'OVERVIEW' && !hasActiveChild) {
        initial[g.name] = true;
      }
    });
    return initial;
  });

  // Automatically expand group when active route changes
  useEffect(() => {
    NAVIGATION_GROUPS.forEach((g) => {
      if (g.items.some((item) => item.href === pathname)) {
        setCollapsedGroups((prev) => ({ ...prev, [g.name]: false }));
      }
    });
  }, [pathname]);

  const [filterQuery, setFilterQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['/dashboard', '/dashboard/attendance']);
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);

  // Load saved favorites & recent pages from localStorage
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('edvonest_pinned_nav');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedRecent = localStorage.getItem('edvonest_recent_pages');
      if (savedRecent) setRecentPages(JSON.parse(savedRecent));
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleFavorite = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href];
      try {
        localStorage.setItem('edvonest_pinned_nav', JSON.stringify(next));
      } catch (err) { }
      return next;
    });
  };

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Filter groups and items by user role and module permissions
  const authorizedGroups = useMemo(() => {
    return NAVIGATION_GROUPS.map((group) => {
      const visibleItems = group.items.filter((item) => {
        if (item.roles && !item.roles.includes(currentRole)) return false;
        if (item.module && !canAccessModule(currentRole, item.module)) return false;
        if (filterQuery.trim()) {
          const q = filterQuery.toLowerCase();
          return (
            item.label.toLowerCase().includes(q) ||
            item.href.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q)
          );
        }
        return true;
      });

      return {
        name: group.name,
        items: visibleItems,
      };
    }).filter((group) => group.items.length > 0);
  }, [currentRole, filterQuery]);

  // Pinned favorite items list
  const favoriteItems = useMemo(() => {
    const allItems = NAVIGATION_GROUPS.flatMap((g) => g.items);
    return allItems.filter(
      (item, idx, arr) =>
        favorites.includes(item.href) &&
        arr.findIndex((x) => x.href === item.href) === idx &&
        (!item.roles || item.roles.includes(currentRole)) &&
        (!item.module || canAccessModule(currentRole, item.module))
    );
  }, [favorites, currentRole]);

  return (
    <aside
      className={`bg-white border-r border-[#E4EAEC] h-screen flex flex-col fixed left-0 top-0 z-30 shadow-2xs select-none transition-all duration-300 ${isCollapsed ? 'w-18' : 'w-60 md:w-64'
        }`}
    >
      {/* Brand Header */}
      <div className={`border-b border-[#E4EAEC] bg-white flex shrink-0 ${isCollapsed ? 'p-3 flex-col items-center justify-center' : 'p-4 flex-col gap-1'}`}>
        <div className="flex items-center justify-between w-full">
          {isCollapsed ? (
            <EdvoNestLogo variant="icon-only" size="sm" />
          ) : (
            <EdvoNestLogo variant="full" size="sm" showTagline={true} />
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 text-[#6B7C83] hover:text-[#086A92] hover:bg-[#EAF5F8] rounded-lg transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar Navigation' : 'Collapse to compact rail'}
              aria-label={isCollapsed ? 'Expand Sidebar Navigation' : 'Collapse to compact rail'}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex items-center justify-between text-[10px] text-[#6B7C83] mt-1 pt-1.5 border-t border-[#E4EAEC]/60">
            <span className="font-semibold text-[#086A92]">Learn • Grow • Succeed</span>
            <span className="px-1.5 py-0.5 rounded bg-[#EAF8EC] text-[#16A34A] font-bold border border-[#bbf0c5]">
              v2.4 Active
            </span>
          </div>
        )}
      </div>

      {/* Quick Search in Nav (when expanded) */}
      {!isCollapsed && (
        <div className="p-2.5 border-b border-[#E4EAEC]/80 bg-[#F7FAFA] shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7C83]" />
            <input
              type="text"
              placeholder="Quick filter menu..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-[#E4EAEC] rounded-lg text-[#17313A] placeholder:text-[#6B7C83] focus:outline-none focus:ring-1 focus:ring-[#086A92]"
            />
          </div>
        </div>
      )}

      {/* Navigation Scrollable Body */}
      <div className={`flex-1 overflow-y-auto space-y-4 ${isCollapsed ? 'p-2' : 'px-2.5 py-3'}`}>
        {/* Quick Action Launcher Button */}
        {!isCollapsed && !filterQuery && (
          <button
            onClick={() => triggerQuickAction('LAUNCHER')}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-[#EAF5F8] to-[#F7FAFA] border border-[#c0e3ed] text-[#086A92] hover:bg-[#086A92] hover:text-white transition-all text-xs font-bold group cursor-pointer shadow-2xs"
            title="Launch quick actions from anywhere"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#35B84A] group-hover:text-yellow-300" />
              <span>Quick Actions</span>
            </div>
            <kbd className="px-1.5 py-0.5 bg-white group-hover:bg-white/20 border border-[#E4EAEC] group-hover:border-transparent text-[10px] rounded font-mono text-[#17313A] group-hover:text-white">
              ⚡
            </kbd>
          </button>
        )}

        {/* Collapsed Mode Quick Action Icon */}
        {isCollapsed && (
          <button
            onClick={() => triggerQuickAction('LAUNCHER')}
            className="w-full flex items-center justify-center p-2 rounded-xl bg-[#EAF5F8] text-[#086A92] hover:bg-[#086A92] hover:text-white transition-all relative group cursor-pointer"
            title="Quick Action Launcher"
          >
            <Zap className="w-5 h-5 text-[#35B84A]" />
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex flex-col w-48 p-2.5 bg-slate-900 text-white rounded-xl shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95">
              <span className="font-bold text-xs">⚡ Quick Actions</span>
              <span className="text-[10px] text-slate-300 mt-0.5">Perform instant operations without switching pages</span>
            </div>
          </button>
        )}

        {/* Pinned Quick Access Favorites */}
        {!filterQuery && favoriteItems.length > 0 && !isCollapsed && (
          <div className="space-y-1 pb-2 border-b border-[#E4EAEC]">
            <div className="px-2 flex items-center justify-between text-[10px] font-bold tracking-wider text-[#6B7C83] uppercase mb-1">
              <span className="flex items-center gap-1.5 text-[#086A92]">
                <Pin className="w-3 h-3 text-[#086A92]" />
                <span>Pinned Favorites</span>
              </span>
              <span className="text-[9px] bg-[#EAF5F8] text-[#086A92] px-1.5 rounded-full font-bold">
                {favoriteItems.length}
              </span>
            </div>
            {favoriteItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={`fav-${item.href}`}
                  href={item.href}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group ${isActive
                    ? 'bg-[#086A92] text-white shadow-xs'
                    : 'text-[#17313A] hover:bg-[#EAF5F8] hover:text-[#086A92]'
                    }`}
                  title={item.description}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-[#086A92]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <button
                    onClick={(e) => toggleFavorite(item.href, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-amber-500 hover:scale-110 transition-all cursor-pointer"
                    title="Unpin favorite"
                  >
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  </button>
                </Link>
              );
            })}
          </div>
        )}

        {/* Categorized Navigation Groups */}
        {authorizedGroups.map((group) => {
          const isGroupCollapsed = !isCollapsed && !!collapsedGroups[group.name];
          const hasActiveChild = group.items.some((item) => pathname === item.href);

          return (
            <div key={group.name} className="space-y-1">
              {/* Category Group Header (Expanded mode only) */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.name)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-black tracking-wider text-[#6B7C83] hover:text-[#17313A] transition-colors uppercase group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={hasActiveChild ? 'text-[#086A92]' : ''}>{group.name}</span>
                    {hasActiveChild && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#086A92]" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-[#6B7C83]">
                    <span>{group.items.length}</span>
                    {isGroupCollapsed ? (
                      <ChevronRight className="w-3 h-3 text-[#6B7C83]" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-[#6B7C83]" />
                    )}
                  </div>
                </button>
              )}

              {/* Group Items */}
              {(!isGroupCollapsed || isCollapsed) && (
                <div className={`space-y-0.5 ${isCollapsed ? '' : 'pl-1'}`}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    const isPinned = favorites.includes(item.href);

                    if (isCollapsed) {
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-center p-2.5 rounded-xl transition-all relative group ${isActive
                            ? 'bg-[#086A92] text-white shadow-xs'
                            : 'text-[#6B7C83] hover:bg-[#EAF5F8] hover:text-[#086A92]'
                            }`}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                          {/* Helpful Floating Tooltip */}
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex flex-col w-56 p-2.5 bg-slate-900 text-white rounded-xl shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs">{item.label}</span>
                              {item.badge && (
                                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-300 mt-1 leading-snug">
                              {item.description}
                            </span>
                          </div>
                        </Link>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={item.description}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group relative ${isActive
                          ? 'bg-[#086A92] text-white font-bold shadow-xs'
                          : 'text-[#17313A] hover:bg-[#EAF5F8] hover:text-[#086A92]'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-[#6B7C83] group-hover:text-[#086A92]'
                              }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${isActive
                                ? 'bg-white text-[#086A92] border-white'
                                : item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                            >
                              {item.badge}
                            </span>
                          )}

                          <button
                            onClick={(e) => toggleFavorite(item.href, e)}
                            className={`opacity-0 group-hover:opacity-100 p-0.5 transition-all cursor-pointer ${isPinned ? 'opacity-100 text-amber-500' : 'text-slate-400 hover:text-amber-500'
                              }`}
                            title={isPinned ? 'Unpin' : 'Pin to favorites'}
                          >
                            <Star
                              className={`w-3 h-3 ${isPinned ? 'fill-amber-400 text-amber-500' : ''}`}
                            />
                          </button>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer User Role Pill */}
      <div className={`border-t border-[#E4EAEC] bg-[#F7FAFA] shrink-0 flex items-center ${isCollapsed ? 'p-2 justify-center' : 'p-3 justify-between text-xs'}`}>
        {isCollapsed ? (
          <Link
            href="/dashboard/settings"
            className="p-2 rounded-lg text-[#6B7C83] hover:text-[#086A92] hover:bg-white transition-colors"
            title="School Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        ) : (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-[#35B84A] shrink-0" />
              <div className="truncate">
                <p className="text-[11px] font-bold text-[#17313A] truncate">{currentRole.replace(/_/g, ' ')}</p>
                <p className="text-[9px] text-[#6B7C83] truncate">EdvoNest Unified OS</p>
              </div>
            </div>
            <Link
              href="/dashboard/settings"
              className="p-1 rounded-md text-[#6B7C83] hover:text-[#086A92] hover:bg-white transition-colors"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
          </>
        )}
      </div>
    </aside>
  );
};
