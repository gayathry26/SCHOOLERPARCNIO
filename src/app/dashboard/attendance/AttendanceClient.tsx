'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Check,
  UserCheck,
  WifiOff,
  RefreshCw,
  Sparkles,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { showToast } from '@/components/ui/Toast';
import {
  isOnline,
  queueOfflineAttendance,
  getOfflineAttendanceCount,
  flushOfflineAttendance,
} from '@/lib/offline-sync';

export const AttendanceClient: React.FC<{
  classes: Array<{ id: string; name: string; sections: Array<{ id: string; name: string }> }>;
  initialStudents: any[];
}> = ({ classes, initialStudents }) => {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const [selectedSectionId, setSelectedSectionId] = useState(currentClass?.sections[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceState, setAttendanceState] = useState<Record<string, { status: string; remarks?: string }>>({});
  const [studentFilter, setStudentFilter] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Initialize attendance records to PRESENT by default
  useEffect(() => {
    const initialMap: Record<string, { status: string; remarks?: string }> = {};
    initialStudents.forEach((s) => {
      initialMap[s.id] = { status: 'PRESENT' };
    });
    setAttendanceState(initialMap);
    setPendingSyncCount(getOfflineAttendanceCount());
  }, [initialStudents]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
    setSaveSuccess(false);
    setOfflineNotice(false);
  };

  const handleMarkAll = (status: string) => {
    const updated: Record<string, { status: string; remarks?: string }> = {};
    initialStudents.forEach((s) => {
      updated[s.id] = { status };
    });
    setAttendanceState(updated);
    setSaveSuccess(false);
    setOfflineNotice(false);
    showToast(`Marked all ${initialStudents.length} students as ${status}`, 'info');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setOfflineNotice(false);

    const records = Object.entries(attendanceState).map(([studentId, val]) => ({
      studentId,
      status: val.status,
      remarks: val.remarks,
    }));

    // OFFLINE HANDLING: If offline, queue locally and show instant feedback
    if (!isOnline()) {
      queueOfflineAttendance(selectedSectionId, selectedDate, records);
      setPendingSyncCount(getOfflineAttendanceCount());
      setIsSaving(false);
      setOfflineNotice(true);
      setSaveSuccess(true);
      showToast('Attendance saved to offline queue. Will sync automatically when connection restores.', 'info');
      return;
    }

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedSectionId,
          dateStr: selectedDate,
          records,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        const pres = Object.values(attendanceState).filter((s) => s.status === 'PRESENT').length;
        const abs = Object.values(attendanceState).filter((s) => s.status === 'ABSENT').length;
        showToast(`Attendance saved: ${pres} Present, ${abs} Absent. SMS notifications dispatched.`, 'success');
      } else {
        // Fallback to local queue if server request fails
        queueOfflineAttendance(selectedSectionId, selectedDate, records);
        setPendingSyncCount(getOfflineAttendanceCount());
        setOfflineNotice(true);
        setSaveSuccess(true);
        showToast('Server unavailable. Saved to local queue.', 'warning');
      }
    } catch {
      // Network failed during send -> save offline
      queueOfflineAttendance(selectedSectionId, selectedDate, records);
      setPendingSyncCount(getOfflineAttendanceCount());
      setOfflineNotice(true);
      setSaveSuccess(true);
      showToast('Network issue. Saved safely to local offline queue.', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSync = async () => {
    const result = await flushOfflineAttendance();
    setPendingSyncCount(getOfflineAttendanceCount());
    showToast(`Synced ${result.synced} offline attendance records with the server!`, 'success');
  };

  // Real-time Counters
  const total = initialStudents.length || 1;
  const presentCount = Object.values(attendanceState).filter((s) => s.status === 'PRESENT').length;
  const absentCount = Object.values(attendanceState).filter((s) => s.status === 'ABSENT').length;
  const leaveCount = Object.values(attendanceState).filter((s) => s.status === 'LEAVE').length;
  const lateCount = Object.values(attendanceState).filter((s) => s.status === 'LATE').length;
  const presentPercentage = Math.round((presentCount / total) * 100);

  const visibleStudents = initialStudents.filter((s) => {
    if (!studentFilter.trim()) return true;
    const q = studentFilter.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.admissionNumber.toLowerCase().includes(q) ||
      (s.rollNumber && s.rollNumber.toString().toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-[#E5E5E5] rounded-xl p-4 sm:p-5 shadow-2xs">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-[#171717] tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#35B84A]" />
            <span>Mobile-First Class Attendance</span>
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            1-tap fast attendance marking with offline background sync for teachers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
          {pendingSyncCount > 0 && (
            <Button size="sm" variant="outline" onClick={handleManualSync}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Sync ({pendingSyncCount})
            </Button>
          )}

          {saveSuccess && (
            <span className="text-xs font-bold text-[#16A34A] bg-[#EAF8EC] px-3 py-1.5 rounded-lg border border-[#bbf0c5] flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" />
              {offlineNotice ? 'Saved Locally (Offline Queue)' : 'Saved & Dispatched'}
            </span>
          )}

          <Button
            variant="primary"
            size="md"
            isLoading={isSaving}
            onClick={handleSave}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Class, Section, Date Pickers */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E5E5E5] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
            <label className="font-bold text-[#171717]">Class:</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                const cId = e.target.value;
                const c = classes.find((cls) => cls.id === cId);
                setSelectedClassId(cId);
                setSelectedSectionId(c?.sections[0]?.id || '');
              }}
              className="px-2.5 py-1.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-xs font-bold text-[#171717]"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
            <label className="font-bold text-[#171717]">Section:</label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-xs font-bold text-[#171717]"
            >
              {currentClass?.sections.map((s) => (
                <option key={s.id} value={s.id}>
                  Section {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1 flex flex-col sm:flex-row sm:items-center gap-1">
            <label className="font-bold text-[#171717]">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-xs font-bold text-[#171717]"
            />
          </div>
        </div>

        {/* 1-Tap Quick Action Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
          <span className="text-slate-500 font-semibold mr-1">Quick:</span>
          <button
            type="button"
            onClick={() => handleMarkAll('PRESENT')}
            className="px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold transition-colors cursor-pointer"
          >
            All Present
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('ABSENT')}
            className="px-2.5 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold transition-colors cursor-pointer"
          >
            All Absent
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium">Present Today</span>
          <div className="text-xl font-black text-emerald-700 mt-1">{presentCount} / {total}</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium">Absent</span>
          <div className="text-xl font-black text-rose-600 mt-1">{absentCount}</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium">On Leave</span>
          <div className="text-xl font-black text-amber-600 mt-1">{leaveCount}</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium">Realized Attendance</span>
          <div className="text-xl font-black text-[#990000] mt-1">{presentPercentage}%</div>
        </div>
      </div>

      {/* Fast Search & Student Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={studentFilter}
          onChange={(e) => setStudentFilter(e.target.value)}
          placeholder={`Fast search ${initialStudents.length} students by name, roll number, or admission ID...`}
          className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E5E5] rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#990000] shadow-2xs"
        />
        {studentFilter && (
          <button
            onClick={() => setStudentFilter('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Student List */}
      <Card>
        {/* MOBILE CARD VIEW (Screen < sm): Large touch targets */}
        <div className="sm:hidden divide-y divide-slate-100">
          {visibleStudents.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No students match &ldquo;{studentFilter}&rdquo;
            </div>
          ) : (
            visibleStudents.map((s, index) => {
              const currentStatus = attendanceState[s.id]?.status || 'PRESENT';

              return (
                <div key={s.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-xs">
                        {s.rollNumber || index + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block leading-tight">{s.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{s.admissionNumber}</span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        currentStatus === 'PRESENT'
                          ? 'green'
                          : currentStatus === 'ABSENT'
                            ? 'rose'
                            : currentStatus === 'LEAVE'
                              ? 'amber'
                              : 'blue'
                      }
                    >
                      {currentStatus}
                    </Badge>
                  </div>

                  {/* 44px Touch Targets for Finger Taps */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(s.id, 'PRESENT')}
                      className={`h-11 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentStatus === 'PRESENT'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700'
                        }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(s.id, 'ABSENT')}
                      className={`h-11 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentStatus === 'ABSENT'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700'
                        }`}
                    >
                      Absent
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(s.id, 'LEAVE')}
                      className={`h-11 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentStatus === 'LEAVE'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700'
                        }`}
                    >
                      Leave
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(s.id, 'LATE')}
                      className={`h-11 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentStatus === 'LATE'
                        ? 'bg-[#990000] text-white shadow-md'
                        : 'bg-slate-100 text-slate-700'
                        }`}
                    >
                      Late
                    </button>
                  </div>
                </div>
              );
            }))}
        </div>

        {/* DESKTOP TABLE VIEW (Screen >= sm) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F5F5] text-[#737373] uppercase tracking-wider font-semibold border-b border-[#E5E5E5]">
              <tr>
                <th className="p-3 w-16">Roll #</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Adm #</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {visibleStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-xs text-slate-500">
                    No students match &ldquo;{studentFilter}&rdquo;
                  </td>
                </tr>
              ) : (
                visibleStudents.map((s) => {
                  const currentStatus = attendanceState[s.id]?.status || 'PRESENT';

                  return (
                    <tr key={s.id} className="hover:bg-[#F5F5F5] transition-colors">
                      <td className="p-3 font-mono font-bold text-[#171717]">{s.rollNumber || '01'}</td>
                      <td className="p-3">
                        <span className="font-bold text-[#171717] block">{s.name}</span>
                        <span className="text-[10.5px] text-[#737373]">{s.email}</span>
                      </td>
                      <td className="p-3 font-mono text-[#737373]">{s.admissionNumber}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'PRESENT')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentStatus === 'PRESENT'
                              ? 'bg-[#35B84A] text-white shadow-2xs'
                              : 'bg-[#F1F5F7] text-[#737373] hover:bg-[#EAF8EC] hover:text-[#16A34A]'
                              }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'ABSENT')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentStatus === 'ABSENT'
                              ? 'bg-[#DC2626] text-white shadow-2xs'
                              : 'bg-[#F1F5F7] text-[#737373] hover:bg-[#FEE2E2] hover:text-[#DC2626]'
                              }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'LEAVE')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentStatus === 'LEAVE'
                              ? 'bg-[#D97706] text-white shadow-2xs'
                              : 'bg-[#F1F5F7] text-[#737373] hover:bg-[#FEF3C7] hover:text-[#B45309]'
                              }`}
                          >
                            Leave
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'LATE')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentStatus === 'LATE'
                              ? 'bg-[#990000] text-white shadow-2xs'
                              : 'bg-[#F1F5F7] text-[#737373] hover:bg-[#FEF2F2] hover:text-[#990000]'
                              }`}
                          >
                            Late
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="Optional remarks..."
                          value={attendanceState[s.id]?.remarks || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAttendanceState((prev) => ({
                              ...prev,
                              [s.id]: { ...prev[s.id], remarks: val },
                            }));
                          }}
                          className="w-full px-2.5 py-1 text-xs border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#990000]"
                        />
                      </td>
                    </tr>
                  );
                }))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
