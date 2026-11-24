'use client';

import React, { useState } from 'react';
import {
  Building2,
  BedDouble,
  Users,
  CalendarCheck,
  DoorOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Phone,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HostelClientProps {
  initialBuildings: any[];
  initialAllocations: any[];
  initialAttendances: any[];
  initialOutpasses: any[];
  students: { id: string; admissionNumber: string; name: string; className: string; sectionName: string }[];
  userRole: string;
}

export const HostelClient: React.FC<HostelClientProps> = ({
  initialBuildings,
  initialAllocations,
  initialAttendances,
  initialOutpasses,
  students,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'allocations' | 'attendance' | 'outpasses'>('rooms');
  const [buildings, setBuildings] = useState(initialBuildings);
  const [allocations, setAllocations] = useState(initialAllocations);
  const [attendances, setAttendances] = useState(initialAttendances);
  const [outpasses, setOutpasses] = useState(initialOutpasses);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(initialBuildings[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [showOutpassModal, setShowOutpassModal] = useState(false);

  // Form states
  const [roomForm, setRoomForm] = useState({
    buildingId: initialBuildings[0]?.id || '',
    roomNumber: '',
    floor: 1,
    capacity: 4,
    roomType: 'NON_AC',
    monthlyFee: 6500,
  });

  const [allocForm, setAllocForm] = useState({
    roomId: '',
    studentId: '',
    bedNumber: 'Bed 1',
    monthlyRent: 6500,
    depositPaid: 10000,
  });

  const [outpassForm, setOutpassForm] = useState({
    studentId: '',
    destination: '',
    purpose: '',
    departureTime: '',
    expectedReturnTime: '',
  });

  const [rollCallRecords, setRollCallRecords] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPIs
  const totalBeds = buildings.reduce((acc, b) => acc + (b.capacity || 0), 0);
  const totalAllocated = allocations.length;
  const vacancyRate = totalBeds > 0 ? Math.round(((totalBeds - totalAllocated) / totalBeds) * 100) : 0;
  const activeOutpassesCount = outpasses.filter((o) => o.status === 'APPROVED').length;

  // Selected building rooms
  const activeBuilding = buildings.find((b) => b.id === selectedBuildingId) || buildings[0];
  const displayedRooms = activeBuilding?.rooms || [];

  // 1. Handle Create Room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.buildingId || !roomForm.roomNumber) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/hostel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_room', ...roomForm }),
      });
      const data = await res.json();
      if (res.ok && data.room) {
        setBuildings((prev) =>
          prev.map((b) =>
            b.id === data.room.buildingId
              ? { ...b, rooms: [...(b.rooms || []), data.room] }
              : b
          )
        );
        setShowRoomModal(false);
        setRoomForm({ ...roomForm, roomNumber: '' });
        showToast(`Room ${data.room.roomNumber} created successfully!`);
      } else {
        alert(data.error || 'Failed to create room');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating room');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Allocate Bed
  const handleAllocateBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocForm.roomId || !allocForm.studentId) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/hostel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'allocate_bed', ...allocForm }),
      });
      const data = await res.json();
      if (res.ok && data.allocation) {
        // Refresh allocations list
        const refRes = await fetch('/api/hostel');
        const refData = await refRes.json();
        if (refData.allocations) setAllocations(refData.allocations);
        if (refData.buildings) setBuildings(refData.buildings);
        setShowAllocModal(false);
        showToast('Student successfully allocated to hostel room!');
      } else {
        alert(data.error || 'Failed to allocate bed');
      }
    } catch (err: any) {
      alert(err.message || 'Error allocating bed');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Vacate Bed
  const handleVacateBed = async (allocationId: string) => {
    if (!confirm('Are you sure you want to mark this student bed as vacated?')) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/hostel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'vacate_bed', allocationId }),
      });
      const data = await res.json();
      if (res.ok) {
        setAllocations((prev) => prev.filter((a) => a.id !== allocationId));
        showToast('Bed vacated and updated in inventory.');
      } else {
        alert(data.error || 'Failed to vacate bed');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Roll-Call Submission
  const handleSaveRollCall = async () => {
    if (!selectedBuildingId) return;
    const buildingStudents = allocations.filter(
      (a) => a.room?.buildingId === selectedBuildingId
    );

    const payload = buildingStudents.map((a) => ({
      studentId: a.studentId,
      status: rollCallRecords[a.studentId] || 'PRESENT',
    }));

    setIsLoading(true);
    try {
      const res = await fetch('/api/hostel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_attendance',
          buildingId: selectedBuildingId,
          records: payload,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Hostel evening roll-call saved successfully!');
      } else {
        alert(data.error || 'Failed to save attendance');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Handle Issue Outpass
  const handleIssueOutpass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outpassForm.studentId || !outpassForm.destination || !outpassForm.purpose) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/hostel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_outpass', ...outpassForm }),
      });
      const data = await res.json();
      if (res.ok && data.outpass) {
        const refRes = await fetch('/api/hostel');
        const refData = await refRes.json();
        if (refData.outpasses) setOutpasses(refData.outpasses);
        setShowOutpassModal(false);
        setOutpassForm({ studentId: '', destination: '', purpose: '', departureTime: '', expectedReturnTime: '' });
        showToast('Outpass issued and logged.');
      } else {
        alert(data.error || 'Failed to issue outpass');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Handle Outpass Return
  const handleUpdateOutpass = async (outpassId: string, status: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/hostel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_outpass_status', outpassId, status }),
      });
      const data = await res.json();
      if (res.ok && data.outpass) {
        setOutpasses((prev) =>
          prev.map((o) => (o.id === outpassId ? { ...o, status: data.outpass.status } : o))
        );
        showToast(`Outpass status marked as ${status}`);
      } else {
        alert(data.error || 'Failed to update outpass');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#171717] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/15 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#35B84A]" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E5E5]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#990000] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
              Hostel &amp; Residential Management
            </h1>
          </div>
          <p className="text-sm text-[#525252] mt-1 font-medium">
            Campus residence blocks, room inventories, bed allocations, evening roll-calls, and student outpasses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRoomModal(true)}
            className="text-xs font-bold bg-white text-[#171717] border-[#E5E5E5]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Room</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAllocModal(true)}
            className="text-xs font-bold bg-[#990000] hover:bg-[#800000] text-white shadow-sm"
          >
            <BedDouble className="w-4 h-4 mr-1.5" />
            <span>Allocate Bed</span>
          </Button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#525252] font-semibold">
            <span>Total Bed Capacity</span>
            <Building2 className="w-4 h-4 text-[#990000]" />
          </div>
          <div className="text-2xl font-black text-[#171717]">{totalBeds} Beds</div>
          <p className="text-xs text-slate-500">Across {buildings.length} Residential Blocks</p>
        </div>

        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#525252] font-semibold">
            <span>Active Residents</span>
            <Users className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-2xl font-black text-[#16A34A]">{totalAllocated} Boarders</div>
          <p className="text-xs text-slate-500">{vacancyRate}% Vacancy Available</p>
        </div>

        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#525252] font-semibold">
            <span>Active Outpasses</span>
            <DoorOpen className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{activeOutpassesCount} Out Today</div>
          <p className="text-xs text-slate-500">Authorized Gate Passes</p>
        </div>

        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#525252] font-semibold">
            <span>Resident Safety</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-[#C00000]">100% Monitored</div>
          <p className="text-xs text-slate-500">24/7 Security &amp; Wardens</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-2">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'rooms'
              ? 'bg-[#990000] text-white shadow-xs'
              : 'bg-white text-[#525252] hover:text-[#171717] border border-[#E5E5E5]'
          }`}
        >
          Buildings &amp; Rooms
        </button>

        <button
          onClick={() => setActiveTab('allocations')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'allocations'
              ? 'bg-[#990000] text-white shadow-xs'
              : 'bg-white text-[#525252] hover:text-[#171717] border border-[#E5E5E5]'
          }`}
        >
          Bed Allocations ({allocations.length})
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-[#990000] text-white shadow-xs'
              : 'bg-white text-[#525252] hover:text-[#171717] border border-[#E5E5E5]'
          }`}
        >
          Night Roll-Call
        </button>

        <button
          onClick={() => setActiveTab('outpasses')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'outpasses'
              ? 'bg-[#990000] text-white shadow-xs'
              : 'bg-white text-[#525252] hover:text-[#171717] border border-[#E5E5E5]'
          }`}
        >
          Outpasses &amp; Leaves ({outpasses.length})
        </button>
      </div>

      {/* =====================================================================
          TAB 1: BUILDINGS & ROOMS
          ===================================================================== */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          {/* Building Switcher Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5E5E5]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
                Residential Block:
              </span>
              {buildings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBuildingId(b.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    selectedBuildingId === b.id
                      ? 'bg-[#171717] text-white'
                      : 'bg-[#F5F5F5] text-slate-700 hover:bg-slate-100 border border-[#E5E5E5]'
                  }`}
                >
                  {b.name} ({b.type})
                </button>
              ))}
            </div>

            {activeBuilding && (
              <div className="text-xs text-slate-600 flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5 text-[#990000]" />
                  <span>Warden: {activeBuilding.wardenName} ({activeBuilding.wardenPhone})</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>{activeBuilding.address}</span>
                </span>
              </div>
            )}
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedRooms.map((room: any) => {
              const isFull = room.occupiedBeds >= room.capacity;
              return (
                <div
                  key={room.id}
                  className="bg-white border border-[#E5E5E5] rounded-2xl p-5 space-y-3 shadow-2xs hover:border-[#E5E5E5] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg font-black text-[#171717]">
                      Room {room.roomNumber}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        isFull
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-[#EAF8EC] text-[#16A34A] border border-[#bbf0c5]'
                      }`}
                    >
                      {isFull ? 'FULL' : `${room.capacity - room.occupiedBeds} Left`}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Floor:</span>
                      <span className="font-semibold text-slate-700">Floor {room.floor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Room Type:</span>
                      <span className="font-semibold text-slate-700">{room.roomType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Monthly Fee:</span>
                      <span className="font-bold text-[#990000]">₹ {room.monthlyFee.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Occupancy bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>Occupancy</span>
                      <span>
                        {room.occupiedBeds} / {room.capacity} Beds
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? 'bg-rose-500' : 'bg-[#990000]'
                        }`}
                        style={{ width: `${(room.occupiedBeds / room.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: BED ALLOCATIONS
          ===================================================================== */}
      {activeTab === 'allocations' && (
        <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between gap-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Active Resident Bed Allocations
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Showing {allocations.length} active boarders
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5] text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Building</th>
                  <th className="py-3 px-4">Room &amp; Bed</th>
                  <th className="py-3 px-4">Monthly Rent</th>
                  <th className="py-3 px-4">Deposit</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {alloc.student?.user?.firstName} {alloc.student?.user?.lastName}
                      </div>
                      <div className="text-xs font-mono text-slate-400">
                        {alloc.student?.admissionNumber}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                      {alloc.student?.enrollments?.[0]?.class?.name || 'Class 10'} -{' '}
                      {alloc.student?.enrollments?.[0]?.section?.name || 'A'}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-700">
                      {alloc.room?.building?.name || 'Residence Block'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-800">
                        Room {alloc.room?.roomNumber}
                      </span>{' '}
                      <span className="text-xs text-slate-500">({alloc.bedNumber})</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#990000]">
                      ₹ {alloc.monthlyRent.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 font-medium">
                      ₹ {alloc.depositPaid.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleVacateBed(alloc.id)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                      >
                        Vacate Bed
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: NIGHT ROLL-CALL ATTENDANCE
          ===================================================================== */}
      {activeTab === 'attendance' && (
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Hostel Evening Roll-Call Register
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Record nightly dormitory attendance for {activeBuilding?.name}
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleSaveRollCall}
              isLoading={isLoading}
              className="text-xs sm:text-sm font-bold bg-[#16A34A] hover:bg-[#138a3e] text-white shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>Save Roll-Call Register</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allocations
              .filter((a) => a.room?.buildingId === selectedBuildingId)
              .map((alloc) => {
                const currentStatus = rollCallRecords[alloc.studentId] || 'PRESENT';
                return (
                  <div
                    key={alloc.id}
                    className="p-3.5 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {alloc.student?.user?.firstName} {alloc.student?.user?.lastName}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          Room {alloc.room?.roomNumber} • {alloc.bedNumber}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1">
                      {['PRESENT', 'ABSENT', 'ON_LEAVE', 'OUTPASS'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() =>
                            setRollCallRecords((prev) => ({ ...prev, [alloc.studentId]: st }))
                          }
                          className={`py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            currentStatus === st
                              ? st === 'PRESENT'
                                ? 'bg-emerald-600 text-white'
                                : st === 'ABSENT'
                                ? 'bg-rose-600 text-white'
                                : st === 'ON_LEAVE'
                                ? 'bg-amber-600 text-white'
                                : 'bg-blue-600 text-white'
                              : 'bg-white text-slate-600 border border-[#E5E5E5] hover:bg-slate-100'
                          }`}
                        >
                          {st === 'ON_LEAVE' ? 'LEAVE' : st}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: OUTPASSES & LEAVES
          ===================================================================== */}
      {activeTab === 'outpasses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Authorized Campus Outpasses &amp; Gate Passes
            </h3>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowOutpassModal(true)}
              className="text-xs font-bold bg-[#990000] hover:bg-[#800000] text-white"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Issue Outpass</span>
            </Button>
          </div>

          <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5] text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Departure</th>
                    <th className="py-3 px-4">Expected Return</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {outpasses.map((op) => (
                    <tr key={op.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {op.student?.user?.firstName} {op.student?.user?.lastName}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{op.destination}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">{op.purpose}</td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-600">
                        {new Date(op.departureTime).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-600">
                        {new Date(op.expectedReturnTime).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            op.status === 'APPROVED'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : op.status === 'RETURNED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {op.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {op.status === 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateOutpass(op.id, 'RETURNED')}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer"
                          >
                            Mark Returned
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ADD NEW ROOM
          ===================================================================== */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-lg">Add New Hostel Room</h3>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Building</label>
                <select
                  value={roomForm.buildingId}
                  onChange={(e) => setRoomForm({ ...roomForm, buildingId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-sm"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Room No.</label>
                  <input
                    type="text"
                    required
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-sm"
                    placeholder="301"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Floor</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bed Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) || 4 })}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={roomForm.roomType}
                    onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-sm"
                  >
                    <option value="NON_AC">Non-AC</option>
                    <option value="AC">Air Conditioned</option>
                    <option value="ATTACHED_BATH">Deluxe Attached</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Fee (₹)</label>
                <input
                  type="number"
                  value={roomForm.monthlyFee}
                  onChange={(e) => setRoomForm({ ...roomForm, monthlyFee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoomModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
                  Create Room
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ALLOCATE BED
          ===================================================================== */}
      {showAllocModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-lg">Allocate Student to Bed</h3>
            <form onSubmit={handleAllocateBed} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Student</label>
                <select
                  required
                  value={allocForm.studentId}
                  onChange={(e) => setAllocForm({ ...allocForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-sm"
                >
                  <option value="">-- Choose Boarding Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admissionNumber}) - {s.className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Available Room</label>
                <select
                  required
                  value={allocForm.roomId}
                  onChange={(e) => setAllocForm({ ...allocForm, roomId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-sm"
                >
                  <option value="">-- Choose Room with Vacancy --</option>
                  {displayedRooms
                    .filter((r: any) => r.occupiedBeds < r.capacity)
                    .map((r: any) => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} ({r.roomType}) - {r.capacity - r.occupiedBeds} beds free
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bed No.</label>
                  <input
                    type="text"
                    required
                    value={allocForm.bedNumber}
                    onChange={(e) => setAllocForm({ ...allocForm, bedNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    value={allocForm.monthlyRent}
                    onChange={(e) => setAllocForm({ ...allocForm, monthlyRent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllocModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
                  Confirm Allocation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ISSUE OUTPASS
          ===================================================================== */}
      {showOutpassModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-lg">Issue Campus Outpass</h3>
            <form onSubmit={handleIssueOutpass} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resident Student</label>
                <select
                  required
                  value={outpassForm.studentId}
                  onChange={(e) => setOutpassForm({ ...outpassForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-sm"
                >
                  <option value="">-- Choose Resident --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination</label>
                <input
                  type="text"
                  required
                  value={outpassForm.destination}
                  onChange={(e) => setOutpassForm({ ...outpassForm, destination: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-sm"
                  placeholder="Parent Residence / Hospital"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Purpose</label>
                <input
                  type="text"
                  required
                  value={outpassForm.purpose}
                  onChange={(e) => setOutpassForm({ ...outpassForm, purpose: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-sm"
                  placeholder="Weekend Home Visit"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOutpassModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
                  Authorize Outpass
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
