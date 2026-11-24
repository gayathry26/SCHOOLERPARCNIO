'use client';

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  BookOpen,
  Calendar,
  Sparkles,
  Award,
  ChevronDown,
  ChevronRight,
  Clock,
  History,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/formatters';

export interface ClassSectionStudioProps {
  initialClasses: any[];
  academicYears: any[];
  teachers: any[];
  userRole: string;
}

export const ClassSectionManagementStudio: React.FC<ClassSectionStudioProps> = ({
  initialClasses,
  academicYears,
  teachers,
  userRole,
}) => {
  const [classes, setClasses] = useState<any[]>(initialClasses);
  const [selectedYearId, setSelectedYearId] = useState<string>(
    academicYears.find((y) => y.isCurrent)?.id || academicYears[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'matrix' | 'advisors' | 'allocations' | 'promotion' | 'history'>('matrix');

  // Modals state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [isTeacherAllocModalOpen, setIsTeacherAllocModalOpen] = useState(false);

  // Form states
  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [classForm, setClassForm] = useState({
    name: '',
    numericOrder: 1,
    stream: 'General',
    academicYearId: selectedYearId,
    isActive: true,
  });

  const [selectedClassForSection, setSelectedClassForSection] = useState<any | null>(null);
  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [sectionForm, setSectionForm] = useState({
    name: '',
    roomNo: 'Room 101',
    capacity: 40,
    classTeacherId: '',
    isActive: true,
  });

  const [advisorForm, setAdvisorForm] = useState({
    sectionId: '',
    teacherId: '',
    remarks: '',
    allowTransfer: false,
  });
  const [advisorConflict, setAdvisorConflict] = useState<string | null>(null);

  // Promotion form
  const [promotionSourceSection, setPromotionSourceSection] = useState('');
  const [promotionTargetClass, setPromotionTargetClass] = useState('');
  const [promotionTargetSection, setPromotionTargetSection] = useState('');
  const [promotionTargetYear, setPromotionTargetYear] = useState(selectedYearId);
  const [promotionStudents, setPromotionStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [promotionLoading, setPromotionLoading] = useState(false);

  // History state
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Reload classes from API
  const reloadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/classes');
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
      }
    } catch (err) {
      console.error('Reload failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load history logs
  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch('/api/classes/advisors');
      if (res.ok) {
        const data = await res.json();
        setHistoryLogs(data.historyLogs || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // -------------------------------------------------------------
  // CLASS HANDLERS
  // -------------------------------------------------------------
  const openCreateClassModal = () => {
    setEditingClass(null);
    setClassForm({
      name: '',
      numericOrder: classes.length + 1,
      stream: 'General',
      academicYearId: selectedYearId,
      isActive: true,
    });
    setIsClassModalOpen(true);
  };

  const openEditClassModal = (cls: any) => {
    setEditingClass(cls);
    setClassForm({
      name: cls.name,
      numericOrder: cls.numericOrder,
      stream: cls.stream || 'General',
      academicYearId: cls.academicYearId || selectedYearId,
      isActive: cls.isActive ?? true,
    });
    setIsClassModalOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    try {
      const url = '/api/classes';
      const method = editingClass ? 'PUT' : 'POST';
      const payload = editingClass ? { id: editingClass.id, ...classForm } : classForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save class');

      setStatusMessage({ type: 'success', text: data.message });
      setIsClassModalOpen(false);
      await reloadData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`Are you sure you want to delete "${className}"? This action cannot be undone.`)) return;
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/classes?id=${classId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete class');

      setStatusMessage({ type: 'success', text: data.message });
      await reloadData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // -------------------------------------------------------------
  // SECTION HANDLERS
  // -------------------------------------------------------------
  const openCreateSectionModal = (cls: any) => {
    setSelectedClassForSection(cls);
    setEditingSection(null);
    setSectionForm({
      name: '',
      roomNo: 'Room 101',
      capacity: 40,
      classTeacherId: '',
      isActive: true,
    });
    setIsSectionModalOpen(true);
  };

  const openEditSectionModal = (cls: any, sec: any) => {
    setSelectedClassForSection(cls);
    setEditingSection(sec);
    setSectionForm({
      name: sec.name,
      roomNo: sec.roomNo || 'Room 101',
      capacity: sec.capacity || 40,
      classTeacherId: sec.classTeacherId || '',
      isActive: sec.isActive ?? true,
    });
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    try {
      const url = '/api/sections';
      const method = editingSection ? 'PUT' : 'POST';
      const payload = editingSection
        ? { id: editingSection.id, ...sectionForm }
        : { classId: selectedClassForSection.id, ...sectionForm };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save section');

      setStatusMessage({ type: 'success', text: data.message });
      setIsSectionModalOpen(false);
      await reloadData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteSection = async (sectionId: string, sectionFullName: string) => {
    if (!confirm(`Are you sure you want to delete section "${sectionFullName}"?`)) return;
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/sections?id=${sectionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete section');

      setStatusMessage({ type: 'success', text: data.message });
      await reloadData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // -------------------------------------------------------------
  // ADVISOR HANDLERS
  // -------------------------------------------------------------
  const openAdvisorAssignmentModal = (sec: any) => {
    setAdvisorConflict(null);
    setAdvisorForm({
      sectionId: sec.id,
      teacherId: sec.classTeacherId || '',
      remarks: '',
      allowTransfer: false,
    });
    setIsAdvisorModalOpen(true);
  };

  const handleSaveAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setAdvisorConflict(null);
    try {
      const res = await fetch('/api/classes/advisors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(advisorForm),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data.canTransfer) {
          setAdvisorConflict(data.error);
          return;
        }
        throw new Error(data.error || 'Failed to assign class advisor');
      }

      setStatusMessage({ type: 'success', text: data.message });
      setIsAdvisorModalOpen(false);
      await reloadData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleRelieveAdvisor = async (sectionId: string) => {
    if (!confirm('Are you sure you want to relieve the current Class Advisor from this section?')) return;
    try {
      const res = await fetch(`/api/classes/advisors?sectionId=${sectionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to relieve advisor');

      setStatusMessage({ type: 'success', text: data.message });
      await reloadData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // -------------------------------------------------------------
  // PROMOTION WORKFLOW
  // -------------------------------------------------------------
  const handleLoadStudentsForPromotion = async (secId: string) => {
    setPromotionSourceSection(secId);
    setSelectedStudentIds([]);
    try {
      const res = await fetch(`/api/students?sectionId=${secId}`);
      if (res.ok) {
        const data = await res.json();
        setPromotionStudents(data.students || []);
        setSelectedStudentIds((data.students || []).map((s: any) => s.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecutePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      alert('Please select at least one student to promote.');
      return;
    }
    setPromotionLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/classes/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceSectionId: promotionSourceSection,
          targetClassId: promotionTargetClass,
          targetSectionId: promotionTargetSection,
          targetAcademicYearId: promotionTargetYear,
          studentIds: selectedStudentIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to promote students');

      setStatusMessage({ type: 'success', text: data.message });
      setIsPromotionModalOpen(false);
      await reloadData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setPromotionLoading(false);
    }
  };

  // Computed metrics
  const totalClassesCount = classes.length;
  const totalSectionsCount = classes.reduce((acc, c) => acc + (c.sections?.length || 0), 0);
  const totalStudentsCount = classes.reduce((acc, c) => acc + (c._count?.enrollments || 0), 0);
  const assignedAdvisorsCount = classes.reduce(
    (acc, c) => acc + (c.sections?.filter((s: any) => s.classTeacherId)?.length || 0),
    0
  );

  // Filter classes
  const filteredClasses = classes.filter((c) => {
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      const hasSecMatch = c.sections?.some((s: any) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (!hasSecMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-[#990000] border-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[#990000] shrink-0" />
            )}
            <span className="font-semibold">{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold uppercase tracking-wider hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#525252] font-semibold">
            <span>Total Classes</span>
            <Layers className="w-4 h-4 text-[#990000]" />
          </div>
          <div className="text-2xl font-black text-[#171717]">{totalClassesCount}</div>
          <p className="text-[11px] text-[#737373]">Pre-KG through Grade 12</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#525252] font-semibold">
            <span>Total Sections</span>
            <Building2 className="w-4 h-4 text-[#990000]" />
          </div>
          <div className="text-2xl font-black text-[#990000]">{totalSectionsCount}</div>
          <p className="text-[11px] text-[#737373]">Active Classroom Groups</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#525252] font-semibold">
            <span>Class Advisors Assigned</span>
            <UserCheck className="w-4 h-4 text-[#C00000]" />
          </div>
          <div className="text-2xl font-black text-[#C00000]">
            {assignedAdvisorsCount} / {totalSectionsCount}
          </div>
          <p className="text-[11px] text-[#737373]">
            {totalSectionsCount - assignedAdvisorsCount === 0
              ? '100% Fully Allocated'
              : `${totalSectionsCount - assignedAdvisorsCount} sections unassigned`}
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#525252] font-semibold">
            <span>Total Enrolled Students</span>
            <Users className="w-4 h-4 text-[#171717]" />
          </div>
          <div className="text-2xl font-black text-[#171717]">{totalStudentsCount}</div>
          <p className="text-[11px] text-[#737373]">Active Academic Roster</p>
        </div>
      </div>

      {/* Action Controls & Navigation Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'matrix'
                ? 'bg-[#990000] text-white shadow-xs'
                : 'bg-[#F5F5F5] text-[#525252] hover:text-[#171717]'
            }`}
          >
            Class &amp; Section Matrix
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              loadHistory();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'history'
                ? 'bg-[#990000] text-white shadow-xs'
                : 'bg-[#F5F5F5] text-[#525252] hover:text-[#171717]'
            }`}
          >
            Advisor Assignment History
          </button>
          <button
            onClick={() => {
              setIsPromotionModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#F5F5F5] text-[#525252] hover:text-[#171717] transition-all cursor-pointer shrink-0"
          >
            Student Promotion Workflow
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="relative flex-1 md:w-48">
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#990000]"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={openCreateClassModal}
            className="bg-[#990000] hover:bg-[#800000] text-white font-bold text-xs shrink-0"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Class
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: CLASS & SECTION MATRIX */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {filteredClasses.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#E5E5E5] space-y-3">
              <Layers className="w-10 h-10 text-[#737373] mx-auto" />
              <h3 className="text-base font-bold text-[#171717]">No classes found</h3>
              <p className="text-xs text-[#525252] max-w-sm mx-auto">
                No classes match your search query or none have been created yet.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={openCreateClassModal}
                className="bg-[#990000] text-white font-bold text-xs mt-2"
              >
                Create First Class
              </Button>
            </div>
          ) : (
            filteredClasses.map((cls) => {
              const classEnrollmentCount = cls.sections?.reduce(
                (sum: number, s: any) => sum + (s._count?.enrollments || 0),
                0
              ) || 0;

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-2xs"
                >
                  {/* Class Header */}
                  <div className="p-4 sm:p-5 bg-[#F5F5F5]/60 border-b border-[#E5E5E5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#990000] text-white flex items-center justify-center font-black text-sm shadow-2xs">
                        {cls.numericOrder}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-[#171717]">{cls.name}</h3>
                          <span className="bg-red-50 text-[#990000] text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">
                            {cls.stream || 'General Stream'}
                          </span>
                          {!cls.isActive && (
                            <span className="bg-neutral-200 text-[#525252] text-[10px] font-bold px-2 py-0.5 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#525252] mt-0.5">
                          {cls.sections?.length || 0} Sections • {classEnrollmentCount} Enrolled Students
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCreateSectionModal(cls)}
                        className="text-xs font-bold text-[#990000] border-red-200 hover:bg-red-50"
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                      >
                        Add Section
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditClassModal(cls)}
                        className="text-xs text-[#525252] hover:text-[#171717]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClass(cls.id, cls.name)}
                        className="text-xs text-[#990000] hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Sections List in this Class */}
                  <div className="p-4 sm:p-5">
                    {cls.sections?.length === 0 ? (
                      <div className="p-6 text-center border-2 border-dashed border-[#E5E5E5] rounded-xl text-xs text-[#525252] space-y-2">
                        <p>No sections created under {cls.name} yet.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCreateSectionModal(cls)}
                          className="text-xs font-semibold text-[#990000]"
                        >
                          + Create Section A
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cls.sections.map((sec: any) => {
                          const enrolled = sec._count?.enrollments || 0;
                          const capacity = sec.capacity || 40;
                          const capacityPercent = Math.min(100, Math.round((enrolled / capacity) * 100));

                          return (
                            <div
                              key={sec.id}
                              className="p-4 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5]/30 hover:border-red-200 hover:bg-white transition-all space-y-3 flex flex-col justify-between"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-lg bg-neutral-900 text-white font-bold text-xs flex items-center justify-center">
                                      {sec.name}
                                    </span>
                                    <span className="font-bold text-sm text-[#171717]">
                                      Section {sec.name}
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-mono font-medium text-[#737373]">
                                    {sec.roomNo || 'Room 101'}
                                  </span>
                                </div>

                                {/* Class Advisor Tag */}
                                <div className="p-2.5 rounded-lg bg-white border border-[#E5E5E5] space-y-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block">
                                    Assigned Class Advisor
                                  </span>
                                  {sec.classTeacher?.user ? (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-red-50 text-[#990000] font-bold text-[10px] flex items-center justify-center border border-red-200">
                                          {sec.classTeacher.user.firstName[0]}
                                        </div>
                                        <span className="text-xs font-bold text-[#171717]">
                                          {sec.classTeacher.user.firstName} {sec.classTeacher.user.lastName}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => openAdvisorAssignmentModal(sec)}
                                        className="text-[11px] font-bold text-[#990000] hover:underline cursor-pointer"
                                      >
                                        Change
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        <span>Not Assigned</span>
                                      </span>
                                      <button
                                        onClick={() => openAdvisorAssignmentModal(sec)}
                                        className="text-[11px] font-bold text-[#990000] hover:underline cursor-pointer"
                                      >
                                        Assign Now
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Student Capacity Meter */}
                                <div className="space-y-1 pt-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-[#525252] font-medium">Students Enrolled</span>
                                    <span className="font-mono font-bold text-[#171717]">
                                      {enrolled} / {capacity}
                                    </span>
                                  </div>
                                  <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        capacityPercent >= 90
                                          ? 'bg-[#990000]'
                                          : capacityPercent >= 70
                                          ? 'bg-amber-600'
                                          : 'bg-emerald-600'
                                      }`}
                                      style={{ width: `${capacityPercent}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Section Actions */}
                              <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                                <button
                                  onClick={() => openEditSectionModal(cls, sec)}
                                  className="text-[#525252] hover:text-[#171717] font-semibold flex items-center gap-1"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteSection(sec.id, `${cls.name} - ${sec.name}`)}
                                  className="text-[#990000] hover:underline font-semibold flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: ASSIGNMENT HISTORY LOG */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'history' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
            <div>
              <h3 className="text-base font-bold text-[#171717]">Class Advisor Assignment Audit Log</h3>
              <p className="text-xs text-[#525252] mt-0.5">
                Permanent institutional log of all advisor assignments, transfers, and relief events
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadHistory}
              isLoading={historyLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Logs
            </Button>
          </div>

          {historyLogs.length === 0 ? (
            <p className="text-xs text-[#525252] text-center py-8">
              No advisor assignment history logs recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F5] text-[#525252] font-bold border-b border-[#E5E5E5]">
                  <tr>
                    <th className="p-3">Class &amp; Section</th>
                    <th className="p-3">Faculty Advisor</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Assignment Date</th>
                    <th className="p-3">Relieved Date</th>
                    <th className="p-3">Remarks / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {historyLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-[#F5F5F5]/60 transition-colors">
                      <td className="p-3 font-bold text-[#171717]">
                        {log.section?.class?.name} - Section {log.section?.name}
                      </td>
                      <td className="p-3 font-medium text-[#171717]">
                        {log.teacher?.user?.firstName} {log.teacher?.user?.lastName} ({log.teacher?.employeeCode})
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            log.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : log.status === 'TRANSFERRED'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-neutral-100 text-[#525252] border-[#E5E5E5]'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[#525252]">{formatDate(log.startDate)}</td>
                      <td className="p-3 font-mono text-[#525252]">
                        {log.endDate ? formatDate(log.endDate) : '— Active'}
                      </td>
                      <td className="p-3 text-[#525252] italic">{log.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: CREATE / EDIT CLASS */}
      {/* ------------------------------------------------------------- */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E5E5] w-full max-w-md p-6 space-y-5 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <h3 className="text-base font-bold text-[#171717]">
                {editingClass ? `Edit Class: ${editingClass.name}` : 'Create New Class'}
              </h3>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#171717] mb-1">
                  Class Name (e.g. Class 1, Class 10, Pre-KG) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-[#171717] focus:border-[#990000] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#171717] mb-1">Grade Order (1–12) *</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={classForm.numericOrder}
                    onChange={(e) => setClassForm({ ...classForm, numericOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-[#171717] focus:border-[#990000] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#171717] mb-1">Academic Stream</label>
                  <select
                    value={classForm.stream}
                    onChange={(e) => setClassForm({ ...classForm, stream: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-[#171717] focus:border-[#990000] focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Science (PCM)">Science (PCM)</option>
                    <option value="Science (PCB)">Science (PCB)</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Pre-Primary">Pre-Primary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#171717] mb-1">Academic Session</label>
                <select
                  value={classForm.academicYearId}
                  onChange={(e) => setClassForm({ ...classForm, academicYearId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-[#171717] focus:border-[#990000] focus:outline-none"
                >
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name} {y.isCurrent ? '(Current Session)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="classActive"
                  checked={classForm.isActive}
                  onChange={(e) => setClassForm({ ...classForm, isActive: e.target.checked })}
                  className="rounded text-[#990000] focus:ring-[#990000]"
                />
                <label htmlFor="classActive" className="text-xs text-[#171717] font-semibold cursor-pointer">
                  Class is Active for Admissions &amp; Enrollments
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E5E5E5]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsClassModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#990000] text-white font-bold"
                >
                  {editingClass ? 'Update Class' : 'Create Class'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: ADD / EDIT SECTION */}
      {/* ------------------------------------------------------------- */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E5E5] w-full max-w-md p-6 space-y-5 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div>
                <h3 className="text-base font-bold text-[#171717]">
                  {editingSection
                    ? `Edit Section ${editingSection.name}`
                    : `Add Section to ${selectedClassForSection?.name}`}
                </h3>
                <p className="text-xs text-[#525252] mt-0.5">
                  Class: <strong>{selectedClassForSection?.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#171717] mb-1">Section Letter/Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A, B, C"
                    value={sectionForm.name}
                    onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-[#171717] focus:border-[#990000] focus:outline-none uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#171717] mb-1">Classroom / Room No</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 1001"
                    value={sectionForm.roomNo}
                    onChange={(e) => setSectionForm({ ...sectionForm, roomNo: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-[#171717] focus:border-[#990000] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#171717] mb-1">Maximum Student Capacity *</label>
                <input
                  type="number"
                  min={1}
                  max={80}
                  required
                  value={sectionForm.capacity}
                  onChange={(e) => setSectionForm({ ...sectionForm, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-[#171717] focus:border-[#990000] focus:outline-none font-mono"
                />
                <p className="text-[10px] text-[#737373] mt-1">
                  Enforces student enrollment cutoff per CBSE standards (recommended: 40 students).
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#171717] mb-1">Assign Class Advisor (Form Tutor)</label>
                <select
                  value={sectionForm.classTeacherId}
                  onChange={(e) => setSectionForm({ ...sectionForm, classTeacherId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-[#171717] focus:border-[#990000] focus:outline-none"
                >
                  <option value="">-- No Class Advisor (Assign Later) --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user.firstName} {t.user.lastName} ({t.employeeCode}) — {t.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sectionActive"
                  checked={sectionForm.isActive}
                  onChange={(e) => setSectionForm({ ...sectionForm, isActive: e.target.checked })}
                  className="rounded text-[#990000] focus:ring-[#990000]"
                />
                <label htmlFor="sectionActive" className="text-xs text-[#171717] font-semibold cursor-pointer">
                  Section is Active for Timetable &amp; Attendance
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E5E5E5]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSectionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#990000] text-white font-bold"
                >
                  {editingSection ? 'Update Section' : 'Create Section'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: ASSIGN / CHANGE CLASS ADVISOR */}
      {/* ------------------------------------------------------------- */}
      {isAdvisorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E5E5] w-full max-w-md p-6 space-y-5 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <h3 className="text-base font-bold text-[#171717]">Assign Class Advisor</h3>
              <button
                onClick={() => setIsAdvisorModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {advisorConflict && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="font-semibold">{advisorConflict}</p>
                </div>
                <div className="pt-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowTransfer"
                    checked={advisorForm.allowTransfer}
                    onChange={(e) => setAdvisorForm({ ...advisorForm, allowTransfer: e.target.checked })}
                    className="rounded text-[#990000]"
                  />
                  <label htmlFor="allowTransfer" className="font-bold text-amber-950 cursor-pointer">
                    Relieve from current section and transfer to this section
                  </label>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveAdvisor} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#171717] mb-1">Select Faculty Teacher *</label>
                <select
                  required
                  value={advisorForm.teacherId}
                  onChange={(e) => setAdvisorForm({ ...advisorForm, teacherId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-[#171717] focus:border-[#990000] focus:outline-none"
                >
                  <option value="">-- Choose Faculty Member --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user.firstName} {t.user.lastName} ({t.employeeCode}) — {t.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#171717] mb-1">Assignment Remarks / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Appointed as Grade 10 Form Tutor for Session 2026–27"
                  value={advisorForm.remarks}
                  onChange={(e) => setAdvisorForm({ ...advisorForm, remarks: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-[#171717] focus:border-[#990000] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-between gap-2 border-t border-[#E5E5E5]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleRelieveAdvisor(advisorForm.sectionId);
                    setIsAdvisorModalOpen(false);
                  }}
                  className="text-red-700 hover:bg-red-50"
                >
                  Relieve Current
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAdvisorModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-[#990000] text-white font-bold"
                  >
                    Confirm Assignment
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: STUDENT PROMOTION WORKFLOW */}
      {/* ------------------------------------------------------------- */}
      {isPromotionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E5E5] w-full max-w-2xl p-6 space-y-5 shadow-xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div>
                <h3 className="text-base font-bold text-[#171717]">Student Promotion Workflow</h3>
                <p className="text-xs text-[#525252] mt-0.5">
                  Promote students to next academic year with permanent audit logs
                </p>
              </div>
              <button
                onClick={() => setIsPromotionModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecutePromotion} className="space-y-4 text-xs">
              {/* Step 1: Select Source Section */}
              <div className="p-3.5 bg-[#F5F5F5] rounded-xl border border-[#E5E5E5] space-y-2">
                <span className="font-bold text-[#171717] block">Step 1: Choose Source Section</span>
                <select
                  required
                  value={promotionSourceSection}
                  onChange={(e) => handleLoadStudentsForPromotion(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-[#171717] font-semibold"
                >
                  <option value="">-- Select Current Section --</option>
                  {classes.map((c) =>
                    c.sections?.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {c.name} - Section {s.name} ({s._count?.enrollments || 0} students)
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Step 2: Select Target Class, Section & Year */}
              <div className="p-3.5 bg-[#F5F5F5] rounded-xl border border-[#E5E5E5] space-y-3">
                <span className="font-bold text-[#171717] block">Step 2: Destination Target</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#737373] font-semibold mb-1">Target Class</label>
                    <select
                      required
                      value={promotionTargetClass}
                      onChange={(e) => {
                        setPromotionTargetClass(e.target.value);
                        setPromotionTargetSection('');
                      }}
                      className="w-full px-2.5 py-2 bg-white border border-[#E5E5E5] rounded-xl text-[#171717]"
                    >
                      <option value="">-- Target Class --</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.stream})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#737373] font-semibold mb-1">Target Section</label>
                    <select
                      required
                      value={promotionTargetSection}
                      onChange={(e) => setPromotionTargetSection(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-[#E5E5E5] rounded-xl text-[#171717]"
                    >
                      <option value="">-- Target Section --</option>
                      {classes
                        .find((c) => c.id === promotionTargetClass)
                        ?.sections?.map((s: any) => (
                          <option key={s.id} value={s.id}>
                            Section {s.name} (Cap: {s.capacity || 40})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#737373] font-semibold mb-1">Target Academic Year</label>
                    <select
                      required
                      value={promotionTargetYear}
                      onChange={(e) => setPromotionTargetYear(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-[#E5E5E5] rounded-xl text-[#171717]"
                    >
                      {academicYears.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: Student Selection Table */}
              {promotionStudents.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#171717]">
                      Select Students to Promote ({selectedStudentIds.length} / {promotionStudents.length} selected)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedStudentIds.length === promotionStudents.length) {
                          setSelectedStudentIds([]);
                        } else {
                          setSelectedStudentIds(promotionStudents.map((s) => s.id));
                        }
                      }}
                      className="text-xs font-bold text-[#990000] hover:underline"
                    >
                      {selectedStudentIds.length === promotionStudents.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-[#E5E5E5] rounded-xl divide-y divide-[#E5E5E5]">
                    {promotionStudents.map((s) => (
                      <label
                        key={s.id}
                        className="p-2.5 flex items-center justify-between hover:bg-[#F5F5F5] cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(s.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudentIds([...selectedStudentIds, s.id]);
                              } else {
                                setSelectedStudentIds(selectedStudentIds.filter((id) => id !== s.id));
                              }
                            }}
                            className="rounded text-[#990000]"
                          />
                          <span className="font-bold text-[#171717]">{s.name}</span>
                          <span className="text-[#737373] font-mono">({s.admissionNumber})</span>
                        </div>
                        <span className="text-slate-500">Roll: {s.rollNumber}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E5E5E5]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPromotionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={promotionLoading}
                  disabled={selectedStudentIds.length === 0}
                  className="bg-[#990000] text-white font-bold"
                >
                  Promote {selectedStudentIds.length} Students
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
