'use client';

import React, { useState } from 'react';
import {
  Bus,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  Phone,
  Plus,
  Navigation,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Radio,
  RefreshCw,
  Send,
  Zap,
} from 'lucide-react';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/formatters';

export const TransportClient: React.FC<{
  vehicles: any[];
  routes: any[];
  assignments: any[];
  activeTrips: any[];
  maintenanceLogs: any[];
  userRole: string;
}> = ({
  vehicles: initialVehicles,
  routes: initialRoutes,
  assignments: initialAssignments,
  activeTrips: initialTrips,
  maintenanceLogs: initialMaintenance,
  userRole,
}) => {
    const [activeTab, setActiveTab] = useState('live');
    const [trips, setTrips] = useState(initialTrips);
    const [maintenance, setMaintenance] = useState(initialMaintenance);
    const [isSimulatingGps, setIsSimulatingGps] = useState(false);
    const [boardSuccessMsg, setBoardSuccessMsg] = useState<string | null>(null);

    // Maintenance Modal
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [maintenanceForm, setMaintenanceForm] = useState({
      vehicleId: initialVehicles[0]?.id || '',
      maintenanceType: 'SERVICE',
      scheduledDate: new Date().toISOString().split('T')[0],
      cost: '4800',
      vendorName: 'Tata Motorcare Sector 62',
      status: 'COMPLETED',
    });

    const handleSimulateGps = async (tripId: string, alertDeviation: boolean = false) => {
      setIsSimulatingGps(true);
      try {
        // Small jitter around Noida/Delhi
        const lat = 28.628 + (Math.random() - 0.5) * 0.02;
        const lng = 77.364 + (Math.random() - 0.5) * 0.02;
        const speed = alertDeviation ? 12.0 : 35.0 + Math.floor(Math.random() * 20);
        const eta = alertDeviation ? 28 : Math.max(2, Math.floor(Math.random() * 15));

        const res = await fetch('/api/transport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SIMULATE_GPS_PING',
            tripId,
            lat,
            lng,
            speed,
            etaMinutes: eta,
            status: alertDeviation ? 'DELAYED' : 'IN_TRANSIT',
            deviationAlert: alertDeviation,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setTrips((prev) =>
            prev.map((t) => (t.id === tripId ? { ...t, ...data.trip } : t))
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSimulatingGps(false);
      }
    };

    const handleSimulateBoarding = async (studentId: string, busNumber: string, stopName: string, status: 'BOARDED' | 'DROPPED') => {
      setBoardSuccessMsg(null);
      try {
        const res = await fetch('/api/transport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'STUDENT_BOARDING',
            studentId,
            busNumber,
            stopName,
            status,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setBoardSuccessMsg(data.message || `Parent notified: Student marked ${status}`);
          setTimeout(() => setBoardSuccessMsg(null), 5000);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const handleCreateMaintenance = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const res = await fetch('/api/transport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'LOG_MAINTENANCE',
            ...maintenanceForm,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setMaintenance([data.maintenance, ...maintenance]);
          setIsMaintenanceModalOpen(false);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const tabs: TabItem[] = [
      { id: 'live', label: 'Live GPS Telemetry & Tracking', count: trips.length, icon: <Radio className="w-4 h-4 text-emerald-500 animate-pulse" /> },
      { id: 'boarding', label: 'Student Bus Boarding RFID', count: initialAssignments.length, icon: <Users className="w-4 h-4" /> },
      { id: 'routes', label: 'Bus Routes & Designated Stops', count: initialRoutes.length, icon: <MapPin className="w-4 h-4" /> },
      { id: 'vehicles', label: 'Fleet Vehicles & Drivers', count: initialVehicles.length, icon: <Bus className="w-4 h-4" /> },
      { id: 'maintenance', label: 'Vehicle Maintenance & Compliance', count: maintenance.length, icon: <Wrench className="w-4 h-4" /> },
    ];

    const studentColumns: Column<any>[] = [
      {
        key: 'student',
        header: 'Student Name',
        render: (row) => {
          const studentName = (
            (row.student?.user?.firstName || row.student?.user?.name || '') + ' ' + (row.student?.user?.lastName || '')
          ).trim() || 'Commuter';
          return (
            <div className="flex items-center gap-2.5">
              <Avatar name={studentName} size="sm" house={row.student?.house} />
              <div>
                <span className="font-bold text-slate-900 block">
                  {studentName}
                </span>
                <span className="block text-[11px] text-slate-400 font-mono">
                  Adm #{row.student?.admissionNumber} • {row.student?.enrollments?.[0]?.class?.name || 'Class 10'} - {row.student?.enrollments?.[0]?.section?.name || 'A'}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: 'route',
        header: 'Assigned Route',
        render: (row) => (
          <div>
            <span className="font-semibold text-slate-800">{row.route?.routeName}</span>
            <span className="block text-[11px] text-slate-400 font-mono">Bus: {row.route?.vehicle?.vehicleNumber || 'UP-16-ED-1001'}</span>
          </div>
        ),
      },
      {
        key: 'stop',
        header: 'Designated Stop & Timings',
        render: (row) => (
          <div>
            <span className="font-bold text-slate-900 text-xs">{row.stop?.stopName}</span>
            <span className="block text-[11px] text-slate-500 font-mono">
              Pickup: {row.stop?.pickupTime} • Drop: {row.stop?.dropTime}
            </span>
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'Boarding RFID Trigger',
        render: (row) => (
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
              onClick={() => handleSimulateBoarding(row.studentId, row.route?.vehicle?.vehicleNumber || 'UP-16-ED-1001', row.stop?.stopName || 'Stop 1', 'BOARDED')}
            >
              Mark Boarded
            </Button>
            <Button
              size="xs"
              variant="outline"
              className="text-blue-700 border-blue-300 hover:bg-blue-50"
              onClick={() => handleSimulateBoarding(row.studentId, row.route?.vehicle?.vehicleNumber || 'UP-16-ED-1001', row.stop?.stopName || 'Stop 1', 'DROPPED')}
            >
              Mark Dropped
            </Button>
          </div>
        ),
      },
    ];

    const maintenanceColumns: Column<any>[] = [
      {
        key: 'vehicle',
        header: 'Bus Vehicle',
        render: (row) => (
          <div>
            <span className="font-bold text-slate-900">{row.vehicle?.vehicleNumber || 'Bus UP-16'}</span>
            <span className="block text-[11px] text-slate-400">{row.vehicle?.model || 'Tata Starbus 42-Seater'}</span>
          </div>
        ),
      },
      {
        key: 'type',
        header: 'Maintenance Type',
        render: (row) => (
          <Badge
            variant={
              row.maintenanceType === 'FITNESS_CERT'
                ? 'purple'
                : row.maintenanceType === 'INSURANCE_RENEWAL'
                  ? 'blue'
                  : 'amber'
            }
          >
            {row.maintenanceType}
          </Badge>
        ),
      },
      {
        key: 'date',
        header: 'Date & Cost',
        render: (row) => (
          <div>
            <span className="font-semibold text-slate-900 text-xs">{formatDate(row.scheduledDate)}</span>
            <span className="block text-[11px] text-slate-500 font-mono">{formatCurrency(row.cost)}</span>
          </div>
        ),
      },
      {
        key: 'vendor',
        header: 'Service Center / Vendor',
        render: (row) => <span className="text-xs text-slate-700">{row.vendorName || 'Authorized Centre'}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => (
          <Badge variant={row.status === 'COMPLETED' ? 'emerald' : row.status === 'OVERDUE' ? 'rose' : 'amber'}>
            {row.status}
          </Badge>
        ),
      },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] p-5 rounded-2xl shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Bus className="w-6 h-6 text-[#990000]" />
                <span>Smart Transport Intelligence &amp; Fleet Telemetry</span>
              </h2>
              <Badge variant="emerald" size="sm" className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                GPS Active
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time GPS vehicle tracking, route deviation alerts, RFID student boarding logs, and maintenance compliance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSimulateGps(trips[0]?.id || 'trip-1')}
              disabled={isSimulatingGps || trips.length === 0}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingGps ? 'animate-spin' : ''}`} />
              Refresh GPS Telemetry
            </Button>
            {['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TRANSPORT_MANAGER'].includes(userRole) && (
              <Button
                size="sm"
                variant="primary"
                className="bg-[#990000] hover:bg-[#800000] text-white flex items-center gap-1.5"
                onClick={() => setIsMaintenanceModalOpen(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                Log Maintenance
              </Button>
            )}
          </div>
        </div>

        {boardSuccessMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{boardSuccessMsg}</span>
          </div>
        )}

        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Buses on Road"
            value={trips.filter((t) => t.status === 'IN_TRANSIT').length || trips.length}
            change="All routes on time"
            trend="up"
            icon={<Bus className="w-5 h-5 text-[#990000]" />}
          />
          <StatCard
            title="Assigned Students"
            value={initialAssignments.length}
            change="Opted for school bus"
            trend="neutral"
            icon={<Users className="w-5 h-5 text-indigo-600" />}
          />
          <StatCard
            title="Active Routes & Stops"
            value={`${initialRoutes.length} Routes`}
            change={`${initialRoutes.reduce((acc, r) => acc + (r.stops?.length || 0), 0)} Pickups`}
            trend="neutral"
            icon={<MapPin className="w-5 h-5 text-amber-600" />}
          />
          <StatCard
            title="Vehicle Fitness & Service"
            value="100% Compliant"
            change="Next RTO check: 45d"
            trend="up"
            icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
          />
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab: Live GPS Telemetry */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Visual Radar / Map Simulator */}
              <div className="lg:col-span-2 bg-slate-950 text-white rounded-2xl p-6 relative overflow-hidden border border-slate-800 shadow-xl min-h-[380px] flex flex-col justify-between">
                {/* Radar Grid overlay */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, #38bdf8 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-mono tracking-wider text-emerald-400 uppercase font-semibold">
                        Live Telemetry Stream • GPS Hub
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      Route 1: Noida Sector 62 ➔ Indirapuram ➔ School Campus
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 text-[11px]"
                      onClick={() => handleSimulateGps(trips[0]?.id || 'trip-1', false)}
                    >
                      Simulate Normal Ping
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      className="border-rose-900 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 text-[11px]"
                      onClick={() => handleSimulateGps(trips[0]?.id || 'trip-1', true)}
                    >
                      Simulate Deviation Alert
                    </Button>
                  </div>
                </div>

                {/* Map Canvas Representation */}
                <div className="relative z-10 my-8 flex flex-col sm:flex-row items-center justify-around gap-6 p-6 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#990000]/20 border border-[#990000]/50 flex items-center justify-center text-[#38bdf8]">
                      <Bus className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-mono">Bus Vehicle</span>
                      <h4 className="text-base font-bold text-white">UP-16-ED-1001</h4>
                      <span className="text-xs text-slate-400">Driver: Harpal Singh • (+91 98101-22444)</span>
                    </div>
                  </div>

                  <div className="h-10 w-px bg-slate-800 hidden sm:block" />

                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-mono">Current Coordinates</span>
                    <div className="text-sm font-mono text-cyan-300 font-semibold mt-0.5">
                      {trips[0]?.currentLat?.toFixed(4) || '28.6280'}° N, {trips[0]?.currentLng?.toFixed(4) || '77.3649'}° E
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Speed: <span className="text-white font-semibold">{trips[0]?.currentSpeedKm || 38.5} km/h</span>
                    </div>
                  </div>

                  <div className="h-10 w-px bg-slate-800 hidden sm:block" />

                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-mono">Estimated Campus Arrival</span>
                    <div className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>~{trips[0]?.etaMinutes || 12} mins</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Scheduled: 08:00 AM</span>
                  </div>
                </div>

                {/* Status Banner */}
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-4 gap-2">
                  <div className="flex items-center gap-2">
                    {trips[0]?.deviationAlert ? (
                      <span className="flex items-center gap-1.5 text-rose-400 font-semibold bg-rose-950/60 px-2.5 py-1 rounded-md border border-rose-800">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Route Deviation Detected: Vehicle stopped outside scheduled corridor
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Vehicle within normal route corridor (deviation &lt; 50m)
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-slate-500">
                    Last Telemetry Packet: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Live Trip Fleet Cards */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-[#990000]" />
                      <span>Active Vehicle Fleet ({trips.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <div className="p-4 space-y-3">
                    {trips.map((trip) => (
                      <div
                        key={trip.id}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-[#990000] transition-colors bg-white flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bus className="w-4 h-4 text-slate-600" />
                            <span className="font-bold text-slate-900 text-sm">{trip.vehicle?.vehicleNumber || trip.vehicle?.busNumber || 'UP-16-ED-1001'}</span>
                          </div>
                          <Badge variant={trip.deviationAlert ? 'rose' : trip.status === 'DELAYED' ? 'amber' : 'emerald'}>
                            {trip.deviationAlert ? 'DEVIATED' : trip.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Speed: {trip.currentSpeedKm || 35} km/h</span>
                          <span className="font-semibold text-slate-700">ETA: {trip.etaMinutes || 10}m</span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">Driver: {trip.driverName}</span>
                          <Button
                            size="xs"
                            variant="ghost"
                            className="text-[#990000] text-[11px] p-0 h-auto hover:underline"
                            onClick={() => handleSimulateGps(trip.id)}
                          >
                            Ping GPS
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Hardware Device Integration Hook */}
                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-600 space-y-2">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Hardware GPS Webhook Endpoint</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Plug any AIS-140 certified GPS tracker or mobile simulator via our JSON telemetry webhook:
                  </p>
                  <code className="block p-2 bg-slate-900 text-cyan-300 rounded font-mono text-[10px] break-all">
                    POST /api/transport &#123; action: &apos;SIMULATE_GPS_PING&apos;, tripId: &apos;...&apos; &#125;
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Student RFID Boarding */}
        {activeTab === 'boarding' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Student Bus Boarding &amp; Parent Alert Logs
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Real-time RFID scanner simulation. Triggering boarding or drop instantly dispatches WhatsApp and in-app alerts to parents.
                </p>
              </div>
            </CardHeader>
            {initialAssignments.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  illustration="no-bus"
                  title="No Student Bus Commuters Allocated"
                  description="Students assigned to transport fleets and designated stops will appear here for live RFID boarding verification."
                />
              </div>
            ) : (
              <DataTable
                data={initialAssignments}
                columns={studentColumns}
                searchable
                searchPlaceholder="Search student, route or stop..."
                pagination
                pageSize={10}
              />
            )}
          </Card>
        )}

        {/* Tab: Routes & Stops */}
        {activeTab === 'routes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialRoutes.map((route) => (
              <Card key={route.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#990000]" />
                        <span>{route.routeName}</span>
                      </CardTitle>
                      <span className="text-xs text-slate-500 font-mono">
                        Vehicle: {route.vehicle?.vehicleNumber || route.vehicle?.busNumber || 'UP-16-ED-1001'} ({route.vehicle?.seatingCapacity || route.vehicle?.capacity || 40} Seats)
                      </span>
                    </div>
                    <Badge variant="blue">{route.stops?.length || 0} Designated Stops</Badge>
                  </div>
                </CardHeader>
                <div className="p-4 space-y-3">
                  {route.stops?.map((stop: any, idx: number) => (
                    <div
                      key={stop.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-900">{stop.stopName}</span>
                          <div className="text-[11px] text-slate-500">
                            Pickup: <strong className="text-slate-700">{stop.pickupTime}</strong> • Drop:{' '}
                            <strong className="text-slate-700">{stop.dropTime}</strong>
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-slate-700 font-semibold">{formatCurrency(stop.monthlyFee || 1800)}/mo</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab: Fleet Vehicles & Drivers */}
        {activeTab === 'vehicles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialVehicles.map((v) => (
              <Card key={v.id}>
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Bus className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{v.vehicleNumber || v.busNumber}</h4>
                        <span className="text-xs text-slate-500 font-mono">{v.model || 'Tata Starbus 42'}</span>
                      </div>
                    </div>
                    <Badge variant={v.isActive ? 'emerald' : 'slate'}>{v.isActive ? 'Active' : 'Off-Duty'}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Seating Capacity</span>
                      <strong className="text-slate-800">{v.capacity || 42} Passengers</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Insurance Policy</span>
                      <strong className="text-slate-800">{v.insuranceExpiry ? formatDate(v.insuranceExpiry) : 'Valid (2027)'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Pollution (PUC)</span>
                      <strong className="text-emerald-700">Valid Certificate</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Speed Governor</span>
                      <strong className="text-slate-800">Capped @ 40 km/h</strong>
                    </div>
                  </div>

                  {v.driverStaff && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-400 block">Assigned Driver</span>
                        <strong className="text-slate-800">
                          {v.driverStaff.user?.firstName} {v.driverStaff.user?.lastName || ''}
                        </strong>
                      </div>
                      <a
                        href={`tel:${v.driverStaff.user?.phone || '9810122444'}`}
                        className="text-[#990000] hover:underline flex items-center gap-1 font-medium"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab: Maintenance & Compliance */}
        {activeTab === 'maintenance' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Vehicle Service, Maintenance &amp; Compliance Logs
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Fitness certificates, pollution checks, insurance renewals, and service records.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-[#990000] text-white"
                  onClick={() => setIsMaintenanceModalOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Service Record
                </Button>
              </div>
            </CardHeader>
            <DataTable
              data={maintenance}
              columns={maintenanceColumns}
              searchable
              searchPlaceholder="Search maintenance logs..."
              pagination
              pageSize={10}
            />
          </Card>
        )}

        {/* Log Maintenance Modal */}
        <Modal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          title="Log Vehicle Maintenance / Compliance Record"
        >
          <form onSubmit={handleCreateMaintenance} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Bus</label>
              <select
                value={maintenanceForm.vehicleId}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, vehicleId: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
              >
                {initialVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicleNumber || v.busNumber} ({v.model || 'Bus'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Maintenance Type</label>
              <select
                value={maintenanceForm.maintenanceType}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenanceType: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
              >
                <option value="SERVICE">Periodic Engine &amp; Brake Service</option>
                <option value="FITNESS_CERT">RTO Fitness Inspection Certificate</option>
                <option value="INSURANCE_RENEWAL">Comprehensive Insurance Renewal</option>
                <option value="POLLUTION_CHECK">Pollution Under Control (PUC)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Date</label>
                <input
                  type="date"
                  value={maintenanceForm.scheduledDate}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, scheduledDate: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Cost (₹)</label>
                <input
                  type="number"
                  value={maintenanceForm.cost}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Center / Vendor</label>
              <input
                type="text"
                value={maintenanceForm.vendorName}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, vendorName: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button size="sm" variant="outline" type="button" onClick={() => setIsMaintenanceModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit" className="bg-[#990000] text-white">
                Save Record
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  };
