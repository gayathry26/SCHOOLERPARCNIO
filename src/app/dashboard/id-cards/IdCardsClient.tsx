'use client';

import React, { useState } from 'react';
import {
  Contact,
  Printer,
  QrCode as QrIcon,
  ShieldCheck,
  GraduationCap,
  Users,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabItem } from '@/components/ui/Tabs';

export const IdCardsClient: React.FC<{
  students: any[];
  teachers: any[];
}> = ({ students, teachers }) => {
  const [activeTab, setActiveTab] = useState('students');
  const [selectedClass, setSelectedClass] = useState('');

  const tabs: TabItem[] = [
    { id: 'students', label: 'Student ID Cards (Bulk Generator)', count: students.length, icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'staff', label: 'Staff & Faculty ID Cards', count: teachers.length, icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Contact className="w-6 h-6 text-emerald-600" />
            <span>ID Card Studio &amp; Dynamic QR Generator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Print ready PVC card layouts with security micro-text and dynamic verification codes.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => window.print()}
          leftIcon={<Printer className="w-3.5 h-3.5" />}
        >
          Print All ID Cards
        </Button>
      </div>

      <div className="no-print">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Student Cards Grid */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((st) => (
            <div
              key={st.id}
              className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-xl space-y-4 border border-slate-700 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-500 text-slate-900 font-black text-xs flex items-center justify-center">
                    E
                  </div>
                  <span className="text-xs font-bold tracking-wider uppercase">EDVONEST ACADEMY</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                  2025–26
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-700 text-white font-black text-2xl flex items-center justify-center border border-slate-600 shrink-0">
                  {st.user.firstName[0]}
                </div>
                <div className="space-y-0.5 text-xs truncate">
                  <p className="font-bold text-sm text-white truncate">
                    {st.user.firstName} {st.user.lastName}
                  </p>
                  <p className="text-slate-400">Class: {st.enrollments[0]?.class?.name} - {st.enrollments[0]?.section?.name}</p>
                  <p className="text-slate-400 font-mono">ID: {st.admissionNumber}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700/80 text-[10px] text-slate-400">
                <div>
                  <p>House: {st.house || 'Emerald'}</p>
                  <p>Emergency: {st.emergencyContact}</p>
                </div>
                <div className="w-12 h-12 bg-white p-1 rounded flex items-center justify-center text-slate-900 font-mono text-[8px] text-center">
                  <QrIcon className="w-8 h-8 text-slate-900" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff Cards Grid */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((t) => (
            <div
              key={t.id}
              className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-xl space-y-4 border border-indigo-800 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-indigo-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-400 text-slate-900 font-black text-xs flex items-center justify-center">
                    E
                  </div>
                  <span className="text-xs font-bold tracking-wider uppercase">STAFF IDENTITY CARD</span>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                  FACULTY
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-indigo-900 text-white font-black text-2xl flex items-center justify-center border border-indigo-700 shrink-0">
                  {t.user.firstName[0]}
                </div>
                <div className="space-y-0.5 text-xs truncate">
                  <p className="font-bold text-sm text-white truncate">
                    {t.user.firstName} {t.user.lastName}
                  </p>
                  <p className="text-indigo-300">{t.specialization || 'Senior Faculty'}</p>
                  <p className="text-slate-400 font-mono">Emp Code: {t.employeeCode}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-indigo-800 text-[10px] text-slate-400">
                <div>
                  <p>Dept: Academics</p>
                  <p>Phone: {t.user.phone || '+91 98XXX XXXXX'}</p>
                </div>
                <div className="w-12 h-12 bg-white p-1 rounded flex items-center justify-center text-slate-900 font-mono text-[8px] text-center">
                  <QrIcon className="w-8 h-8 text-slate-900" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
