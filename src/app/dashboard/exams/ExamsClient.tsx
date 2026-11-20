'use client';

import React, { useState } from 'react';
import {
  FileCheck2,
  Lock,
  Unlock,
  Edit3,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  Save,
  Check,
  Eye,
  Plus,
  Send,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import { formatDate, calculateGrade } from '@/lib/formatters';

export const ExamsClient: React.FC<{
  exams: any[];
  userRole: string;
  students: any[];
  subjects?: any[];
}> = ({ exams: initialExams, userRole, students, subjects = [] }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [exams, setExams] = useState(initialExams);
  const [selectedExam, setSelectedExam] = useState<any>(exams[0] || null);
  const [activeSchedule, setActiveSchedule] = useState<any | null>(null);
  const [marksState, setMarksState] = useState<Record<string, { theory: number; practical: number; remarks: string }>>({});
  const [isSavingMarks, setIsSavingMarks] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingExam, setIsCreatingExam] = useState(false);

  // New Exam Form
  const [newExamForm, setNewExamForm] = useState({
    name: '',
    term: 'TERM 1',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
    subjectId: subjects[0]?.id || '',
    maxMarks: 100,
    passMarks: 33,
  });

  const tabs: TabItem[] = [
    { id: 'upcoming', label: 'Upcoming Exams', count: exams.filter((e) => !e.isLocked && e.isPublished).length },
    { id: 'completed', label: 'Completed & Finalized', count: exams.filter((e) => e.isLocked).length },
    { id: 'drafts', label: 'Draft Schedules', count: exams.filter((e) => !e.isPublished).length },
  ];

  const filteredExams = exams.filter((e) => {
    if (activeTab === 'upcoming') return !e.isLocked && e.isPublished;
    if (activeTab === 'completed') return e.isLocked;
    if (activeTab === 'drafts') return !e.isPublished;
    return true;
  });

  const handleOpenMarksEntry = (schedule: any) => {
    setActiveSchedule(schedule);
    const initialMap: Record<string, { theory: number; practical: number; remarks: string }> = {};

    students.forEach((s) => {
      const existing = schedule.markEntries?.find((m: any) => m.studentId === s.id);
      initialMap[s.id] = {
        theory: existing?.theoryMarks || 0,
        practical: existing?.practicalMarks || 0,
        remarks: existing?.remarks || '',
      };
    });

    setMarksState(initialMap);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamForm.name.trim()) {
      showToast('Please enter an examination name', 'warning');
      return;
    }

    setIsCreatingExam(true);
    try {
      const schedules = newExamForm.subjectId
        ? [
            {
              subjectId: newExamForm.subjectId,
              examDate: newExamForm.startDate,
              maxMarks: Number(newExamForm.maxMarks),
              passMarks: Number(newExamForm.passMarks),
            },
          ]
        : [];

      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newExamForm.name,
          term: newExamForm.term,
          startDate: newExamForm.startDate,
          endDate: newExamForm.endDate,
          schedules,
        }),
      });

      const data = await res.json();
      if (res.ok && data.exam) {
        setExams((prev) => [data.exam, ...prev]);
        setSelectedExam(data.exam);
        setIsCreateModalOpen(false);
        showToast(`Examination "${data.exam.name}" created successfully!`, 'success');
      } else {
        showToast(data.error || 'Failed to create examination', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsCreatingExam(false);
    }
  };

  const handlePublishExam = async (examId: string) => {
    setIsPublishing(true);
    try {
      const res = await fetch('/api/exams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          isPublished: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.exam) {
        setExams((prev) =>
          prev.map((ex) => (ex.id === examId ? { ...ex, isPublished: true } : ex))
        );
        if (selectedExam?.id === examId) {
          setSelectedExam((prev: any) => ({ ...prev, isPublished: true }));
        }
        showToast('Examination results published to students and parents!', 'success');
      } else {
        showToast(data.error || 'Failed to publish examination', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchedule) return;
    setIsSavingMarks(true);
    try {
      const markEntries = Object.entries(marksState).map(([studentId, val]) => ({
        studentId,
        theoryMarks: val.theory,
        practicalMarks: val.practical,
        remarks: val.remarks,
      }));

      const res = await fetch('/api/exams/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examScheduleId: activeSchedule.id,
          markEntries,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Marks saved successfully!', 'success');
        // Update local schedule entries without reload
        if (selectedExam && activeSchedule) {
          const updatedSchedules = selectedExam.schedules.map((s: any) => {
            if (s.id === activeSchedule.id) {
              return { ...s, markEntries };
            }
            return s;
          });
          setSelectedExam({ ...selectedExam, schedules: updatedSchedules });
        }
        setActiveSchedule(null);
      } else {
        showToast(data.error || 'Failed to save marks', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsSavingMarks(false);
    }
  };

  const handleToggleLock = async (examId: string, currentLockState: boolean) => {
    setLockLoading(true);
    try {
      const res = await fetch('/api/exams/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          isLocked: !currentLockState,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setExams((prev) =>
          prev.map((ex) => (ex.id === examId ? { ...ex, isLocked: !currentLockState } : ex))
        );
        if (selectedExam?.id === examId) {
          setSelectedExam((prev: any) => ({ ...prev, isLocked: !currentLockState }));
        }
        showToast(
          !currentLockState
            ? 'Exam finalized and locked for report generation'
            : 'Exam unlocked for marks correction',
          'success'
        );
      } else {
        showToast(data.error || 'Lock toggle failed', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLockLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-[#E4EAEC] rounded-xl p-5 shadow-2xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#17313A] tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[#086A92]" />
            <span>Examinations &amp; Marks Entry</span>
          </h2>
          <p className="text-xs text-[#6B7C83] mt-0.5">
            Manage exam schedules, enter subject marks fast, and finalize report cards.
          </p>
        </div>

        {(userRole === 'SCHOOL_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'PRINCIPAL') && (
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Examination
          </Button>
        )}
      </div>

      {/* Tabs: Upcoming, Completed, Drafts */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredExams.length === 0 ? (
          <div className="col-span-3 p-8 bg-white border border-[#E4EAEC] rounded-xl text-center text-xs text-[#6B7C83]">
            No exams in this category.
          </div>
        ) : (
          filteredExams.map((ex) => {
            const isSelected = selectedExam?.id === ex.id;
            return (
              <div
                key={ex.id}
                onClick={() => setSelectedExam(ex)}
                className={`cursor-pointer p-4 rounded-xl border transition-all ${isSelected
                  ? 'bg-[#EAF5F8] border-[#086A92] shadow-xs'
                  : 'bg-white border-[#E4EAEC] hover:border-[#cbd7da]'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#086A92] uppercase bg-[#EAF5F8] px-2 py-0.5 rounded">
                    {ex.term || 'TERM 1'}
                  </span>
                  <Badge variant={ex.isLocked ? 'rose' : 'green'} size="xs">
                    {ex.isLocked ? 'Locked' : 'Scheduled'}
                  </Badge>
                </div>

                <h4 className="text-sm font-bold text-[#17313A] mt-2">
                  {ex.name}
                </h4>
                <p className="text-xs text-[#6B7C83] mt-0.5">
                  Class 10 • {formatDate(ex.startDate, 'dd MMM')} – {formatDate(ex.endDate, 'dd MMM')}
                </p>

                <div className="mt-3 pt-2 border-t border-[#E4EAEC] flex justify-between items-center text-xs">
                  <span className="text-[#6B7C83]">{ex.schedules?.length || 0} Subjects</span>
                  <span className="font-bold text-[#086A92]">View &rarr;</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Active Exam Details & Subject Schedules */}
      {selectedExam && (
        <Card>
          <CardHeader>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{selectedExam.name}</CardTitle>
                <Badge variant={selectedExam.isLocked ? 'rose' : 'green'} size="xs">
                  {selectedExam.isLocked ? 'Locked' : 'Marks Entry Open'}
                </Badge>
              </div>
              <p className="text-xs text-[#6B7C83] mt-0.5">
                {selectedExam.isLocked
                  ? 'Locked & finalized by Principal'
                  : 'Fast keyboard-friendly subject marks entry'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!selectedExam.isPublished && (userRole === 'SCHOOL_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'PRINCIPAL') && (
                <Button
                  variant="primary"
                  size="xs"
                  isLoading={isPublishing}
                  onClick={() => handlePublishExam(selectedExam.id)}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Publish Results
                </Button>
              )}

              {selectedExam.isPublished && (
                <Badge variant="green" size="sm">
                  Published Live
                </Badge>
              )}

              {(userRole === 'SCHOOL_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'PRINCIPAL') && (
                <Button
                  variant={selectedExam.isLocked ? 'outline' : 'danger'}
                  size="xs"
                  isLoading={lockLoading}
                  onClick={() => handleToggleLock(selectedExam.id, selectedExam.isLocked)}
                  leftIcon={selectedExam.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                >
                  {selectedExam.isLocked ? 'Unlock Results' : 'Finalize & Lock'}
                </Button>
              )}
            </div>
          </CardHeader>

          {/* Mobile Cards for Exam Schedules (< sm) */}
          <div className="sm:hidden divide-y divide-[#E4EAEC]">
            {selectedExam.schedules?.map((sched: any) => (
              <div key={sched.id} className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#17313A] text-sm">{sched.subject?.name}</span>
                  <Badge variant={selectedExam.isLocked ? 'rose' : 'green'} size="xs">
                    {formatDate(sched.examDate)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-[#6B7C83]">
                  <span>Timing: {sched.startTime} - {sched.endTime}</span>
                  <span>Room: {sched.roomNumber || 'Main Hall'}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-dashed border-[#E4EAEC]">
                  <span className="font-mono">
                    Max: {sched.maxTheoryMarks} Th + {sched.maxPracticalMarks} Pr (Pass: {sched.passingMarks})
                  </span>
                  <Button
                    variant={selectedExam.isLocked ? 'outline' : 'primary'}
                    size="xs"
                    disabled={selectedExam.isLocked && userRole === 'TEACHER'}
                    onClick={() => handleOpenMarksEntry(sched)}
                    leftIcon={<Edit3 className="w-3 h-3" />}
                  >
                    {selectedExam.isLocked ? 'View' : 'Marks'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table for Exam Schedules (>= sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7FAFA] text-[#6B7C83] font-bold border-b border-[#E4EAEC]">
                <tr>
                  <th className="p-3">Exam Date</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Timing</th>
                  <th className="p-3">Room</th>
                  <th className="p-3">Max Theory / Practical</th>
                  <th className="p-3">Pass Mark</th>
                  <th className="p-3">Marks Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EAEC]">
                {selectedExam.schedules?.map((sched: any) => (
                  <tr key={sched.id} className="hover:bg-[#F7FAFA]">
                    <td className="p-3 font-semibold text-[#17313A]">{formatDate(sched.examDate)}</td>
                    <td className="p-3 font-bold text-[#17313A]">{sched.subject?.name}</td>
                    <td className="p-3 text-[#6B7C83]">{sched.startTime} - {sched.endTime}</td>
                    <td className="p-3 text-[#6B7C83]">{sched.roomNumber || 'Room 1001'}</td>
                    <td className="p-3 font-mono text-[#17313A]">
                      {sched.maxTheoryMarks} Th + {sched.maxPracticalMarks} Pr
                    </td>
                    <td className="p-3 font-mono font-bold text-[#17313A]">{sched.passingMarks}</td>
                    <td className="p-3">
                      <span className="text-[10.5px] bg-[#EAF8EC] text-[#16A34A] px-2 py-0.5 rounded font-bold border border-[#bbf0c5]">
                        {sched.markEntries?.length || 0} Recorded
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant={selectedExam.isLocked ? 'outline' : 'primary'}
                        size="xs"
                        disabled={selectedExam.isLocked && userRole === 'TEACHER'}
                        onClick={() => handleOpenMarksEntry(sched)}
                        leftIcon={<Edit3 className="w-3 h-3" />}
                      >
                        {selectedExam.isLocked ? 'View Marks' : 'Enter Marks'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ---------------------------------------------------- */}
      {/* DRAWER: FAST MARKS ENTRY MATRIX */}
      {/* ---------------------------------------------------- */}
      <Drawer
        isOpen={!!activeSchedule}
        onClose={() => setActiveSchedule(null)}
        title={`Marks Entry: ${activeSchedule?.subject?.name}`}
        subtitle={`Theory (${activeSchedule?.maxTheoryMarks}) + Practical (${activeSchedule?.maxPracticalMarks})`}
        width="2xl"
      >
        {activeSchedule && (
          <form onSubmit={handleSaveMarks} className="space-y-4 text-xs">
            <div className="p-3 bg-[#F7FAFA] border border-[#E4EAEC] rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-[#17313A]">{activeSchedule.subject?.name}</p>
                <p className="text-[11px] text-[#6B7C83]">
                  Passing: {activeSchedule.passingMarks} / {activeSchedule.maxTheoryMarks + activeSchedule.maxPracticalMarks}
                </p>
              </div>
              <Badge variant="blue" size="xs">Keyboard-friendly</Badge>
            </div>

            <div className="max-h-[60vh] overflow-y-auto border border-[#E4EAEC] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7FAFA] font-bold text-[#6B7C83] border-b border-[#E4EAEC] sticky top-0">
                  <tr>
                    <th className="p-2.5">Roll</th>
                    <th className="p-2.5">Student</th>
                    <th className="p-2.5">Theory ({activeSchedule.maxTheoryMarks})</th>
                    <th className="p-2.5">Practical ({activeSchedule.maxPracticalMarks})</th>
                    <th className="p-2.5">Total &amp; Grade</th>
                    <th className="p-2.5">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4EAEC]">
                  {students.map((st) => {
                    const theory = marksState[st.id]?.theory || 0;
                    const practical = marksState[st.id]?.practical || 0;
                    const total = theory + practical;
                    const gradeInfo = calculateGrade(total, 100);

                    return (
                      <tr key={st.id} className="hover:bg-[#F7FAFA]">
                        <td className="p-2.5 font-mono font-bold text-[#17313A]">{st.rollNumber || '01'}</td>
                        <td className="p-2.5 font-bold text-[#17313A]">{st.name}</td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min={0}
                            max={activeSchedule.maxTheoryMarks}
                            value={theory}
                            disabled={selectedExam.isLocked}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setMarksState((prev) => ({
                                ...prev,
                                [st.id]: { ...prev[st.id], theory: val },
                              }));
                            }}
                            className="w-16 px-2 py-1 border border-[#E4EAEC] rounded font-mono font-bold text-[#17313A] focus:outline-none focus:border-[#086A92]"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min={0}
                            max={activeSchedule.maxPracticalMarks}
                            value={practical}
                            disabled={selectedExam.isLocked}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setMarksState((prev) => ({
                                ...prev,
                                [st.id]: { ...prev[st.id], practical: val },
                              }));
                            }}
                            className="w-16 px-2 py-1 border border-[#E4EAEC] rounded font-mono font-bold text-[#17313A] focus:outline-none focus:border-[#086A92]"
                          />
                        </td>
                        <td className="p-2.5">
                          <span className="font-bold text-[#17313A] mr-1.5">{total}</span>
                          <span className="font-bold text-[#16A34A]">({gradeInfo.grade})</span>
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            placeholder="Feedback..."
                            value={marksState[st.id]?.remarks || ''}
                            disabled={selectedExam.isLocked}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMarksState((prev) => ({
                                ...prev,
                                [st.id]: { ...prev[st.id], remarks: val },
                              }));
                            }}
                            className="w-full px-2 py-1 border border-[#E4EAEC] rounded text-xs focus:outline-none focus:border-[#086A92]"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-[#E4EAEC] flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveSchedule(null)}
              >
                Close
              </Button>
              {!selectedExam.isLocked && (
                <Button type="submit" variant="primary" size="sm" isLoading={isSavingMarks}>
                  Save Marks
                </Button>
              )}
            </div>
          </form>
        )}
      </Drawer>

      {/* Create Examination Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule New Examination"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#17313A] mb-1">
              Examination Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. CBSE Term 2 Pre-Board Exam"
              value={newExamForm.name}
              onChange={(e) => setNewExamForm({ ...newExamForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-[#E4EAEC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#086A92]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#17313A] mb-1">
                Term
              </label>
              <select
                value={newExamForm.term}
                onChange={(e) => setNewExamForm({ ...newExamForm, term: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E4EAEC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#086A92]"
              >
                <option value="TERM 1">TERM 1</option>
                <option value="TERM 2">TERM 2</option>
                <option value="ANNUAL">ANNUAL</option>
                <option value="PERIODIC TEST">PERIODIC TEST</option>
                <option value="PRE-BOARD">PRE-BOARD</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17313A] mb-1">
                Primary Subject
              </label>
              <select
                value={newExamForm.subjectId}
                onChange={(e) => setNewExamForm({ ...newExamForm, subjectId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E4EAEC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#086A92]"
              >
                {subjects.length === 0 && <option value="">No subjects found</option>}
                {subjects.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code || 'SUB'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#17313A] mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={newExamForm.startDate}
                onChange={(e) => setNewExamForm({ ...newExamForm, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E4EAEC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#086A92]"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17313A] mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={newExamForm.endDate}
                onChange={(e) => setNewExamForm({ ...newExamForm, endDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E4EAEC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#086A92]"
              >
              </input>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#17313A] mb-1">
                Max Marks
              </label>
              <input
                type="number"
                min={10}
                max={200}
                value={newExamForm.maxMarks}
                onChange={(e) => setNewExamForm({ ...newExamForm, maxMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-[#E4EAEC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#086A92]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17313A] mb-1">
                Passing Marks
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={newExamForm.passMarks}
                onChange={(e) => setNewExamForm({ ...newExamForm, passMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-[#E4EAEC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#086A92]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E4EAEC] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreatingExam}
            >
              Schedule Examination
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
