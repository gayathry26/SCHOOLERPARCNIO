'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Sparkles,
  BookOpen,
  Printer,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/formatters';

export const QuestionBankClient: React.FC<{
  questions: any[];
  questionPapers: any[];
  mockTests: any[];
  subjects: any[];
  classes: any[];
  chapters: any[];
  userRole: string;
}> = ({
  questions: initialQuestions,
  questionPapers: initialPapers,
  mockTests,
  subjects,
  classes,
  chapters,
  userRole,
}) => {
    const [activeTab, setActiveTab] = useState('repository');
    const [questions, setQuestions] = useState(initialQuestions);
    const [papers, setPapers] = useState(initialPapers);

    // Filters
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
    const [isGeneratePaperOpen, setIsGeneratePaperOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Question Form
    const [qForm, setQForm] = useState({
      subjectId: subjects[0]?.id || '',
      chapterId: chapters[0]?.id || '',
      questionType: 'MCQ',
      difficulty: 'MEDIUM',
      marks: 1,
      questionText: '',
      explanation: '',
      optA: '',
      optB: '',
      optC: '',
      optD: '',
      correctOpt: 'A',
    });

    // Paper Form
    const [pForm, setPForm] = useState({
      title: '',
      subjectId: subjects[0]?.id || '',
      classId: classes[0]?.id || '',
      totalMarks: 80,
      durationMinutes: 180,
      instructions: '1. Paper consists of Section A (MCQs), Section B (Short), Section C (Long).\n2. All questions are compulsory.',
    });

    const filteredQuestions = questions.filter((q) => {
      if (selectedSubject !== 'all' && q.subjectId !== selectedSubject) return false;
      if (selectedType !== 'all' && q.questionType !== selectedType) return false;
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      if (searchQuery && !q.questionText.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    const handleCreateQuestion = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/question-bank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'CREATE_QUESTION', ...qForm }),
        });
        const data = await res.json();
        if (res.ok) {
          setQuestions([data.question, ...questions]);
          setIsAddQuestionOpen(false);
          setQForm({
            ...qForm,
            questionText: '',
            explanation: '',
            optA: '',
            optB: '',
            optC: '',
            optD: '',
          });
        } else {
          alert(data.error || 'Failed to create question');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleGeneratePaper = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/question-bank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'GENERATE_PAPER', ...pForm }),
        });
        const data = await res.json();
        if (res.ok) {
          setPapers([data.paper, ...papers]);
          setIsGeneratePaperOpen(false);
        } else {
          alert(data.error || 'Failed to generate paper');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleApprovePaper = async (paperId: string) => {
      try {
        const res = await fetch('/api/question-bank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'APPROVE_PAPER', paperId }),
        });
        if (res.ok) {
          setPapers((prev) =>
            prev.map((p) => (p.id === paperId ? { ...p, isApproved: true } : p))
          );
        }
      } catch (e) {
        console.error(e);
      }
    };

    const tabs: TabItem[] = [
      { id: 'repository', label: 'Question Repository', count: questions.length, icon: <Layers className="w-4 h-4" /> },
      { id: 'papers', label: 'Question Papers & Blueprints', count: papers.length, icon: <FileText className="w-4 h-4" /> },
      { id: 'mocks', label: 'Online Mock Examinations', count: mockTests.length, icon: <HelpCircle className="w-4 h-4" /> },
    ];

    const canApprove = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(userRole);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] p-5 rounded-2xl shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#990000]" />
                <span>Smart Examination Question Bank &amp; Blueprint Studio</span>
              </h2>
              <Badge variant="blue" size="sm">
                CBSE / ICSE Compliant
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Centralized subject &amp; chapter question repositories, automated blueprint paper generator, and mock tests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGeneratePaperOpen(true)}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#990000]" />}
            >
              Auto-Generate Paper
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddQuestionOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Question
            </Button>
          </div>
        </div>

        {/* 4 Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Repository Questions"
            value={questions.length}
            subtitle="Classified by Chapter & Difficulty"
            icon={<Layers className="w-5 h-5" />}
            variant="blue"
          />
          <StatCard
            title="Generated Test Papers"
            value={papers.length}
            subtitle={`${papers.filter((p) => p.isApproved).length} Approved & Published`}
            icon={<FileText className="w-5 h-5" />}
            variant="teal"
          />
          <StatCard
            title="Pending Paper Approvals"
            value={papers.filter((p) => !p.isApproved).length}
            subtitle="Awaiting Principal Review"
            icon={<ShieldCheck className="w-5 h-5" />}
            variant="amber"
          />
          <StatCard
            title="Online Mock Tests"
            value={mockTests.length}
            subtitle="Auto-evaluated Objective Exams"
            icon={<HelpCircle className="w-5 h-5" />}
            variant="green"
          />
        </div>

        {/* Tabs */}
        <Tabs items={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* TAB 1: REPOSITORY */}
        {activeTab === 'repository' && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 border border-[#E5E5E5] rounded-xl">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions by text or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg px-2.5 py-1.5 font-semibold text-slate-700"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg px-2.5 py-1.5 font-semibold text-slate-700"
                >
                  <option value="all">All Types</option>
                  <option value="MCQ">MCQ</option>
                  <option value="SHORT">Short Answer</option>
                  <option value="LONG">Long Answer</option>
                </select>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg px-2.5 py-1.5 font-semibold text-slate-700"
                >
                  <option value="all">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="space-y-3">
              {filteredQuestions.length === 0 ? (
                <EmptyState
                  illustration="no-search"
                  title="No Questions Found"
                  description="No questions match your current subject or difficulty filters. Try adjusting filters or create a new question."
                  actionLabel="Add Question"
                  onAction={() => setIsAddQuestionOpen(true)}
                />
              ) : (
                filteredQuestions.map((q, idx) => (
                  <Card key={q.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={q.difficulty === 'HARD' ? 'rose' : q.difficulty === 'MEDIUM' ? 'amber' : 'green'} size="xs">
                          {q.difficulty}
                        </Badge>
                        <Badge variant="slate" size="xs">
                          {q.questionType}
                        </Badge>
                        <span className="text-xs font-bold text-[#990000]">{q.subject?.name}</span>
                        {q.chapter && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            • {q.chapter.name}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{q.marks} Mark{q.marks > 1 ? 's' : ''}</span>
                    </div>

                    <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                      {q.questionText}
                    </p>

                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt: any) => (
                          <div
                            key={opt.id}
                            className={`p-2 rounded-lg text-[11px] flex items-center gap-2 border ${opt.isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                          >
                            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center font-bold text-[9px] shrink-0">
                              {opt.optionKey}
                            </span>
                            <span>{opt.optionText}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.explanation && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-md border border-slate-100">
                        <strong className="text-slate-700">Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PAPERS */}
        {activeTab === 'papers' && (
          <div className="space-y-4">
            {papers.length === 0 ? (
              <EmptyState
                illustration="no-search"
                title="No Question Papers Generated"
                description="Assemble customized examination papers directly from the central curriculum question repository."
                actionLabel="Generate Question Paper"
                onAction={() => setIsGeneratePaperOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {papers.map((p) => (
                  <Card key={p.id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <Badge variant={p.isApproved ? 'green' : 'amber'} size="xs">
                        {p.isApproved ? 'Approved for Printing' : 'Draft / Needs Principal Sign-off'}
                      </Badge>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {p.totalMarks} Marks • {p.durationMinutes} Mins
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{p.title}</h3>
                      <p className="text-xs text-[#990000] font-semibold mt-0.5">
                        {p.class?.name} • {p.subject?.name}
                      </p>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-600 whitespace-pre-wrap font-mono">
                      {p.instructions}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400">
                        Created: {formatDate(p.createdAt)}
                      </span>
                      <div className="flex items-center gap-2">
                        {!p.isApproved && canApprove && (
                          <Button
                            size="xs"
                            variant="primary"
                            onClick={() => handleApprovePaper(p.id)}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Approve Paper
                          </Button>
                        )}
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => window.print()}
                          leftIcon={<Printer className="w-3.5 h-3.5" />}
                        >
                          Print Paper
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MOCK TESTS */}
        {activeTab === 'mocks' && (
          <div>
            {mockTests.length === 0 ? (
              <EmptyState
                illustration="ai-tutor"
                title="No Online Mock Tests Scheduled"
                description="Configure digital practice assessments with instant automated evaluation and result analytics."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {mockTests.map((m) => (
                  <Card key={m.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={m.isPublished ? 'green' : 'slate'} size="xs">
                        {m.isPublished ? 'Live & Accepting' : 'Scheduled'}
                      </Badge>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {m.totalMarks} Marks
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{m.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {m.class?.name} • {m.subject?.name} • {m.durationMinutes} mins
                    </p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span>{m.submissions?.length || 0} Submissions</span>
                      <Button size="xs" variant="primary">
                        Start Mock Test
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL: ADD QUESTION */}
        <Modal
          isOpen={isAddQuestionOpen}
          onClose={() => setIsAddQuestionOpen(false)}
          title="Add New Question to Central Repository"
        >
          <form onSubmit={handleCreateQuestion} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <select
                  value={qForm.subjectId}
                  onChange={(e) => setQForm({ ...qForm, subjectId: e.target.value })}
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
                  value={qForm.chapterId}
                  onChange={(e) => setQForm({ ...qForm, chapterId: e.target.value })}
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

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                <select
                  value={qForm.questionType}
                  onChange={(e) => setQForm({ ...qForm, questionType: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                >
                  <option value="MCQ">MCQ</option>
                  <option value="SHORT">Short Answer</option>
                  <option value="LONG">Long Answer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
                <select
                  value={qForm.difficulty}
                  onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Marks</label>
                <input
                  type="number"
                  value={qForm.marks}
                  onChange={(e) => setQForm({ ...qForm, marks: Number(e.target.value) })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Question Text</label>
              <textarea
                required
                rows={3}
                value={qForm.questionText}
                onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                placeholder="State question clearly following CBSE/NCERT guidelines..."
              />
            </div>

            {qForm.questionType === 'MCQ' && (
              <div className="space-y-2 border-t border-slate-100 pt-2">
                <label className="block text-xs font-bold text-slate-700">4 Options &amp; Correct Answer</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Option A"
                    value={qForm.optA}
                    onChange={(e) => setQForm({ ...qForm, optA: e.target.value })}
                    className="text-xs p-2 border border-slate-200 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Option B"
                    value={qForm.optB}
                    onChange={(e) => setQForm({ ...qForm, optB: e.target.value })}
                    className="text-xs p-2 border border-slate-200 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Option C"
                    value={qForm.optC}
                    onChange={(e) => setQForm({ ...qForm, optC: e.target.value })}
                    className="text-xs p-2 border border-slate-200 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Option D"
                    value={qForm.optD}
                    onChange={(e) => setQForm({ ...qForm, optD: e.target.value })}
                    className="text-xs p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs pt-1">
                  <span className="font-semibold text-slate-700">Correct Option:</span>
                  {['A', 'B', 'C', 'D'].map((key) => (
                    <label key={key} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="correctOpt"
                        value={key}
                        checked={qForm.correctOpt === key}
                        onChange={(e) => setQForm({ ...qForm, correctOpt: e.target.value })}
                      />
                      <span>{key}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Step-by-Step Explanation</label>
              <textarea
                rows={2}
                value={qForm.explanation}
                onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                placeholder="Explain why the solution is correct..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setIsAddQuestionOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
                Save Question
              </Button>
            </div>
          </form>
        </Modal>

        {/* MODAL: GENERATE PAPER */}
        <Modal
          isOpen={isGeneratePaperOpen}
          onClose={() => setIsGeneratePaperOpen(false)}
          title="Auto-Generate CBSE/ICSE Blueprint Question Paper"
        >
          <form onSubmit={handleGeneratePaper} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Paper Title</label>
              <input
                type="text"
                required
                value={pForm.title}
                onChange={(e) => setPForm({ ...pForm, title: e.target.value })}
                placeholder="e.g. CBSE Class 10 Pre-Board Assessment Mathematics 2026"
                className="w-full text-xs p-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <select
                  value={pForm.subjectId}
                  onChange={(e) => setPForm({ ...pForm, subjectId: e.target.value })}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Class</label>
                <select
                  value={pForm.classId}
                  onChange={(e) => setPForm({ ...pForm, classId: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Marks</label>
                <input
                  type="number"
                  value={pForm.totalMarks}
                  onChange={(e) => setPForm({ ...pForm, totalMarks: Number(e.target.value) })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Mins)</label>
                <input
                  type="number"
                  value={pForm.durationMinutes}
                  onChange={(e) => setPForm({ ...pForm, durationMinutes: Number(e.target.value) })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Instructions</label>
              <textarea
                rows={3}
                value={pForm.instructions}
                onChange={(e) => setPForm({ ...pForm, instructions: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <span className="font-bold">CBSE Blueprint Rule:</span> Paper will draw questions proportionally across Easy (30%), Medium (50%), and Hard (20%) difficulty tiers and require Principal sign-off before printing.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setIsGeneratePaperOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
                Compile &amp; Generate Paper
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  };
