'use client';

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Receipt,
  CreditCard,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Building,
  ArrowRight,
  ShieldCheck,
  Search,
  Plus,
  RefreshCw,
  BellRing,
  Download,
  Calendar,
  Percent,
  Sliders,
  RotateCcw,
  Check,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { EdvoNestLogo } from '@/components/ui/EdvoNestLogo';
import { showToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface FeesClientProps {
  invoices: any[];
  feeStructures: any[];
  receipts: any[];
  concessions: any[];
  bankAccounts: any[];
  categories: any[];
  classes: any[];
  students: any[];
  schoolInfo: any;
  userRole: string;
}

export const FeesClient: React.FC<FeesClientProps> = ({
  invoices: initialInvoices,
  feeStructures: initialFeeStructures,
  receipts: initialReceipts,
  concessions: initialConcessions,
  bankAccounts,
  categories,
  classes,
  students,
  schoolInfo,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useState(initialInvoices);
  const [feeStructures, setFeeStructures] = useState(initialFeeStructures);
  const [receipts, setReceipts] = useState(initialReceipts);
  const [concessions, setConcessions] = useState(initialConcessions);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [viewReceipt, setViewReceipt] = useState<any | null>(null);
  const [refundReceipt, setRefundReceipt] = useState<any | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isConcessionModalOpen, setIsConcessionModalOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment Form State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState<string>('UPI');
  const [txnRef, setTxnRef] = useState<string>('');
  const [chequeNumber, setChequeNumber] = useState<string>('');
  const [chequeDate, setChequeDate] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>(bankAccounts[0]?.id || '');

  // Refund Form State
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState<string>('Administrative concession adjustment');
  const [refundMode, setRefundMode] = useState<string>('BANK_TRANSFER');

  // Batch Generation Form State
  const [batchClassId, setBatchClassId] = useState<string>('ALL');
  const [batchStructureId, setBatchStructureId] = useState<string>(feeStructures[0]?.id || '');
  const [batchDueDate, setBatchDueDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [batchTitle, setBatchTitle] = useState<string>('');

  // Concession Form State
  const [concessionStudentId, setConcessionStudentId] = useState<string>(students[0]?.id || '');
  const [concessionType, setConcessionType] = useState<string>('SCHOLARSHIP');
  const [discountType, setDiscountType] = useState<string>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [concessionReason, setConcessionReason] = useState<string>('Merit Scholarship for high board ranking');

  // Fee Structure Form State
  const [newStructureTitle, setNewStructureTitle] = useState('');
  const [newStructureClassId, setNewStructureClassId] = useState('ALL');
  const [newStructureFrequency, setNewStructureFrequency] = useState('Quarterly');
  const [newStructureItems, setNewStructureItems] = useState<{ categoryId: string; amount: number }[]>([
    { categoryId: categories[0]?.id || '', amount: 12000 },
    { categoryId: categories[1]?.id || '', amount: 3000 },
  ]);

  const isStaff = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PRINCIPAL'].includes(userRole);

  // Tabs Configuration
  const tabs: TabItem[] = [
    { id: 'invoices', label: 'Invoices & Dues', count: invoices.length, icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: 'structures', label: 'Fee Structures', count: feeStructures.length, icon: <Building className="w-3.5 h-3.5" /> },
    { id: 'concessions', label: 'Concessions & Scholarships', count: concessions.length, icon: <Percent className="w-3.5 h-3.5" /> },
    { id: 'receipts', label: 'Receipts & Refunds', count: receipts.length, icon: <Receipt className="w-3.5 h-3.5" /> },
    { id: 'analytics', label: 'Financial Analytics', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  ];

  // Aggregated KPIs
  const totalExpected = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.totalAmount + (inv.lateFeeAmount || 0), 0);
  }, [invoices]);

  const totalCollected = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  }, [invoices]);

  const totalOutstanding = Math.max(0, totalExpected - totalCollected);
  const collectionPercentage = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;
  const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE');

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const studentName = `${inv.student?.user?.firstName || ''} ${inv.student?.user?.lastName || ''}`.toLowerCase();
      const admNo = (inv.student?.admissionNumber || '').toLowerCase();
      const invNo = (inv.invoiceNumber || '').toLowerCase();
      const matchesSearch =
        studentName.includes(searchQuery.toLowerCase()) ||
        admNo.includes(searchQuery.toLowerCase()) ||
        invNo.includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      const studentClassId = inv.student?.enrollments?.[0]?.classId;
      const matchesClass = classFilter === 'ALL' || studentClassId === classFilter;

      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [invoices, searchQuery, statusFilter, classFilter]);

  // Payment Execution
  const handleOpenPay = (inv: any) => {
    setSelectedInvoice(inv);
    const effectiveTotal = inv.totalAmount + (inv.lateFeeAmount || 0);
    setPayAmount(Math.max(0, effectiveTotal - inv.paidAmount));
    setTxnRef(`UPI-${Date.now().toString().slice(-8)}`);
    setChequeNumber('');
    setBankName('');
    setUpiId('');
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setIsProcessing(true);
    try {
      const idempotencyKey = `PAY-${selectedInvoice.id}-${Date.now()}`;
      const res = await fetch('/api/fees/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: payAmount,
          paymentMode: payMode,
          transactionRef: txnRef,
          chequeNumber,
          chequeDate,
          bankName,
          upiId,
          bankAccountId: selectedBankAccountId,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === selectedInvoice.id
              ? {
                  ...inv,
                  paidAmount: inv.paidAmount + payAmount,
                  status: data.newStatus,
                }
              : inv
          )
        );
        if (data.receipt) {
          setReceipts((prev) => [data.receipt, ...prev]);
          setViewReceipt(data.receipt);
        }
        setSelectedInvoice(null);
        showToast(
          `Payment of ${formatCurrency(payAmount)} recorded! Official receipt generated.`,
          'success'
        );
      } else {
        showToast(data.error || 'Payment failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Refund Execution
  const handleOpenRefund = (rcp: any) => {
    setRefundReceipt(rcp);
    const maxRefundable = rcp.amountPaid - (rcp.refundedAmount || 0);
    setRefundAmount(maxRefundable);
    setRefundReason('Administrative concession adjustment');
  };

  const handleExecuteRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundReceipt) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/fees/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId: refundReceipt.id,
          refundAmount,
          reason: refundReason,
          refundMode,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Update receipts state
        setReceipts((prev) =>
          prev.map((r) =>
            r.id === refundReceipt.id
              ? {
                  ...r,
                  refundedAmount: (r.refundedAmount || 0) + refundAmount,
                  status: data.receiptStatus,
                }
              : r
          )
        );
        // Update invoices state
        if (data.updatedInvoice) {
          setInvoices((prev) =>
            prev.map((inv) => (inv.id === data.updatedInvoice.id ? { ...inv, ...data.updatedInvoice } : inv))
          );
        }
        setRefundReceipt(null);
        showToast(data.message || 'Refund successfully processed', 'success');
      } else {
        showToast(data.error || 'Refund failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Batch Invoices Generation
  const handleGenerateInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GENERATE_BATCH_INVOICES',
          classId: batchClassId,
          feeStructureId: batchStructureId,
          title: batchTitle,
          dueDate: batchDueDate,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || `Successfully generated ${data.count} invoices`);
        setIsGenerateModalOpen(false);
        // Reload page to reflect new relations
        window.location.reload();
      } else {
        alert(data.error || 'Batch generation failed');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Concession Creation
  const handleApplyConcession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPLY_CONCESSION',
          studentId: concessionStudentId,
          concessionType,
          discountType,
          discountValue,
          reason: concessionReason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setConcessions((prev) => [data.concession, ...prev]);
        setIsConcessionModalOpen(false);
        alert('Concession applied successfully');
      } else {
        alert(data.error || 'Failed to apply concession');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Late Fee Calculation
  const handleCalculateLateFees = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CALCULATE_LATE_FEES' }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Late fee calculation scan complete', 'success');
      } else {
        showToast(data.error || 'Failed to compute late fees', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Dispatch Reminders
  const handleSendReminders = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEND_REMINDERS' }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Payment reminders dispatched via SMS & Email', 'success');
      } else {
        showToast(data.error || 'Failed to send reminders', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['InvoiceNumber', 'StudentName', 'AdmissionNumber', 'Title', 'TotalAmount', 'PaidAmount', 'LateFee', 'Status', 'DueDate'];
    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      `"${inv.student?.user?.firstName || ''} ${inv.student?.user?.lastName || ''}"`,
      inv.student?.admissionNumber || '',
      `"${inv.title}"`,
      inv.totalAmount,
      inv.paidAmount,
      inv.lateFeeAmount || 0,
      inv.status,
      formatDate(inv.dueDate),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `edvonest_fee_invoices_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Columns for Invoices DataTable
  const invoiceColumns: Column<any>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-[#990000]">{row.invoiceNumber}</span>
          <span className="block text-[11px] text-slate-400 font-medium">{formatDate(row.createdAt)}</span>
        </div>
      ),
    },
    {
      key: 'student',
      header: 'Student & Class',
      render: (row) => (
        <div>
          <span className="font-bold text-[#171717]">
            {row.student?.user?.firstName} {row.student?.user?.lastName}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-[#737373] font-mono">{row.student?.admissionNumber}</span>
            {row.student?.enrollments?.[0]?.class && (
              <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                {row.student.enrollments[0].class.name}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Fee Title',
      render: (row) => (
        <div>
          <span className="font-semibold text-[#171717]">{row.title}</span>
          {row.concessionAmount > 0 && (
            <span className="block text-[11px] text-emerald-600 font-medium">
              Concession: -{formatCurrency(row.concessionAmount)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (row) => (
        <div>
          <span className="text-slate-700 font-medium">{formatDate(row.dueDate)}</span>
          {new Date(row.dueDate) < new Date() && row.status !== 'PAID' && (
            <span className="block text-[10px] text-rose-600 font-bold uppercase tracking-wider">Overdue</span>
          )}
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Fee',
      render: (row) => (
        <div>
          <span className="font-bold text-[#171717]">{formatCurrency(row.totalAmount)}</span>
          {row.lateFeeAmount > 0 && (
            <span className="block text-[10.5px] text-rose-600 font-bold">
              + Late Fee: {formatCurrency(row.lateFeeAmount)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'paidAmount',
      header: 'Paid Amount',
      render: (row) => (
        <span className="font-bold text-[#16A34A]">{formatCurrency(row.paidAmount)}</span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance Due',
      render: (row) => {
        const bal = Math.max(0, row.totalAmount + (row.lateFeeAmount || 0) - row.paidAmount);
        return (
          <span className={`font-mono font-bold ${bal > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
            {formatCurrency(bal)}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          variant={
            row.status === 'PAID'
              ? 'green'
              : row.status === 'PARTIALLY_PAID'
              ? 'blue'
              : row.status === 'OVERDUE'
              ? 'rose'
              : 'amber'
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        const bal = row.totalAmount + (row.lateFeeAmount || 0) - row.paidAmount;
        return (
          <div className="flex items-center gap-1.5">
            {bal > 0 && (
              <Button size="sm" variant="primary" onClick={() => handleOpenPay(row)}>
                <CreditCard className="w-3.5 h-3.5 mr-1" />
                Pay
              </Button>
            )}
            {row.payments?.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewReceipt(row.payments[0])}
                title="View Latest Receipt"
              >
                <Printer className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // Columns for Receipts DataTable
  const receiptColumns: Column<any>[] = [
    {
      key: 'receiptNumber',
      header: 'Receipt #',
      render: (row) => <span className="font-mono font-bold text-slate-900">{row.receiptNumber}</span>,
    },
    {
      key: 'student',
      header: 'Student',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900">
            {row.invoice?.student?.user?.firstName} {row.invoice?.student?.user?.lastName}
          </span>
          <span className="block text-[11px] text-slate-500 font-mono">
            {row.invoice?.student?.admissionNumber}
          </span>
        </div>
      ),
    },
    {
      key: 'amountPaid',
      header: 'Amount Paid',
      render: (row) => (
        <div>
          <span className="font-bold text-emerald-700 font-mono">{formatCurrency(row.amountPaid)}</span>
          {row.refundedAmount > 0 && (
            <span className="block text-[10px] text-rose-600 font-medium">
              Refunded: {formatCurrency(row.refundedAmount)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'paymentMode',
      header: 'Payment Mode',
      render: (row) => (
        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
          {row.paymentMode}
        </span>
      ),
    },
    {
      key: 'transactionRef',
      header: 'Reference',
      render: (row) => (
        <span className="text-xs font-mono text-slate-600">{row.transactionRef || 'N/A'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          variant={
            row.status === 'SUCCESS'
              ? 'green'
              : row.status === 'PARTIALLY_REFUNDED'
              ? 'amber'
              : 'rose'
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'paidAt',
      header: 'Date & Time',
      render: (row) => <span className="text-xs text-slate-600">{formatDate(row.paidAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => {
        const canRefund = isStaff && row.amountPaid - (row.refundedAmount || 0) > 0;
        return (
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" onClick={() => setViewReceipt(row)}>
              <Printer className="w-3.5 h-3.5 mr-1" />
              Receipt
            </Button>
            {canRefund && (
              <Button size="sm" variant="danger" onClick={() => handleOpenRefund(row)}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Refund
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Financial Hub</h1>
            <Badge variant="teal">Learn • Grow • Succeed</Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Complete institutional fee planning, multi-mode payment counter, automated invoicing & ledger accounting.
          </p>
        </div>

        {isStaff && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-1.5" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleCalculateLateFees} disabled={isProcessing}>
              <Clock className="w-4 h-4 mr-1.5" />
              Scan Late Fees
            </Button>
            <Button variant="outline" size="sm" onClick={handleSendReminders} disabled={isProcessing}>
              <BellRing className="w-4 h-4 mr-1.5" />
              Send Reminders
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsGenerateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Generate Invoices
            </Button>
          </div>
        )}
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Expected Revenue"
          value={formatCurrency(totalExpected)}
          icon={<DollarSign className="w-5 h-5 text-[#990000]" />}
          change={`${invoices.length} active invoices`}
          trend="neutral"
        />
        <StatCard
          title="Total Fee Collection"
          value={formatCurrency(totalCollected)}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          change={`${collectionPercentage}% collection efficiency`}
          trend="up"
        />
        <StatCard
          title="Outstanding Dues"
          value={formatCurrency(totalOutstanding)}
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          change={`${invoices.filter((i) => i.status !== 'PAID').length} pending/partial`}
          trend="down"
        />
        <StatCard
          title="Overdue Invoices"
          value={overdueInvoices.length.toString()}
          icon={<Clock className="w-5 h-5 text-rose-600" />}
          change={`${formatCurrency(overdueInvoices.reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0))} overdue amount`}
          trend="down"
        />
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: INVOICES & DUES REGISTER */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
              <CardTitle className="text-base font-bold text-slate-900">
                Student Invoices Register ({filteredInvoices.length})
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search student, adm #, inv #..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#990000]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
                <select
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700"
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                >
                  <option value="ALL">All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <DataTable
              data={filteredInvoices}
              columns={invoiceColumns}
              emptyMessage="No fee invoices found matching your criteria."
            />
          </Card>
        </div>
      )}

      {/* TAB 2: FEE STRUCTURES */}
      {activeTab === 'structures' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Configured Academic Fee Structures</h2>
            {isStaff && (
              <Button size="sm" variant="primary" onClick={() => setIsStructureModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Create Structure
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feeStructures.map((fs) => {
              const baseTotal = fs.items?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0;
              return (
                <Card key={fs.id} className="hover:border-slate-300 transition-colors">
                  <CardHeader className="pb-2 border-b border-slate-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{fs.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Applicable to: {fs.class?.name || 'All Classes'} • Frequency: {fs.frequency}
                        </p>
                      </div>
                      <Badge variant="teal">{formatCurrency(baseTotal)}</Badge>
                    </div>
                  </CardHeader>
                  <div className="p-4 space-y-3">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Fee Head Breakdown</p>
                    <div className="space-y-1.5">
                      {fs.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-dashed border-slate-100">
                          <span className="text-slate-700 font-medium">{item.category?.name || 'Academic Fee'}</span>
                          <span className="font-mono font-semibold text-slate-900">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>

                    {fs.installments?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Installment Schedule
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {fs.installments.map((inst: any) => (
                            <div key={inst.id} className="p-2 bg-slate-50 rounded text-xs border border-slate-100">
                              <span className="font-semibold text-slate-800 block truncate">{inst.title}</span>
                              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                                <span>{inst.percentage}%</span>
                                <span>Due: {formatDate(inst.dueDate)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Grace Period: {fs.graceDays || 7} days</span>
                      <span>Late Fee: ₹{fs.lateFeePerDay || 50}/day</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CONCESSIONS & SCHOLARSHIPS */}
      {activeTab === 'concessions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Concessions & Scholarships</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically deducted during batch invoice generation.
              </p>
            </div>
            {isStaff && (
              <Button size="sm" variant="primary" onClick={() => setIsConcessionModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Grant Concession
              </Button>
            )}
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">Student</th>
                    <th className="py-2.5 px-4 font-bold">Concession Type</th>
                    <th className="py-2.5 px-4 font-bold">Discount Value</th>
                    <th className="py-2.5 px-4 font-bold">Reason / Purpose</th>
                    <th className="py-2.5 px-4 font-bold">Approved By</th>
                    <th className="py-2.5 px-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {concessions.map((conc) => (
                    <tr key={conc.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">
                          {conc.student?.user?.firstName} {conc.student?.user?.lastName}
                        </span>
                        <span className="block text-[11px] text-slate-500 font-mono">
                          {conc.student?.admissionNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="blue">{conc.concessionType}</Badge>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {conc.discountType === 'PERCENTAGE' ? `${conc.discountValue}% Off` : formatCurrency(conc.discountValue)}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{conc.reason}</td>
                      <td className="py-3 px-4 text-slate-600">{conc.approvedBy || 'Principal'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={conc.isActive ? 'green' : 'slate'}>
                          {conc.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {concessions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No active scholarships or concessions configured.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: RECEIPTS & REFUNDS */}
      {activeTab === 'receipts' && (
        <Card>
          <CardHeader className="flex items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              Receipts Ledger & Refund History ({receipts.length})
            </CardTitle>
          </CardHeader>
          <DataTable
            data={receipts}
            columns={receiptColumns}
            emptyMessage="No payment receipts found."
          />
        </Card>
      )}

      {/* TAB 5: FINANCIAL ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Realization Rate</span>
                <div className="text-3xl font-black text-slate-900 mt-2">{collectionPercentage}%</div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
                  <div
                    className="bg-[#990000] h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, collectionPercentage)}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
                <span>Collected: {formatCurrency(totalCollected)}</span>
                <span>Expected: {formatCurrency(totalExpected)}</span>
              </div>
            </Card>

            <Card className="p-5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Bank Accounts</span>
              <div className="mt-3 space-y-2">
                {bankAccounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-slate-900 block">{acc.accountName}</span>
                      <span className="text-[10.5px] text-slate-500 font-mono">{acc.bankName || acc.accountType}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">{formatCurrency(acc.currentBalance)}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accounting Integrations</span>
                <p className="text-xs text-slate-600 mt-2">
                  Compliant with CBSE audit norms and direct import into Tally ERP, Zoho Books, and QuickBooks.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Button size="sm" variant="outline" className="w-full" onClick={handleExportCSV}>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download Financial Journal (CSV)
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* MODAL 1: PAY FEE COUNTER */}
      {selectedInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
          title={`Fee Payment Terminal: Invoice ${selectedInvoice.invoiceNumber}`}
        >
          <form onSubmit={handleExecutePayment} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-600">Student:</span>
                <span className="font-bold text-slate-900">
                  {selectedInvoice.student?.user?.firstName} {selectedInvoice.student?.user?.lastName} (
                  {selectedInvoice.student?.admissionNumber})
                </span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-600">Fee Head:</span>
                <span className="font-semibold text-slate-900">{selectedInvoice.title}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-600">Total Invoice Amount:</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedInvoice.totalAmount)}</span>
              </div>
              {selectedInvoice.lateFeeAmount > 0 && (
                <div className="flex justify-between items-center mb-1 text-rose-600">
                  <span>Late Fee Penalty:</span>
                  <span className="font-mono font-bold">+{formatCurrency(selectedInvoice.lateFeeAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-emerald-700 font-bold border-t border-slate-200 pt-1 mt-1">
                <span>Remaining Due:</span>
                <span className="font-mono text-sm">
                  {formatCurrency(
                    selectedInvoice.totalAmount + (selectedInvoice.lateFeeAmount || 0) - selectedInvoice.paidAmount
                  )}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedInvoice.totalAmount + (selectedInvoice.lateFeeAmount || 0) - selectedInvoice.paidAmount}
                  className="w-full px-3 py-2 border rounded font-mono font-bold text-sm bg-white"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Mode *</label>
                <select
                  className="w-full px-3 py-2 border rounded font-medium bg-white"
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CASH">Cash Counter Register</option>
                  <option value="CHEQUE">Bank Cheque / DD</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="NET_BANKING">Net Banking / NEFT</option>
                  <option value="RAZORPAY">Razorpay Gateway Simulation</option>
                </select>
              </div>
            </div>

            {/* Mode-specific Fields */}
            {payMode === 'CHEQUE' && (
              <div className="grid grid-cols-3 gap-2 bg-amber-50/50 p-2.5 rounded border border-amber-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cheque Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. 000492"
                    className="w-full px-2 py-1.5 border rounded bg-white text-xs"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cheque Date *</label>
                  <input
                    type="date"
                    className="w-full px-2 py-1.5 border rounded bg-white text-xs"
                    value={chequeDate}
                    onChange={(e) => setChequeDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issuing Bank *</label>
                  <input
                    type="text"
                    placeholder="e.g. SBI, HDFC"
                    className="w-full px-2 py-1.5 border rounded bg-white text-xs"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {payMode === 'UPI' && (
              <div className="grid grid-cols-2 gap-2 bg-blue-50/50 p-2.5 rounded border border-blue-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payer UPI ID / VPA</label>
                  <input
                    type="text"
                    placeholder="e.g. parent@oksbi"
                    className="w-full px-2 py-1.5 border rounded bg-white text-xs"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transaction Ref (UTR) *</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1.5 border rounded bg-white text-xs font-mono"
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Deposit To Account</label>
              <select
                className="w-full px-3 py-2 border rounded font-medium bg-white"
                value={selectedBankAccountId}
                onChange={(e) => setSelectedBankAccountId(e.target.value)}
              >
                {bankAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountName} ({acc.accountType}) - Current Bal: {formatCurrency(acc.currentBalance)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setSelectedInvoice(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isProcessing}>
                {isProcessing ? 'Processing Transaction...' : `Confirm & Record ₹${payAmount.toLocaleString('en-IN')}`}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: PRINT OFFICIAL RECEIPT */}
      {viewReceipt && (
        <Modal isOpen={true} onClose={() => setViewReceipt(null)} title="Official Fee Payment Receipt">
          <div className="space-y-4 text-xs font-sans p-2">
            {/* School Header */}
            <div className="text-center border-b pb-3">
              <div className="flex justify-center mb-1">
                <EdvoNestLogo variant="full" />
              </div>
              <h2 className="text-base font-black text-slate-900">
                {schoolInfo?.name || 'Edvonest Model International Academy'}
              </h2>
              <p className="text-[11px] text-slate-500">
                CBSE Affiliation No: {schoolInfo?.affiliationNo || 'CBSE/AFF/2026/89410'} • {schoolInfo?.city || 'Noida'},{' '}
                {schoolInfo?.state || 'Uttar Pradesh'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Contact: accounts@edvonest-academy.edu.in</p>
            </div>

            {/* Receipt Identification */}
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10.5px]">RECEIPT NUMBER</span>
                <span className="font-mono font-bold text-sm text-[#990000]">{viewReceipt.receiptNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10.5px]">PAYMENT DATE</span>
                <span className="font-medium text-slate-800">{formatDate(viewReceipt.paidAt)}</span>
              </div>
            </div>

            {/* Student Details */}
            <div className="grid grid-cols-2 gap-2 text-slate-700 border-b pb-2.5">
              <div>
                <span className="text-slate-400 text-[10.5px] block">STUDENT NAME</span>
                <span className="font-bold text-slate-900">
                  {viewReceipt.invoice?.student?.user?.firstName} {viewReceipt.invoice?.student?.user?.lastName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10.5px] block">ADMISSION NUMBER</span>
                <span className="font-mono font-bold text-slate-900">
                  {viewReceipt.invoice?.student?.admissionNumber || 'ADM-2026-001'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10.5px] block">INVOICE TITLE</span>
                <span className="font-medium text-slate-800">{viewReceipt.invoice?.title || 'Academic Fee'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10.5px] block">PAYMENT MODE</span>
                <span className="font-bold text-slate-900">{viewReceipt.paymentMode}</span>
              </div>
            </div>

            {/* Amount Table */}
            <div className="border rounded overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b">
                  <tr>
                    <th className="p-2">Particulars</th>
                    <th className="p-2 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-b">Fee Amount Received ({viewReceipt.paymentMode})</td>
                    <td className="p-2 border-b text-right font-mono font-bold">
                      {formatCurrency(viewReceipt.amountPaid)}
                    </td>
                  </tr>
                  {viewReceipt.refundedAmount > 0 && (
                    <tr className="text-rose-600 bg-rose-50/50">
                      <td className="p-2 border-b">Refund Reversal Issued</td>
                      <td className="p-2 border-b text-right font-mono font-bold">
                        -{formatCurrency(viewReceipt.refundedAmount)}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-slate-50 font-black">
                    <td className="p-2">Net Realized Balance</td>
                    <td className="p-2 text-right font-mono text-sm text-emerald-700">
                      {formatCurrency(viewReceipt.amountPaid - (viewReceipt.refundedAmount || 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer Signatures */}
            <div className="flex justify-between items-end pt-4 border-t border-dashed">
              <div className="text-[10px] text-slate-400">
                <p>Computer-generated digital receipt.</p>
                <p>Transaction Ref: {viewReceipt.transactionRef || 'SYSTEM-VERIFIED'}</p>
                <p>Verified By: {viewReceipt.collectedBy || 'Accounts Desk'}</p>
              </div>
              <div className="text-center">
                <div className="h-8 border-b border-slate-300 w-32 mb-1" />
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Authorized Signatory</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-3.5 h-3.5 mr-1" />
                Print / Save PDF
              </Button>
              <Button variant="primary" size="sm" onClick={() => setViewReceipt(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: ISSUE REFUND */}
      {refundReceipt && (
        <Modal
          isOpen={true}
          onClose={() => setRefundReceipt(null)}
          title={`Process Payment Refund: Receipt ${refundReceipt.receiptNumber}`}
        >
          <form onSubmit={handleExecuteRefund} className="space-y-4 text-xs">
            <div className="bg-rose-50 p-3 rounded border border-rose-200 text-rose-900">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Transactional Fee Reversal Notice
              </p>
              <p className="text-[11px] mt-1">
                Refunding this payment will decrease the receipt total, restore invoice balance due, and record an expense
                entry in the school general ledger.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Refund Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  max={refundReceipt.amountPaid - (refundReceipt.refundedAmount || 0)}
                  className="w-full px-3 py-2 border rounded font-mono font-bold text-sm bg-white"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Max refundable: {formatCurrency(refundReceipt.amountPaid - (refundReceipt.refundedAmount || 0))}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Refund Mode *</label>
                <select
                  className="w-full px-3 py-2 border rounded font-medium bg-white"
                  value={refundMode}
                  onChange={(e) => setRefundMode(e.target.value)}
                >
                  <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                  <option value="CASH">Counter Cash Payout</option>
                  <option value="UPI">UPI Refund</option>
                  <option value="ORIGINAL_SOURCE">Original Payment Channel</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason for Refund *</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border rounded bg-white"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setRefundReceipt(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" disabled={isProcessing}>
                {isProcessing ? 'Processing Refund...' : `Confirm Refund of ₹${refundAmount.toLocaleString('en-IN')}`}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: GENERATE BATCH INVOICES */}
      {isGenerateModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsGenerateModalOpen(false)}
          title="Batch Fee Invoice Generator"
        >
          <form onSubmit={handleGenerateInvoices} className="space-y-4 text-xs">
            <p className="text-slate-600">
              Generates customized fee invoices for enrolled students. Any active scholarship or sibling discount
              configured for a student will be automatically calculated and applied.
            </p>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Class *</label>
              <select
                className="w-full px-3 py-2 border rounded font-medium bg-white"
                value={batchClassId}
                onChange={(e) => setBatchClassId(e.target.value)}
              >
                <option value="ALL">All Classes (Entire School)</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Fee Structure *</label>
              <select
                className="w-full px-3 py-2 border rounded font-medium bg-white"
                value={batchStructureId}
                onChange={(e) => setBatchStructureId(e.target.value)}
                required
              >
                {feeStructures.map((fs) => (
                  <option key={fs.id} value={fs.id}>
                    {fs.title} ({formatCurrency(fs.items?.reduce((s: number, i: any) => s + i.amount, 0) || 0)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Invoice Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Term 1 Composite Fee 2026"
                  className="w-full px-3 py-2 border rounded bg-white"
                  value={batchTitle}
                  onChange={(e) => setBatchTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Due Date *</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded bg-white font-medium"
                  value={batchDueDate}
                  onChange={(e) => setBatchDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsGenerateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isProcessing}>
                {isProcessing ? 'Generating Invoices...' : 'Generate Batch Invoices'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 5: GRANT CONCESSION */}
      {isConcessionModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsConcessionModalOpen(false)}
          title="Grant Student Concession / Scholarship"
        >
          <form onSubmit={handleApplyConcession} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Student *</label>
              <select
                className="w-full px-3 py-2 border rounded font-medium bg-white"
                value={concessionStudentId}
                onChange={(e) => setConcessionStudentId(e.target.value)}
                required
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.user?.firstName} {st.user?.lastName} ({st.admissionNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Concession Type *</label>
                <select
                  className="w-full px-3 py-2 border rounded font-medium bg-white"
                  value={concessionType}
                  onChange={(e) => setConcessionType(e.target.value)}
                >
                  <option value="SCHOLARSHIP">Merit Scholarship</option>
                  <option value="SIBLING_DISCOUNT">Sibling Discount</option>
                  <option value="EWS">EWS / Financial Aid</option>
                  <option value="STAFF_WARD">Staff Ward Concession</option>
                  <option value="SPECIAL">Special Management Quota</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Discount Type *</label>
                <select
                  className="w-full px-3 py-2 border rounded font-medium bg-white"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (INR)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Discount Value ({discountType === 'PERCENTAGE' ? '%' : '₹'}) *
              </label>
              <input
                type="number"
                min="1"
                max={discountType === 'PERCENTAGE' ? 100 : 200000}
                className="w-full px-3 py-2 border rounded font-bold font-mono bg-white"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Approval Reason & Authorization Notes *</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border rounded bg-white"
                value={concessionReason}
                onChange={(e) => setConcessionReason(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsConcessionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isProcessing}>
                {isProcessing ? 'Applying...' : 'Apply Concession'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
