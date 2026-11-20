import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PRINCIPAL'];
    if (!ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only authorized finance staff can record expense vouchers.' },
        { status: 403 }
      );
    }

    const { categoryId, title, vendorName, amount, paymentMode, notes } = await req.json();

    const parsedAmount = Number(amount);
    if (!categoryId || !title || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Category, title, and a positive amount are required.' },
        { status: 400 }
      );
    }

    const voucherNo = `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const voucher = await prisma.expenseVoucher.create({
      data: {
        voucherNumber: voucherNo,
        categoryId,
        title,
        vendorName,
        amount: Number(amount),
        paymentMode: paymentMode || 'BANK_TRANSFER',
        approvedBy: `${user.firstName} ${user.lastName} (${user.role})`,
        notes,
      },
      include: { category: true },
    });

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'CREATE_EXPENSE_VOUCHER',
      module: 'FINANCE',
      recordId: voucher.id,
      newValue: `Created expense voucher ${voucherNo} for ₹ ${amount} (${title})`,
    });

    return NextResponse.json({ success: true, voucher });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
