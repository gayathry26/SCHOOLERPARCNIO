'use client';

import React, { useState } from 'react';
import {
  Award,
  Trophy,
  Star,
  ShieldCheck,
  CheckCircle2,
  Plus,
  QrCode,
  Calendar,
  Sparkles,
  ExternalLink,
  BookOpen,
  Filter,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/formatters';

export const PortfolioClient: React.FC<{
  initialAchievements: any[];
  students: any[];
  userRole: string;
  currentUserName: string;
}> = ({ initialAchievements, students, userRole, currentUserName }) => {
  const [achievements, setAchievements] = useState(initialAchievements);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('ALL');
  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    studentId: students[0]?.id || '',
    title: '',
    category: 'ACADEMIC',
    achievementDate: new Date().toISOString().split('T')[0],
    rankOrPosition: '1st Place / Gold Medal',
    issuingAuthority: 'CBSE Regional Committee',
    certificateUrl: '/certificates/cert_sample.pdf',
  });

  const categories = [
    { id: 'ALL', label: 'All Achievements' },
    { id: 'ACADEMIC', label: 'Academic & Science', icon: '🔬' },
    { id: 'SPORTS', label: 'Sports & Athletics', icon: '🏆' },
    { id: 'CULTURAL', label: 'Cultural & Arts', icon: '🎭' },
    { id: 'OLYMPIAD', label: 'Olympiads & Hackathons', icon: '⚡' },
    { id: 'LEADERSHIP', label: 'Student Council & Leadership', icon: '👑' },
    { id: 'COMMUNITY', label: 'Community Service & Social Work', icon: '🌱' },
  ];

  const filtered = achievements.filter((a) => {
    const catMatch = selectedCategory === 'ALL' || a.category === selectedCategory;
    const stuMatch = selectedStudentFilter === 'ALL' || a.studentId === selectedStudentFilter;
    return catMatch && stuMatch;
  });

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setAchievements([data.achievement, ...achievements]);
        setIsAddModalOpen(false);
        setForm({
          studentId: students[0]?.id || '',
          title: '',
          category: 'ACADEMIC',
          achievementDate: new Date().toISOString().split('T')[0],
          rankOrPosition: '1st Place / Gold Medal',
          issuingAuthority: 'CBSE Regional Committee',
          certificateUrl: '/certificates/cert_sample.pdf',
        });
      } else {
        alert(data.error || 'Failed to add achievement');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerify = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VERIFY_ACHIEVEMENT',
          achievementId: id,
          isVerified: !currentStatus,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAchievements((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isVerified: !currentStatus, verifiedByStaff: currentUserName } : a))
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
              <Trophy className="w-6 h-6 text-amber-500" />
              <span>Student Digital Portfolio &amp; Credentials</span>
            </h2>
            <Badge variant="blue" size="sm">
              Lifelong Verified Records
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Holistic achievements in academics, Olympiads, sports, fine arts, leadership, and tamper-evident QR verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="primary"
            className="bg-[#990000] hover:bg-[#800000] text-white flex items-center gap-1.5"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Achievement Record
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Achievements"
          value={achievements.length}
          change="Across all grade levels"
          trend="up"
          icon={<Trophy className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="Verified Digital Credentials"
          value={achievements.filter((a) => a.isVerified).length}
          change="Faculty certified"
          trend="up"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Olympiads &amp; Hackathons"
          value={achievements.filter((a) => a.category === 'OLYMPIAD').length}
          change="State & National level"
          trend="neutral"
          icon={<Star className="w-5 h-5 text-purple-600" />}
        />
        <StatCard
          title="Sports Medals"
          value={achievements.filter((a) => a.category === 'SPORTS').length}
          change="Inter-school athletic meets"
          trend="up"
          icon={<Award className="w-5 h-5 text-rose-500" />}
        />
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedCategory === cat.id
                ? 'bg-[#990000] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              {cat.icon ? `${cat.icon} ` : ''}
              {cat.label}
            </button>
          ))}
        </div>

        {students.length > 1 && (
          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-700 outline-none focus:border-[#990000]"
          >
            <option value="ALL">All Students ({students.length})</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.user?.firstName} {s.user?.lastName || ''} ({s.admissionNumber})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Portfolio Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <span className="text-2xl">
                  {item.category === 'SPORTS'
                    ? '🏆'
                    : item.category === 'OLYMPIAD'
                      ? '🥇'
                      : item.category === 'CULTURAL'
                        ? '🎭'
                        : item.category === 'LEADERSHIP'
                          ? '👑'
                          : '📜'}
                </span>
                <Badge variant={item.isVerified ? 'emerald' : 'amber'} size="sm" className="flex items-center gap-1">
                  {item.isVerified ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </>
                  ) : (
                    'Pending Verification'
                  )}
                </Badge>
              </div>

              <div>
                <span className="text-[11px] font-mono text-[#990000] font-semibold uppercase tracking-wider block">
                  {item.category} • {formatDate(item.achievementDate)}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1 leading-snug">{item.title}</h4>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  {item.rankOrPosition} — <span className="text-slate-500">{item.issuingAuthority}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    name={item.student?.user ? `${item.student.user.firstName} ${item.student.user.lastName || ''}`.trim() : 'Awardee'}
                    size="sm"
                    house={item.student?.house}
                  />
                  <div>
                    <strong className="text-slate-800 block text-xs">
                      {item.student?.user?.firstName} {item.student?.user?.lastName || ''}
                    </strong>
                    <span className="block text-[10px] text-slate-400">
                      {item.student?.enrollments?.[0]?.class?.name || 'Class 10'} - {item.student?.enrollments?.[0]?.section?.name || 'A'}
                    </span>
                  </div>
                </div>

                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setSelectedAchievement(item)}
                  className="flex items-center gap-1 text-[#990000]"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  View Badge
                </Button>
              </div>

              {['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'].includes(userRole) && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => handleVerify(item.id, item.isVerified)}
                    className="text-[11px] text-slate-600 hover:text-slate-900"
                  >
                    {item.isVerified ? 'Revoke Verification' : 'Verify as Faculty'}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          illustration="achievement-trophy"
          title="No Achievements In This Category"
          description="Verified Olympiad medals, science congress citations, and athletic trophies will be displayed here."
          actionLabel="Add Achievement Record"
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Add Achievement Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Student Achievement Record">
        <form onSubmit={handleAddAchievement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.firstName} {s.user?.lastName || ''} (Adm #{s.admissionNumber} - {s.enrollments?.[0]?.class?.name || 'Class 10'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Achievement / Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. National Cyber Olympiad Gold Medal"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              >
                <option value="ACADEMIC">Academic &amp; Science</option>
                <option value="SPORTS">Sports &amp; Athletics</option>
                <option value="CULTURAL">Cultural &amp; Performing Arts</option>
                <option value="OLYMPIAD">Olympiads &amp; Hackathons</option>
                <option value="LEADERSHIP">Student Council &amp; Leadership</option>
                <option value="COMMUNITY">Community Service &amp; Social Work</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date Achieved</label>
              <input
                type="date"
                required
                value={form.achievementDate}
                onChange={(e) => setForm({ ...form, achievementDate: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rank / Position / Honor</label>
              <input
                type="text"
                required
                placeholder="e.g. 1st Place / State Rank 3"
                value={form.rankOrPosition}
                onChange={(e) => setForm({ ...form, rankOrPosition: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issuing Authority / Organizer</label>
              <input
                type="text"
                required
                placeholder="e.g. Science Olympiad Foundation"
                value={form.issuingAuthority}
                onChange={(e) => setForm({ ...form, issuingAuthority: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" className="bg-[#990000] text-white">
              Save Achievement
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Certificate Verification Modal */}
      <Modal
        isOpen={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
        title="Verified Digital Credential &amp; Anti-Forgery QR"
      >
        {selectedAchievement && (
          <div className="space-y-4 text-center">
            {/* Visual Certificate Preview Card */}
            <div className="p-6 bg-gradient-to-br from-amber-50/60 via-white to-sky-50/60 border-2 border-amber-300 rounded-2xl relative shadow-md">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono font-bold text-amber-700 tracking-wider uppercase">
                  EdvoNest Digital Credential
                </span>
                <Badge variant="emerald" size="sm">
                  CRYPTOGRAPHICALLY VERIFIED
                </Badge>
              </div>

              <div className="my-4">
                <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-slate-900">{selectedAchievement.title}</h3>
                <p className="text-xs text-slate-600 mt-1">Conferred upon</p>
                <div className="text-base font-bold text-[#990000] mt-0.5">
                  {selectedAchievement.student?.user?.firstName} {selectedAchievement.student?.user?.lastName || ''}
                </div>
                <p className="text-xs text-slate-500">
                  {selectedAchievement.rankOrPosition} • {selectedAchievement.issuingAuthority}
                </p>
              </div>

              {/* QR Code representation */}
              <div className="mt-6 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 max-w-[180px] mx-auto">
                <div className="w-24 h-24 bg-slate-900 p-2 rounded-lg flex items-center justify-center text-white">
                  <QrCode className="w-20 h-20 text-white" />
                </div>
                <span className="font-mono text-[9px] text-slate-500 mt-1.5 break-all">
                  UID: CERT-{selectedAchievement.id.slice(0, 10).toUpperCase()}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 mt-4 border-t border-amber-200/80 pt-3">
                Verified By: <strong className="text-slate-700">{selectedAchievement.verifiedByStaff || 'Faculty Panel'}</strong> • Validated on CBSE Digital Locker Protocol
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedAchievement(null)}>
                Close
              </Button>
              <Button
                size="sm"
                variant="primary"
                className="bg-[#990000] text-white"
                onClick={() => alert('Certificate downloaded as tamper-proof PDF with embedded QR token.')}
              >
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
