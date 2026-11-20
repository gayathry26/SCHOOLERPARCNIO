'use client';

import React, { useState } from 'react';
import {
  Globe,
  Image as ImageIcon,
  Edit3,
  Eye,
  CheckCircle2,
  Plus,
  Save,
} from 'lucide-react';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/formatters';

export const CmsClient: React.FC<{
  pages: any[];
  school: any;
}> = ({ pages: initialPages, school }) => {
  const [activeTab, setActiveTab] = useState('pages');
  const [pages, setPages] = useState(initialPages);
  const [editingPage, setEditingPage] = useState<any | null>(null);

  const tabs: TabItem[] = [
    { id: 'pages', label: 'Website Content Pages', count: pages.length, icon: <Globe className="w-4 h-4" /> },
    { id: 'gallery', label: 'Photo & Media Gallery Albums', count: 4, icon: <ImageIcon className="w-4 h-4" /> },
  ];

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    setSaving(true);
    try {
      const res = await fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPage.id,
          title: editingPage.title,
          content: editingPage.content,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update CMS page');

      setPages((prev) =>
        prev.map((p) => (p.id === editingPage.id ? data.page : p))
      );
      setEditingPage(null);
      setSuccessMsg('Website content updated and published successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-600" />
            <span>Public Website CMS &amp; Media Gallery</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage public-facing school website content, principal message, admission criteria, and event photo albums.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {successMsg && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </span>
          )}
          <a href="/" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" rightIcon={<Eye className="w-3.5 h-3.5" />}>
              View Live Public Site
            </Button>
          </a>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ---------------------------------------------------- */}
      {/* TAB 1: PAGES */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'pages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pages.map((p) => (
            <Card key={p.id} hoverEffect className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="emerald">Live &amp; Published</Badge>
                <span className="text-xs text-slate-400 font-mono">Slug: /{p.slug}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {p.content}
              </p>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400">Updated: {formatDate(p.updatedAt)}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPage(p)}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Edit Content
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: GALLERY ALBUMS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: 'Annual Sports Day 2025', count: 48, tag: 'Sports' },
            { title: 'Robotics & STEM AI Fair', count: 32, tag: 'Academics' },
            { title: 'Independence Day Parade', count: 24, tag: 'National' },
            { title: 'Cultural Dance Festival', count: 60, tag: 'Arts' },
          ].map((alb, i) => (
            <Card key={i} hoverEffect className="space-y-3">
              <div className="h-28 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center text-slate-400">
                <ImageIcon className="w-8 h-8 opacity-40" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs">{alb.title}</h4>
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>{alb.count} Photos</span>
                <Badge variant="slate">{alb.tag}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: EDIT CMS PAGE */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={!!editingPage}
        onClose={() => setEditingPage(null)}
        title={`Edit Website Page: ${editingPage?.title}`}
        maxWidth="lg"
      >
        {editingPage && (
          <form onSubmit={handleSavePage} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Page Title *</label>
              <input
                type="text"
                required
                value={editingPage.title}
                onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Page Content *</label>
              <textarea
                rows={5}
                required
                value={editingPage.content}
                onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingPage(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={saving} leftIcon={<Save className="w-3.5 h-3.5" />}>
                Save &amp; Publish Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
