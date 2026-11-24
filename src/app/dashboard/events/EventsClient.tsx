'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Trophy,
  Sparkles,
  Camera,
  BookOpen,
  GraduationCap,
  Coffee,
  Bell,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Download,
  Edit3,
  Trash2,
  Plus,
  X,
  Layers,
  Repeat,
  AlertCircle,
  Eye,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/formatters';

export type CalendarCategory =
  | 'ALL'
  | 'HOLIDAY'
  | 'ACADEMIC'
  | 'EXAMINATION'
  | 'HOMEWORK'
  | 'PTM'
  | 'EVENT'
  | 'SPORTS'
  | 'STAFF_LEAVE'
  | 'TIMETABLE'
  | 'ADMISSION';

export interface UnifiedCalendarItem {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO
  endDate?: string;   // ISO
  category: CalendarCategory;
  categoryLabel: string;
  color: string;
  bgLight: string;
  textDark: string;
  borderClass: string;
  badgeVariant: 'slate' | 'green' | 'emerald' | 'teal' | 'blue' | 'amber' | 'rose' | 'indigo' | 'purple';
  venue?: string;
  targetRole: string; // 'ALL' | 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN'
  classId?: string | null;
  className?: string | null;
  sectionId?: string | null;
  sectionName?: string | null;
  isRecurring?: boolean;
  recurrencePattern?: string | null;
  reminderMinutes?: number;
  sourceType: 'EVENT' | 'EXAM' | 'HOMEWORK' | 'PTM' | 'LEAVE' | 'TIMETABLE';
  sourceId: string;
  link?: string;
  rawEvent?: any;
}

const CATEGORY_META: Record<
  string,
  {
    label: string;
    color: string;
    bgLight: string;
    textDark: string;
    borderClass: string;
    badgeVariant: 'slate' | 'green' | 'emerald' | 'teal' | 'blue' | 'amber' | 'rose' | 'indigo' | 'purple';
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  HOLIDAY: {
    label: 'School Holiday',
    color: '#DC2626',
    bgLight: 'bg-red-50',
    textDark: 'text-red-700',
    borderClass: 'border-red-200',
    badgeVariant: 'rose',
    icon: Coffee,
  },
  ACADEMIC: {
    label: 'Academic Event',
    color: '#990000',
    bgLight: 'bg-sky-50',
    textDark: 'text-[#990000]',
    borderClass: 'border-sky-200',
    badgeVariant: 'blue',
    icon: GraduationCap,
  },
  EXAMINATION: {
    label: 'Examination',
    color: '#7C3AED',
    bgLight: 'bg-purple-50',
    textDark: 'text-purple-700',
    borderClass: 'border-purple-200',
    badgeVariant: 'purple',
    icon: Sparkles,
  },
  HOMEWORK: {
    label: 'Homework Deadline',
    color: '#D97706',
    bgLight: 'bg-amber-50',
    textDark: 'text-amber-800',
    borderClass: 'border-amber-200',
    badgeVariant: 'amber',
    icon: BookOpen,
  },
  PTM: {
    label: 'Parent-Teacher Meeting',
    color: '#4F46E5',
    bgLight: 'bg-indigo-50',
    textDark: 'text-indigo-700',
    borderClass: 'border-indigo-200',
    badgeVariant: 'indigo',
    icon: Users,
  },
  SPORTS: {
    label: 'Sports & Athletics',
    color: '#16A34A',
    bgLight: 'bg-emerald-50',
    textDark: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    badgeVariant: 'emerald',
    icon: Trophy,
  },
  EVENT: {
    label: 'Campus Event',
    color: '#C00000',
    bgLight: 'bg-teal-50',
    textDark: 'text-teal-700',
    borderClass: 'border-teal-200',
    badgeVariant: 'teal',
    icon: CalendarDays,
  },
  STAFF_LEAVE: {
    label: 'Staff Leave',
    color: '#64748B',
    bgLight: 'bg-slate-100',
    textDark: 'text-slate-700',
    borderClass: 'border-slate-300',
    badgeVariant: 'slate',
    icon: Clock,
  },
  TIMETABLE: {
    label: 'Class Schedule',
    color: '#0284C7',
    bgLight: 'bg-blue-50',
    textDark: 'text-blue-700',
    borderClass: 'border-blue-200',
    badgeVariant: 'blue',
    icon: Clock,
  },
  ADMISSION: {
    label: 'Admission Event',
    color: '#DB2777',
    bgLight: 'bg-pink-50',
    textDark: 'text-pink-700',
    borderClass: 'border-pink-200',
    badgeVariant: 'rose',
    icon: Bell,
  },
};

