'use client';

import React, { useState } from 'react';
import {
  Shield,
  QrCode,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Plus,
  ArrowRight,
  LogOut,
  LogIn,
  Search,
  Printer,
  BellRing,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable, Column } from '@/components/ui/DataTable';
import { formatDate } from '@/lib/formatters';

export const CampusSafetyClient: React.FC<{
  gateLogs: any[];
  visitorPasses: any[];
  pickups: any[];
  incidents: any[];
  students: any[];
  userRole: string;
}> = ({
  gateLogs: initialGateLogs,
  visitorPasses: initialPasses,
  pickups: initialPickups,
  incidents: initialIncidents,
  students,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState('turnstile');
  const [gateLogs, setGateLogs] = useState(initialGateLogs);
  const [passes, setPasses] = useState(initialPasses);
  const [incidents, setIncidents] = useState(initialIncidents);

  // Scanner State
  const [scannedId, setScannedId] = useState(students[0]?.admissionNumber || '');
  const [scanType, setScanType] = useState<'ENTRY' | 'EXIT'>('ENTRY');
  const [isScanning, setIsScanning] = useState(false);
  const [scanNotification, setScanNotification] = useState<string | null>(null);

  // Visitor Modal
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [visitorForm, setVisitorForm] = useState({
    visitorName: '',
    phone: '',
    purpose: 'Parent Inquiry / Fee Verification',
    hostStaffName: 'Dr. Sunita Mehra (Principal)',
  });

  // Incident Modal
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    severity: 'LOW',
    category: 'PLAYGROUND',
    description: '',
    location: 'Junior Wing Sports Ground',
  });

  const handleSimulateScan = async () => {
    setIsScanning(true);
    setScanNotification(null);
    try {
      const res = await fetch('/api/campus-safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GATE_SCAN',
          identifier: scannedId,
          scanType,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setGateLogs([data.log, ...gateLogs]);
        setScanNotification(
          `Success: ${data.log.personName} marked ${scanType === 'ENTRY' ? 'INSIDE' : 'EXITED'}. Parent notification dispatched via WhatsApp.`
        );
      } else {
        alert(data.error || 'Scan processing failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCreateVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/campus-safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_VISITOR', ...visitorForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasses([data.pass, ...passes]);
        setIsVisitorModalOpen(false);
        setVisitorForm({ ...visitorForm, visitorName: '', phone: '' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/campus-safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REPORT_INCIDENT', ...incidentForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setIncidents([data.incident, ...incidents]);
        setIsIncidentModalOpen(false);
        setIncidentForm({ ...incidentForm, title: '', description: '' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const tabs: TabItem[] = [
    { id: 'turnstile', label: 'Gate Scanner & Turnstiles', icon: <QrCode className="w-4 h-4" /> },
    { id: 'visitors', label: 'Visitor Digital Passes', count: passes.length, icon: <UserCheck className="w-4 h-4" /> },
    { id: 'pickups', label: 'Authorized Guardian Pickups', count: initialPickups.length, icon: <Users className="w-4 h-4" /> },
    { id: 'incidents', label: 'Safety Incidents & Escalation', count: incidents.length, icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#990000]" />
              <span>Smart Campus Safety &amp; Access Control</span>
            </h2>
            <Badge variant="blue" size="sm">
              Live Gate Protocol
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time biometric turnstile monitoring, automated parent check-in alerts, authorized pickup verification, and visitor pass workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsIncidentModalOpen(true)}
            leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
          >
            Report Incident
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsVisitorModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Issue Visitor Pass
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Campus Occupancy"
          value="1,294"
          subtitle="Students, Faculty & Staff Inside"
          icon={<Users className="w-5 h-5" />}
          variant="green"
        />
        <StatCard
          title="Active Visitor Passes"
          value={passes.filter((p) => p.status === 'ACTIVE').length}
          subtitle="Host Verified & Badge Issued"
          icon={<UserCheck className="w-5 h-5" />}
          variant="blue"
        />
        <StatCard
          title="Verified Guardians"
          value={initialPickups.length}
          subtitle="Govt ID & Photo Authenticated"
          icon={<Shield className="w-5 h-5" />}
          variant="teal"
        />
        <StatCard
          title="Safety Incidents"
          value={incidents.filter((i) => i.status === 'OPEN').length}
          subtitle="Zero High-Severity Alerts"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={incidents.filter((i) => i.status === 'OPEN').length > 0 ? 'amber' : 'green'}
        />
      </div>

      {/* Tabs */}
      <Tabs items={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: TURNSTILE SCANNER */}
      {activeTab === 'turnstile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner Simulator */}
          <Card className="lg:col-span-1 space-y-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <QrCode className="w-4 h-4 text-[#990000]" />
                <span>Simulate Turnstile / RFID Scan</span>
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Student / Card</label>
                <select
                  value={scannedId}
                  onChange={(e) => setScannedId(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg font-mono font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.admissionNumber}>
                      {s.user.firstName} {s.user.lastName} ({s.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Turnstile Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScanType('ENTRY')}
                    className={`py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 cursor-pointer ${
                      scanType === 'ENTRY'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                    Entry Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanType('EXIT')}
                    className={`py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 cursor-pointer ${
                      scanType === 'EXIT'
                        ? 'bg-blue-50 border-blue-500 text-blue-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <LogOut className="w-3.5 h-3.5 text-blue-600" />
                    Exit Scan
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                size="sm"
                isLoading={isScanning}
                onClick={handleSimulateScan}
                leftIcon={<QrCode className="w-3.5 h-3.5" />}
              >
                Execute Biometric Gate Scan
              </Button>

              {scanNotification && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>{scanNotification}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Gate Logs Ledger */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Live Gate Access Ledger ({gateLogs.length} Events)</span>
                <span className="text-[11px] font-normal text-slate-400">Main Gate &amp; Turnstiles</span>
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-[11px]">
                    <th className="p-3">Person</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Gate</th>
                    <th className="p-3">Entry Time</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gateLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{log.personName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{log.identifierCard}</span>
                      </td>
                      <td className="p-3">
                        <Badge variant="slate" size="xs">
                          {log.personType}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-600 text-[11px]">{log.gateNumber}</td>
                      <td className="p-3 font-mono text-slate-600 text-[11px]">
                        {formatDate(log.entryTime, 'hh:mm a')}
                      </td>
                      <td className="p-3">
                        <Badge variant={log.status === 'INSIDE' ? 'green' : 'blue'} size="xs">
                          {log.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: VISITOR PASSES */}
      {activeTab === 'visitors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {passes.map((vp) => (
            <Card key={vp.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-[#990000]">{vp.passNumber}</span>
                <Badge variant={vp.status === 'ACTIVE' ? 'green' : 'slate'} size="xs">
                  {vp.status}
                </Badge>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{vp.visitorName}</h3>
                <p className="text-xs text-slate-500 font-mono">{vp.phone}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                <div>
                  <strong className="text-slate-700">Purpose:</strong> {vp.purpose}
                </div>
                <div>
                  <strong className="text-slate-700">Host:</strong> {vp.hostStaffName}
                </div>
                <div className="text-[11px] text-slate-400 font-mono pt-1">
                  Checked in: {formatDate(vp.checkInTime, 'hh:mm a')}
                </div>
              </div>
              <Button size="xs" variant="outline" className="w-full" leftIcon={<Printer className="w-3.5 h-3.5" />}>
                Print Badge Pass
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: AUTHORIZED PICKUPS */}
      {activeTab === 'pickups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {initialPickups.map((pick) => (
            <Card key={pick.id} className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="teal" size="xs">
                    {pick.relationship}
                  </Badge>
                  <span className="text-xs font-bold text-slate-900">{pick.guardianName}</span>
                </div>
                <p className="text-xs text-slate-500 font-mono">{pick.phone}</p>
                <p className="text-xs text-[#990000] font-semibold mt-1">
                  Ward: {pick.student?.user?.firstName} {pick.student?.user?.lastName} (Adm #{pick.student?.admissionNumber})
                </p>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block font-bold">
                  {pick.idProofType}
                </span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            </Card>
          ))}
        </div>
      )}

      {/* TAB 4: INCIDENTS */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          {incidents.map((inc) => (
            <Card key={inc.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={inc.severity === 'CRITICAL' ? 'rose' : inc.severity === 'HIGH' ? 'amber' : 'slate'} size="xs">
                    {inc.severity} Severity
                  </Badge>
                  <Badge variant="blue" size="xs">
                    {inc.category}
                  </Badge>
                  <span className="text-xs font-bold text-slate-900">{inc.title}</span>
                </div>
                <Badge variant={inc.status === 'RESOLVED' ? 'green' : 'amber'} size="xs">
                  {inc.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{inc.description}</p>
              {inc.resolutionNotes && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950">
                  <strong>Resolution:</strong> {inc.resolutionNotes}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* MODAL: VISITOR PASS */}
      <Modal
        isOpen={isVisitorModalOpen}
        onClose={() => setIsVisitorModalOpen(false)}
        title="Issue New Campus Visitor Badge Pass"
      >
        <form onSubmit={handleCreateVisitor} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Visitor Full Name</label>
            <input
              type="text"
              required
              value={visitorForm.visitorName}
              onChange={(e) => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg"
              placeholder="e.g. Ramesh Chandra"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              required
              value={visitorForm.phone}
              onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg"
              placeholder="+91 98111 22334"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Purpose of Visit</label>
            <input
              type="text"
              required
              value={visitorForm.purpose}
              onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Host Staff / Department</label>
            <input
              type="text"
              required
              value={visitorForm.hostStaffName}
              onChange={(e) => setVisitorForm({ ...visitorForm, hostStaffName: e.target.value })}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsVisitorModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Generate Visitor Pass
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: REPORT INCIDENT */}
      <Modal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        title="Report Campus Safety / Medical Incident"
      >
        <form onSubmit={handleCreateIncident} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Incident Headline</label>
            <input
              type="text"
              required
              value={incidentForm.title}
              onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg"
              placeholder="e.g. Broken glass bottle found near tennis court"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Severity</label>
              <select
                value={incidentForm.severity}
                onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg"
              >
                <option value="LOW">Low (Observation)</option>
                <option value="MEDIUM">Medium (First Aid / Maintenance)</option>
                <option value="HIGH">High (Immediate Action)</option>
                <option value="CRITICAL">Critical (Emergency)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={incidentForm.category}
                onChange={(e) => setIncidentForm({ ...incidentForm, category: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg"
              >
                <option value="PLAYGROUND">Playground &amp; Sports</option>
                <option value="MEDICAL">Medical Infirmary</option>
                <option value="DISCIPLINE">Discipline / Safety</option>
                <option value="PROPERTY">Campus Property</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Location Details</label>
            <input
              type="text"
              value={incidentForm.location}
              onChange={(e) => setIncidentForm({ ...incidentForm, location: e.target.value })}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
            <textarea
              required
              rows={3}
              value={incidentForm.description}
              onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg"
              placeholder="Provide exact facts, persons present, and actions taken..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsIncidentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Safety Incident
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
