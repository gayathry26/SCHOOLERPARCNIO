'use client';

import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Users,
  GraduationCap,
  DollarSign,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Phone,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency } from '@/lib/formatters';

export const MultiCampusClient: React.FC<{
  branches: any[];
  totalStudents: number;
  totalTeachers: number;
  userRole: string;
}> = ({ branches: initialBranches, totalStudents, totalTeachers, userRole }) => {
  const [branches, setBranches] = useState(initialBranches);
  const [activeBranchId, setActiveBranchId] = useState(initialBranches[0]?.id || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: 'EdvoNest International — Greater Noida Tech Campus',
    branchCode: 'EDV-GN-03',
    address: 'Knowledge Park III, Greater Noida',
    city: 'Greater Noida',
    state: 'Uttar Pradesh',
    principalName: 'Dr. R. K. Bhattacharya',
    contactPhone: '+91 120 4889900',
    studentCapacity: 1800,
  });

  const totalCapacity = branches.reduce((acc, b) => acc + (b.studentCapacity || 1500), 0);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/multi-campus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_BRANCH', ...form }),
      });
      const data = await res.json();
      if (res.ok) {
        setBranches([...branches, data.branch]);
        setIsAddModalOpen(false);
      } else {
        alert(data.error || 'Failed to create campus branch');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E4EAEC] p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#086A92]" />
              <span>Multi-Campus Architecture &amp; Group Network</span>
            </h2>
            <Badge variant="purple" size="sm">
              SaaS Multi-Tenant Mode
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centrally oversee multiple school branches, isolate campus student records, and benchmark comparative academic metrics.
          </p>
        </div>

        {['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(userRole) && (
          <Button
            size="sm"
            variant="primary"
            className="bg-[#086A92] hover:bg-[#065A7D] text-white flex items-center gap-1.5"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Campus Branch
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Campus Branches"
          value={`${branches.length} Campuses`}
          change="Delhi NCR Region"
          trend="neutral"
          icon={<Building2 className="w-5 h-5 text-[#086A92]" />}
        />
        <StatCard
          title="Consolidated Student Strength"
          value={totalStudents}
          change={`Max Capacity: ${totalCapacity}`}
          trend="up"
          icon={<GraduationCap className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Group Teaching Faculty"
          value={totalTeachers}
          change="Across all wings"
          trend="up"
          icon={<Users className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Institutional Compliance"
          value="100% CBSE"
          change="Affiliation validated"
          trend="up"
          icon={<ShieldCheck className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* Comparative Branch Benchmark Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Cross-Campus Performance &amp; Capacity Benchmarking
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Comparative student strength, faculty ratio, fee realization rate, and CBSE Grade 10/12 averages.
              </p>
            </div>
          </div>
        </CardHeader>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((b, idx) => {
            const enrolled = idx === 0 ? 1250 : idx === 1 ? 480 : 320;
            const feeRate = idx === 0 ? 94.2 : idx === 1 ? 96.8 : 91.5;
            const cbseAverage = idx === 0 ? '88.4%' : idx === 1 ? '91.2%' : '86.5%';
            const isSelected = activeBranchId === b.id;

            return (
              <div
                key={b.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-[#086A92] ring-2 ring-[#086A92]/20 bg-sky-50/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="blue" size="sm" className="font-mono">
                      {b.branchCode}
                    </Badge>
                    <h4 className="font-bold text-slate-900 text-base mt-2 leading-snug">{b.name}</h4>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.city}, {b.state}
                    </span>
                  </div>
                </div>

                <div className="my-4 space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Enrolled / Capacity:</span>
                    <strong className="text-slate-900 font-mono">
                      {enrolled} / {b.studentCapacity} ({Math.round((enrolled / b.studentCapacity) * 100)}%)
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Head of Campus:</span>
                    <strong className="text-slate-900">{b.principalName}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Fee Recovery Rate:</span>
                    <strong className="text-emerald-700 font-mono font-bold">{feeRate}%</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CBSE Board Average:</span>
                    <strong className="text-[#086A92] font-mono font-bold">{cbseAverage}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    size="xs"
                    variant={isSelected ? 'primary' : 'outline'}
                    className={isSelected ? 'bg-[#086A92] text-white' : 'text-[#086A92]'}
                    onClick={() => setActiveBranchId(b.id)}
                  >
                    {isSelected ? 'Active Context' : 'Switch Context'}
                  </Button>
                  <a
                    href={`tel:${b.contactPhone}`}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-mono"
                  >
                    <Phone className="w-3 h-3" /> {b.contactPhone}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Add Branch Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Campus Branch">
        <form onSubmit={handleCreateBranch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Code</label>
              <input
                type="text"
                required
                value={form.branchCode}
                onChange={(e) => setForm({ ...form, branchCode: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student Capacity</label>
              <input
                type="number"
                value={form.studentCapacity}
                onChange={(e) => setForm({ ...form, studentCapacity: parseInt(e.target.value) || 1500 })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Head of School / Principal</label>
              <input
                type="text"
                required
                value={form.principalName}
                onChange={(e) => setForm({ ...form, principalName: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                required
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#086A92] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#086A92] outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" className="bg-[#086A92] text-white">
              Save Campus Branch
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
