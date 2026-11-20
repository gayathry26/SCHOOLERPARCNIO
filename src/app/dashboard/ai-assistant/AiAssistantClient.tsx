'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  HelpCircle,
  TrendingUp,
  DollarSign,
  CalendarCheck,
  BookOpen,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  'How much fee is pending across Class 10?',
  'Which students have low attendance below 75%?',
  'List top performers in Mid-Term Examinations',
  'Explain Physics Lens formula and sign rules',
  'Generate 3 practice questions for Trigonometry',
];

export const AiAssistantClient: React.FC<{ userRole: string; userName: string }> = ({
  userRole,
  userName,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello **${userName}**! I am your **EDVONEST Intelligent School Copilot**.\n\nYou can ask me direct database queries regarding fees, attendance, student performance, or ask for NCERT academic explanations and study quizzes.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          mode: userRole === 'STUDENT' ? 'STUDENT' : 'ADMIN',
        }),
      });

      const data = await res.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.answer || 'Sorry, I could not process your query.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `Error connecting to AI service: ${err.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <span>EDVONEST AI Copilot &amp; Institutional Intelligence</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Grounded natural language insights for School Admin, Principal oversight, and Student Academic Tutoring.
          </p>
        </div>
        <Badge variant="amber">AI Active</Badge>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="text-xs px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-full border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Canvas */}
      <Card className="flex flex-col h-[520px] p-0 overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-xl text-xs leading-relaxed space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-br-xs shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line font-sans">{m.text}</div>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs text-xs font-bold">
                  {userName[0]}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <Bot className="w-4 h-4 animate-spin text-amber-500" />
              <span>Analyzing live database &amp; curriculum context...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything (e.g. 'Show pending fees for Grade 10', 'Explain NCERT concepts')..."
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            rightIcon={<Send className="w-4 h-4" />}
          >
            Ask Copilot
          </Button>
        </form>
      </Card>
    </div>
  );
};
