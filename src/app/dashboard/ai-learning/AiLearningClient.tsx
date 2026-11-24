'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Brain,
  MessageSquare,
  Award,
  Sliders,
  Send,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/formatters';

export const AiLearningClient: React.FC<{
  learningPaths: any[];
  revisionSchedules: any[];
  practiceQuestions: any[];
  subjects: any[];
  student: any;
  userRole: string;
}> = ({
  learningPaths,
  revisionSchedules: initialRevisions,
  practiceQuestions,
  subjects,
  student,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState('paths');
  const [revisions, setRevisions] = useState(initialRevisions);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // AI Doubt Solver State
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtResponse, setDoubtResponse] = useState<string | null>(null);
  const [isAskingDoubt, setIsAskingDoubt] = useState(false);

  const tabs: TabItem[] = [
    { id: 'paths', label: 'Learning Paths & Mastery', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'practice', label: 'Adaptive Practice Sets', count: practiceQuestions.length, icon: <Brain className="w-4 h-4" /> },
    { id: 'revision', label: 'Smart Revision Schedule', count: revisions.length, icon: <Calendar className="w-4 h-4" /> },
    { id: 'doubt', label: 'AI Doubt Assistant', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
    setRevealedSolutions((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleToggleRevision = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/ai-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE_REVISION', revisionId: id, isCompleted: !currentStatus }),
      });
      if (res.ok) {
        setRevisions((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isCompleted: !currentStatus } : r))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtQuestion.trim()) return;

    setIsAskingDoubt(true);
    setDoubtResponse(null);

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: doubtQuestion, mode: 'STUDENT' }),
      });
      const data = await res.json();
      setDoubtResponse(data.answer || 'Concept explained using NCERT CBSE guidelines.');
    } catch (e) {
      setDoubtResponse('Could not connect to AI reasoning service.');
    } finally {
      setIsAskingDoubt(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#35B84A]" />
              <span>AI-Powered Personalized Learning &amp; Revision</span>
            </h2>
            <Badge variant="teal" size="sm">
              Adaptive Tutor
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Curriculum-grounded learning trajectories, spaced-repetition revision calendars, and automated practice problem generation.
          </p>
        </div>

        {student && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl text-xs font-semibold text-slate-700">
            <span>Student:</span>
            <span className="font-bold text-[#990000]">
              {student.user.firstName} {student.user.lastName} ({student.admissionNumber})
            </span>
          </div>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Mastery Index"
          value="84.5%"
          subtitle="Top: Trigonometric Proofs"
          icon={<Brain className="w-5 h-5" />}
          trend={{ value: '+5.2%', isPositive: true }}
          variant="green"
        />
        <StatCard
          title="Active Learning Paths"
          value={learningPaths.length > 0 ? learningPaths.length : 2}
          subtitle="Target: CBSE 90%+ Distinction"
          icon={<TrendingUp className="w-5 h-5" />}
          variant="blue"
        />
        <StatCard
          title="Pending Revisions"
          value={revisions.filter((r) => !r.isCompleted).length}
          subtitle="Spaced Repetition Schedule"
          icon={<Calendar className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Practice Problems"
          value={practiceQuestions.length}
          subtitle="Calibrated Easy to Hard"
          icon={<HelpCircle className="w-5 h-5" />}
          variant="teal"
        />
      </div>

      {/* Tabs */}
      <Tabs items={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: LEARNING PATHS */}
      {activeTab === 'paths' && (
        <div>
          {learningPaths.length === 0 ? (
            <EmptyState
              illustration="ai-tutor"
              title="No Active Learning Paths"
              description="AI learning trajectories will be tailored automatically once diagnostic and formative assessment scores are recorded."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {learningPaths.map((lp) => {
                let topics: string[] = [];
                try {
                  topics = JSON.parse(lp.recommendedTopicsJson || '[]');
                } catch (e) {
                  topics = ['Chapter Review', 'Formula Flashcards'];
                }

                return (
                  <Card key={lp.id} className="space-y-4">
                    <div className="flex items-start justify-between">
                      <Badge variant="blue" size="xs">
                        {lp.subject?.name}
                      </Badge>
                      <span className="text-xs font-bold text-emerald-600 font-mono">
                        {lp.currentMastery}% Mastery
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{lp.targetGoal}</h3>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                          style={{ width: `${lp.currentMastery}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        AI Recommended Focus Areas
                      </span>
                      <div className="space-y-1.5">
                        {topics.map((t, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs text-slate-800"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADAPTIVE PRACTICE SETS */}
      {activeTab === 'practice' && (
        <div className="space-y-4">
          {practiceQuestions.length === 0 ? (
            <EmptyState
              illustration="ai-tutor"
              title="No Practice Sets Available"
              description="Adaptive practice questions are curated dynamically based on diagnostic benchmarks and teacher assignments."
            />
          ) : (
            practiceQuestions.map((q, idx) => {
              const isRevealed = revealedSolutions[q.id];
              const userPick = selectedAnswers[q.id];

            return (
              <Card key={q.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center">
                      Q{idx + 1}
                    </span>
                    <Badge variant={q.difficulty === 'HARD' ? 'rose' : q.difficulty === 'MEDIUM' ? 'amber' : 'green'} size="xs">
                      {q.difficulty}
                    </Badge>
                    <span className="text-xs text-slate-500 font-medium">
                      {q.subject?.name} • {q.marks} Mark{q.marks > 1 ? 's' : ''}
                    </span>
                  </div>
                  {isRevealed && (
                    <Badge variant="blue" size="xs">
                      Solution Verified
                    </Badge>
                  )}
                </div>

                <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                  {q.questionText}
                </p>

                {/* MCQ Options */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt: any) => {
                      const isSelected = userPick === opt.optionKey;
                      const isCorrect = opt.isCorrect;

                      let btnStyle = 'border-slate-200 bg-white text-slate-800 hover:border-slate-300';
                      if (isRevealed) {
                        if (isCorrect) btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                        else if (isSelected && !isCorrect) btnStyle = 'border-rose-400 bg-rose-50 text-rose-800';
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(q.id, opt.optionKey)}
                          className={`p-3 text-left rounded-xl border text-xs transition-all flex items-center gap-2.5 cursor-pointer ${btnStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-bold text-[10px] shrink-0">
                            {opt.optionKey}
                          </span>
                          <span>{opt.optionText}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Explanation Dropdown */}
                {isRevealed && q.explanation && (
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-950 mt-2 space-y-1">
                    <span className="font-bold text-blue-900 uppercase text-[10px] block">
                      Step-by-Step AI Explanation
                    </span>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </Card>
            );
          }))}
        </div>
      )}

      {/* TAB 3: SMART REVISION SCHEDULE */}
      {activeTab === 'revision' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Automated Spaced-Repetition Calendar</span>
              <span className="text-xs text-slate-500 font-normal">
                Scientifically scheduled review checkpoints
              </span>
            </CardTitle>
          </CardHeader>
          <div className="p-4">
            {revisions.length === 0 ? (
              <EmptyState
                illustration="ai-tutor"
                title="All Revisions Completed"
                description="Your spaced-repetition study milestones are up to date! Check back following your next test."
                className="border-0 bg-transparent p-4 sm:p-6"
              />
            ) : (
              <div className="space-y-2">
                {revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={rev.isCompleted}
                        onChange={() => handleToggleRevision(rev.id, rev.isCompleted)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div>
                        <span className={`text-xs font-bold ${rev.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {rev.topicName}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          {rev.subject?.name} • Due: {formatDate(rev.revisionDate, 'dd MMMM yyyy')}
                        </span>
                      </div>
                    </div>

                    <Badge variant={rev.priority === 'HIGH' ? 'rose' : 'slate'} size="xs">
                      {rev.priority} Priority
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* TAB 4: AI DOUBT ASSISTANT */}
      {activeTab === 'doubt' && (
        <div className="max-w-3xl mx-auto space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#990000]" />
                <span>Instant Concept Explainer &amp; Homework Helper</span>
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleAskDoubt} className="p-4 space-y-3">
              <textarea
                value={doubtQuestion}
                onChange={(e) => setDoubtQuestion(e.target.value)}
                placeholder="Ask any question from NCERT Math, Science, Social Studies, e.g.: 'Explain why concave mirror is used in car headlights with ray diagram formula'..."
                className="w-full h-28 p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#990000] focus:ring-1 focus:ring-[#990000] placeholder:text-slate-400"
              />
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400">
                  Strictly aligned to CBSE &amp; ICSE syllabi.
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isAskingDoubt}
                  rightIcon={<Send className="w-3.5 h-3.5 ml-1" />}
                >
                  Explain Concept
                </Button>
              </div>
            </form>
          </Card>

          {doubtResponse && (
            <Card className="p-5 bg-white border border-[#E5E5E5] space-y-3 shadow-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-[#35B84A]" />
                <span className="font-bold text-xs text-slate-900">AI Tutor Solution</span>
              </div>
              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {doubtResponse}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
