'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { formatDate } from '@/lib/formatters';

export const AuditLogsClient: React.FC<{ logs: any[] }> = ({ logs }) => {
  const columns: Column<any>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (row) => (
        <span className="text-xs font-mono text-slate-600">
          {formatDate(row.timestamp, 'dd MMM yyyy, hh:mm:ss a')}
        </span>
      ),
    },
    {
      key: 'user',
      header: 'Actor / User',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-xs">
            {row.user?.firstName} {row.user?.lastName}
          </span>
          <span className="block text-[10px] text-slate-400 font-mono">
            Role: {row.user?.role || 'SYSTEM'}
          </span>
        </div>
      ),
    },
    {
      key: 'module',
      header: 'Module',
      render: (row) => <Badge variant="slate">{row.module}</Badge>,
    },
    {
      key: 'action',
      header: 'Action Event',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900 text-xs">{row.action}</span>
      ),
    },
    {
      key: 'newValue',
      header: 'Audit Description / Details',
      render: (row) => (
        <span className="text-xs text-slate-700 leading-relaxed">
          {row.newValue || row.previousValue || 'Event Executed'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Institutional Security &amp; Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Immutable system logs tracking financial changes, examination lock events, and attendance modifications.
          </p>
        </div>
        <Badge variant="emerald">{logs.length} Logged Events</Badge>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        searchPlaceholder="Search audit events by action, module, or user..."
        exportFilename="edvonest_audit_logs"
      />
    </div>
  );
};
