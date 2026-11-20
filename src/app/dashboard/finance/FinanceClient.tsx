'use client';

import React, { useState, useMemo } from 'react';
import {
  Receipt,
  DollarSign,
  TrendingUp,
  Plus,
  FileSpreadsheet,
  Building,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Calendar,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CreditCard,
  Printer,
} from 'lucide-react';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface FinanceClientProps {
  vouchers: any[];
  categories: any[];
  bankAccounts: any[];
  ledgerEntries: any[];
  reconciliations: any[];
  dailyCollection: any;
  schoolInfo: any;
  userRole: string;
}

export const FinanceClient: React.FC<FinanceClientProps> = ({
  vouchers: initialVouchers,
  categories,
  bankAccounts: initialBankAccounts,
  ledgerEntries: initialLedgerEntries,
  reconciliations: initialReconciliations,
  dailyCollection,
  schoolInfo,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState('ledger');
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [bankAccounts, setBankAccounts] = useState(initialBankAccounts);
  const [ledgerEntries, setLedgerEntries] = useState(initialLedgerEntries);
  const [reconciliations, setReconciliations] = useState(initialReconciliations);

  // Filters
  const [searchLedger, setSearchLedger] = useState('');
  const [entryTypeFilter, setEntryTypeFilter] = useState('ALL');

  // Modals
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isReconModalOpen, setIsReconModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Expense Voucher Form State
  const [voucherData, setVoucherData] = useState({
    categoryId: categories[0]?.id || '',
    title: '',
    vendorName: '',
    vendorPhone: '',
    vendorInvoice: '',
    amount: 15000,
    paymentMode: 'BANK_TRANSFER',
    bankAccountId: bankAccounts[0]?.id || '',
    notes: '',
  });

  // Bank Account Form State
  const [accountData, setAccountData] = useState({
    accountName: '',
    accountType: 'BANK',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    openingBalance: 100000,
  });

  // Reconciliation Form State
  const [reconData, setReconData] = useState({
    bankAccountId: bankAccounts[0]?.id || '',
    statementDate: new Date().toISOString().split('T')[0],
    openingBalance: 500000,
    closingBalance: 650000,
    reconciledAmount: 650000,
    notes: 'Monthly bank statement matched against ERP ledger',
  });

  // Tabs
  const tabs: TabItem[] = [
    { id: 'ledger', label: 'General Ledger', count: ledgerEntries.length, icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'vouchers', label: 'Expense Vouchers', count: vouchers.length, icon: <Receipt className="w-3.5 h-3.5" /> },
    { id: 'accounts', label: 'Bank & Cash Accounts', count: bankAccounts.length, icon: <Wallet className="w-3.5 h-3.5" /> },
    { id: 'reconciliation', label: 'Bank Reconciliation', count: reconciliations.length, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { id: 'statements', label: 'P&L & Daily Register', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
  ];

  // Aggregated Financial Metrics
  const totalLiquidFunds = useMemo(() => {
    return bankAccounts.reduce((acc, b) => acc + b.currentBalance, 0);
  }, [bankAccounts]);

  const totalIncome = useMemo(() => {
    return ledgerEntries
      .filter((e) => e.entryType === 'INCOME')
      .reduce((acc, e) => acc + e.amount, 0);
  }, [ledgerEntries]);

  const totalExpenses = useMemo(() => {
    return ledgerEntries
      .filter((e) => e.entryType === 'EXPENSE')
      .reduce((acc, e) => acc + e.amount, 0);
  }, [ledgerEntries]);

  const netSurplus = totalIncome - totalExpenses;

  // Filtered Ledger Entries
  const filteredLedger = useMemo(() => {
    return ledgerEntries.filter((item) => {
      const textMatch =
        item.entryNumber.toLowerCase().includes(searchLedger.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(searchLedger.toLowerCase()) ||
        item.description.toLowerCase().includes(searchLedger.toLowerCase());

      const typeMatch = entryTypeFilter === 'ALL' || item.entryType === entryTypeFilter;
      return textMatch && typeMatch;
    });
  }, [ledgerEntries, searchLedger, entryTypeFilter]);

  // Create Expense Voucher
  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RECORD_EXPENSE_VOUCHER',
          ...voucherData,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setVouchers((prev) => [data.voucher, ...prev]);
        setIsVoucherModalOpen(false);
        // Refresh bank accounts
        window.location.reload();
      } else {
        alert(data.error || 'Failed to record expense voucher');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Create Bank Account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_BANK_ACCOUNT',
          ...accountData,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBankAccounts((prev) => [data.account, ...prev]);
        setIsAccountModalOpen(false);
        window.location.reload();
      } else {
        alert(data.error || 'Failed to create account');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reconcile Bank
  const handleReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RECONCILE_BANK',
          ...reconData,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReconciliations((prev) => [data.reconciliation, ...prev]);
        setIsReconModalOpen(false);
        alert('Reconciliation statement recorded successfully');
      } else {
        alert(data.error || 'Failed to record reconciliation');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Export CSV
  const handleExportLedgerCSV = () => {
    const headers = ['EntryNumber', 'Date', 'Type', 'Category', 'Amount', 'PaymentMode', 'Account', 'Description'];
    const rows = ledgerEntries.map((e) => [
      e.entryNumber,
      formatDate(e.transactionDate),
      e.entryType,
      `"${e.categoryName}"`,
      e.amount,
      e.paymentMode,
      `"${e.bankAccount?.accountName || 'General'}"`,
      `"${e.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `edvonest_general_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ledger DataTable Columns
  const ledgerColumns: Column<any>[] = [
    {
      key: 'entryNumber',
      header: 'Entry #',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900">{row.entryNumber}</span>
          <span className="block text-[11px] text-slate-400 font-medium">{formatDate(row.transactionDate)}</span>
        </div>
      ),
    },
    {
      key: 'entryType',
      header: 'Type',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
            row.entryType === 'INCOME' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}
        >
          {row.entryType === 'INCOME' ? (
            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
          ) : (
            <ArrowDownRight className="w-3 h-3 text-rose-600" />
          )}
          {row.entryType}
        </span>
      ),
    },
    {
      key: 'categoryName',
      header: 'Account Head',
      render: (row) => <span className="font-semibold text-slate-800">{row.categoryName}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <span
          className={`font-mono font-bold ${
            row.entryType === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {row.entryType === 'INCOME' ? '+' : '-'}
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'bankAccount',
      header: 'Bank / Cash Book',
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.bankAccount?.accountName || 'Cash Drawer'}
        </span>
      ),
    },
    {
      key: 'paymentMode',
      header: 'Mode',
      render: (row) => (
        <span className="text-[11px] font-medium bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
          {row.paymentMode}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Transaction Details',
      render: (row) => <span className="text-xs text-slate-600 max-w-xs block truncate">{row.description}</span>,
    },
  ];

  // Voucher DataTable Columns
  const voucherColumns: Column<any>[] = [
    {
      key: 'voucherNumber',
      header: 'Voucher #',
      render: (row) => <span className="font-mono font-bold text-slate-900">{row.voucherNumber}</span>,
    },
    {
      key: 'title',
      header: 'Expense Item',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900">{row.title}</span>
          <span className="block text-[11px] text-slate-500">Category: {row.category?.name}</span>
        </div>
      ),
    },
    {
      key: 'vendorName',
      header: 'Vendor / Payee',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800">{row.vendorName || 'School General'}</span>
          {row.vendorInvoice && (
            <span className="block text-[10px] text-slate-400 font-mono">Bill #{row.vendorInvoice}</span>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      render: (row) => <span className="font-bold text-rose-700 font-mono">{formatCurrency(row.amount)}</span>,
    },
    {
      key: 'paymentMode',
      header: 'Mode',
      render: (row) => <span className="text-xs bg-slate-100 font-bold px-2 py-0.5 rounded">{row.paymentMode}</span>,
    },
    {
      key: 'expenseDate',
      header: 'Date',
      render: (row) => <span className="text-slate-600 text-xs">{formatDate(row.expenseDate)}</span>,
    },
    {
      key: 'approvedBy',
      header: 'Approved By',
      render: (row) => <span className="text-xs text-slate-600">{row.approvedBy || 'Admin'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Accounting & Ledger</h1>
            <Badge variant="teal">Learn • Grow • Succeed</Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            General ledger, cash and bank management, vendor payments & CBSE compliant financial statements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportLedgerCSV}>
            <Download className="w-4 h-4 mr-1.5" />
            Export Ledger
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsReconModalOpen(true)}>
            <Scale className="w-4 h-4 mr-1.5" />
            Reconcile Bank
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsAccountModalOpen(true)}>
            <Wallet className="w-4 h-4 mr-1.5" />
            Add Account
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsVoucherModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Expense Voucher
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Liquid Funds"
          value={formatCurrency(totalLiquidFunds)}
          icon={<Wallet className="w-5 h-5 text-[#086A92]" />}
          change={`${bankAccounts.length} active cash & bank accounts`}
          trend="up"
        />
        <StatCard
          title="Total Ledger Revenue"
          value={formatCurrency(totalIncome)}
          icon={<ArrowUpRight className="w-5 h-5 text-emerald-600" />}
          change="Income from fees & services"
          trend="up"
        />
        <StatCard
          title="Total Operating Expenses"
          value={formatCurrency(totalExpenses)}
          icon={<ArrowDownRight className="w-5 h-5 text-rose-600" />}
          change={`${vouchers.length} vouchers disbursed`}
          trend="down"
        />
        <StatCard
          title="Net Operating Surplus"
          value={formatCurrency(netSurplus)}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          change="Realized Operating Margin"
          trend={netSurplus >= 0 ? 'up' : 'down'}
        />
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: GENERAL LEDGER */}
      {activeTab === 'ledger' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              General Ledger Entries ({filteredLedger.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search ledger entries..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none"
                  value={searchLedger}
                  onChange={(e) => setSearchLedger(e.target.value)}
                />
              </div>
              <select
                className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700"
                value={entryTypeFilter}
                onChange={(e) => setEntryTypeFilter(e.target.value)}
              >
                <option value="ALL">All Entries</option>
                <option value="INCOME">Income Only</option>
                <option value="EXPENSE">Expense Only</option>
              </select>
            </div>
          </CardHeader>
          <DataTable
            data={filteredLedger}
            columns={ledgerColumns}
            emptyMessage="No ledger entries recorded."
          />
        </Card>
      )}

      {/* TAB 2: EXPENSE VOUCHERS */}
      {activeTab === 'vouchers' && (
        <Card>
          <CardHeader className="flex items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              Approved Expense Vouchers & Bills ({vouchers.length})
            </CardTitle>
            <Button size="sm" variant="primary" onClick={() => setIsVoucherModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              New Voucher
            </Button>
          </CardHeader>
          <DataTable
            data={vouchers}
            columns={voucherColumns}
            emptyMessage="No expense vouchers recorded."
          />
        </Card>
      )}

      {/* TAB 3: CASH & BANK ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Institutional Bank Accounts & Cash Books</h2>
            <Button size="sm" variant="primary" onClick={() => setIsAccountModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Account
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bankAccounts.map((acc) => (
              <Card key={acc.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {acc.accountType}
                    </span>
                    <Badge variant={acc.isActive ? 'green' : 'slate'}>{acc.isActive ? 'Active' : 'Closed'}</Badge>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{acc.accountName}</h3>
                  <p className="text-xs text-slate-500 mt-1">{acc.bankName || 'Physical Counter Cash'}</p>
                  {acc.accountNumber && (
                    <p className="text-xs font-mono text-slate-600 mt-0.5">A/C: {acc.accountNumber}</p>
                  )}
                  {acc.ifscCode && (
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">IFSC: {acc.ifscCode}</p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Current Balance:</span>
                  <span className="font-mono text-lg font-black text-emerald-700">
                    {formatCurrency(acc.currentBalance)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BANK RECONCILIATION */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Bank Statement Reconciliation Logs</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly verified statements comparing bank passes against internal ERP receipts.
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={() => setIsReconModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              New Reconciliation
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">Bank Account</th>
                    <th className="py-2.5 px-4 font-bold">Statement Date</th>
                    <th className="py-2.5 px-4 font-bold">Opening Balance</th>
                    <th className="py-2.5 px-4 font-bold">Closing Balance</th>
                    <th className="py-2.5 px-4 font-bold">Reconciled Sum</th>
                    <th className="py-2.5 px-4 font-bold">Status</th>
                    <th className="py-2.5 px-4 font-bold">Auditor / Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reconciliations.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{rec.bankAccount?.accountName}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(rec.statementDate)}</td>
                      <td className="py-3 px-4 font-mono font-medium">{formatCurrency(rec.openingBalance)}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {formatCurrency(rec.closingBalance)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {formatCurrency(rec.reconciledAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={rec.status === 'MATCHED' ? 'green' : 'amber'}>{rec.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{rec.reconciledBy}</td>
                    </tr>
                  ))}
                  {reconciliations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No reconciliation logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: P&L & DAILY REGISTER */}
      {activeTab === 'statements' && (
        <div className="space-y-6">
          {/* Today's Daily Collection Counter */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Today&apos;s Daily Counter Collection Register</h3>
                <p className="text-xs text-slate-500">Aggregated real-time receipts collected across payment modes today.</p>
              </div>
              <Badge variant="teal">Total: {formatCurrency(dailyCollection.totalAmount)}</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
              <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 block font-medium">UPI / QR</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatCurrency(dailyCollection.byMode?.UPI || 0)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 block font-medium">Cash Drawer</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatCurrency(dailyCollection.byMode?.CASH || 0)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 block font-medium">Cheque / DD</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatCurrency(dailyCollection.byMode?.CHEQUE || 0)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 block font-medium">Debit/Credit Card</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatCurrency(dailyCollection.byMode?.CARD || 0)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 block font-medium">Net Banking</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatCurrency(dailyCollection.byMode?.NET_BANKING || 0)}
                </span>
              </div>
            </div>
          </Card>

          {/* Monthly P&L Overview */}
          <Card className="p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Institutional Income Statement (P&L Breakdown)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income Heads */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block border-b pb-1">
                  Operating Incomes (Credit)
                </span>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Student Tuition & Composite Fees</span>
                    <span className="font-mono font-bold text-emerald-700">{formatCurrency(totalIncome)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-700 border-t border-dashed">
                    <span>Other Academic & Extracurricular Incomes</span>
                    <span className="font-mono font-bold text-emerald-700">₹0</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-black text-slate-900 border-t">
                    <span>Total Operational Income</span>
                    <span className="font-mono text-emerald-700">{formatCurrency(totalIncome)}</span>
                  </div>
                </div>
              </div>

              {/* Expense Heads */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block border-b pb-1">
                  Operating Expenditures (Debit)
                </span>
                <div className="space-y-1 text-xs">
                  {vouchers.slice(0, 4).map((v) => (
                    <div key={v.id} className="flex justify-between py-1 text-slate-700">
                      <span className="truncate max-w-[200px]">{v.title}</span>
                      <span className="font-mono font-bold text-rose-700">-{formatCurrency(v.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1.5 font-black text-slate-900 border-t">
                    <span>Total Operating Expenditures</span>
                    <span className="font-mono text-rose-700">-{formatCurrency(totalExpenses)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Net Operating Surplus / (Deficit)
                </span>
                <p className="text-xs text-slate-500 mt-0.5">Calculated from verified General Ledger entries</p>
              </div>
              <span
                className={`text-2xl font-black font-mono ${netSurplus >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
              >
                {formatCurrency(netSurplus)}
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 1: RECORD EXPENSE VOUCHER */}
      {isVoucherModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsVoucherModalOpen(false)}
          title="Record Approved Expense Voucher"
        >
          <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Category *</label>
                <select
                  className="w-full px-3 py-2 border rounded font-medium bg-white"
                  value={voucherData.categoryId}
                  onChange={(e) => setVoucherData({ ...voucherData, categoryId: e.target.value })}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Title / Item *</label>
                <input
                  type="text"
                  placeholder="e.g. Science Lab Consumables"
                  className="w-full px-3 py-2 border rounded bg-white font-medium"
                  value={voucherData.title}
                  onChange={(e) => setVoucherData({ ...voucherData, title: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Vendor / Payee Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Scientific Supplies"
                  className="w-full px-3 py-2 border rounded bg-white"
                  value={voucherData.vendorName}
                  onChange={(e) => setVoucherData({ ...voucherData, vendorName: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vendor Invoice #</label>
                <input
                  type="text"
                  placeholder="e.g. INV-9842"
                  className="w-full px-3 py-2 border rounded bg-white font-mono"
                  value={voucherData.vendorInvoice}
                  onChange={(e) => setVoucherData({ ...voucherData, vendorInvoice: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border rounded font-mono font-bold text-sm bg-white"
                  value={voucherData.amount}
                  onChange={(e) => setVoucherData({ ...voucherData, amount: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Disbursed From Account *</label>
                <select
                  className="w-full px-3 py-2 border rounded font-medium bg-white"
                  value={voucherData.bankAccountId}
                  onChange={(e) => setVoucherData({ ...voucherData, bankAccountId: e.target.value })}
                  required
                >
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} (Bal: {formatCurrency(acc.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
              <select
                className="w-full px-3 py-2 border rounded font-medium bg-white"
                value={voucherData.paymentMode}
                onChange={(e) => setVoucherData({ ...voucherData, paymentMode: e.target.value })}
              >
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                <option value="CHEQUE">Bank Cheque</option>
                <option value="CASH">Counter Cash Payout</option>
                <option value="UPI">Institutional UPI</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsVoucherModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isProcessing}>
                {isProcessing ? 'Recording Voucher...' : `Approve & Disburse ₹${voucherData.amount.toLocaleString('en-IN')}`}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: ADD BANK ACCOUNT */}
      {isAccountModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAccountModalOpen(false)}
          title="Add Institutional Bank / Cash Account"
        >
          <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Display Name *</label>
                <input
                  type="text"
                  placeholder="e.g. SBI Fee Collection Account"
                  className="w-full px-3 py-2 border rounded font-medium bg-white"
                  value={accountData.accountName}
                  onChange={(e) => setAccountData({ ...accountData, accountName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Type *</label>
                <select
                  className="w-full px-3 py-2 border rounded font-medium bg-white"
                  value={accountData.accountType}
                  onChange={(e) => setAccountData({ ...accountData, accountType: e.target.value })}
                >
                  <option value="BANK">Bank Account</option>
                  <option value="CASH">Cash Register / Box</option>
                  <option value="PETTY_CASH">Petty Cash Drawer</option>
                </select>
              </div>
            </div>

            {accountData.accountType === 'BANK' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bank Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. State Bank of India"
                      className="w-full px-3 py-2 border rounded bg-white"
                      value={accountData.bankName}
                      onChange={(e) => setAccountData({ ...accountData, bankName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Account Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. 502000849201"
                      className="w-full px-3 py-2 border rounded bg-white font-mono"
                      value={accountData.accountNumber}
                      onChange={(e) => setAccountData({ ...accountData, accountNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SBIN0001234"
                      className="w-full px-3 py-2 border rounded bg-white font-mono uppercase"
                      value={accountData.ifscCode}
                      onChange={(e) => setAccountData({ ...accountData, ifscCode: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Branch Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Sector 62, Noida"
                      className="w-full px-3 py-2 border rounded bg-white"
                      value={accountData.branch}
                      onChange={(e) => setAccountData({ ...accountData, branch: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Opening Balance (₹) *</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border rounded font-mono font-bold text-sm bg-white"
                value={accountData.openingBalance}
                onChange={(e) => setAccountData({ ...accountData, openingBalance: Number(e.target.value) })}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsAccountModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isProcessing}>
                {isProcessing ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: RECONCILE BANK */}
      {isReconModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsReconModalOpen(false)}
          title="Record Bank Statement Reconciliation"
        >
          <form onSubmit={handleReconcile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Bank Account *</label>
              <select
                className="w-full px-3 py-2 border rounded font-medium bg-white"
                value={reconData.bankAccountId}
                onChange={(e) => setReconData({ ...reconData, bankAccountId: e.target.value })}
                required
              >
                {bankAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountName} (Ledger Bal: {formatCurrency(acc.currentBalance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Statement Date *</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded bg-white font-medium"
                  value={reconData.statementDate}
                  onChange={(e) => setReconData({ ...reconData, statementDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Statement Closing Balance (₹) *</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded bg-white font-mono font-bold"
                  value={reconData.closingBalance}
                  onChange={(e) =>
                    setReconData({
                      ...reconData,
                      closingBalance: Number(e.target.value),
                      reconciledAmount: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Auditor Reconciliation Notes</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border rounded bg-white"
                value={reconData.notes}
                onChange={(e) => setReconData({ ...reconData, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsReconModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isProcessing}>
                {isProcessing ? 'Recording...' : 'Submit Reconciliation'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
