'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  X,
  Loader2,
  ArrowRight,
  BookOpen,
  GraduationCap,
  DollarSign,
  Users,
  Sparkles,
  CalendarCheck,
  ClipboardList,
  FileCheck2,
  Bus,
  Library,
  Shield,
  Settings,
  ShieldCheck,
  UserPlus,
  MessageSquare,
  CornerDownLeft,
  Clock,
  Pin,
  Star,
  Zap,
  FileDown,
  Layers,
  HeartPulse,
  Compass,
} from 'lucide-react';
import { UserRole } from '@/lib/auth';
import { triggerQuickAction, QuickActionKey } from './QuickActionLauncher';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  url: string;
  quickActionKey?: QuickActionKey;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface RecentPage {
  title: string;
  url: string;
  category: string;
  timestamp: number;
}

interface OmniSearchProps {
  userRole?: UserRole;
}

const DEFAULT_ACTIONS: Array<{
  id: string;
  title: string;
  subtitle: string;
  url: string;
  category: string;
  roles: UserRole[];
  quickActionKey?: QuickActionKey;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'act-attendance',
    title: 'Mark Class Attendance',
    subtitle: 'Daily classroom register & roll call',
    url: '/dashboard/attendance',
    category: 'Quick Action',
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'CLASS_TEACHER'],
    quickActionKey: 'MARK_ATTENDANCE',
    icon: CalendarCheck,
  },
  {
    id: 'act-fees',
    title: 'Collect Student Fee',
    subtitle: 'Fee counter instant payment receipt',
    url: '/dashboard/fees',
    category: 'Quick Action',
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PRINCIPAL'],
    quickActionKey: 'RECORD_PAYMENT',
    icon: DollarSign,
  },
  {
    id: 'act-student',
    title: 'Register New Student',
    subtitle: 'Fast admission enrollment form',
    url: '/dashboard/students',
    category: 'Quick Action',
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'RECEPTIONIST'],
    quickActionKey: 'ADD_STUDENT',
    icon: UserPlus,
  },
  {
    id: 'act-homework',
    title: 'Assign Homework',
    subtitle: 'Publish class section assignment',
    url: '/dashboard/homework',
    category: 'Quick Action',
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'CLASS_TEACHER'],
    quickActionKey: 'CREATE_HOMEWORK',
    icon: ClipboardList,
  },
  {
    id: 'act-exam',
    title: 'Schedule Examination',
    subtitle: 'Create test paper or term exam',
    url: '/dashboard/exams',
    category: 'Quick Action',
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'],
    quickActionKey: 'CREATE_EXAM',
    icon: FileCheck2,
  },
  {
    id: 'act-announcement',
    title: 'Broadcast Announcement',
    subtitle: 'Dispatch circular to parents & staff',
    url: '/dashboard/communication',
    category: 'Quick Action',
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'],
    quickActionKey: 'SEND_ANNOUNCEMENT',
    icon: MessageSquare,
  },
  {
    id: 'act-report',
    title: 'Generate Executive Report',
    subtitle: 'CBSE inspection, fees & attendance summary',
    url: '/dashboard/reports',
    category: 'Quick Action',
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'HR_MANAGER'],
    quickActionKey: 'GENERATE_REPORT',
    icon: FileDown,
  },
  {
    id: 'act-teacher',
    title: 'Add Faculty Member',
    subtitle: 'Onboard teaching faculty or staff',
    url: '/dashboard/hr',
    category: 'Quick Action',
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'HR_MANAGER'],
    quickActionKey: 'ADD_TEACHER',
    icon: Users,
  },
  {
    id: 'act-ai',
    title: 'Ask AI Study Tutor',
    subtitle: 'Curriculum-grounded instant doubt solver',
    url: '/dashboard/ai-learning',
    category: 'AI Assistant',
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'],
    icon: Sparkles,
  },
  {
    id: 'act-transport',
    title: 'Live School Bus GPS',
    subtitle: 'Real-time vehicle transit coordinates',
    url: '/dashboard/transport',
    category: 'Campus',
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TRANSPORT_MANAGER', 'PARENT', 'STUDENT'],
    icon: Bus,
  },
];

