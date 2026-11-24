'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ShieldAlert,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { showToast } from '@/components/ui/Toast';
import {
  isOnline,
  queueOfflineAttendance,
  getOfflineAttendanceCount,
  flushOfflineAttendance,
} from '@/lib/offline-sync';

export interface AttendanceStudent {
  id: string;
  admissionNumber: string;
  rollNumber: string;
  name: string;
  email: string;
  parentPhone?: string | null;
  emergencyContact?: string | null;
  classId?: string | null;
  sectionId?: string | null;
  className?: string;
  sectionName?: string;
}

export interface AttendanceClass {
  id: string;
  name: string;
  numericOrder?: number;
  stream?: string | null;
  sections: Array<{ id: string; name: string; capacity?: number }>;
}

export const AttendanceClient: React.FC<{
  classes: AttendanceClass[];
  initialStudents: AttendanceStudent[];
  userRole?: string;
}> = ({ classes, initialStudents, userRole = 'SCHOOL_ADMIN' }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(() => classes[0]?.id || '');
  const currentClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId) || classes[0],
    [classes, selectedClassId]
  );

  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    () => currentClass?.sections[0]?.id || ''
  );

  // When class changes, ensure selectedSectionId is updated to the first section of the new class
  useEffect(() => {
    if (currentClass?.sections && currentClass.sections.length > 0) {
      const exists = currentClass.sections.some((s) => s.id === selectedSectionId);
      if (!exists) {
        setSelectedSectionId(currentClass.sections[0].id);
      }
    } else {
      setSelectedSectionId('');
    }
  }, [currentClass, selectedSectionId]);

  const currentSection = useMemo(
    () => currentClass?.sections.find((s) => s.id === selectedSectionId),
    [currentClass, selectedSectionId]
  );

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceState, setAttendanceState] = useState<Record<string, { status: string; remarks?: string }>>({});
  const [studentFilter, setStudentFilter] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Filter students strictly by selectedSectionId (or class if unassigned)
  const sectionStudents = useMemo(() => {
    if (!selectedSectionId) return [];
    return initialStudents.filter(
      (s) => s.sectionId === selectedSectionId || (!s.sectionId && s.classId === selectedClassId)
    );
  }, [initialStudents, selectedSectionId, selectedClassId]);

  // Initialize attendance records to PRESENT by default whenever section students change
  useEffect(() => {
    const initialMap: Record<string, { status: string; remarks?: string }> = {};
    sectionStudents.forEach((s) => {
      initialMap[s.id] = { status: 'PRESENT' };
    });
    setAttendanceState(initialMap);
    setPendingSyncCount(getOfflineAttendanceCount());
    setSaveSuccess(false);
  }, [sectionStudents]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
    setSaveSuccess(false);
    setOfflineNotice(false);
  };

  const handleMarkAll = (status: string) => {
    if (sectionStudents.length === 0) return;
    const updated: Record<string, { status: string; remarks?: string }> = {};
    sectionStudents.forEach((s) => {
      updated[s.id] = { status };
    });
    setAttendanceState(updated);
    setSaveSuccess(false);
    setOfflineNotice(false);
    showToast(`Marked all ${sectionStudents.length} students as ${status}`, 'info');
  };

  const handleSave = async () => {
    if (sectionStudents.length === 0) {
      showToast('No students enrolled in this section to save attendance for.', 'warning');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setOfflineNotice(false);

    const records = Object.entries(attendanceState)
      .filter(([studentId]) => sectionStudents.some((s) => s.id === studentId))
      .map(([studentId, val]) => ({
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
        const pres = records.filter((s) => s.status === 'PRESENT').length;
        const abs = records.filter((s) => s.status === 'ABSENT').length;
        showToast(`Attendance saved: ${pres} Present, ${abs} Absent. Synced to institutional register.`, 'success');
      } else {
        const errData = await res.json().catch(() => null);
        queueOfflineAttendance(selectedSectionId, selectedDate, records);
        setPendingSyncCount(getOfflineAttendanceCount());
        setOfflineNotice(true);
        setSaveSuccess(true);
        showToast(errData?.error || 'Server queue saved locally.', 'warning');
      }
    } catch {
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

  // Real-time Counters for the currently selected section
  const total = sectionStudents.length;
  const presentCount = sectionStudents.filter(
    (s) => (attendanceState[s.id]?.status || 'PRESENT') === 'PRESENT'
  ).length;
  const absentCount = sectionStudents.filter(
    (s) => attendanceState[s.id]?.status === 'ABSENT'
  ).length;
  const leaveCount = sectionStudents.filter(
    (s) => attendanceState[s.id]?.status === 'LEAVE'
  ).length;
  const lateCount = sectionStudents.filter(
    (s) => attendanceState[s.id]?.status === 'LATE'
  ).length;
  const presentPercentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  const visibleStudents = sectionStudents.filter((s) => {
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
            <CalendarCheck className="w-5 h-5 text-[#990000]" />
            <span>Mobile-First Class Attendance</span>
          </h2>
          <p className="text-xs text-[#737373] mt-0.5 font-normal">
            1-tap fast attendance register with offline sync across all classes (LKG to 12th).
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
            <span className="text-xs font-bold text-[#990000] bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" />
              {offlineNotice ? 'Saved Locally (Offline Queue)' : 'Saved & Registered'}
            </span>
          )}

          <Button
            variant="primary"
            size="md"
            isLoading={isSaving}
            onClick={handleSave}
            disabled={sectionStudents.length === 0}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Class, Section, Date Pickers */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E5E5E5] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
          {/* Class Selector - Displays All Classes LKG to 12th */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
            <label className="font-bold text-[#171717] whitespace-nowrap">Class:</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                const cId = e.target.value;
                const c = classes.find((cls) => cls.id === cId);
                setSelectedClassId(cId);
                setSelectedSectionId(c?.sections[0]?.id || '');
              }}
              className="px-2.5 py-1.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-xs font-bold text-[#171717] focus:outline-none focus:border-[#990000]"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
            <label className="font-bold text-[#171717] whitespace-nowrap">Section:</label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-xs font-bold text-[#171717] focus:outline-none focus:border-[#990000]"
            >
              {currentClass?.sections && currentClass.sections.length > 0 ? (
                currentClass.sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    Section {s.name}
                  </option>
                ))
              ) : (
                <option value="">No Sections</option>
              )}
            </select>
          </div>

          {/* Date Picker */}
          <div className="col-span-2 sm:col-span-1 flex flex-col sm:flex-row sm:items-center gap-1.5">
            <label className="font-bold text-[#171717] whitespace-nowrap">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-xs font-bold text-[#171717] focus:outline-none focus:border-[#990000]"
            />
          </div>
        </div>

        {/* 1-Tap Quick Action Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
          <span className="text-[#737373] font-semibold mr-1">Quick:</span>
          <button
            type="button"
            onClick={() => handleMarkAll('PRESENT')}
            disabled={sectionStudents.length === 0}
            className="px-2.5 py-1 rounded bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#171717] border border-[#E5E5E5] font-bold transition-colors cursor-pointer disabled:opacity-40"
          >
            All Present
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('ABSENT')}
            disabled={sectionStudents.length === 0}
            className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-[#DC2626] border border-red-200 font-bold transition-colors cursor-pointer disabled:opacity-40"
          >
            All Absent
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-[#E5E5E5] shadow-2xs">
          <span className="text-[11px] text-[#737373] font-medium">Present Today</span>
          <div className="text-xl font-black text-[#171717] mt-1">{presentCount} / {total}</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-[#E5E5E5] shadow-2xs">
          <span className="text-[11px] text-[#737373] font-medium">Absent</span>
          <div className="text-xl font-black text-[#DC2626] mt-1">{absentCount}</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-[#E5E5E5] shadow-2xs">
          <span className="text-[11px] text-[#737373] font-medium">On Leave</span>
          <div className="text-xl font-black text-[#D97706] mt-1">{leaveCount}</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-[#E5E5E5] shadow-2xs">
          <span className="text-[11px] text-[#737373] font-medium">Realized Attendance</span>
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
          placeholder={`Fast search ${sectionStudents.length} students enrolled in ${currentClass?.name} - Section ${currentSection?.name || 'A'}...`}
          className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#171717] placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#990000] shadow-2xs"
        />
        {studentFilter && (
          <button
            onClick={() => setStudentFilter('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#737373] hover:text-[#171717] font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Student List */}
      <Card>
        {sectionStudents.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center mx-auto text-[#737373]">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#171717]">
              No Students Enrolled in {currentClass?.name} - Section {currentSection?.name || 'A'}
            </h3>
            <p className="text-xs text-[#737373] max-w-md mx-auto">
              Section allocation is managed exclusively by the School Administrator. To enroll students into this class section, use the Student Directory or Admissions enrollment workflow.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE CARD VIEW (Screen < sm): Large touch targets */}
            <div className="sm:hidden divide-y divide-[#E5E5E5]">
              {visibleStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#737373]">
                  No students match &ldquo;{studentFilter}&rdquo;
                </div>
              ) : (
                visibleStudents.map((s, index) => {
                  const currentStatus = attendanceState[s.id]?.status || 'PRESENT';

                  return (
                    <div key={s.id} className="p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#F5F5F5] text-[#171717] flex items-center justify-center font-mono font-bold text-xs">
                            {s.rollNumber || index + 1}
                          </span>
                          <div>
                            <span className="font-bold text-[#171717] text-sm block leading-tight">{s.name}</span>
                            <span className="text-[11px] text-[#737373] font-mono">{s.admissionNumber}</span>
                          </div>
                        </div>
                        <Badge
                          variant={
                            currentStatus === 'PRESENT'
                              ? 'dark-red'
                              : currentStatus === 'ABSENT'
                                ? 'red'
                                : currentStatus === 'LEAVE'
                                  ? 'amber'
                                  : 'slate'
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
                          className={`h-11 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'PRESENT'
                              ? 'bg-[#990000] text-white shadow-xs'
                              : 'bg-[#F5F5F5] text-[#525252]'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'ABSENT')}
                          className={`h-11 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'ABSENT'
                              ? 'bg-[#DC2626] text-white shadow-xs'
                              : 'bg-[#F5F5F5] text-[#525252]'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'LEAVE')}
                          className={`h-11 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'LEAVE'
                              ? 'bg-[#D97706] text-white shadow-xs'
                              : 'bg-[#F5F5F5] text-[#525252]'
                          }`}
                        >
                          Leave
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'LATE')}
                          className={`h-11 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'LATE'
                              ? 'bg-[#171717] text-white shadow-xs'
                              : 'bg-[#F5F5F5] text-[#525252]'
                          }`}
                        >
                          Late
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
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
                      <td colSpan={5} className="p-6 text-center text-xs text-[#737373]">
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
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentStatus === 'PRESENT'
                                    ? 'bg-[#990000] text-white shadow-2xs'
                                    : 'bg-[#F5F5F5] text-[#737373] hover:bg-red-50 hover:text-[#990000]'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(s.id, 'ABSENT')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentStatus === 'ABSENT'
                                    ? 'bg-[#DC2626] text-white shadow-2xs'
                                    : 'bg-[#F5F5F5] text-[#737373] hover:bg-red-50 hover:text-[#DC2626]'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(s.id, 'LEAVE')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentStatus === 'LEAVE'
                                    ? 'bg-[#D97706] text-white shadow-2xs'
                                    : 'bg-[#F5F5F5] text-[#737373] hover:bg-amber-50 hover:text-[#D97706]'
                                }`}
                              >
                                Leave
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(s.id, 'LATE')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentStatus === 'LATE'
                                    ? 'bg-[#171717] text-white shadow-2xs'
                                    : 'bg-[#F5F5F5] text-[#737373] hover:bg-slate-200 hover:text-[#171717]'
                                }`}
                              >
                                Late
                              </button>
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={attendanceState[s.id]?.remarks || ''}
                              onChange={(e) =>
                                setAttendanceState((prev) => ({
                                  ...prev,
                                  [s.id]: { ...prev[s.id], remarks: e.target.value },
                                }))
                              }
                              placeholder="Optional remarks..."
                              className="w-full px-2.5 py-1 bg-[#F5F5F5] border border-[#E5E5E5] rounded text-xs text-[#171717] focus:outline-none focus:border-[#990000]"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
