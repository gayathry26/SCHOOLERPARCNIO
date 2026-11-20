'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Trash2,
  Download,
  Award,
  Layers,
  Search,
  Bell,
  Activity,
  HeartPulse,
  Eye,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import {
  SmartStatCard,
  ProgressRing,
  Timeline,
  CalendarWidget,
  VisualFilters,
  ProfileHeader,
  ChartTooltip,
  ActivityFeed,
  FilePreviewModal,
  FilePreviewItem,
  showToast,
  ConfirmationModal,
  Card,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  EmptyState,
  CardSkeleton,
  TableSkeleton,
} from '@/components/ui';

export default function ComponentShowcasePage() {
  // Modal states for live testing
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<FilePreviewItem | null>(null);

  // Filters state
  const [searchVal, setSearchVal] = useState('');
  const [selectedChip, setSelectedChip] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Sample calendar events
  const sampleEvents = [
    { id: '1', title: 'CBSE Pre-Board Math', date: new Date().toISOString(), time: '09:30 AM', category: 'EXAM' as const },
    { id: '2', title: 'Annual Athletics Meet', date: new Date(Date.now() + 86400000 * 2).toISOString(), time: '08:30 AM', category: 'EVENT' as const },
    { id: '3', title: 'Guru Nanak Jayanti', date: new Date(Date.now() + 86400000 * 4).toISOString(), category: 'HOLIDAY' as const },
  ];

  // Sample timeline
  const sampleTimeline = [
    {
      id: '1',
      title: 'CBSE Term 1 Scorecard Published',
      description: 'Scored 94% in Standard Mathematics and 88% in Science.',
      date: new Date(),
      category: 'Academics',
      badgeVariant: 'purple' as const,
      iconBgColor: '#7C3AED',
      authorName: 'Dr. Sunita Mehra (Principal)',
    },
    {
      id: '2',
      title: 'Term 2 Tuition Fee Paid',
      description: 'Recorded payment of ₹18,000 via UPI receipt #REC-8891.',
      date: new Date(Date.now() - 86400000 * 2),
      category: 'Finance',
      badgeVariant: 'emerald' as const,
      iconBgColor: '#16A34A',
      authorName: 'Accounts Counter',
    },
    {
      id: '3',
      title: 'Inter-School Robotics Trophy',
      description: '1st place in National STEM Innovation Challenge at IIT Delhi.',
      date: new Date(Date.now() - 86400000 * 5),
      category: 'Award',
      badgeVariant: 'amber' as const,
      iconBgColor: '#D97706',
    },
  ];

  // Sample Activity Feed
  const sampleActivity = [
    {
      id: 'act-1',
      actorName: 'Pooja Nair',
      actorRole: 'TEACHER',
      action: 'graded homework submission for',
      target: 'Chapter 8 Trigonometry Exercise 8.4',
      description: 'Reviewed proofs with maximum mark awards.',
      timestamp: new Date(),
      category: 'Academics',
      badgeVariant: 'blue' as const,
    },
    {
      id: 'act-2',
      actorName: 'Fee Desk',
      actorRole: 'ACCOUNTANT',
      action: 'dispatched automated fee reminder to',
      target: 'Class 10 Section A Guardians',
      timestamp: new Date(Date.now() - 3600000 * 3),
      category: 'Finance',
      badgeVariant: 'emerald' as const,
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white border border-[#E4EAEC] p-6 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EAF5F8] text-[#086A92]">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              EdvoNest Visual Component Library
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standardized, accessible, and performant design system primitives across EdvoNest ERP.
          </p>
        </div>

        <Badge variant="blue" size="md">
          16 Visual Primitives Active
        </Badge>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. SMART STAT CARDS */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#086A92]" />
          <span>1. Smart Stat Cards</span>
        </h3>
        <p className="text-xs text-slate-500">
          Used across Attendance, Fees, and Academics with comparative trends, sparklines, and progress bars.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SmartStatCard
            title="Attendance Vital"
            value="94.8%"
            subtitle="Present 118 of 124 Days"
            variant="emerald"
            icon={<CalendarCheck className="w-5 h-5" />}
            trend={{ value: '+2.4%', isPositive: true }}
            progress={{ value: 94.8, targetLabel: 'Target: 75% CBSE Norm' }}
          />
          <SmartStatCard
            title="Fee Collections"
            value="₹ 48,50,000"
            subtitle="Q3 Collection Cycle"
            variant="ocean"
            icon={<CreditCard className="w-5 h-5" />}
            trend={{ value: '+14.2%', isPositive: true }}
            progress={{ value: 82.5, targetLabel: '82.5% of total billed' }}
          />
          <SmartStatCard
            title="Academic Average"
            value="88.4%"
            subtitle="Pre-Board Term Evaluation"
            variant="purple"
            icon={<GraduationCap className="w-5 h-5" />}
            trend={{ value: '+3.1%', isPositive: true }}
            progress={{ value: 88.4, targetLabel: 'Grade A1 Trajectory' }}
          />
          <SmartStatCard
            title="Pending Dues"
            value="₹ 1,24,000"
            subtitle="28 Defaulter Accounts"
            variant="rose"
            icon={<AlertCircle className="w-5 h-5" />}
            trend={{ value: '-8.5%', isPositive: true, label: 'improved' }}
            progress={{ value: 15, targetLabel: 'Notice dispatched' }}
          />
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 2. PROGRESS RINGS */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#086A92]" />
          <span>2. Progress Rings</span>
        </h3>
        <p className="text-xs text-slate-500">
          Used for syllabus completion, attendance quota, homework progress, and task completion.
        </p>

        <Card className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 text-center">
            <ProgressRing
              progress={94}
              variant="emerald"
              size={90}
              strokeWidth={8}
              subtitle="Attendance (94%)"
            />
            <ProgressRing
              progress={78}
              variant="ocean"
              size={90}
              strokeWidth={8}
              subtitle="Syllabus Done (78%)"
            />
            <ProgressRing
              progress={86}
              variant="purple"
              size={90}
              strokeWidth={8}
              subtitle="Exam Prep (86%)"
            />
            <ProgressRing
              progress={62}
              variant="amber"
              size={90}
              strokeWidth={8}
              subtitle="Fee Target (62%)"
            />
            <ProgressRing
              progress={45}
              variant="rose"
              size={90}
              strokeWidth={8}
              subtitle="Lab Tasks (45%)"
            />
          </div>
        </Card>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3 & 4. TIMELINE & CALENDAR WIDGET */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#086A92]" />
          <span>3 &amp; 4. Interactive Timeline &amp; Calendar Widget</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <CardHeader className="p-0 pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Continuous Vertical Timeline
                </CardTitle>
              </CardHeader>
              <div className="pt-4">
                <Timeline items={sampleTimeline} />
              </div>
            </Card>
          </div>

          <div>
            <CalendarWidget
              events={sampleEvents}
              onSelectDate={(d) => showToast(`Selected date: ${d.toLocaleDateString()}`, 'info')}
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 5. VISUAL FILTERS */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#086A92]" />
          <span>5. Visual Filters</span>
        </h3>
        <p className="text-xs text-slate-500">
          Reusable search, category chips, and dropdown selector for tabular and analytic views.
        </p>

        <VisualFilters
          searchQuery={searchVal}
          onSearchChange={setSearchVal}
          searchPlaceholder="Filter students, faculty, or invoices..."
          chips={[
            { id: 'ALL', label: 'All Records', count: 124 },
            { id: 'PRESENT', label: 'Present Today', count: 118, color: '#16A34A' },
            { id: 'ABSENT', label: 'Absentees', count: 4, color: '#DC2626' },
            { id: 'LATE', label: 'Late Commuters', count: 2, color: '#D97706' },
            { id: 'FEES_DUE', label: 'Pending Dues', count: 18, color: '#7C3AED' },
          ]}
          selectedChipId={selectedChip}
          onSelectChip={setSelectedChip}
          dropdownOptions={[
            { label: 'Sort by Newest', value: 'newest' },
            { label: 'Sort by Roll Number', value: 'roll' },
            { label: 'Sort by Attendance Rate', value: 'attendance' },
          ]}
          selectedDropdownValue={selectedSort}
          onSelectDropdown={setSelectedSort}
          isFilterActive={searchVal.length > 0 || selectedChip !== 'ALL'}
          onReset={() => {
            setSearchVal('');
            setSelectedChip('ALL');
          }}
        />
      </section>

      {/* ---------------------------------------------------- */}
      {/* 6. PROFILE HEADER */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#086A92]" />
          <span>6. Profile Header</span>
        </h3>
        <p className="text-xs text-slate-500">
          Reusable profile header banner for Students, Faculty, and Staff members.
        </p>

        <ProfileHeader
          name="Aarav Verma"
          avatarUrl={null}
          idCode="EDV-2023-0101"
          idLabel="Adm No"
          statusBadge={{ label: 'Active Enrollment', variant: 'emerald' }}
          subtitle={
            <span>
              Class 10 - Section A • Roll No: <strong>01</strong> • <span className="text-emerald-700">House: Emerald</span>
            </span>
          }
          metaTags={[
            { icon: Mail, text: 'aarav.verma@student.edvonest.edu' },
            { icon: Phone, text: '+91 98765 43210', colorClass: 'text-[#16A34A]' },
            { icon: MapPin, text: 'Sector 62, Noida' },
          ]}
          actions={
            <Button size="xs" variant="outline" className="text-[#086A92]">
              View Full Dossier
            </Button>
          }
        />
      </section>

      {/* ---------------------------------------------------- */}
      {/* 7 & 8. CHART TOOLTIP & ACTIVITY FEED */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#086A92]" />
          <span>7 &amp; 8. Chart Tooltip &amp; Activity Feed</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Interactive Chart Tooltip
            </h4>
            <div className="p-8 bg-slate-100 rounded-xl flex items-center justify-center">
              <ChartTooltip
                title="CBSE Pre-Board Exam Evaluation"
                delta={{ value: '+4.2% vs Term 1', isPositive: true }}
                entries={[
                  { label: 'Student Score', value: '92.4%', color: '#086A92' },
                  { label: 'Class Section Average', value: '76.8%', color: '#16A34A' },
                  { label: 'Highest Benchmark', value: '98.0%', color: '#7C3AED' },
                ]}
              />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Activity Feed Component
            </h4>
            <ActivityFeed items={sampleActivity} />
          </Card>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 9, 10 & 11. NOTIFICATION TOASTS, MODALS & PREVIEWS */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#086A92]" />
          <span>9, 10, 11 &amp; 12. Notification Toasts, Modals &amp; File Preview</span>
        </h3>

        <Card className="p-6 space-y-4">
          <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Interactive Actions &amp; System Modals
          </h4>

          <div className="flex flex-wrap items-center gap-3">
            {/* Toast triggers */}
            <Button
              size="sm"
              variant="outline"
              className="text-emerald-700 bg-emerald-50 border-emerald-200"
              onClick={() => showToast('Attendance successfully verified for 32 students!', 'success')}
            >
              Trigger Success Toast
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-rose-700 bg-rose-50 border-rose-200"
              onClick={() => showToast('Unable to reach biometric turnstile server', 'error')}
            >
              Trigger Error Toast
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-amber-700 bg-amber-50 border-amber-200"
              onClick={() => showToast('Student attendance below 75% threshold', 'warning')}
            >
              Trigger Warning Toast
            </Button>

            {/* Modal triggers */}
            <Button
              size="sm"
              variant="outline"
              className="text-[#086A92] border-sky-300"
              onClick={() =>
                setPreviewFile({
                  title: 'Class 10 CBSE Board Marksheet',
                  category: 'Official Grade Sheet',
                  fileSize: '1.4 MB',
                  format: 'PDF',
                  uploadDate: new Date(),
                  verified: true,
                })
              }
            >
              <Eye className="w-3.5 h-3.5 mr-1" /> Open File Preview Modal
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-rose-600 border-rose-300"
              onClick={() => setIsConfirmModalOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Open Confirmation Modal
            </Button>
          </div>
        </Card>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 13 & 14. SKELETONS & EMPTY STATES */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#086A92]" />
          <span>13 &amp; 14. Skeleton Loading System &amp; Smart Empty States</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skeleton Loading Preset</h4>
            <CardSkeleton />
            <TableSkeleton rows={3} columns={3} />
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Smart Empty State Preset</h4>
            <EmptyState
              illustration="no-students"
              title="No Enrollees Found"
              description="No active student records match your selected grade or section criteria."
              actionLabel="Add New Student"
              onAction={() => showToast('Navigating to Add Student form...', 'info')}
            />
          </div>
        </div>
      </section>

      {/* File Preview Modal instance */}
      <FilePreviewModal
        isOpen={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />

      {/* Confirmation Modal instance */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Delete Examination Record"
        message="Are you sure you want to permanently delete this exam schedule? All entered student marks for this subject will be removed."
        confirmLabel="Yes, Delete Record"
        variant="danger"
        isLoading={confirmLoading}
        onConfirm={async () => {
          setConfirmLoading(true);
          await new Promise((r) => setTimeout(r, 1000));
          setConfirmLoading(false);
          setIsConfirmModalOpen(false);
          showToast('Record deleted successfully.', 'success');
        }}
      />
    </div>
  );
}
