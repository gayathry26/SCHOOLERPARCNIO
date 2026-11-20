'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Plus,
  Printer,
  ShieldAlert,
  Edit2,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const PERIOD_TIMES = [
  { index: 1, start: '08:30', end: '09:15' },
  { index: 2, start: '09:15', end: '10:00' },
  { index: 3, start: '10:15', end: '11:00' },
  { index: 4, start: '11:00', end: '11:45' },
  { index: 5, start: '12:15', end: '01:00' },
  { index: 6, start: '01:00', end: '01:45' },
];

export const TimetableClient: React.FC<{
  classes: any[];
  teachers: any[];
  subjects: any[];
  initialEntries: any[];
  userRole: string;
}> = ({ classes, teachers, subjects, initialEntries, userRole }) => {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const [selectedSectionId, setSelectedSectionId] = useState(currentClass?.sections[0]?.id || '');
  const [entries, setEntries] = useState(initialEntries);

  // Edit slot modal
  const [editingSlot, setEditingSlot] = useState<{ day: string; period: number } | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.id || '');
  const [roomNumber, setRoomNumber] = useState('Room-1001');
  const [clashError, setClashError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenSlot = (day: string, period: number) => {
    setEditingSlot({ day, period });
    setClashError(null);
    const existing = entries.find(
      (e) => e.sectionId === selectedSectionId && e.dayOfWeek === day && e.periodIndex === period
    );
    if (existing) {
      setSelectedSubjectId(existing.subjectId);
      setSelectedTeacherId(existing.teacherId);
      setRoomNumber(existing.roomNumber || 'Room-1001');
    }
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;
    setIsSaving(true);
    setClashError(null);

    const timing = PERIOD_TIMES.find((p) => p.index === editingSlot.period) || PERIOD_TIMES[0];

    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedSectionId,
          subjectId: selectedSubjectId,
          teacherId: selectedTeacherId,
          dayOfWeek: editingSlot.day,
          periodIndex: editingSlot.period,
          startTime: timing.start,
          endTime: timing.end,
          roomNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setClashError(data.error || 'Clash detected');
      } else {
        // Update local entries
        setEntries((prev) => [
          ...prev.filter(
            (e) =>
              !(
                e.sectionId === selectedSectionId &&
                e.dayOfWeek === editingSlot.day &&
                e.periodIndex === editingSlot.period
              )
          ),
          data.entry,
        ]);
        setEditingSlot(null);
        window.location.reload();
      }
    } catch (err: any) {
      setClashError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-emerald-600" />
            <span>Interactive Timetable Matrix &amp; Clash Prevention</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Weekly period grid with real-time teacher and classroom clash detection.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          leftIcon={<Printer className="w-3.5 h-3.5" />}
        >
          Print Timetable
        </Button>
      </div>

      {/* Selector Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-4 text-xs no-print">
        <div className="flex items-center gap-1.5">
          <label className="font-bold text-slate-700">Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => {
              const cId = e.target.value;
              const c = classes.find((cls) => cls.id === cId);
              setSelectedClassId(cId);
              setSelectedSectionId(c?.sections[0]?.id || '');
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="font-bold text-slate-700">Section:</label>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none"
          >
            {currentClass?.sections.map((s: any) => (
              <option key={s.id} value={s.id}>
                Section {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Weekly Timetable Grid */}
      <Card className="print-container">
        <CardHeader>
          <div>
            <CardTitle>
              Weekly Schedule: {currentClass?.name} - Section{' '}
              {currentClass?.sections.find((s: any) => s.id === selectedSectionId)?.name || 'A'}
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any period card to assign subject, faculty &amp; room with conflict checking
            </p>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 w-28 border-r border-slate-200">Day / Period</th>
                {PERIOD_TIMES.map((p) => (
                  <th key={p.index} className="p-3 border-r border-slate-200 min-w-[140px]">
                    <div>
                      <span>Period {p.index}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {p.start} - {p.end}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {DAYS.map((day) => (
                <tr key={day} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900 bg-slate-50 border-r border-slate-200 uppercase tracking-wider text-[11px]">
                    {day}
                  </td>
                  {PERIOD_TIMES.map((p) => {
                    const slot = entries.find(
                      (e) =>
                        e.sectionId === selectedSectionId &&
                        e.dayOfWeek === day &&
                        e.periodIndex === p.index
                    );

                    return (
                      <td
                        key={p.index}
                        onClick={() => handleOpenSlot(day, p.index)}
                        className="p-2 border-r border-slate-200 align-top cursor-pointer hover:bg-emerald-50/40 transition-colors group"
                      >
                        {slot ? (
                          <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1">
                            <p className="font-bold text-slate-900 text-xs">
                              {slot.subject?.name || 'Subject'}
                            </p>
                            <p className="text-[10px] text-slate-600">
                              {slot.teacher?.user?.firstName} {slot.teacher?.user?.lastName}
                            </p>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-emerald-200">
                              <span>{slot.roomNumber || 'Room 101'}</span>
                              <Edit2 className="w-3 h-3 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ) : (
                          <div className="h-16 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 group-hover:border-emerald-400 group-hover:text-emerald-700 transition-all">
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-[10px] mt-0.5">Assign</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ---------------------------------------------------- */}
      {/* MODAL: ASSIGN / EDIT TIMETABLE SLOT */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={!!editingSlot}
        onClose={() => setEditingSlot(null)}
        title={`Assign Period ${editingSlot?.period} (${editingSlot?.day})`}
        subtitle="Live conflict detection for teacher schedule and classroom availability"
        maxWidth="md"
      >
        {editingSlot && (
          <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
            {clashError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{clashError}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-white"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Faculty / Teacher *</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-white"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user?.firstName} {t.user?.lastName} ({t.specialization || 'Faculty'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Classroom / Laboratory</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                placeholder="Room-1001 / Physics Lab"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingSlot(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                Assign Slot
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
