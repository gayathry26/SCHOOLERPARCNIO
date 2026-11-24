'use client';

import React, { useState } from 'react';
import {
  Library,
  BookOpen,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  ArrowRight,
  BookCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import { formatCurrency, formatDate } from '@/lib/formatters';

export const LibraryClient: React.FC<{
  books: any[];
  issues: any[];
  students?: any[];
  userRole: string;
}> = ({ books: initialBooks, issues: initialIssues, students = [], userRole }) => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [books, setBooks] = useState(initialBooks);
  const [issues, setIssues] = useState(initialIssues);

  // Modal states
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isIssueBookOpen, setIsIssueBookOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Science',
    rackNumber: 'RACK-01',
    totalCopies: 5,
    price: 350,
  });

  const [issueForm, setIssueForm] = useState({
    bookId: initialBooks[0]?.id || '',
    studentId: students[0]?.id || '',
    days: 14,
  });

  const canManage = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'LIBRARIAN', 'PRINCIPAL'].includes(userRole);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADD_BOOK', ...bookForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add book');

      setBooks((prev) => [data.book, ...prev]);
      setIsAddBookOpen(false);
      setBookForm({
        title: '',
        author: '',
        isbn: '',
        category: 'Science',
        rackNumber: 'RACK-01',
        totalCopies: 5,
        price: 350,
      });
      showNotification(`Book "${data.book.title}" added to catalog successfully!`);
    } catch (err: any) {
      showNotification(err.message || 'Error adding book', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ISSUE_BOOK', ...issueForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue book');

      setIssues((prev) => [data.issue, ...prev]);
      // Decrement available copy
      setBooks((prev) =>
        prev.map((b) => (b.id === issueForm.bookId ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b))
      );
      setIsIssueBookOpen(false);
      showNotification('Book issued successfully!');
    } catch (err: any) {
      showNotification(err.message || 'Error issuing book', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (issueId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RETURN_BOOK', issueId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to return book');

      setIssues((prev) =>
        prev.map((i) => (i.id === issueId ? { ...i, status: 'RETURNED', returnDate: new Date() } : i))
      );
      // Increment available copy
      if (data.issue?.bookId) {
        setBooks((prev) =>
          prev.map((b) => (b.id === data.issue.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b))
        );
      }
      showNotification('Book marked as returned!');
    } catch (err: any) {
      showNotification(err.message || 'Error returning book', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs: TabItem[] = [
    { id: 'catalog', label: 'Book Catalog & Inventory', count: books.length, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'issues', label: 'Circulation & Issued Books', count: issues.length, icon: <BookCheck className="w-4 h-4" /> },
  ];

  const getBookCoverTheme = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('sci') || cat.includes('phy') || cat.includes('chem')) {
      return { gradient: 'from-[#990000] to-[#C00000]', badge: 'bg-[#FEF2F2] text-[#990000] border-[#FECACA]', icon: '🧪' };
    }
    if (cat.includes('math')) {
      return { gradient: 'from-[#990000] to-[#C00000]', badge: 'bg-red-50 text-[#990000] border-red-200', icon: '📐' };
    }
    if (cat.includes('comp') || cat.includes('tech') || cat.includes('ai')) {
      return { gradient: 'from-indigo-600 to-purple-600', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '💻' };
    }
    if (cat.includes('hist') || cat.includes('soc')) {
      return { gradient: 'from-emerald-700 to-teal-800', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: '🏛️' };
    }
    return { gradient: 'from-[#D97706] to-[#B45309]', badge: 'bg-amber-50 text-amber-800 border-amber-200', icon: '📖' };
  };

  const bookColumns: Column<any>[] = [
    {
      key: 'title',
      header: 'Book & Spine',
      render: (row) => {
        const theme = getBookCoverTheme(row.category);
        return (
          <div className="flex items-center gap-3">
            {/* 3D-styled mini book thumbnail with spine accent */}
            <div className={`w-9 h-12 rounded-r-md rounded-l-xs bg-gradient-to-br ${theme.gradient} shadow-sm border-l-3 border-black/30 flex flex-col justify-between p-1 text-white shrink-0`}>
              <span className="text-[9px] leading-none">{theme.icon}</span>
              <span className="text-[7px] font-black uppercase tracking-tighter opacity-80 truncate">
                {row.isbn ? row.isbn.slice(-4) : 'CBSE'}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-900 block hover:text-[#990000] transition-colors">
                {row.title}
              </span>
              <span className="block text-[11px] text-slate-500">Author: {row.author}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'isbn',
      header: 'ISBN #',
      render: (row) => <span className="font-mono text-slate-700">{row.isbn}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => {
        const theme = getBookCoverTheme(row.category);
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${theme.badge}`}>{row.category}</span>;
      },
    },
    {
      key: 'rackNumber',
      header: 'Rack / Shelf',
      render: (row) => <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">{row.rackNumber || 'RACK-01'}</span>,
    },
    {
      key: 'copies',
      header: 'Availability',
      render: (row) => (
        <span className={`font-bold ${row.availableCopies > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
          {row.availableCopies} / {row.totalCopies} Available
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (row) => <span className="font-mono text-slate-900">{formatCurrency(row.price)}</span>,
    },
  ];

  const issueColumns: Column<any>[] = [
    {
      key: 'book',
      header: 'Book Title',
      render: (row) => {
        const theme = getBookCoverTheme(row.book?.category || 'General');
        return (
          <div className="flex items-center gap-2.5">
            <span className="text-base">{theme.icon}</span>
            <span className="font-bold text-slate-900">{row.book?.title}</span>
          </div>
        );
      },
    },
    {
      key: 'student',
      header: 'Issued To Student',
      render: (row) => {
        const studentName = row.student?.user
          ? `${row.student.user.firstName} ${row.student.user.lastName || ''}`.trim()
          : 'Enrolled Student';
        return (
          <div className="flex items-center gap-2.5">
            <Avatar name={studentName} size="xs" house={row.student?.house} />
            <div>
              <span className="font-bold text-slate-900 text-xs block">
                {studentName}
              </span>
              <span className="block text-[10px] text-slate-500 font-mono">
                Adm #{row.student?.admissionNumber}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      render: (row) => <span className="text-slate-600">{formatDate(row.issueDate)}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due Return Date',
      render: (row) => <span className="font-semibold text-slate-800">{formatDate(row.dueDate)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'ISSUED' ? 'amber' : 'emerald'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) =>
        canManage && row.status === 'ISSUED' ? (
          <Button
            size="xs"
            variant="outline"
            onClick={() => handleReturnBook(row.id)}
            leftIcon={<RotateCcw className="w-3 h-3" />}
          >
            Mark Returned
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Library className="w-6 h-6 text-emerald-600" />
            <span>Library Management &amp; Book Circulation</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Accession catalog, ISBN lookup, checkout/return transactions, and overdue fine tracking.
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsIssueBookOpen(true)}
              leftIcon={<BookCheck className="w-3.5 h-3.5 text-[#990000]" />}
            >
              Issue Book
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddBookOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              + Add Title
            </Button>
          </div>
        )}
      </div>

      {notification && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Catalog Titles"
          value={books.length}
          subtitle="Reference &amp; NCERT Textbooks"
          icon={<BookOpen className="w-5 h-5" />}
          variant="indigo"
        />
        <StatCard
          title="Total Book Volumes"
          value={books.reduce((acc, b) => acc + (b.totalCopies || 0), 0)}
          subtitle="In School Library Racks"
          icon={<Library className="w-5 h-5" />}
          variant="emerald"
        />
        <StatCard
          title="Active Issued Books"
          value={issues.filter((i) => i.status === 'ISSUED').length}
          subtitle="Circulated with Students &amp; Faculty"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'catalog' && (
        books.length === 0 ? (
          <EmptyState
            illustration="no-books"
            title="Library Catalog is Empty"
            description="Add books to the accession catalog to manage ISBN records, rack placement, and student circulation."
            actionLabel="Add Book to Catalog"
            onAction={() => setIsAddBookOpen(true)}
          />
        ) : (
          <DataTable
            columns={bookColumns}
            data={books}
            searchPlaceholder="Search catalog by title, author, or ISBN..."
            exportFilename="edvonest_library_catalog"
          />
        )
      )}

      {activeTab === 'issues' && (
        issues.length === 0 ? (
          <EmptyState
            illustration="no-books"
            title="No Books Currently Checked Out"
            description="Circulation checkouts, return due dates, and student borrowing history will be tracked here."
            actionLabel="Issue Book to Student"
            onAction={() => setIsIssueBookOpen(true)}
          />
        ) : (
          <DataTable
            columns={issueColumns}
            data={issues}
            searchPlaceholder="Search circulation transactions..."
            exportFilename="edvonest_library_circulation"
          />
        )
      )}

      {/* Add Book Modal */}
      <Modal isOpen={isAddBookOpen} onClose={() => setIsAddBookOpen(false)} title="Add New Book to Catalog">
        <form onSubmit={handleAddBook} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Book Title *</label>
            <input
              type="text"
              required
              value={bookForm.title}
              onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#990000]"
              placeholder="e.g. Higher Engineering Mathematics"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Author *</label>
              <input
                type="text"
                required
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#990000]"
                placeholder="Dr. B.S. Grewal"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ISBN Number *</label>
              <input
                type="text"
                required
                value={bookForm.isbn}
                onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#990000] font-mono"
                placeholder="978-81-7409-195-5"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={bookForm.category}
                onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#990000]"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="Literature">Literature</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Reference">Reference</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rack / Shelf</label>
              <input
                type="text"
                value={bookForm.rackNumber}
                onChange={(e) => setBookForm({ ...bookForm, rackNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#990000]"
                placeholder="RACK-03"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Copies</label>
              <input
                type="number"
                min="1"
                required
                value={bookForm.totalCopies}
                onChange={(e) => setBookForm({ ...bookForm, totalCopies: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#990000]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddBookOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={loading}>
              Save to Catalog
            </Button>
          </div>
        </form>
      </Modal>

      {/* Issue Book Modal */}
      <Modal isOpen={isIssueBookOpen} onClose={() => setIsIssueBookOpen(false)} title="Issue Book to Student">
        <form onSubmit={handleIssueBook} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Book Title *</label>
            <select
              value={issueForm.bookId}
              onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#990000]"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                  {b.title} by {b.author} ({b.availableCopies} available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
            <select
              value={issueForm.studentId}
              onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#990000]"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.firstName} {s.user?.lastName} (Adm #{s.admissionNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Issue Duration (Days)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={issueForm.days}
              onChange={(e) => setIssueForm({ ...issueForm, days: parseInt(e.target.value) || 14 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#990000]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsIssueBookOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={loading}>
              Issue Book
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
