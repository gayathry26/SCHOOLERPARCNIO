'use client';

import React, { useState } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Layers,
  Activity,
  Globe,
  DollarSign,
  TrendingUp,
  Download,
  Settings,
  RefreshCw,
  Search,
  ExternalLink,
  Ban,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { exportToCSV } from '@/lib/export';

interface PlatformAdminClientProps {
  initialSchools: any[];
  plans: any[];
  initialInvoices: any[];
  kpis: {
    totalSchools: number;
    activeSchools: number;
    suspendedSchools: number;
    totalStudents: number;
    totalStaff: number;
    totalPaidRevenue: number;
    systemHealth: string;
  };
}

export const PlatformAdminClient: React.FC<PlatformAdminClientProps> = ({
  initialSchools,
  plans,
  initialInvoices,
  kpis,
}) => {
  const [activeTab, setActiveTab] = useState('schools');
  const [schools, setSchools] = useState(initialSchools);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState<any>(null);
  const [showGenerateInvoiceModal, setShowGenerateInvoiceModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState<any>(null);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states: Onboarding
  const [onboardForm, setOnboardForm] = useState({
    name: '',
    tenantCode: '',
    board: 'CBSE',
    affiliationNo: '',
    email: '',
    phone: '',
    address: 'Sector 62, Institutional Area',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201309',
    subscriptionPlan: 'STANDARD',
    maxStudents: 1500,
    maxStaff: 120,
    adminFirstName: 'Director',
    adminLastName: 'Office',
    adminEmail: '',
    adminPassword: 'password123',
    themeColor: '#990000',
  });

  // Form states: Edit Plan
  const [editPlanForm, setEditPlanForm] = useState({
    planCode: 'STANDARD',
    maxStudents: 1500,
    maxStaff: 120,
    enabledModules: 'ALL',
  });

  // Form states: Invoice
  const [invoiceForm, setInvoiceForm] = useState({
    schoolId: initialSchools[0]?.id || '',
    planCode: 'STANDARD',
    amount: 95000,
    billingPeriod: 'Annual Session 2026–2027',
  });

  // Form states: Payment
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'BANK_TRANSFER',
    transactionRef: `TXN-NEFT-${Date.now().toString().slice(-6)}`,
  });

  // Filtered Schools
  const filteredSchools = schools.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tenantCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ----------------------------------------------------
  // API ACTIONS
  // ----------------------------------------------------
  const handleOnboardSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/saas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REGISTER_SCHOOL',
          ...onboardForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to onboard school');

      const enrichedNew = {
        ...data.school,
        _count: { users: 1, branches: 0, academicYears: 1, classes: 0 },
        liveMetrics: { students: 0, staff: 1, capacityPercent: 0 },
        subscriptionInvoices: [data.invoice],
      };

      setSchools([enrichedNew, ...schools]);
      if (data.invoice) setInvoices([data.invoice, ...invoices]);
      setShowOnboardModal(false);
      setFeedback({
        type: 'success',
        text: `School "${onboardForm.name}" (Tenant: ${data.school.tenantCode}) successfully created with School Admin credentials (${onboardForm.adminEmail}).`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSchoolStatus = async (schoolId: string, status: string) => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/saas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SCHOOL_STATUS',
          schoolId,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setSchools(schools.map((s) => (s.id === schoolId ? { ...s, status } : s)));
      setFeedback({ type: 'success', text: `School status updated to ${status}.` });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditPlanModal) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/saas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SUBSCRIPTION_PLAN',
          schoolId: showEditPlanModal.id,
          ...editPlanForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update subscription');

      setSchools(
        schools.map((s) =>
          s.id === showEditPlanModal.id
            ? {
                ...s,
                subscriptionPlan: editPlanForm.planCode,
                maxStudents: editPlanForm.maxStudents,
                maxStaff: editPlanForm.maxStaff,
              }
            : s
        )
      );
      setShowEditPlanModal(null);
      setFeedback({ type: 'success', text: 'Subscription plan and quotas updated.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/saas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GENERATE_INVOICE',
          ...invoiceForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate invoice');

      const targetSchool = schools.find((s) => s.id === invoiceForm.schoolId);
      const enrichedInvoice = { ...data.invoice, school: targetSchool };

      setInvoices([enrichedInvoice, ...invoices]);
      setShowGenerateInvoiceModal(false);
      setFeedback({ type: 'success', text: `Invoice ${data.invoice.invoiceNumber} generated.` });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRecordPaymentModal) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/saas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RECORD_PAYMENT',
          invoiceId: showRecordPaymentModal.id,
          ...paymentForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record payment');

      setInvoices(invoices.map((inv) => (inv.id === showRecordPaymentModal.id ? data.invoice : inv)));
      setShowRecordPaymentModal(null);
      setFeedback({ type: 'success', text: 'Subscription payment recorded and renewal date extended.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const exportSchoolsData = () => {
    const data = schools.map((s) => ({
      'Tenant Code': s.tenantCode,
      'School Name': s.name,
      Board: s.board,
      City: s.city,
      State: s.state,
      Status: s.status,
      'Subscription Plan': s.subscriptionPlan,
      'Enrolled Students': s.liveMetrics?.students || 0,
      'Student Limit': s.maxStudents,
      'Staff Count': s.liveMetrics?.staff || 0,
      'Contact Email': s.email,
    }));
    exportToCSV(data, 'EDVONEST_Platform_Schools_Master');
  };

  const tabs: TabItem[] = [
    { id: 'schools', label: 'Institutions Directory', count: schools.length, icon: <Building2 className="w-4 h-4" /> },
    { id: 'plans', label: 'Subscription Tiers', count: plans.length, icon: <Layers className="w-4 h-4" /> },
    { id: 'billing', label: 'SaaS Invoices & Billing', count: invoices.length, icon: <CreditCard className="w-4 h-4" /> },
    { id: 'isolation', label: 'Tenant Security & Isolation', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* EXECUTIVE HEADER */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FEF2F2] text-[#990000]">
              <Globe className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                Platform Super Admin &bull; Multi-School SaaS OS
                <Badge variant="emerald" className="text-xs px-2.5 py-0.5">
                  Multi-Tenant
                </Badge>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Learn • Grow • Succeed &bull; Centralized institutional tenant management, subscription tiers, and data isolation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={exportSchoolsData}
            className="text-xs font-semibold border-slate-200"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export SaaS Directory
          </Button>

          <Button
            size="sm"
            onClick={() => setShowOnboardModal(true)}
            className="bg-[#990000] hover:bg-[#065475] text-white text-xs font-bold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Onboard New School
          </Button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* KPI METRIC CARDS */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Schools</span>
            <Building2 className="w-4 h-4 text-[#990000]" />
          </div>
          <span className="text-2xl font-bold text-slate-900 mt-2 block">{kpis.totalSchools}</span>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
            {kpis.activeSchools} Active &bull; {kpis.suspendedSchools} Suspended
          </span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Students</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900 mt-2 block">{kpis.totalStudents}</span>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Platform-wide enrollment</span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Faculty &amp; Staff</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900 mt-2 block">{kpis.totalStaff}</span>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Across all institutions</span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Paid SaaS Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900 mt-2 block">
            ₹ {(kpis.totalPaidRevenue / 100000).toFixed(1)}L
          </span>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Subscriptions Collected</span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Subscription Plans</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900 mt-2 block">{plans.length}</span>
          <span className="text-[10px] text-purple-600 font-bold mt-1 block">Trial, Basic, Std, Prem</span>
        </Card>

        <Card className="p-4 border-slate-200 bg-emerald-50/50 border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Tenant Isolation</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-base font-bold text-emerald-900 mt-2 block">100% Enforced</span>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 block">Zero Cross-Tenant Leak</span>
        </Card>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 font-bold ml-4">
            &times;
          </button>
        </div>
      )}

      {/* TABS */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ==================================================== */}
      {/* TAB 1: INSTITUTIONS DIRECTORY */}
      {/* ==================================================== */}
      {activeTab === 'schools' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search school name, code, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#990000]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-bold border border-slate-200 rounded-lg py-1.5 px-3 bg-white outline-none cursor-pointer"
              >
                <option value="ALL">All Schools</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* Schools Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">School &amp; Tenant ID</th>
                    <th className="py-3.5 px-4">Affiliation &amp; Board</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Subscription Plan</th>
                    <th className="py-3.5 px-4">Enrolled vs Quota</th>
                    <th className="py-3.5 px-4">Tenant Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredSchools.map((sch) => {
                    const studentCount = sch.liveMetrics?.students || 0;
                    const capacityPct = sch.liveMetrics?.capacityPercent || 0;

                    return (
                      <tr key={sch.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{sch.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Tenant: <span className="font-bold text-[#990000]">{sch.tenantCode}</span> &bull; ID: {sch.id}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800">{sch.board}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{sch.affiliationNo}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800">{sch.city}</span>, {sch.state}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              sch.subscriptionPlan === 'PREMIUM'
                                ? 'purple'
                                : sch.subscriptionPlan === 'STANDARD'
                                ? 'blue'
                                : sch.subscriptionPlan === 'BASIC'
                                ? 'teal'
                                : 'amber'
                            }
                            className="text-[10px] font-bold uppercase"
                          >
                            {sch.subscriptionPlan.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {studentCount} / {sch.maxStudents}
                            </span>
                            <span className="text-[10px] text-slate-400">({capacityPct}%)</span>
                          </div>
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${
                                capacityPct > 90 ? 'bg-rose-500' : capacityPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, capacityPct)}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              sch.status === 'ACTIVE'
                                ? 'emerald'
                                : sch.status === 'SUSPENDED'
                                ? 'rose'
                                : 'amber'
                            }
                            className="text-[10px] font-bold uppercase"
                          >
                            {sch.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => {
                                setShowEditPlanModal(sch);
                                setEditPlanForm({
                                  planCode: sch.subscriptionPlan,
                                  maxStudents: sch.maxStudents,
                                  maxStaff: sch.maxStaff,
                                  enabledModules: sch.enabledModules || 'ALL',
                                });
                              }}
                              className="text-[10px] h-7 px-2 font-semibold"
                            >
                              <Settings className="w-3 h-3 mr-1" /> Plan &amp; Quota
                            </Button>

                            {sch.status === 'ACTIVE' ? (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleUpdateSchoolStatus(sch.id, 'SUSPENDED')}
                                className="text-[10px] h-7 px-2 font-semibold text-rose-600 border-rose-200 hover:bg-rose-50"
                              >
                                <Ban className="w-3 h-3 mr-1" /> Suspend
                              </Button>
                            ) : (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleUpdateSchoolStatus(sch.id, 'ACTIVE')}
                                className="text-[10px] h-7 px-2 font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Reinstate
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: SUBSCRIPTION TIERS & PRICING */}
      {/* ==================================================== */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((pl) => {
              const activeSubscribers = schools.filter((s) => s.subscriptionPlan === pl.code).length;

              return (
                <Card
                  key={pl.id}
                  hoverEffect
                  className={`border-2 transition-all p-5 flex flex-col justify-between ${
                    pl.code === 'PREMIUM'
                      ? 'border-purple-300 bg-gradient-to-b from-white to-purple-50/30 shadow-md'
                      : pl.isPopular
                      ? 'border-[#990000] bg-white shadow-sm'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          pl.code === 'PREMIUM'
                            ? 'purple'
                            : pl.code === 'STANDARD'
                            ? 'blue'
                            : pl.code === 'BASIC'
                            ? 'teal'
                            : 'amber'
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {pl.name}
                      </Badge>
                      {pl.isPopular && (
                        <span className="text-[10px] font-bold text-[#990000] bg-[#FEF2F2] px-2 py-0.5 rounded-full">
                          Most Popular
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-slate-900">
                          ₹ {pl.pricePerYear.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">/ year</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{pl.description}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Max Students:</span>
                        <span className="font-bold text-slate-800">{pl.maxStudents.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Max Faculty:</span>
                        <span className="font-bold text-slate-800">{pl.maxStaff}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Monthly Option:</span>
                        <span className="font-bold text-slate-800">₹ {pl.pricePerMonth.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="font-semibold text-slate-900 text-[11px]">Included Capabilities:</div>
                      <div className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        {pl.features || 'Core academic and attendance features'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Active Tenants:</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {activeSubscribers} {activeSubscribers === 1 ? 'School' : 'Schools'}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: SAAS INVOICES & BILLING */}
      {/* ==================================================== */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">SaaS Platform Subscription Invoices</h3>
              <p className="text-xs text-slate-500">
                Generate annual subscription billings, log NEFT/RTGS payments, and track renewals.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowGenerateInvoiceModal(true)}
              className="bg-[#990000] hover:bg-[#065475] text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Issue Subscription Invoice
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Institution Name</th>
                    <th className="py-3.5 px-4">Subscription Plan</th>
                    <th className="py-3.5 px-4">Billing Period</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                        No subscription invoices recorded yet.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{inv.school?.name || inv.schoolId}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant="blue" className="text-[10px]">
                            {inv.planCode}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{inv.billingPeriod}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          ₹ {inv.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={inv.status === 'PAID' ? 'emerald' : inv.status === 'OVERDUE' ? 'rose' : 'amber'}
                            className="text-[10px] uppercase font-bold"
                          >
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {inv.status !== 'PAID' && (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => setShowRecordPaymentModal(inv)}
                              className="text-[10px] h-7 px-2 font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Paid
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: TENANT SECURITY & DATA ISOLATION */}
      {/* ==================================================== */}
      {activeTab === 'isolation' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <Card className="p-6 border-slate-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              <span className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Multi-Tenant Boundary &amp; Data Isolation</h3>
                <p className="text-xs text-slate-500">
                  Statutory architectural verification guarantees complete database and authorization segregation across institutions.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-4">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Tenant Code Boundary</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Every school is assigned an immutable uppercase tenant code (e.g. <code>MAIN</code>, <code>DPSNOIDA</code>). User accounts, academic sessions, fee structures, and audit trails are tagged with <code>schoolId</code>.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-4">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Cross-Tenant Mutation Guarding</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Server APIs verify <code>enforceTenantIsolation(user, targetSchoolId)</code>. Any user attempting to inspect or edit another institution’s records receives a <code>403 Forbidden</code>.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-4">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Subscription Student Quota Gates</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Enrolling students triggers capacity check <code>checkStudentCapacity(schoolId)</code>. Institutions cannot exceed their subscription student allowance.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ONBOARD NEW INSTITUTION */}
      {/* ==================================================== */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#990000]" />
              Onboard New School (SaaS Tenant)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Registers the institution, creates its tenant environment, provision initial School Admin, and generate first invoice.
            </p>

            <form onSubmit={handleOnboardSchool} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Institution Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Greenwood Cambridge International"
                    value={onboardForm.name}
                    onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-[#990000]"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Unique Tenant Code (Short ID)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GREENWOOD"
                    value={onboardForm.tenantCode}
                    onChange={(e) => setOnboardForm({ ...onboardForm, tenantCode: e.target.value.toUpperCase() })}
                    className="w-full text-xs font-mono font-bold border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-[#990000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Education Board</label>
                  <select
                    value={onboardForm.board}
                    onChange={(e) => setOnboardForm({ ...onboardForm, board: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none font-bold"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="STATE_BOARD">State Board</option>
                    <option value="IB">International Baccalaureate (IB)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={onboardForm.city}
                    onChange={(e) => setOnboardForm({ ...onboardForm, city: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={onboardForm.state}
                    onChange={(e) => setOnboardForm({ ...onboardForm, state: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#990000]" /> Primary School Admin Account
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Admin First Name</label>
                    <input
                      type="text"
                      required
                      value={onboardForm.adminFirstName}
                      onChange={(e) => setOnboardForm({ ...onboardForm, adminFirstName: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg py-1.5 px-3 bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Admin Last Name</label>
                    <input
                      type="text"
                      required
                      value={onboardForm.adminLastName}
                      onChange={(e) => setOnboardForm({ ...onboardForm, adminLastName: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg py-1.5 px-3 bg-white outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Admin Sign-in Email</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@school.edu.in"
                      value={onboardForm.adminEmail}
                      onChange={(e) => setOnboardForm({ ...onboardForm, adminEmail: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg py-1.5 px-3 bg-white outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Subscription Plan</label>
                  <select
                    value={onboardForm.subscriptionPlan}
                    onChange={(e) => {
                      const p = e.target.value;
                      const plan = plans.find((pl) => pl.code === p);
                      setOnboardForm({
                        ...onboardForm,
                        subscriptionPlan: p,
                        maxStudents: plan?.maxStudents || 1000,
                        maxStaff: plan?.maxStaff || 100,
                      });
                    }}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none font-bold"
                  >
                    {plans.map((pl) => (
                      <option key={pl.code} value={pl.code}>
                        {pl.name} (₹{pl.pricePerYear.toLocaleString()}/yr)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Student Quota Limit</label>
                  <input
                    type="number"
                    value={onboardForm.maxStudents}
                    onChange={(e) => setOnboardForm({ ...onboardForm, maxStudents: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOnboardModal(false)}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="bg-[#990000] hover:bg-[#065475] text-white text-xs font-bold"
                >
                  Onboard Institution
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: EDIT PLAN & LIMITS */}
      {/* ==================================================== */}
      {showEditPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#990000]" />
              Modify Subscription &amp; Quotas
            </h3>
            <p className="text-xs text-slate-500 mb-4">{showEditPlanModal.name}</p>

            <form onSubmit={handleUpdatePlan} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subscription Tier</label>
                <select
                  value={editPlanForm.planCode}
                  onChange={(e) => setEditPlanForm({ ...editPlanForm, planCode: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none font-bold"
                >
                  {plans.map((pl) => (
                    <option key={pl.code} value={pl.code}>
                      {pl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Max Student Quota</label>
                  <input
                    type="number"
                    value={editPlanForm.maxStudents}
                    onChange={(e) => setEditPlanForm({ ...editPlanForm, maxStudents: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Max Faculty Quota</label>
                  <input
                    type="number"
                    value={editPlanForm.maxStaff}
                    onChange={(e) => setEditPlanForm({ ...editPlanForm, maxStaff: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditPlanModal(null)}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="bg-[#990000] hover:bg-[#065475] text-white text-xs font-bold"
                >
                  Save Quotas
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: GENERATE INVOICE */}
      {/* ==================================================== */}
      {showGenerateInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#990000]" />
              Issue Subscription Invoice
            </h3>

            <form onSubmit={handleGenerateInvoice} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Institution</label>
                <select
                  value={invoiceForm.schoolId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, schoolId: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none"
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.tenantCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Billing Period</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.billingPeriod}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, billingPeriod: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGenerateInvoiceModal(false)}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="bg-[#990000] hover:bg-[#065475] text-white text-xs font-bold"
                >
                  Generate Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: RECORD PAYMENT */}
      {/* ==================================================== */}
      {showRecordPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Record Subscription Payment
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Invoice #{showRecordPaymentModal.invoiceNumber} for ₹ {showRecordPaymentModal.amount.toLocaleString()}
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none font-bold"
                >
                  <option value="BANK_TRANSFER">NEFT / RTGS Corporate Wire</option>
                  <option value="ONLINE_RAZORPAY">Razorpay Corporate Gateway</option>
                  <option value="CHEQUE">Banker Cheque / Demand Draft</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Transaction Reference</label>
                <input
                  type="text"
                  required
                  value={paymentForm.transactionRef}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRecordPaymentModal(null)}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
