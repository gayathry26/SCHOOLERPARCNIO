import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { InventoryClient } from './InventoryClient';

export default async function InventoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'INVENTORY')) redirect('/dashboard');

  const [
    categories,
    assets,
    vendors,
    purchaseRequests,
    purchaseOrders,
    stockMovements,
    maintenanceLogs,
    auditSessions,
    departments,
    staffUsers,
  ] = await Promise.all([
    prisma.assetCategory.findMany({ orderBy: { name: 'asc' } }),
    prisma.assetItem.findMany({
      include: {
        category: true,
        vendor: true,
        assignedDepartment: true,
        issues: {
          include: { issuedTo: true },
          where: { returnDate: null },
        },
        movements: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        maintenanceLogs: {
          take: 5,
          orderBy: { serviceDate: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.assetVendor.findMany({ orderBy: { name: 'asc' } }),
    prisma.purchaseRequest.findMany({
      include: { requestedBy: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.purchaseOrder.findMany({
      include: {
        vendor: true,
        items: true,
        grns: true,
      },
      orderBy: { orderDate: 'desc' },
    }),
    prisma.stockMovement.findMany({
      include: { assetItem: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.assetMaintenanceLog.findMany({
      include: { assetItem: true },
      orderBy: { serviceDate: 'desc' },
    }),
    prisma.stockAuditSession.findMany({
      include: {
        items: {
          include: { assetItem: true },
        },
      },
      orderBy: { auditDate: 'desc' },
    }),
    prisma.department.findMany({ orderBy: { name: 'asc' } }),
    prisma.user.findMany({
      where: {
        role: { in: ['TEACHER', 'CLASS_TEACHER', 'HR_MANAGER', 'ACCOUNTANT', 'LIBRARIAN', 'SCHOOL_ADMIN', 'PRINCIPAL'] },
      },
      select: { id: true, firstName: true, lastName: true, role: true },
    }),
  ]);

  return (
    <InventoryClient
      categories={categories}
      initialAssets={assets}
      vendors={vendors}
      initialRequests={purchaseRequests}
      initialPurchaseOrders={purchaseOrders}
      initialMovements={stockMovements}
      initialMaintenanceLogs={maintenanceLogs}
      initialAuditSessions={auditSessions}
      departments={departments}
      staffUsers={staffUsers}
      userRole={user.role}
    />
  );
}