export const OmniSearch: React.FC<OmniSearchProps> = ({ userRole = 'SCHOOL_ADMIN' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIONS' | 'RECENT' | 'MODULES' | 'STUDENTS'>('ALL');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
  const [pinnedHrefs, setPinnedHrefs] = useState<string[]>([]);

  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load Recent Pages and Pinned Favorites
  useEffect(() => {
    try {
      const storedRecent = localStorage.getItem('edvonest_recent_pages');
      if (storedRecent) setRecentPages(JSON.parse(storedRecent));

      const storedPinned = localStorage.getItem('edvonest_pinned_nav');
      if (storedPinned) setPinnedHrefs(JSON.parse(storedPinned));
    } catch (e) {
      // ignore
    }
  }, [isOpen]);

  // Track Page Visits Automatically
  useEffect(() => {
    if (!pathname || pathname === '/login') return;

    try {
      const routeNameMap: Record<string, { title: string; category: string }> = {
        '/dashboard': { title: 'Overview Dashboard', category: 'Dashboard' },
        '/dashboard/attendance': { title: 'Attendance Register', category: 'Academics' },
        '/dashboard/homework': { title: 'Homework & Assignments', category: 'Academics' },
        '/dashboard/exams': { title: 'Examinations & Marks', category: 'Academics' },
        '/dashboard/timetable': { title: 'Class Timetable', category: 'Academics' },
        '/dashboard/fees': { title: 'Fee Management', category: 'Finance' },
        '/dashboard/finance': { title: 'Accounting & Ledger', category: 'Finance' },
        '/dashboard/students': { title: 'Student Directory', category: 'Students' },
        '/dashboard/admissions': { title: 'Admissions CRM', category: 'Students' },
        '/dashboard/portfolio': { title: 'Student Achievements', category: 'Students' },
        '/dashboard/lifecycle': { title: 'School Lifecycle & Sessions', category: 'Students' },
        '/dashboard/hr': { title: 'Staff Directory & HR', category: 'Staff' },
        '/dashboard/transport': { title: 'School Transport Live', category: 'Campus' },
        '/dashboard/library': { title: 'Digital Library', category: 'Campus' },
        '/dashboard/campus-safety': { title: 'Campus Safety & Visitors', category: 'Campus' },
        '/dashboard/health': { title: 'Health Clinic', category: 'Campus' },
        '/dashboard/communication': { title: 'Communication Hub', category: 'Overview' },
        '/dashboard/events': { title: 'Events Calendar', category: 'Overview' },
        '/dashboard/question-bank': { title: 'Question Bank & Mocks', category: 'Academics' },
        '/dashboard/ai-learning': { title: 'AI Study Assistant', category: 'Academics' },
        '/dashboard/command-centre': { title: 'Principal Command Centre', category: 'Administration' },
        '/dashboard/settings': { title: 'School Configuration', category: 'Administration' },
        '/dashboard/reports': { title: 'Executive Reports', category: 'Administration' },
        '/dashboard/audit-logs': { title: 'System Audit Trail', category: 'Administration' },
      };

      const matched = routeNameMap[pathname] || {
        title: pathname.split('/').pop()?.replace(/-/g, ' ').toUpperCase() || 'Page',
        category: 'Module',
      };

      const currentStored = localStorage.getItem('edvonest_recent_pages');
      let currentList: RecentPage[] = currentStored ? JSON.parse(currentStored) : [];

      // Filter out duplicate of same URL and keep top 8
      currentList = [
        { title: matched.title, url: pathname, category: matched.category, timestamp: Date.now() },
        ...currentList.filter((p) => p.url !== pathname),
      ].slice(0, 8);

      localStorage.setItem('edvonest_recent_pages', JSON.stringify(currentList));
      setRecentPages(currentList);
    } catch (e) {
      // ignore
    }
  }, [pathname]);

  // Global Ctrl+K / Cmd+K Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto focus input on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced Live Search Query to /api/search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setSelectedIndex(0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  // Authorized Quick Actions for Current User Role
  const roleAuthorizedActions = useMemo(() => {
    return DEFAULT_ACTIONS.filter((action) => action.roles.includes(userRole));
  }, [userRole]);

  // Handle Item Selection / Activation
  const handleSelect = (item: SearchResultItem | RecentPage | (typeof DEFAULT_ACTIONS)[0]) => {
    setIsOpen(false);
    setQuery('');

    if ('quickActionKey' in item && item.quickActionKey) {
      triggerQuickAction(item.quickActionKey);
    } else {
      router.push(item.url);
    }
  };

  // Filter Active Display Items Based on Query and Selected Tab
  const displayItems = useMemo(() => {
    if (query.length >= 2) {
      if (activeTab === 'ALL') return results;
      if (activeTab === 'MODULES') return results.filter((r) => r.category === 'ERP Modules');
      if (activeTab === 'STUDENTS') return results.filter((r) => r.category === 'Students');
      if (activeTab === 'ACTIONS')
        return roleAuthorizedActions.filter(
          (a) =>
            a.title.toLowerCase().includes(query.toLowerCase()) ||
            a.subtitle.toLowerCase().includes(query.toLowerCase())
        );
      return results;
    }

    // Default view when query is empty:
    if (activeTab === 'ACTIONS') return roleAuthorizedActions;
    if (activeTab === 'RECENT')
      return recentPages.map((p) => ({
        id: p.url,
        title: p.title,
        subtitle: `Visited recently • ${p.category}`,
        category: 'Recent',
        url: p.url,
        icon: Clock,
      }));
    if (activeTab === 'MODULES')
      return [
        { id: 'mod-attendance', title: 'Attendance Register', subtitle: 'Classroom & staff attendance', category: 'ERP Modules', url: '/dashboard/attendance', icon: CalendarCheck },
        { id: 'mod-fees', title: 'Fee Management', subtitle: 'Fee collection & financial receipts', category: 'ERP Modules', url: '/dashboard/fees', icon: DollarSign },
        { id: 'mod-students', title: 'Student Directory', subtitle: 'Profiles & enrollment records', category: 'ERP Modules', url: '/dashboard/students', icon: GraduationCap },
        { id: 'mod-exams', title: 'Examinations & Marks', subtitle: 'Report cards & CBSE grading', category: 'ERP Modules', url: '/dashboard/exams', icon: FileCheck2 },
        { id: 'mod-homework', title: 'Homework & Assignments', subtitle: 'Homework tasks & submissions', category: 'ERP Modules', url: '/dashboard/homework', icon: ClipboardList },
        { id: 'mod-transport', title: 'School Transport', subtitle: 'Live GPS vehicle routes', category: 'ERP Modules', url: '/dashboard/transport', icon: Bus },
      ];

    // Combined default view: Quick Actions + Recent Pages
    return [
      ...roleAuthorizedActions.slice(0, 5),
      ...recentPages.slice(0, 3).map((p) => ({
        id: `rec-${p.url}`,
        title: p.title,
        subtitle: `Recently Visited • ${p.category}`,
        category: 'Recent',
        url: p.url,
        icon: Clock,
      })),
    ];
  }, [query, activeTab, results, roleAuthorizedActions, recentPages]);

  // Keyboard navigation within the command menu
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (displayItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (displayItems.length || 1)) % (displayItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (displayItems[selectedIndex]) {
        handleSelect(displayItems[selectedIndex]);
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ERP Modules':
        return <Layers className="w-4 h-4 text-[#086A92]" />;
      case 'Students':
        return <GraduationCap className="w-4 h-4 text-[#086A92]" />;
      case 'Teachers & Staff':
        return <Users className="w-4 h-4 text-[#008C91]" />;
      case 'Classes & Wings':
        return <BookOpen className="w-4 h-4 text-[#35B84A]" />;
      case 'Library Books':
        return <Library className="w-4 h-4 text-[#35B84A]" />;
      case 'Fee Invoices':
        return <DollarSign className="w-4 h-4 text-[#D97706]" />;
      case 'Quick Action':
        return <Zap className="w-4 h-4 text-[#086A92]" />;
      case 'AI Assistant':
      case 'AI Tool':
        return <Sparkles className="w-4 h-4 text-[#35B84A]" />;
      case 'Campus':
        return <Bus className="w-4 h-4 text-[#008C91]" />;
      case 'Recent':
        return <Clock className="w-4 h-4 text-[#6B7C83]" />;
      default:
        return <ArrowRight className="w-4 h-4 text-[#086A92]" />;
    }
  };

  return (
    <>
      {/* Desktop Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#F7FAFA] hover:bg-[#EAF5F8] border border-[#E4EAEC] hover:border-[#086A92] rounded-xl text-xs text-[#6B7C83] transition-all w-60 sm:w-68 justify-between select-none cursor-pointer shadow-2xs group"
        aria-label="Search or Quick Command"
      >
        <span className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-[#6B7C83] group-hover:text-[#086A92] transition-colors" />
          <span className="group-hover:text-[#17313A] transition-colors">Search or Command...</span>
        </span>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-[#E4EAEC] rounded text-[#17313A] font-mono shadow-2xs font-semibold">
            Ctrl K
          </kbd>
        </div>
      </button>

      {/* Mobile Search Trigger Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-[#6B7C83] hover:text-[#086A92] hover:bg-[#EAF5F8] rounded-xl border border-[#E4EAEC] transition-colors cursor-pointer"
        aria-label="Search or Quick Command"
        title="Search or Quick Command (Ctrl+K)"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Command Menu Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-16 p-3 sm:p-4 bg-[#17313A]/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Global Search and Quick Action Command Menu"
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E4EAEC] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Search Input Bar */}
            <div className="p-3.5 border-b border-[#E4EAEC] flex items-center gap-2.5 bg-[#F7FAFA]">
              <Search className="w-4 h-4 text-[#086A92] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search students, faculty, classes, modules, or launch actions..."
                className="w-full text-xs sm:text-sm bg-transparent border-none text-[#17313A] placeholder:text-[#6B7C83] focus:outline-none"
              />
              {loading && <Loader2 className="w-4 h-4 animate-spin text-[#086A92] shrink-0" />}
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-[#6B7C83] hover:text-[#17313A] rounded-md cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-[#E4EAEC] rounded text-[#6B7C83] font-mono">
                ESC
              </kbd>
            </div>

            {/* Filter Tabs Bar */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white border-b border-[#E4EAEC]/70 text-[11px] overflow-x-auto">
              <span className="text-[10px] font-bold uppercase text-[#6B7C83] mr-1 shrink-0">Filter:</span>
              {(['ALL', 'ACTIONS', 'RECENT', 'MODULES', 'STUDENTS'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSelectedIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? 'bg-[#086A92] text-white shadow-2xs'
                      : 'text-[#6B7C83] hover:bg-[#F7FAFA] hover:text-[#17313A]'
                  }`}
                >
                  {tab === 'ALL' && 'All Results'}
                  {tab === 'ACTIONS' && '⚡ Quick Actions'}
                  {tab === 'RECENT' && '🕒 Recent Pages'}
                  {tab === 'MODULES' && '📦 ERP Modules'}
                  {tab === 'STUDENTS' && '🎓 Students'}
                </button>
              ))}
            </div>

            {/* Results / Action Items List */}
            <div className="overflow-y-auto p-2 divide-y divide-[#E4EAEC]/50 max-h-[58vh]">
              {/* No matches state */}
              {query.length >= 2 && displayItems.length === 0 && !loading && (
                <div className="p-8 text-center text-xs text-[#6B7C83] space-y-2">
                  <p className="font-semibold text-[#17313A]">No matches found for &ldquo;{query}&rdquo;</p>
                  <p className="text-[11px]">
                    Try searching by student name, admission number, module keyword (e.g. &ldquo;fees&rdquo;, &ldquo;attendance&rdquo;) or class.
                  </p>
                </div>
              )}

              {/* Display items */}
              {displayItems.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#6B7C83]">
                    <span>
                      {query.length >= 2
                        ? `Search Results (${displayItems.length})`
                        : activeTab === 'RECENT'
                        ? 'Recently Visited Pages'
                        : activeTab === 'ACTIONS'
                        ? 'Quick Action Launcher'
                        : 'Suggested Actions & Recent Pages'}
                    </span>
                    <span className="font-mono text-[9px] lowercase">use &uarr;&darr; + enter</span>
                  </div>

                  {displayItems.map((item, idx) => {
                    const isSelected = selectedIndex === idx;
                    const isPinned = pinnedHrefs.includes(item.url);
                    const CustomIcon = 'icon' in item && item.icon ? item.icon : null;

                    return (
                      <button
                        key={`${('id' in item && item.id) ? item.id : item.url}-${idx}`}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-all group cursor-pointer ${
                          isSelected ? 'bg-[#EAF5F8] text-[#086A92]' : 'hover:bg-[#F7FAFA]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-lg transition-colors shrink-0 ${
                              isSelected
                                ? 'bg-white shadow-2xs text-[#086A92]'
                                : 'bg-[#F1F5F7] text-[#6B7C83]'
                            }`}
                          >
                            {CustomIcon ? (
                              <CustomIcon className="w-4 h-4" />
                            ) : (
                              getCategoryIcon(item.category)
                            )}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-[#17313A] truncate">
                                {item.title}
                              </p>
                              {isPinned && (
                                <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-[#6B7C83] truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                            {item.category}
                          </span>
                          {isSelected ? (
                            <CornerDownLeft className="w-3.5 h-3.5 text-[#086A92]" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5 text-[#6B7C83] group-hover:text-[#086A92] transition-colors" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Keyboard Shortcut Hint Footer */}
            <div className="p-2.5 bg-[#F7FAFA] border-t border-[#E4EAEC] flex items-center justify-between text-[11px] text-[#6B7C83] px-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-[#E4EAEC] rounded text-[10px] font-mono">↑↓</kbd>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-[#E4EAEC] rounded text-[10px] font-mono">↵</kbd>
                  <span>select / launch</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-[#E4EAEC] rounded text-[10px] font-mono">esc</kbd>
                  <span>close</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#086A92] font-semibold">
                <Zap className="w-3 h-3 text-[#35B84A]" />
                <span>EdvoNest Instant Command</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