export const EventsClient: React.FC<{
  initialEvents: any[];
  initialExams?: any[];
  initialHomework?: any[];
  initialPtm?: any[];
  initialLeaves?: any[];
  initialTimetable?: any[];
  classes: any[];
  students: any[];
  currentUser: any;
}> = ({
  initialEvents = [],
  initialExams = [],
  initialHomework = [],
  initialPtm = [],
  initialLeaves = [],
  initialTimetable = [],
  classes = [],
  students = [],
  currentUser,
}) => {
  const userRole = currentUser?.role || 'STUDENT';
  const isAdmin = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(userRole);
  const isTeacher = ['TEACHER', 'CLASS_TEACHER'].includes(userRole);
  const canManageEvents = isAdmin || isTeacher;

  // Active top tab
  const [activeTab, setActiveTab] = useState('calendar');

  // Master events state (for dynamic updates without reload)
  const [events, setEvents] = useState<any[]>(initialEvents);
  const [exams] = useState<any[]>(initialExams);
  const [homework] = useState<any[]>(initialHomework);
  const [ptm] = useState<any[]>(initialPtm);
  const [leaves] = useState<any[]>(initialLeaves);
  const [timetable] = useState<any[]>(initialTimetable);

  // Calendar View Switcher
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');

  // Current anchor date (defaults to November 18, 2026 or active date)
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // If today is late 2026 or current, use current date
    return new Date();
  });

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<CalendarCategory>('ALL');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedAudience, setSelectedAudience] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Selected event for Detail / Edit / Delete / Registration
  const [selectedItem, setSelectedItem] = useState<UnifiedCalendarItem | null>(null);
  const [selectedEventForReg, setSelectedEventForReg] = useState<any | null>(null);

  // Action status / Loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Event form state
  const [eventForm, setEventForm] = useState({
    id: '',
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '15:00',
    venue: 'School Auditorium',
    category: 'EVENT' as CalendarCategory,
    classId: 'ALL',
    sectionId: 'ALL',
    targetRole: 'ALL',
    isRecurring: false,
    recurrencePattern: 'WEEKLY',
    reminderMinutes: 30,
    color: '#990000',
  });

  // Student Registration form
  const [registerForm, setRegisterForm] = useState({
    studentId: students[0]?.id || '',
    roleOrCategory: 'General Participant',
    parentConsentGiven: true,
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ----------------------------------------------------
  // NORMALIZE ALL DATA FEEDS INTO UNIFIED CALENDAR ITEMS
  // ----------------------------------------------------
  const allCalendarItems: UnifiedCalendarItem[] = useMemo(() => {
    const items: UnifiedCalendarItem[] = [];

    // 1. School Events
    events.forEach((ev) => {
      let cat: CalendarCategory = (ev.category as CalendarCategory) || 'EVENT';
      if (!CATEGORY_META[cat]) {
        // Fallback detection from title
        if (/holiday|diwali|eid|christmas|parv|break|vacation/i.test(ev.title)) cat = 'HOLIDAY';
        else if (/sport|athletic|race|relay|match|cricket|football/i.test(ev.title)) cat = 'SPORTS';
        else if (/admission|open house|enrol/i.test(ev.title)) cat = 'ADMISSION';
        else if (/exam|test|pre-board|mock/i.test(ev.title)) cat = 'EXAMINATION';
        else if (/ptm|parent.*teacher|conference/i.test(ev.title)) cat = 'PTM';
        else cat = 'EVENT';
      }

      const meta = CATEGORY_META[cat] || CATEGORY_META.EVENT;
      items.push({
        id: `event-${ev.id}`,
        sourceId: ev.id,
        sourceType: 'EVENT',
        title: ev.title,
        description: ev.description || '',
        startDate: new Date(ev.startDate).toISOString(),
        endDate: ev.endDate ? new Date(ev.endDate).toISOString() : new Date(ev.startDate).toISOString(),
        category: cat,
        categoryLabel: meta.label,
        color: ev.color || meta.color,
        bgLight: meta.bgLight,
        textDark: meta.textDark,
        borderClass: meta.borderClass,
        badgeVariant: meta.badgeVariant,
        venue: ev.venue || 'Campus Auditorium',
        targetRole: ev.targetRole || 'ALL',
        classId: ev.classId,
        sectionId: ev.sectionId,
        isRecurring: Boolean(ev.isRecurring),
        recurrencePattern: ev.recurrencePattern,
        reminderMinutes: ev.reminderMinutes || 30,
        rawEvent: ev,
      });
    });

    // 2. Exam Schedules
    exams.forEach((ex) => {
      const meta = CATEGORY_META.EXAMINATION;
      const title = ex.exam?.title
        ? `${ex.exam.title}: ${ex.subject?.name || 'Subject'}`
        : `Exam: ${ex.subject?.name || 'Subject'}`;
      items.push({
        id: `exam-${ex.id}`,
        sourceId: ex.id,
        sourceType: 'EXAM',
        title,
        description: `Max Marks: ${ex.maxMarks} • Pass Marks: ${ex.passMarks}. Strictly follow CBSE examination seating guidelines.`,
        startDate: new Date(ex.examDate).toISOString(),
        endDate: new Date(ex.examDate).toISOString(),
        category: 'EXAMINATION',
        categoryLabel: meta.label,
        color: meta.color,
        bgLight: meta.bgLight,
        textDark: meta.textDark,
        borderClass: meta.borderClass,
        badgeVariant: meta.badgeVariant,
        venue: 'Examination Hall Wing A',
        targetRole: 'STUDENT',
        link: '/dashboard/examinations',
      });
    });

    // 3. Homework Deadlines
    homework.forEach((hw) => {
      const meta = CATEGORY_META.HOMEWORK;
      const className = hw.class?.name || 'Class';
      const sectionName = hw.section?.name ? `-${hw.section.name}` : '';
      items.push({
        id: `hw-${hw.id}`,
        sourceId: hw.id,
        sourceType: 'HOMEWORK',
        title: `HW Due: ${hw.title}`,
        description: `${hw.subject?.name || 'Subject'} (${className}${sectionName}): ${hw.description}`,
        startDate: new Date(hw.dueDate).toISOString(),
        endDate: new Date(hw.dueDate).toISOString(),
        category: 'HOMEWORK',
        categoryLabel: meta.label,
        color: meta.color,
        bgLight: meta.bgLight,
        textDark: meta.textDark,
        borderClass: meta.borderClass,
        badgeVariant: meta.badgeVariant,
        venue: 'Online / Homework Portal',
        targetRole: 'STUDENT',
        classId: hw.classId,
        className: hw.class?.name,
        sectionId: hw.sectionId,
        sectionName: hw.section?.name,
        link: '/dashboard/homework',
      });
    });

    // 4. PTM Bookings
    ptm.forEach((p) => {
      const meta = CATEGORY_META.PTM;
      const parentName = p.parent?.user
        ? `${p.parent.user.firstName} ${p.parent.user.lastName || ''}`.trim()
        : 'Parent';
      const teacherName = p.teacher?.user
        ? `${p.teacher.user.firstName} ${p.teacher.user.lastName || ''}`.trim()
        : 'Teacher';
      items.push({
        id: `ptm-${p.id}`,
        sourceId: p.id,
        sourceType: 'PTM',
        title: `PTM: ${parentName} & ${teacherName}`,
        description: `Slot: ${p.timeSlot || 'Scheduled Time'} • Mode: ${p.meetingMode || 'In Person'} • Notes: ${p.notes || 'Academic review'}`,
        startDate: new Date(p.scheduledDate).toISOString(),
        endDate: new Date(p.scheduledDate).toISOString(),
        category: 'PTM',
        categoryLabel: meta.label,
        color: meta.color,
        bgLight: meta.bgLight,
        textDark: meta.textDark,
        borderClass: meta.borderClass,
        badgeVariant: meta.badgeVariant,
        venue: p.meetingMode === 'ONLINE' ? 'Virtual Google Meet' : 'Teacher Conference Room',
        targetRole: 'PARENT',
        link: '/dashboard/ptm',
      });
    });

    // 5. Staff Leaves (Hidden from Students and Parents)
    if (isAdmin || isTeacher) {
      leaves.forEach((l) => {
        const meta = CATEGORY_META.STAFF_LEAVE;
        const staffName = l.teacher?.user
          ? `${l.teacher.user.firstName} ${l.teacher.user.lastName || ''}`.trim()
          : l.staff?.user
          ? `${l.staff.user.firstName} ${l.staff.user.lastName || ''}`.trim()
          : 'Staff Member';
        items.push({
          id: `leave-${l.id}`,
          sourceId: l.id,
          sourceType: 'LEAVE',
          title: `Staff Leave: ${staffName} (${l.leaveType})`,
          description: `Reason: ${l.reason || 'Personal / Academic duty'} • Approved by: ${l.approvedBy || 'Principal'}`,
          startDate: new Date(l.startDate).toISOString(),
          endDate: l.endDate ? new Date(l.endDate).toISOString() : new Date(l.startDate).toISOString(),
          category: 'STAFF_LEAVE',
          categoryLabel: meta.label,
          color: meta.color,
          bgLight: meta.bgLight,
          textDark: meta.textDark,
          borderClass: meta.borderClass,
          badgeVariant: meta.badgeVariant,
          venue: 'Off Duty',
          targetRole: 'TEACHER',
          link: '/dashboard/staff/leaves',
        });
      });
    }

    return items;
  }, [events, exams, homework, ptm, leaves, isAdmin, isTeacher]);

  // ----------------------------------------------------
  // FILTERED CALENDAR ITEMS
  // ----------------------------------------------------
  const filteredItems = useMemo(() => {
    return allCalendarItems.filter((item) => {
      // 1. Category Filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      // 2. Class Filter
      if (selectedClassId !== 'ALL') {
        // If event is class-specific and doesn't match
        if (item.classId && item.classId !== selectedClassId) {
          return false;
        }
      }

      // 3. Audience / Role Filter
      if (selectedAudience !== 'ALL') {
        if (item.targetRole !== 'ALL' && item.targetRole !== selectedAudience) {
          return false;
        }
      }

      // 4. Role Guard for Non-Admins: Students/Parents shouldn't see staff leaves
      if (!isAdmin && !isTeacher) {
        if (item.category === 'STAFF_LEAVE') return false;
        if (item.targetRole === 'TEACHER' || item.targetRole === 'ADMIN') return false;
      }

      // 5. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesVenue = (item.venue || '').toLowerCase().includes(q);
        const matchesCat = item.categoryLabel.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesVenue && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [allCalendarItems, selectedCategory, selectedClassId, selectedAudience, searchQuery, isAdmin, isTeacher]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: allCalendarItems.length };
    allCalendarItems.forEach((it) => {
      counts[it.category] = (counts[it.category] || 0) + 1;
    });
    return counts;
  }, [allCalendarItems]);

  // Total stats
  const totalParticipants = events.reduce((acc, e) => acc + (e.participants?.length || 0), 0);
  const totalGallery = events.reduce((acc, e) => acc + (e.gallery?.length || 0), 0);

  // ----------------------------------------------------
  // DATE NAVIGATION LOGIC
  // ----------------------------------------------------
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed
  const currentDay = currentDate.getDate();

  const handlePrev = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (calendarView === 'month') {
        d.setMonth(d.getMonth() - 1);
      } else if (calendarView === 'week') {
        d.setDate(d.getDate() - 7);
      } else if (calendarView === 'day') {
        d.setDate(d.getDate() - 1);
      } else {
        d.setMonth(d.getMonth() - 1);
      }
      return d;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (calendarView === 'month') {
        d.setMonth(d.getMonth() + 1);
      } else if (calendarView === 'week') {
        d.setDate(d.getDate() + 7);
      } else if (calendarView === 'day') {
        d.setDate(d.getDate() + 1);
      } else {
        d.setMonth(d.getMonth() + 1);
      }
      return d;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month Grid Calculation
  const monthGridDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon ...
    const daysInMonth = lastDayOfMonth.getDate();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      items: UnifiedCalendarItem[];
    }> = [];

    // Prev month overflow days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: isSameDate(d, new Date()),
        items: getItemsForDate(filteredItems, d),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(currentYear, currentMonth, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: isSameDate(d, new Date()),
        items: getItemsForDate(filteredItems, d),
      });
    }

    // Next month overflow days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: isSameDate(d, new Date()),
        items: getItemsForDate(filteredItems, d),
      });
    }

    return days;
  }, [currentYear, currentMonth, filteredItems]);

  // Week Grid Calculation (Sunday to Saturday of active week)
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const dayOfWeek = d.getDay();
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - dayOfWeek);

    const days: Array<{
      date: Date;
      isToday: boolean;
      items: UnifiedCalendarItem[];
    }> = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      days.push({
        date: day,
        isToday: isSameDate(day, new Date()),
        items: getItemsForDate(filteredItems, day),
      });
    }

    return days;
  }, [currentDate, filteredItems]);

  // Helper date checker
  function isSameDate(d1: Date, d2: Date) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  function getItemsForDate(items: UnifiedCalendarItem[], d: Date) {
    const dateStr = d.toISOString().split('T')[0];
    return items.filter((it) => {
      const startStr = it.startDate.split('T')[0];
      const endStr = it.endDate ? it.endDate.split('T')[0] : startStr;
      return dateStr >= startStr && dateStr <= endStr;
    });
  }

  // Header Title Formatter
  const viewTitle = useMemo(() => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    if (calendarView === 'month') {
      return `${monthNames[currentMonth]} ${currentYear}`;
    }

    if (calendarView === 'week') {
      const first = weekDays[0]?.date;
      const last = weekDays[6]?.date;
      if (!first || !last) return '';
      return `${first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${last.toLocaleDateString(
        'en-US',
        { month: 'short', day: 'numeric', year: 'numeric' }
      )}`;
    }

    if (calendarView === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }

    return `Schedule & Agenda • ${monthNames[currentMonth]} ${currentYear}`;
  }, [calendarView, currentMonth, currentYear, currentDate, weekDays]);

  // ----------------------------------------------------
  // ICALENDAR (.ICS) EXPORT FOR PERSONAL SYNC
  // ----------------------------------------------------
  const handleExportIcs = (item: UnifiedCalendarItem) => {
    try {
      const start = new Date(item.startDate).toISOString().replace(/[-:]|\.\d{3}/g, '');
      const end = item.endDate
        ? new Date(item.endDate).toISOString().replace(/[-:]|\.\d{3}/g, '')
        : start;

      const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//EdvoNest School ERP//Interactive Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${item.id}@edvonest-academy.edu.in`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d{3}/g, '')}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${item.title.replace(/[,;]/g, ' ')}`,
        `DESCRIPTION:${(item.description || '').replace(/\n/g, '\\n')}`,
        `LOCATION:${item.venue || 'Campus Auditorium'}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${item.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Calendar event exported (.ics) successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to export event', 'error');
    }
  };

  // ----------------------------------------------------
  // EVENT CRUD HANDLERS
  // ----------------------------------------------------
  const handleOpenCreateModal = (presetDate?: Date) => {
    const dStr = presetDate
      ? presetDate.toISOString().split('T')[0]
      : currentDate.toISOString().split('T')[0];

    setEventForm({
      id: '',
      title: '',
      description: '',
      startDate: dStr,
      startTime: '09:00',
      endDate: dStr,
      endTime: '15:00',
      venue: 'School Auditorium',
      category: 'EVENT',
      classId: 'ALL',
      sectionId: 'ALL',
      targetRole: 'ALL',
      isRecurring: false,
      recurrencePattern: 'WEEKLY',
      reminderMinutes: 30,
      color: '#990000',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (item: UnifiedCalendarItem) => {
    if (item.sourceType !== 'EVENT' || !item.rawEvent) {
      showToast('Only custom campus events can be edited directly here.', 'error');
      return;
    }
    const raw = item.rawEvent;
    const sDate = new Date(raw.startDate);
    const eDate = raw.endDate ? new Date(raw.endDate) : sDate;

    setEventForm({
      id: raw.id,
      title: raw.title,
      description: raw.description || '',
      startDate: sDate.toISOString().split('T')[0],
      startTime: sDate.toTimeString().slice(0, 5) || '09:00',
      endDate: eDate.toISOString().split('T')[0],
      endTime: eDate.toTimeString().slice(0, 5) || '15:00',
      venue: raw.venue || 'School Auditorium',
      category: (raw.category as CalendarCategory) || 'EVENT',
      classId: raw.classId || 'ALL',
      sectionId: raw.sectionId || 'ALL',
      targetRole: raw.targetRole || 'ALL',
      isRecurring: Boolean(raw.isRecurring),
      recurrencePattern: raw.recurrencePattern || 'WEEKLY',
      reminderMinutes: raw.reminderMinutes || 30,
      color: raw.color || '#990000',
    });

    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) {
      showToast('Event title is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const startDateTime = new Date(`${eventForm.startDate}T${eventForm.startTime || '09:00'}:00`);
      const endDateTime = new Date(`${eventForm.endDate}T${eventForm.endTime || '15:00'}:00`);

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_EVENT',
          title: eventForm.title,
          description: eventForm.description,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          venue: eventForm.venue,
          category: eventForm.category,
          classId: eventForm.classId === 'ALL' ? null : eventForm.classId,
          sectionId: eventForm.sectionId === 'ALL' ? null : eventForm.sectionId,
          targetRole: eventForm.targetRole,
          isRecurring: eventForm.isRecurring,
          recurrencePattern: eventForm.recurrencePattern,
          reminderMinutes: Number(eventForm.reminderMinutes),
          color: eventForm.color,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create event');

      setEvents((prev) => [...prev, data.event]);
      setIsCreateModalOpen(false);
      showToast(`Event "${eventForm.title}" scheduled and broadcasted!`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error creating event', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.id) return;

    setIsSubmitting(true);
    try {
      const startDateTime = new Date(`${eventForm.startDate}T${eventForm.startTime || '09:00'}:00`);
      const endDateTime = new Date(`${eventForm.endDate}T${eventForm.endTime || '15:00'}:00`);

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_EVENT',
          eventId: eventForm.id,
          title: eventForm.title,
          description: eventForm.description,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          venue: eventForm.venue,
          category: eventForm.category,
          classId: eventForm.classId === 'ALL' ? null : eventForm.classId,
          sectionId: eventForm.sectionId === 'ALL' ? null : eventForm.sectionId,
          targetRole: eventForm.targetRole,
          isRecurring: eventForm.isRecurring,
          recurrencePattern: eventForm.recurrencePattern,
          reminderMinutes: Number(eventForm.reminderMinutes),
          color: eventForm.color,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update event');

      setEvents((prev) => prev.map((ev) => (ev.id === eventForm.id ? data.event : ev)));
      setIsEditModalOpen(false);
      showToast(`Updated "${eventForm.title}" successfully.`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error updating event', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedItem || selectedItem.sourceType !== 'EVENT') return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_EVENT',
          eventId: selectedItem.sourceId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete event');

      setEvents((prev) => prev.filter((ev) => ev.id !== selectedItem.sourceId));
      setIsDeleteModalOpen(false);
      setIsDetailModalOpen(false);
      setSelectedItem(null);
      showToast('Event removed from institutional calendar.');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error deleting event', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForReg) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REGISTER_STUDENT',
          eventId: selectedEventForReg.id,
          ...registerForm,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register student');

      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === selectedEventForReg.id
            ? { ...ev, participants: [...(ev.participants || []), data.registration] }
            : ev
        )
      );

      setIsRegisterModalOpen(false);
      setSelectedEventForReg(null);
      showToast('Student registered with verified parental consent!');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemClick = (item: UnifiedCalendarItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  // Top Tabs
  const tabs: TabItem[] = [
    {
      id: 'calendar',
      label: 'Institutional Master Calendar & Schedule',
      count: filteredItems.length,
      icon: <CalendarDays className="w-4 h-4 text-[#990000]" />,
    },
    {
      id: 'participants',
      label: 'Student Event Roster & Participation',
      count: totalParticipants,
      icon: <Users className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'gallery',
      label: 'Event Photo & Media Galleries',
      count: totalGallery,
      icon: <Camera className="w-4 h-4 text-purple-600" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-[#990000]" />
              <span>Unified Institutional Calendar</span>
            </h2>
            <Badge variant="emerald" size="sm">
              Live Integrated Schedule
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Integrated school holidays, exams, homework deadlines, parent-teacher conferences, athletic meets, and academic events.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {canManageEvents && (
            <Button
              size="sm"
              variant="primary"
              className="bg-[#990000] hover:bg-[#800000] text-white flex items-center gap-1.5 shadow-2xs"
              onClick={() => handleOpenCreateModal()}
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Event</span>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Integrated Calendar Items"
          value={filteredItems.length}
          change="Across all categories"
          trend="neutral"
          icon={<CalendarDays className="w-5 h-5 text-[#990000]" />}
        />
        <StatCard
          title="Exams & Homework Deadlines"
          value={(categoryCounts.EXAMINATION || 0) + (categoryCounts.HOMEWORK || 0)}
          change="Academic evaluations"
          trend="up"
          icon={<GraduationCap className="w-5 h-5 text-purple-600" />}
        />
        <StatCard
          title="Gazetted School Holidays"
          value={categoryCounts.HOLIDAY || 0}
          change="Campus closures noted"
          trend="neutral"
          icon={<Coffee className="w-5 h-5 text-rose-600" />}
        />
        <StatCard
          title="Student Participations"
          value={totalParticipants}
          change="Consent-verified roster"
          trend="up"
          icon={<Users className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Main Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          {/* Controls Bar: Search, Category Chips, Views, Date Navigator */}
          <Card className="p-4 space-y-4">
            {/* Row 1: Date Navigator & View Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              {/* Date Nav (Prev / Next / Today / Current Title) */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous Period"
                    className="p-1.5 rounded-md hover:bg-white text-slate-700 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleToday}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-white rounded-md transition"
                  >
                    Today
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next Period"
                    className="p-1.5 rounded-md hover:bg-white text-slate-700 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {viewTitle}
                </h3>
              </div>

              {/* View Mode Toggle: Month | Week | Day | Agenda */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 self-start md:self-auto">
                <button
                  onClick={() => setCalendarView('month')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    calendarView === 'month'
                      ? 'bg-white text-[#990000] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setCalendarView('week')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    calendarView === 'week'
                      ? 'bg-white text-[#990000] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setCalendarView('day')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    calendarView === 'day'
                      ? 'bg-white text-[#990000] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setCalendarView('agenda')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    calendarView === 'agenda'
                      ? 'bg-white text-[#990000] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Agenda
                </button>
              </div>
            </div>

            {/* Row 2: Category Filter Chips with counts & color dots */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition flex items-center gap-1.5 border ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#990000] text-white border-[#990000]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {allCalendarItems.length}
                </span>
              </button>

              {(Object.keys(CATEGORY_META) as CalendarCategory[]).map((catKey) => {
                const meta = CATEGORY_META[catKey];
                const count = categoryCounts[catKey] || 0;
                const isSelected = selectedCategory === catKey;

                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCategory(catKey)}
                    className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span>{meta.label}</span>
                    {count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Row 3: Class Filter, Audience Filter & Search Input */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter events, subjects, venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#990000] outline-none transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Class Filter */}
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#990000] outline-none text-slate-700 transition"
              >
                <option value="ALL">All Academic Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Audience Filter */}
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#990000] outline-none text-slate-700 transition"
              >
                <option value="ALL">All Target Audiences</option>
                <option value="STUDENT">Students &amp; Learners</option>
                <option value="PARENT">Parents &amp; Guardians</option>
                <option value="TEACHER">Faculty &amp; Staff</option>
              </select>
            </div>
          </Card>

          {/* VIEW RENDERERS */}

          {/* 1. MONTH VIEW */}
          {calendarView === 'month' && (
            <Card className="overflow-hidden border border-slate-200 shadow-2xs">
              {/* Day header row */}
              <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <span className="text-rose-600">Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* 7-column calendar grid */}
              <div className="grid grid-cols-7 border-b border-slate-200 divide-x divide-y divide-slate-100 bg-slate-100">
                {monthGridDays.map((cell, idx) => {
                  const hasEvents = cell.items.length > 0;
                  const dayNum = cell.date.getDate();

                  return (
                    <div
                      key={idx}
                      className={`min-h-[110px] sm:min-h-[125px] p-1.5 sm:p-2 bg-white transition flex flex-col justify-between ${
                        !cell.isCurrentMonth ? 'bg-slate-50/60 text-slate-400' : 'text-slate-800'
                      } ${cell.isToday ? 'bg-sky-50/40 ring-1 ring-inset ring-[#990000]' : ''}`}
                    >
                      {/* Top bar of date cell */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                            cell.isToday
                              ? 'bg-[#990000] text-white font-bold shadow-2xs'
                              : cell.isCurrentMonth
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {dayNum}
                        </span>

                        {canManageEvents && cell.isCurrentMonth && (
                          <button
                            onClick={() => handleOpenCreateModal(cell.date)}
                            title="Schedule event on this day"
                            className="opacity-0 hover:opacity-100 p-0.5 text-slate-400 hover:text-[#990000] transition rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Event chips inside day cell */}
                      <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[85px] scrollbar-none">
                        {cell.items.slice(0, 3).map((item) => {
                          const meta = CATEGORY_META[item.category] || CATEGORY_META.EVENT;
                          const Icon = meta.icon;

                          return (
                            <button
                              key={item.id}
                              onClick={() => handleItemClick(item)}
                              title={`${item.title} (${item.categoryLabel})`}
                              className={`w-full text-left px-1.5 py-0.5 rounded text-[11px] font-medium border truncate flex items-center gap-1 transition shadow-2xs ${item.bgLight} ${item.textDark} ${item.borderClass} hover:brightness-95`}
                            >
                              <Icon className="w-2.5 h-2.5 shrink-0 opacity-80" />
                              <span className="truncate">{item.title}</span>
                            </button>
                          );
                        })}

                        {cell.items.length > 3 && (
                          <button
                            onClick={() => {
                              setCurrentDate(cell.date);
                              setCalendarView('day');
                            }}
                            className="w-full text-left text-[10px] font-bold text-[#990000] hover:underline px-1"
                          >
                            +{cell.items.length - 3} more events
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* 2. WEEK VIEW */}
          {calendarView === 'week' && (
            <Card className="overflow-hidden border border-slate-200 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                {weekDays.map((dayCol, idx) => {
                  const dayNum = dayCol.date.getDate();
                  const weekdayName = dayCol.date.toLocaleDateString('en-US', { weekday: 'short' });

                  return (
                    <div
                      key={idx}
                      className={`min-h-[380px] p-3 flex flex-col bg-white ${
                        dayCol.isToday ? 'bg-sky-50/20' : ''
                      }`}
                    >
                      {/* Day Header */}
                      <div
                        className={`text-center pb-2 mb-3 border-b ${
                          dayCol.isToday ? 'border-[#990000]' : 'border-slate-100'
                        }`}
                      >
                        <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block">
                          {weekdayName}
                        </span>
                        <span
                          className={`text-base font-bold inline-block rounded-full px-2 py-0.5 mt-0.5 ${
                            dayCol.isToday ? 'bg-[#990000] text-white' : 'text-slate-800'
                          }`}
                        >
                          {dayNum}
                        </span>
                      </div>

                      {/* Events Column */}
                      <div className="space-y-2 flex-1 overflow-y-auto">
                        {dayCol.items.length === 0 ? (
                          <p className="text-[11px] text-slate-400 text-center italic mt-6">
                            No scheduled items
                          </p>
                        ) : (
                          dayCol.items.map((item) => {
                            const meta = CATEGORY_META[item.category] || CATEGORY_META.EVENT;
                            const Icon = meta.icon;

                            return (
                              <div
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition hover:shadow-sm ${item.bgLight} ${item.borderClass}`}
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Icon className="w-3 h-3 text-slate-700 shrink-0" />
                                  <span
                                    className="text-[10px] font-bold uppercase tracking-wider truncate"
                                    style={{ color: meta.color }}
                                  >
                                    {meta.label}
                                  </span>
                                </div>
                                <h5 className={`font-semibold text-xs leading-snug line-clamp-2 ${item.textDark}`}>
                                  {item.title}
                                </h5>
                                {item.venue && (
                                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 truncate">
                                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">{item.venue}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* 3. DAY VIEW */}
          {calendarView === 'day' && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Schedule for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Hourly timetable breakdown, scheduled evaluations, and campus notices.
                  </p>
                </div>
                {canManageEvents && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[#990000]"
                    onClick={() => handleOpenCreateModal(currentDate)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Entry
                  </Button>
                )}
              </div>

              {/* Day items list */}
              {(() => {
                const dayItems = getItemsForDate(filteredItems, currentDate);

                if (dayItems.length === 0) {
                  return (
                    <EmptyState
                      illustration="no-events"
                      title="Clear Schedule for this Day"
                      description="No classes, examinations, or extracurricular activities scheduled for this date."
                      actionLabel="Schedule Event"
                      onAction={() => handleOpenCreateModal(currentDate)}
                    />
                  );
                }

                return (
                  <div className="space-y-3">
                    {dayItems.map((item) => {
                      const meta = CATEGORY_META[item.category] || CATEGORY_META.EVENT;
                      const Icon = meta.icon;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:shadow-sm transition ${item.bgLight} ${item.borderClass}`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                              style={{ backgroundColor: meta.color, color: '#fff' }}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant={item.badgeVariant} size="sm">
                                  {meta.label}
                                </Badge>
                                {item.targetRole && item.targetRole !== 'ALL' && (
                                  <Badge variant="slate" size="sm">
                                    Audience: {item.targetRole}
                                  </Badge>
                                )}
                                {item.isRecurring && (
                                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                                    <Repeat className="w-3 h-3 text-cyan-600" /> Recurring
                                  </span>
                                )}
                              </div>
                              <h5 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h5>
                              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{item.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-600 shrink-0 self-end sm:self-auto">
                            {item.venue && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#990000]" />
                                <span>{item.venue}</span>
                              </div>
                            )}
                            <Button size="xs" variant="outline" className="bg-white text-slate-700">
                              <Eye className="w-3 h-3 mr-1" /> View Details
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </Card>
          )}

          {/* 4. AGENDA VIEW */}
          {calendarView === 'agenda' && (
            <Card className="p-5 space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Chronological Agenda &amp; Deadlines</h4>
                  <p className="text-xs text-slate-500">Upcoming deadlines, exams, and institutional events.</p>
                </div>
                <Badge variant="blue">{filteredItems.length} Events Total</Badge>
              </div>

              {filteredItems.length === 0 ? (
                <EmptyState
                  illustration="no-events"
                  title="No Matching Events Found"
                  description="Try adjusting your filters, category selections, or search query."
                  actionLabel="Reset All Filters"
                  onAction={() => {
                    setSelectedCategory('ALL');
                    setSelectedClassId('ALL');
                    setSelectedAudience('ALL');
                    setSearchQuery('');
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item) => {
                    const meta = CATEGORY_META[item.category] || CATEGORY_META.EVENT;
                    const Icon = meta.icon;
                    const dateObj = new Date(item.startDate);
                    const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' });
                    const dayNum = dateObj.getDate();
                    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#990000] hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                      >
                        {/* Date badge */}
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                            <span className="text-[10px] uppercase font-bold text-slate-500">{monthStr}</span>
                            <span className="text-base font-bold text-slate-900 leading-none">{dayNum}</span>
                            <span className="text-[9px] uppercase text-slate-400">{weekday}</span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={item.badgeVariant} size="sm">
                                {meta.label}
                              </Badge>
                              {item.className && (
                                <Badge variant="slate" size="sm">
                                  {item.className}
                                </Badge>
                              )}
                              {item.venue && (
                                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-[#990000]" /> {item.venue}
                                </span>
                              )}
                            </div>
                            <h5 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h5>
                            <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <Button
                            size="xs"
                            variant="outline"
                            className="text-slate-600 hover:text-slate-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportIcs(item);
                            }}
                            title="Export to Apple/Google/Outlook Calendar (.ics)"
                          >
                            <Download className="w-3 h-3 mr-1" /> Sync
                          </Button>
                          <Button size="xs" variant="primary" className="bg-[#990000] text-white">
                            Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: PARTICIPANTS ROSTER */}
      {activeTab === 'participants' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              Registered Student Participants &amp; Parent Consents
            </CardTitle>
          </CardHeader>
          <div className="p-5 space-y-3">
            {events.flatMap((ev) =>
              (ev.participants || []).map((part: any) => (
                <div
                  key={part.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={
                        part.student?.user
                          ? `${part.student.user.firstName} ${part.student.user.lastName || ''}`.trim()
                          : 'Student Participant'
                      }
                      size="sm"
                    />
                    <div>
                      <strong className="text-slate-900 text-sm block">
                        {part.student?.user
                          ? `${part.student.user.firstName} ${part.student.user.lastName || ''}`.trim()
                          : 'Participant'}
                      </strong>
                      <span className="text-slate-500">
                        Event: <strong className="text-slate-800">{ev.title}</strong> • Category:{' '}
                        {part.roleOrCategory}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={part.parentConsentGiven ? 'emerald' : 'amber'}>
                      {part.parentConsentGiven ? 'Consent Verified' : 'Pending Consent'}
                    </Badge>
                    <Badge variant="blue">{part.participationStatus}</Badge>
                  </div>
                </div>
              ))
            )}
            {totalParticipants === 0 && (
              <EmptyState
                illustration="no-students"
                title="No Student Participants Registered"
                description="Students registered for track events, exhibitions, and ceremonies will be listed here with consent status."
              />
            )}
          </div>
        </Card>
      )}

      {/* TAB 3: PHOTO GALLERY */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {totalGallery === 0 ? (
            <EmptyState
              illustration="no-events"
              title="Event Photo Gallery Empty"
              description="High-resolution campus event photos, athletic meet memories, and ceremonies will be displayed here."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {events.flatMap((ev) =>
                (ev.gallery || []).map((pic: any) => (
                  <Card key={pic.id} className="overflow-hidden">
                    <div className="h-48 bg-slate-900 relative">
                      <img
                        src={pic.mediaUrl}
                        alt={pic.caption || ev.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                        <div>
                          <span className="text-cyan-300 font-mono text-[10px] uppercase font-bold">
                            {ev.title}
                          </span>
                          <h4 className="text-white text-xs font-semibold mt-0.5">{pic.caption}</h4>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: EVENT DETAILS MODAL */}
      {/* ==================================================== */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedItem ? selectedItem.categoryLabel : 'Event Details'}
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={selectedItem.badgeVariant}>{selectedItem.categoryLabel}</Badge>
              {selectedItem.isRecurring && (
                <Badge variant="teal" size="sm">
                  Repeats {selectedItem.recurrencePattern || 'Periodically'}
                </Badge>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{selectedItem.title}</h3>
              <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{selectedItem.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Date &amp; Time</span>
                <span className="font-bold text-slate-800">
                  {formatDate(selectedItem.startDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Campus Venue</span>
                <span className="font-bold text-slate-800">{selectedItem.venue || 'Campus Wide'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Target Audience</span>
                <span className="font-bold text-slate-800">
                  {selectedItem.targetRole === 'ALL' ? 'Entire School Community' : selectedItem.targetRole}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Reminder Alert</span>
                <span className="font-bold text-slate-800">
                  {selectedItem.reminderMinutes ? `${selectedItem.reminderMinutes} minutes before` : 'Default Alert'}
                </span>
              </div>
            </div>

            {/* Contextual Action Link */}
            {selectedItem.link && (
              <div className="pt-2">
                <Link
                  href={selectedItem.link}
                  className="w-full py-2 px-3 text-xs font-semibold text-[#990000] bg-sky-50 border border-sky-200 rounded-lg flex items-center justify-center gap-1.5 hover:bg-sky-100 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Dedicated Module</span>
                </Link>
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-200">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportIcs(selectedItem)}
                className="text-slate-700"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Export (.ics)
              </Button>

              <div className="flex items-center gap-2">
                {selectedItem.sourceType === 'EVENT' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[#990000]"
                    onClick={() => {
                      setSelectedEventForReg(selectedItem.rawEvent);
                      setIsDetailModalOpen(false);
                      setIsRegisterModalOpen(true);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Register Student
                  </Button>
                )}

                {canManageEvents && selectedItem.sourceType === 'EVENT' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-slate-700"
                    onClick={() => handleOpenEditModal(selectedItem)}
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                )}

                {isAdmin && selectedItem.sourceType === 'EVENT' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-600 hover:bg-rose-50 border-rose-200"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}

                <Button size="sm" variant="primary" onClick={() => setIsDetailModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 2: SCHEDULE NEW EVENT */}
      {/* ==================================================== */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule Institutional Event"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Science Exhibition, Winter Break, Athletics Meet"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Category *</label>
              <select
                value={eventForm.category}
                onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as CalendarCategory })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
              >
                <option value="EVENT">Campus Event</option>
                <option value="HOLIDAY">School Holiday</option>
                <option value="ACADEMIC">Academic Event</option>
                <option value="EXAMINATION">Examination</option>
                <option value="SPORTS">Sports &amp; Athletics</option>
                <option value="PTM">Parent-Teacher Meeting</option>
                <option value="ADMISSION">Admission Event</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
              <select
                value={eventForm.targetRole}
                onChange={(e) => setEventForm({ ...eventForm, targetRole: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
              >
                <option value="ALL">Entire Campus (All)</option>
                <option value="STUDENT">Students &amp; Parents</option>
                <option value="TEACHER">Faculty &amp; Staff Only</option>
                <option value="ADMIN">Administrative Staff</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={eventForm.startDate}
                onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={eventForm.startTime}
                onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={eventForm.endDate}
                onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={eventForm.endTime}
                onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Venue</label>
              <input
                type="text"
                placeholder="e.g. Auditorium, Sports Track, Lab 2"
                value={eventForm.venue}
                onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class Specific (Optional)</label>
              <select
                value={eventForm.classId}
                onChange={(e) => setEventForm({ ...eventForm, classId: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
              >
                <option value="ALL">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Automated Reminder</label>
              <select
                value={eventForm.reminderMinutes}
                onChange={(e) => setEventForm({ ...eventForm, reminderMinutes: Number(e.target.value) })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
              >
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={1440}>1 day before</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isRec"
                checked={eventForm.isRecurring}
                onChange={(e) => setEventForm({ ...eventForm, isRecurring: e.target.checked })}
                className="w-4 h-4 text-[#990000] rounded"
              />
              <label htmlFor="isRec" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Recurring Event (Weekly / Monthly)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Agenda Notes</label>
            <textarea
              rows={2}
              placeholder="Provide instructions, equipment requirements, or agenda points..."
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              className="bg-[#990000] text-white"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule & Broadcast Notice'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 3: EDIT EVENT */}
      {/* ==================================================== */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Scheduled Event">
        <form onSubmit={handleUpdateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={eventForm.startDate}
                onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={eventForm.endDate}
                onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Venue</label>
            <input
              type="text"
              value={eventForm.venue}
              onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              className="bg-[#990000] text-white"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 4: DELETE CONFIRMATION */}
      {/* ==================================================== */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Event Deletion">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-900">{selectedItem?.title}</strong>? This will remove the event from all
            calendars and notifications.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={handleDeleteEvent}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Event'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 5: REGISTER STUDENT */}
      {/* ==================================================== */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => {
          setIsRegisterModalOpen(false);
          setSelectedEventForReg(null);
        }}
        title={`Register Student: ${selectedEventForReg?.title}`}
      >
        <form onSubmit={handleRegisterStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
            <select
              value={registerForm.studentId}
              onChange={(e) => setRegisterForm({ ...registerForm, studentId: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user ? `${s.user.firstName} ${s.user.lastName || ''}`.trim() : 'Student'} (
                  {s.admissionNumber} - {s.enrollments?.[0]?.class?.name || 'Class'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Sub-Event Category</label>
            <input
              type="text"
              required
              placeholder="e.g. 100m Sprint, Debate Lead, Robot Pilot"
              value={registerForm.roleOrCategory}
              onChange={(e) => setRegisterForm({ ...registerForm, roleOrCategory: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <input
              type="checkbox"
              id="parentPerm"
              checked={registerForm.parentConsentGiven}
              onChange={(e) => setRegisterForm({ ...registerForm, parentConsentGiven: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="parentPerm" className="text-xs font-semibold text-emerald-800 cursor-pointer">
              Parent digital consent letter received and verified on file.
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => {
                setIsRegisterModalOpen(false);
                setSelectedEventForReg(null);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              className="bg-[#990000] text-white"
            >
              {isSubmitting ? 'Registering...' : 'Confirm Registration'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
