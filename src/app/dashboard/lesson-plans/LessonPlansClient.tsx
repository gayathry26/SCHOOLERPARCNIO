'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Layers,
  FileCheck2,
  User,
  Sparkles,
  Search,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { formatDate } from '@/lib/formatters';

export const LessonPlansClient: React.FC<{
  lessonPlans: any[];
  classes: any[];
  subjects: any[];
  chapters: any[];
  teachers: any[];
  userRole: string;
  currentUserId: string;
}> = ({
  lessonPlans: initialPlans,
  classes,
  subjects,
  chapters,
  teachers,
  userRole,
}) => {
  const [plans, setPlans] = useState(initialPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    classId: classes[0]?.id || '',
    sectionId: classes[0]?.sections[0]?.id || '',
    subjectId: subjects[0]?.id || '',
    chapterId: chapters[0]?.id || '',
    topicTitle: '',
    learningObjectives: '',
    teachingMethod: 'Interactive Smartboard Lecture & Paired Problem Solving',
    materialsNeeded: 'NCERT Textbook, Geometry Box, Projector slides',
    scheduledDate: new Date().toISOString().slice(0, 10),
  });

  const selectedClass = classes.find((c) => c.id === formData.classId) || classes[0];
  const canApprove = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(userRole);

  const filteredPlans = plans.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/lesson-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE', ...formData }),
      });
      const data = await res.json();
      if (res.ok) {
        setPlans([data.lessonPlan, ...plans]);
        setIsModalOpen(false);
        setFormData({ ...formData, topicTitle: '', learningObjectives: '' });
      } else {
        alert(data.error || 'Failed to create lesson plan');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (planId: string) => {
    try {
      const res = await fetch('/api/lesson-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE', planId, remarks: 'Pedagogical objectives approved.' }),
      });
      if (res.ok) {
        setPlans((prev) =>
          prev.map((p) => (p.id === planId ? { ...p, status: 'APPROVED' } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = async (planId: string) => {
    try {
      const res = await fetch('/api/lesson-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_COMPLETED', planId }),
      });
      if (res.ok) {
        setPlans((prev) =>
          prev.map((p) => (p.id === planId ? { ...p, completionStatus: 'COMPLETED' } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 text-[#990000]" />
              <span>Lesson Planning &amp; Syllabus Progress Tracker</span>
            </h2>
            <Badge variant="blue" size="sm">
              Pedagogy Studio
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Teacher daily lesson designs, learning outcomes, teaching methodologies, and Principal sign-off workflows.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Draft Lesson Plan
        </Button>
      </div>

      {/* 4 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Lesson Plans"
          value={plans.length}
          subtitle="Class & Subject Scheduled"
          icon={<Layers className="w-5 h-5" />}
          variant="blue"
        />
        <StatCard
          title="Approved Plans"
          value={plans.filter((p) => p.status === 'APPROVED').length}
          subtitle="Signed-off by Leadership"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="green"
        />
        <StatCard
          title="Pending Approval"
          value={plans.filter((p) => p.status === 'SUBMITTED').length}
          subtitle="Review Queue"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Completed Lessons"
          value={plans.filter((p) => p.completionStatus === 'COMPLETED').length}
          subtitle="Syllabus Delivered"
          icon={<BookOpen className="w-5 h-5" />}
          variant="teal"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-white p-3 border border-[#E5E5E5] rounded-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span>Filter Status:</span>
          {['all', 'SUBMITTED', 'APPROVED', 'DRAFT'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-[#990000] text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {s === 'all' ? 'All Plans' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    plan.status === 'APPROVED' ? 'green' : plan.status === 'SUBMITTED' ? 'amber' : 'slate'
                  }
                  size="xs"
                >
                  {plan.status}
                </Badge>
                <Badge
                  variant={plan.completionStatus === 'COMPLETED' ? 'teal' : 'slate'}
                  size="xs"
                >
                  {plan.completionStatus}
                </Badge>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-500">
                {formatDate(plan.scheduledDate, 'dd MMM yyyy')}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-snug">{plan.topicTitle}</h3>
              <p className="text-xs text-[#990000] font-semibold mt-0.5">
                {plan.class?.name} - {plan.section?.name} • {plan.subject?.name}
                {plan.chapter && <span className="text-slate-500 font-normal"> ({plan.chapter.name})</span>}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100 text-xs">
              <div>
                <strong className="text-slate-800">Learning Objectives:</strong>
                <p className="text-slate-600 mt-0.5">{plan.learningObjectives}</p>
              </div>
              <div>
                <strong className="text-slate-800">Methodology:</strong>
                <p className="text-slate-600 mt-0.5">{plan.teachingMethod}</p>
              </div>
              {plan.materialsNeeded && (
                <div className="text-[11px] text-slate-500 font-mono">
                  Materials: {plan.materialsNeeded}
                </div>
              )}
            </div>

            {plan.principalRemarks && (
              <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                <strong>Principal Remarks:</strong> {plan.principalRemarks}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Teacher: {plan.teacher?.user?.firstName} {plan.teacher?.user?.lastName}
              </span>
              <div className="flex items-center gap-2">
                {canApprove && plan.status === 'SUBMITTED' && (
                  <Button
                    size="xs"
                    variant="primary"
                    onClick={() => handleApprove(plan.id)}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Approve
                  </Button>
                )}
                {plan.completionStatus !== 'COMPLETED' && (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handleComplete(plan.id)}
                  >
                    Mark Taught
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* CREATE LESSON PLAN MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Draft Structured Lesson Plan"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
              <select
                value={formData.sectionId}
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg"
              >
                {selectedClass?.sections?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    Section {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chapter</label>
              <select
                value={formData.chapterId}
                onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg"
              >
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Topic Title</label>
            <input
              type="text"
              required
              value={formData.topicTitle}
              onChange={(e) => setFormData({ ...formData, topicTitle: e.target.value })}
              placeholder="e.g. Derivation of Quadratic Formula and Nature of Roots"
              className="w-full text-xs p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Learning Objectives (Outcomes)
            </label>
            <textarea
              required
              rows={2}
              value={formData.learningObjectives}
              onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
              placeholder="What will students understand, prove, or calculate by end of period?"
              className="w-full text-xs p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Teaching Methodology</label>
            <input
              type="text"
              value={formData.teachingMethod}
              onChange={(e) => setFormData({ ...formData, teachingMethod: e.target.value })}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Teaching Materials Needed</label>
            <input
              type="text"
              value={formData.materialsNeeded}
              onChange={(e) => setFormData({ ...formData, materialsNeeded: e.target.value })}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Date</label>
            <input
              type="date"
              required
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Submit for Approval
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
