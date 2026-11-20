'use client';

import React from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Receipt,
  CreditCard,
  TrendingUp,
  Download,
  PlusCircle,
  FileCheck2,
  CalendarCheck,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/formatters';

export interface AccountantDashboardProps {
  totalCollected: number;
  totalPending: number;
  totalExpenses: number;
  recentInvoices: any[];
}

export const AccountantDashboardView: React.FC<AccountantDashboardProps> = ({
  totalCollected,
  totalPending,
  totalExpenses,
  recentInvoices,
}) => {
  const todayCollection = 48500;
  const netOperatingSurplus = totalCollected - totalExpenses;

  return (
    <div className="space-y-6">
      {/* 4 Financial KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Counter Inflow"
          value={formatCurrency(todayCollection)}
          subtitle="14 Transactions recorded"
          icon={<DollarSign className="w-5 h-5" />}
          variant="green"
        />
        <StatCard
          title="Total Fee Collections (YTD)"
          value={formatCurrency(totalCollected)}
          subtitle="84% of expected collection"
          icon={<Receipt className="w-5 h-5" />}
          variant="blue"
        />
        <StatCard
          title="Outstanding Fee Dues"
          value={formatCurrency(totalPending)}
          subtitle="28 student accounts overdue"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Campus Operational Expenses"
          value={formatCurrency(totalExpenses)}
          subtitle={`Surplus: ${formatCurrency(netOperatingSurplus)}`}
          icon={<CreditCard className="w-5 h-5" />}
          variant="teal"
        />
      </div>

      {/* Accountant Fast Operations Bar */}
      <div className="bg-white border border-[#E4EAEC] rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[#17313A] uppercase tracking-wider">
            Finance &amp; Counter Operations
          </h3>
          <span className="text-[11px] text-[#6B7C83]">Accounting Fast Bar</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/dashboard/fees">
            <Button variant="primary" size="sm" className="w-full" leftIcon={<DollarSign className="w-3.5 h-3.5" />}>
              Collect Student Fee
            </Button>
          </Link>
          <Link href="/dashboard/finance">
            <Button variant="outline" size="sm" className="w-full" leftIcon={<Receipt className="w-3.5 h-3.5" />}>
              Record Expense Voucher
            </Button>
          </Link>
          <Link href="/dashboard/fees">
            <Button variant="outline" size="sm" className="w-full" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
              Create Fee Invoice
            </Button>
          </Link>
          <Link href="/dashboard/reports">
            <Button variant="outline" size="sm" className="w-full" leftIcon={<Download className="w-3.5 h-3.5" />}>
              Financial Statement
            </Button>
          </Link>
        </div>
      </div>

      {/* Payment Modes & Collection Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Payment Mode Distribution */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#086A92]" />
                <span>Payment Mode Breakdown</span>
              </CardTitle>
              <Badge variant="blue" size="xs">This Month</Badge>
            </CardHeader>
            <div className="space-y-3 text-xs">
              {[
                { mode: 'UPI & QR Terminal', amount: 285000, share: 51, color: 'bg-[#35B84A]' },
                { mode: 'Net Banking / NEFT / IMPS', amount: 142000, share: 25, color: 'bg-[#086A92]' },
                { mode: 'Credit / Debit Cards', amount: 80000, share: 14, color: 'bg-[#008C91]' },
                { mode: 'Cash Counter Deposits', amount: 53000, share: 10, color: 'bg-amber-500' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-[#F7FAFA] border border-[#E4EAEC] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17313A]">{item.mode}</span>
                    <span className="font-bold text-[#17313A]">{formatCurrency(item.amount)} ({item.share}%)</span>
                  </div>
                  <div className="w-full bg-[#E4EAEC] h-2 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Overdue Accounts & Collection Reminders */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>High-Value Pending Fee Dues</span>
              </CardTitle>
              <Link href="/dashboard/fees">
                <Button variant="ghost" size="xs">Send Reminders</Button>
              </Link>
            </CardHeader>
            <div className="space-y-2.5 text-xs">
              {[
                { student: 'Vivaan Saxena', class: 'Class 10-A', amount: 24500, days: '25 Days Overdue' },
                { student: 'Tanvi Joshi', class: 'Class 12-Science', amount: 28000, days: '18 Days Overdue' },
                { student: 'Kabir Malhotra', class: 'Class 8-B', amount: 16500, days: '12 Days Overdue' },
                { student: 'Ananya Sharma', class: 'Class 9-A', amount: 18500, days: '8 Days Overdue' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#17313A]">{item.student}</p>
                    <p className="text-[10px] text-[#6B7C83]">{item.class} • <span className="text-amber-800 font-semibold">{item.days}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#17313A]">{formatCurrency(item.amount)}</p>
                    <Link href="/dashboard/fees">
                      <Button variant="outline" size="xs">Collect</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Invoices Ledger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#086A92]" />
            <span>Recent Invoices &amp; Receipts Ledger</span>
          </CardTitle>
          <Link href="/dashboard/fees">
            <Button variant="ghost" size="xs">Complete Ledger</Button>
          </Link>
        </CardHeader>
        <div className="divide-y divide-[#E4EAEC]">
          {recentInvoices.length === 0 ? (
            <p className="text-xs text-[#6B7C83] py-4 text-center">No fee invoices recorded yet.</p>
          ) : (
            recentInvoices.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#17313A]">
                      {inv.student.user.firstName} {inv.student.user.lastName}
                    </p>
                    <span className="text-[10px] text-[#6B7C83]">#{inv.invoiceNumber}</span>
                  </div>
                  <p className="text-[10px] text-[#6B7C83]">
                    Created: {formatDate(inv.createdAt)} • Due: {formatDate(inv.dueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#17313A]">{formatCurrency(inv.totalAmount)}</p>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
