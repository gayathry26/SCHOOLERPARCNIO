'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/formatters';

export interface ChartsProps {
  totalCollected: number;
  totalPending: number;
  totalExpenses: number;
  attendancePresent?: number;
  attendanceAbsent?: number;
  attendanceLeave?: number;
}

const MONTHLY_COLLECTION_DATA = [
  { month: 'Apr', Collected: 145000, Pending: 25000 },
  { month: 'May', Collected: 180000, Pending: 35000 },
  { month: 'Jun', Collected: 160000, Pending: 30000 },
  { month: 'Jul', Collected: 210000, Pending: 40000 },
  { month: 'Aug', Collected: 195000, Pending: 28000 },
  { month: 'Sep', Collected: 240000, Pending: 45000 },
];

export const RoleDashboardCharts: React.FC<ChartsProps> = ({
  totalCollected,
  totalPending,
  totalExpenses,
  attendancePresent = 42,
  attendanceAbsent = 2,
  attendanceLeave = 1,
}) => {
  const attendancePieData = [
    { name: 'Present', value: attendancePresent, color: '#35B84A' },
    { name: 'Absent', value: attendanceAbsent, color: '#DC2626' },
    { name: 'On Leave', value: attendanceLeave, color: '#D97706' },
  ];

  const feeBarData = [
    { category: 'Fee Ledger', Collected: totalCollected, Pending: totalPending, Overdue: 35000 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Attendance Overview Chart */}
      <Card className="lg:col-span-5 flex flex-col justify-between">
        <CardHeader className="mb-2">
          <div>
            <CardTitle>Today&apos;s Attendance Overview</CardTitle>
            <p className="text-[11px] text-[#6B7C83] mt-0.5">
              Breakdown across Present, Absent, and On Leave
            </p>
          </div>
        </CardHeader>
        <div className="h-60 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  borderColor: '#E4EAEC',
                  fontSize: '11px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(value) => <span className="text-[#17313A] font-semibold">{value}</span>}
              />
              <Pie
                data={attendancePieData}
                innerRadius={50}
                outerRadius={78}
                paddingAngle={4}
                dataKey="value"
              >
                {attendancePieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="pt-2 border-t border-[#E4EAEC] grid grid-cols-3 text-center text-xs">
          <div>
            <p className="text-[#35B84A] font-bold">{attendancePresent}</p>
            <p className="text-[10px] text-[#6B7C83]">Present</p>
          </div>
          <div>
            <p className="text-[#DC2626] font-bold">{attendanceAbsent}</p>
            <p className="text-[10px] text-[#6B7C83]">Absent</p>
          </div>
          <div>
            <p className="text-[#D97706] font-bold">{attendanceLeave}</p>
            <p className="text-[10px] text-[#6B7C83]">Leave</p>
          </div>
        </div>
      </Card>

      {/* 2. Fee Collection Trend Chart */}
      <Card className="lg:col-span-7 flex flex-col justify-between">
        <CardHeader className="mb-2">
          <div>
            <CardTitle>Fee Collection &amp; Pending Dues</CardTitle>
            <p className="text-[11px] text-[#6B7C83] mt-0.5">
              Monthly collections vs outstanding balances (in ₹ INR)
            </p>
          </div>
        </CardHeader>
        <div className="h-60 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MONTHLY_COLLECTION_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#086A92" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#086A92" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4EAEC" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7C83' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#6B7C83' }}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip
                formatter={(val: any) => formatCurrency(Number(val))}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  borderColor: '#E4EAEC',
                  fontSize: '11px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="Collected"
                stroke="#086A92"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCollected)"
              />
              <Area
                type="monotone"
                dataKey="Pending"
                stroke="#D97706"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPending)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="pt-2 border-t border-[#E4EAEC] flex items-center justify-between text-xs px-2">
          <span className="text-[#6B7C83]">Total Collected (YTD): <strong className="text-[#086A92]">{formatCurrency(totalCollected)}</strong></span>
          <span className="text-[#6B7C83]">Outstanding: <strong className="text-[#D97706]">{formatCurrency(totalPending)}</strong></span>
        </div>
      </Card>
    </div>
  );
};
