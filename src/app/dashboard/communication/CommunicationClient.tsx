'use client';

import React, { useState } from 'react';
import {
  MessageSquareText,
  Megaphone,
  Calendar,
  Send,
  Plus,
  Sparkles,
  Users,
  Clock,
  User,
  CheckCircle2,
} from 'lucide-react';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/formatters';

export const CommunicationClient: React.FC<{
  announcements: any[];
  events: any[];
  directMessages: any[];
  teachers: any[];
  parents: any[];
  user: any;
}> = ({
  announcements: initialAnnouncements,
  events,
  directMessages: initialMessages,
  teachers,
  parents,
  user,
}) => {
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [messages, setMessages] = useState(initialMessages);

  // Announcement Modal
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [annForm, setAnnForm] = useState({
    title: '',
    content: '',
    targetAudience: 'ALL',
    priority: 'NORMAL',
  });

  // Chat message state
  const [chatRecipientId, setChatRecipientId] = useState<string>(
    user.role === 'PARENT' ? teachers[0]?.user?.id || '' : parents[0]?.user?.id || ''
  );
  const [chatText, setChatText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const tabs: TabItem[] = [
    { id: 'announcements', label: 'School Announcements', count: announcements.length, icon: <Megaphone className="w-4 h-4" /> },
    { id: 'chat', label: 'Parent-Teacher Messages', count: messages.length, icon: <MessageSquareText className="w-4 h-4" /> },
    { id: 'events', label: 'School Events & Calendar', count: events.length, icon: <Calendar className="w-4 h-4" /> },
  ];

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/communication/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annForm),
      });
      const data = await res.json();
      if (res.ok) {
        setAnnouncements((prev) => [data.announcement, ...prev]);
        setIsAnnModalOpen(false);
        showToast(`Announcement published and broadcast to ${annForm.targetAudience}!`, 'success');
      } else {
        showToast(data.error || 'Failed to publish announcement', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim() || !chatRecipientId) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/communication/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: chatRecipientId,
          message: chatText,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.message]);
        setChatText('');
        showToast('Message sent', 'success');
      } else {
        showToast(data.error || 'Failed to send message', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const activeChatMessages = messages.filter(
    (m) =>
      (m.senderId === user.id && m.receiverId === chatRecipientId) ||
      (m.senderId === chatRecipientId && m.receiverId === user.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquareText className="w-6 h-6 text-emerald-600" />
            <span>Centralized Communication &amp; PTM Messaging</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            School bulletins, broadcast circulars, controlled parent-teacher threads, and activity calendar.
          </p>
        </div>

        {(user.role === 'SCHOOL_ADMIN' || user.role === 'PRINCIPAL' || user.role === 'SUPER_ADMIN') && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAnnModalOpen(true)}
            leftIcon={<Megaphone className="w-3.5 h-3.5" />}
          >
            Post Announcement
          </Button>
        )}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ---------------------------------------------------- */}
      {/* TAB 1: ANNOUNCEMENTS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <Card key={ann.id} hoverEffect className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded">
                    Audience: {ann.targetAudience}
                  </span>
                  <Badge variant={ann.priority === 'URGENT' ? 'rose' : 'slate'}>
                    {ann.priority}
                  </Badge>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {formatDate(ann.publishedAt, 'dd MMM yyyy, hh:mm a')}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {ann.content}
              </p>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                <span>Issued by: <strong>{ann.authorName}</strong></span>
                <span>EDVONEST Official Bulletin</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: PARENT-TEACHER CHAT */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[520px]">
          {/* Contacts Sidebar */}
          <Card className="md:col-span-4 flex flex-col p-3 overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">
              {user.role === 'PARENT' ? 'Class & Subject Teachers' : 'Enrolled Parents'}
            </h4>

            <div className="space-y-1 overflow-y-auto flex-1">
              {(user.role === 'PARENT' ? teachers : parents).map((contact: any) => {
                const isSelected = chatRecipientId === contact.user?.id;
                return (
                  <button
                    key={contact.id}
                    onClick={() => setChatRecipientId(contact.user?.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? 'bg-emerald-500 text-slate-900' : 'bg-slate-200 text-slate-700'}`}>
                      {contact.user?.firstName[0]}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate">
                        {contact.user?.firstName} {contact.user?.lastName}
                      </p>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {contact.specialization || contact.relation || 'Parent'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Conversation Message Thread */}
          <Card className="md:col-span-8 flex flex-col p-0 overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-900">
                  Direct Parent-Teacher Message Thread
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Privacy Protected</span>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
              {activeChatMessages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No previous messages with this contact. Send a note below.
                </div>
              ) : (
                activeChatMessages.map((m) => {
                  const isMine = m.senderId === user.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`p-3 rounded-2xl max-w-sm text-xs leading-relaxed shadow-2xs ${
                          isMine
                            ? 'bg-slate-900 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        {m.message}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 px-1 font-mono">
                        {formatDate(m.sentAt, 'hh:mm a')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Send Box */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-100 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Type your message to teacher / parent..."
                className="flex-1 text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSending}
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: EVENTS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-3">
            <div className="flex justify-between items-center">
              <Badge variant="emerald">Annual Institutional Calendar</Badge>
              <span className="text-xs text-slate-400">AY 2025–26</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Annual Inter-School Science &amp; AI Exhibition
            </h3>
            <p className="text-xs text-slate-600">
              Students showcase robotics projects, solar power models, and machine learning demonstrations in the main auditorium.
            </p>
            <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
              <span>Date: <strong>18 Nov 2025</strong></span>
              <span>Venue: <strong>Main Multipurpose Hall</strong></span>
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="flex justify-between items-center">
              <Badge variant="amber">Parent-Teacher Meeting</Badge>
              <span className="text-xs text-slate-400">Term 1 Review</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              PTM Session for Mid-Term Examination Progress
            </h3>
            <p className="text-xs text-slate-600">
              One-on-one academic counseling and performance review with subject faculties.
            </p>
            <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
              <span>Date: <strong>11 Oct 2025</strong></span>
              <span>Timing: <strong>08:30 AM - 01:30 PM</strong></span>
            </div>
          </Card>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: POST ANNOUNCEMENT */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isAnnModalOpen}
        onClose={() => setIsAnnModalOpen(false)}
        title="Post School Announcement / Circular"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Audience *</label>
            <select
              value={annForm.targetAudience}
              onChange={(e) => setAnnForm({ ...annForm, targetAudience: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-white"
            >
              <option value="ALL">Entire School (Parents, Teachers &amp; Students)</option>
              <option value="PARENTS">Parents Only</option>
              <option value="TEACHERS">Teachers &amp; Faculty Only</option>
              <option value="STUDENTS">Students Only</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={annForm.title}
              onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
              placeholder="e.g. Winter Vacation Notice & Holiday Assignments"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notice Content *</label>
            <textarea
              rows={4}
              required
              value={annForm.content}
              onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
              placeholder="Detailed announcement content..."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAnnModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Circular
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
