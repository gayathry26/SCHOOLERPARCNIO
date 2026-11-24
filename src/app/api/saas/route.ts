import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const [schools, plans, invoices, users] = await Promise.all([
      prisma.school.findMany({
        include: {
          _count: {
            select: {
              users: true,
              branches: true,
              academicYears: true,
              classes: true,
            },
          },
          subscriptionInvoices: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscriptionPlan.findMany({
        orderBy: { pricePerYear: 'asc' },
      }),
      prisma.subscriptionInvoice.findMany({
        include: { school: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.user.findMany({
        select: { id: true, schoolId: true, role: true },
      }),
    ]);

    // Compute live per-school analytics
    const enrichedSchools = schools.map((s) => {
      const schoolUsers = users.filter((u) => u.schoolId === s.id);
      const studentCount = schoolUsers.filter((u) => u.role === 'STUDENT').length;
      const staffCount = schoolUsers.filter((u) =>
        ['TEACHER', 'CLASS_TEACHER', 'HR_MANAGER', 'ACCOUNTANT', 'PRINCIPAL', 'VICE_PRINCIPAL', 'LIBRARIAN'].includes(u.role)
      ).length;

      return {
        ...s,
        liveMetrics: {
          students: studentCount,
          staff: staffCount,
          studentCapacityPct: s.maxStudents > 0 ? Math.round((studentCount / s.maxStudents) * 100) : 0,
        },
      };
    });

    const totalStudents = users.filter((u) => u.role === 'STUDENT').length;
    const totalStaff = users.filter((u) =>
      ['TEACHER', 'CLASS_TEACHER', 'HR_MANAGER', 'ACCOUNTANT', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(u.role)
    ).length;

    const totalRevenue = invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.amount, 0);

    return NextResponse.json({
      schools: enrichedSchools,
      plans,
      invoices,
      kpis: {
        totalSchools: schools.length,
        activeSchools: schools.filter((s) => s.status === 'ACTIVE').length,
        suspendedSchools: schools.filter((s) => s.status === 'SUSPENDED').length,
        totalPlatformStudents: totalStudents,
        totalPlatformStaff: totalStaff,
        totalPaidRevenue: totalRevenue,
        systemHealth: 'OPERATIONAL',
      },
    });
  } catch (error: any) {
    console.error('SaaS API GET error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // ----------------------------------------------------
    // 1. REGISTER NEW INSTITUTION (ONBOARDING)
    // ----------------------------------------------------
    if (action === 'REGISTER_SCHOOL') {
      const {
        name,
        tenantCode,
        board,
        affiliationNo,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        subscriptionPlan = 'BASIC',
        maxStudents = 500,
        maxStaff = 50,
        adminFirstName,
        adminLastName,
        adminEmail,
        adminPassword = 'password123',
        themeColor = '#990000',
      } = body;

      if (!name || !tenantCode || !adminEmail) {
        return NextResponse.json({ error: 'School name, tenant code, and admin email are required' }, { status: 400 });
      }

      const formattedTenantCode = tenantCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');

      // Check tenant code uniqueness
      const existing = await prisma.school.findFirst({
        where: { tenantCode: formattedTenantCode },
      });
      if (existing) {
        return NextResponse.json({ error: `Tenant code "${formattedTenantCode}" is already in use by another school` }, { status: 409 });
      }

      const planConfig = await prisma.subscriptionPlan.findUnique({
        where: { code: subscriptionPlan },
      });

      const schoolId = `sch_${formattedTenantCode.toLowerCase()}_${Date.now().toString().slice(-4)}`;

      // 1. Create School Record
      const newSchool = await prisma.school.create({
        data: {
          id: schoolId,
          tenantCode: formattedTenantCode,
          name,
          board: board || 'CBSE',
          affiliationNo: affiliationNo || `AFF/${formattedTenantCode}/2026`,
          email: email || adminEmail,
          phone: phone || '+91 11 4000 0000',
          address: address || 'Campus Plot 1',
          city: city || 'New Delhi',
          state: state || 'Delhi',
          pincode: pincode || '110001',
          themeColor: themeColor || '#990000',
          status: 'ACTIVE',
          subscriptionPlan,
          subscriptionStatus: 'ACTIVE',
          maxStudents: planConfig?.maxStudents || parseInt(maxStudents) || 500,
          maxStaff: planConfig?.maxStaff || parseInt(maxStaff) || 50,
          enabledModules: planConfig?.allowedModules || 'ALL',
          onboardingStatus: 'COMPLETED',
          contactPersonName: `${adminFirstName || 'Admin'} ${adminLastName || ''}`.trim(),
          contactPersonEmail: adminEmail,
          contactPersonPhone: phone,
        },
      });

      // 2. Create Initial School Admin Account
      const passwordHash = await hashPassword(adminPassword);
      const adminUser = await prisma.user.create({
        data: {
          schoolId: newSchool.id,
          email: adminEmail,
          username: `admin.${formattedTenantCode.toLowerCase()}`,
          passwordHash,
          role: 'SCHOOL_ADMIN',
          firstName: adminFirstName || 'School',
          lastName: adminLastName || 'Admin',
          phone: phone || '+91 99000 00000',
        },
      });

      // 3. Generate Initial Subscription Invoice
      const invoiceNo = `INV-${formattedTenantCode}-${new Date().getFullYear()}-01`;
      const invoice = await prisma.subscriptionInvoice.create({
        data: {
          invoiceNumber: invoiceNo,
          schoolId: newSchool.id,
          planCode: subscriptionPlan,
          amount: planConfig?.pricePerYear || 45000,
          currency: 'INR',
          status: 'PAID',
          billingPeriod: `Annual Session ${new Date().getFullYear()}–${new Date().getFullYear() + 1}`,
          dueDate: new Date(Date.now() + 86400000 * 14),
          paidAt: new Date(),
          paymentMethod: 'ONBOARDING_PROMO',
          transactionRef: `TXN-${Date.now()}`,
        },
      });

      // 4. Create Initial Academic Session for the School
      await prisma.academicYear.create({
        data: {
          schoolId: newSchool.id,
          name: `${new Date().getFullYear()}–${new Date().getFullYear() + 1}`,
          startDate: new Date(`${new Date().getFullYear()}-04-01`),
          endDate: new Date(`${new Date().getFullYear() + 1}-03-31`),
          isCurrent: true,
          status: 'ACTIVE',
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'REGISTER_NEW_SAAS_SCHOOL',
        module: 'SETTINGS',
        recordId: newSchool.id,
        newValue: `Onboarded school ${name} (Tenant: ${formattedTenantCode}, Plan: ${subscriptionPlan}, Admin: ${adminEmail})`,
      });

      return NextResponse.json({
        success: true,
        school: newSchool,
        adminUser: { id: adminUser.id, email: adminUser.email },
        invoice,
      });
    }

    // ----------------------------------------------------
    // 2. UPDATE SCHOOL STATUS (APPROVE / SUSPEND)
    // ----------------------------------------------------
    if (action === 'UPDATE_SCHOOL_STATUS') {
      const { schoolId, status } = body;
      if (!schoolId || !status) {
        return NextResponse.json({ error: 'School ID and status are required' }, { status: 400 });
      }

      const updated = await prisma.school.update({
        where: { id: schoolId },
        data: { status },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'UPDATE_SCHOOL_STATUS',
        module: 'SETTINGS',
        recordId: schoolId,
        newValue: `Changed institutional status of ${updated.name} to ${status}`,
      });

      return NextResponse.json({ success: true, school: updated });
    }

    // ----------------------------------------------------
    // 3. UPDATE SUBSCRIPTION PLAN & CAPACITY
    // ----------------------------------------------------
    if (action === 'UPDATE_SUBSCRIPTION_PLAN') {
      const { schoolId, planCode, maxStudents, maxStaff, enabledModules } = body;
      if (!schoolId || !planCode) {
        return NextResponse.json({ error: 'School ID and plan code are required' }, { status: 400 });
      }

      const planConfig = await prisma.subscriptionPlan.findUnique({ where: { code: planCode } });

      const updated = await prisma.school.update({
        where: { id: schoolId },
        data: {
          subscriptionPlan: planCode,
          maxStudents: parseInt(maxStudents) || planConfig?.maxStudents || 1000,
          maxStaff: parseInt(maxStaff) || planConfig?.maxStaff || 100,
          enabledModules: enabledModules || planConfig?.allowedModules || 'ALL',
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'UPDATE_SCHOOL_SUBSCRIPTION_PLAN',
        module: 'SETTINGS',
        recordId: schoolId,
        newValue: `Updated plan for ${updated.name} to ${planCode} (Max Students: ${updated.maxStudents})`,
      });

      return NextResponse.json({ success: true, school: updated });
    }

    // ----------------------------------------------------
    // 4. GENERATE SUBSCRIPTION INVOICE
    // ----------------------------------------------------
    if (action === 'GENERATE_INVOICE') {
      const { schoolId, planCode, amount, billingPeriod, dueDate } = body;
      if (!schoolId || !amount) {
        return NextResponse.json({ error: 'School ID and amount are required' }, { status: 400 });
      }

      const school = await prisma.school.findUnique({ where: { id: schoolId } });
      if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });

      const invNumber = `INV-${school.tenantCode}-${Date.now().toString().slice(-6)}`;

      const invoice = await prisma.subscriptionInvoice.create({
        data: {
          invoiceNumber: invNumber,
          schoolId,
          planCode: planCode || school.subscriptionPlan,
          amount: parseFloat(amount),
          currency: 'INR',
          status: 'PENDING',
          billingPeriod: billingPeriod || 'Annual Renewal',
          dueDate: new Date(dueDate || Date.now() + 86400000 * 30),
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'GENERATE_SUBSCRIPTION_INVOICE',
        module: 'FINANCE',
        recordId: invoice.id,
        newValue: `Generated subscription invoice ${invNumber} for ₹ ${amount} to ${school.name}`,
      });

      return NextResponse.json({ success: true, invoice });
    }

    // ----------------------------------------------------
    // 5. RECORD INVOICE PAYMENT
    // ----------------------------------------------------
    if (action === 'RECORD_PAYMENT') {
      const { invoiceId, paymentMethod, transactionRef } = body;
      if (!invoiceId) return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });

      const invoice = await prisma.subscriptionInvoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

      const updated = await prisma.subscriptionInvoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentMethod: paymentMethod || 'BANK_TRANSFER',
          transactionRef: transactionRef || `TXN-${Date.now()}`,
        },
      });

      // Extend subscription renewal
      await prisma.school.update({
        where: { id: invoice.schoolId },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionRenewsAt: new Date(Date.now() + 86400000 * 365),
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'RECORD_SUBSCRIPTION_PAYMENT',
        module: 'FINANCE',
        recordId: invoiceId,
        newValue: `Recorded payment for invoice ${invoice.invoiceNumber} (₹ ${invoice.amount})`,
      });

      return NextResponse.json({ success: true, invoice: updated });
    }

    return NextResponse.json({ error: 'Invalid SaaS action' }, { status: 400 });
  } catch (error: any) {
    console.error('SaaS API POST error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
