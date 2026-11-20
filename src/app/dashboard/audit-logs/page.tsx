import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { AuditLogsClient } from './AuditLogsClient';

export default async function AuditLogsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'AUDIT_LOGS')) redirect('/dashboard');

  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { timestamp: 'desc' },
    take: 100,
  });

  return <AuditLogsClient logs={logs} />;
}
