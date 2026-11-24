'use client';

import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  User,
  Star,
  Upload,
  Camera,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { showToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/formatters';

export const HomeworkClient: React.FC<{
  homeworks: any[];
  classes: any[];
  subjects: any[];
  userRole: string;
}> = ({ homeworks: initialHomeworks, classes, subjects, userRole }) => {
  const [homeworks, setHomeworks] = useState(initialHomeworks);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedHw, setSelectedHw] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Assignment Creation Form
  const [formData, setFormData] = useState({
    classId: classes[0]?.id || '',
    sectionId: classes[0]?.sections[0]?.id || '',
    subjectId: subjects[0]?.id || '',
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    maxMarks: 20,
  });

  // Mobile Homework Submission Form
  const [submissionText, setSubmissionText] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch('/api/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setHomeworks((prev) => [data.homework, ...prev]);
        setIsAddModalOpen(false);
        showToast('Homework assigned and published to students!', 'success');
      } else {
        showToast(data.error || 'Failed to create homework', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenSubmit = (hw: any) => {
    setSelectedHw(hw);
    setSubmissionText('');
    setAttachedFileName('');
    setIsSubmitModalOpen(true);
  };

  const handleExecuteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHw) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/homework/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeworkId: selectedHw.id,
          submissionText: `${submissionText} ${attachedFileName ? `[Attachment: ${attachedFileName}]` : ''}`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Homework submitted successfully to your teacher!', 'success');
        setIsSubmitModalOpen(false);
        // Update local submission count
        setHomeworks((prev) =>
          prev.map((h) =>
            h.id === selectedHw.id
              ? { ...h, submissions: [...(h.submissions || []), data.submission] }
              : h
          )
        );
      } else {
        showToast(data.error || 'Submission failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const isFaculty = ['TEACHER', 'CLASS_TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'PRINCIPAL'].includes(userRole);
  const isStudentOrParent = userRole === 'STUDENT' || userRole === 'PARENT';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-600" />
            <span>Homework, Assignments &amp; Digital Submissions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mobile-friendly homework tracking, student photo/document submissions, and grading.
          </p>
        </div>

        {isFaculty && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Assign New Homework
          </Button>
        )}
      </div>

      {/* Homework Cards Grid */}
      {homeworks.length === 0 ? (
        <EmptyState
          illustration="no-homework"
          title="No Homework Assignments"
          description="Assignments created by faculty teachers and submission due dates will appear here."
          actionLabel={isFaculty ? "Assign New Homework" : undefined}
          onAction={isFaculty ? () => setIsAddModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {homeworks.map((hw) => {
            const isOverdue = new Date(hw.dueDate) < new Date();
            return (
              <Card key={hw.id} hoverEffect className="space-y-3.5 p-4 sm:p-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] bg-[#FEF2F2] text-[#990000] font-bold px-2 py-0.5 rounded border border-[#FECACA]">
                        {hw.class?.name || 'Class'} {hw.section ? `- Sec ${hw.section.name}` : ''} • {hw.subject?.name || 'General'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">{hw.title}</h3>
                    </div>
                    <Badge variant={isOverdue ? 'rose' : 'amber'}>Due: {formatDate(hw.dueDate)}</Badge>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {hw.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">
                    Max Marks: <strong>{hw.maxMarks || 20}</strong>
                  </span>

                  {isStudentOrParent ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenSubmit(hw)}
                    >
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      Submit Homework
                    </Button>
                  ) : (
                    <span className="text-emerald-700 font-bold">
                      {hw.submissions?.length || 0} Submissions Received
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: SUBMIT HOMEWORK (MOBILE FRIENDLY) */}
      {/* ---------------------------------------------------- */}
      {isSubmitModalOpen && selectedHw && (
        <Modal
          isOpen={true}
          onClose={() => setIsSubmitModalOpen(false)}
          title={`Submit Assignment: ${selectedHw.title}`}
        >
          <form onSubmit={handleExecuteSubmit} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">ASSIGNMENT DETAILS</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedHw.title}</p>
              <p className="text-slate-600 text-xs mt-1">{selectedHw.description}</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Your Submission Notes / Answers *</label>
              <textarea
                rows={3}
                required
                className="w-full px-3 py-2 border rounded-lg bg-white"
                placeholder="Write your explanation or answer summary here..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Upload Work / Notebook Photo</label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:bg-slate-50 transition-colors">
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700">
                    {attachedFileName ? attachedFileName : 'Take Photo or Choose File'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setAttachedFileName(e.target.files[0].name);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsSubmitModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isProcessing}>
                {isProcessing ? 'Submitting...' : 'Confirm Submission'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: ASSIGN HOMEWORK (FACULTY) */}
      {/* ---------------------------------------------------- */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Assign New Homework / Task"
          maxWidth="lg"
        >
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class *</label>
                <select
                  value={formData.classId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    const c = classes.find((cls) => cls.id === cId);
                    setFormData({
                      ...formData,
                      classId: cId,
                      sectionId: c?.sections[0]?.id || '',
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Section *</label>
                <select
                  value={formData.sectionId}
                  onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-white"
                >
                  {classes
                    .find((c) => c.id === formData.classId)
                    ?.sections.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        Section {s.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-white"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assignment Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                placeholder="e.g. Physics Laws of Motion Problem Set"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Instructions &amp; Requirements *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                placeholder="Detail textbook questions, diagram guidelines, and submission format..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Marks</label>
                <input
                  type="number"
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isProcessing}>
                {isProcessing ? 'Dispatching...' : 'Dispatch Homework'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
