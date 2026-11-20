import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ALLOWED_STAFF = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PRINCIPAL'];
    if (!ALLOWED_STAFF.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only authorized finance staff can issue payment refunds.' },
        { status: 403 }
      );
    }

    const { receiptId, refundAmount, reason, refundMode } = await req.json();

    const parsedRefundAmount = Number(refundAmount);
    if (!receiptId || isNaN(parsedRefundAmount) || parsedRefundAmount <= 0) {
      return NextResponse.json(
        { error: 'Receipt ID and a positive refund amount are required.' },
        { status: 400 }
      );
    }

    const receipt = await prisma.feePaymentReceipt.findUnique({
      where: { id: receiptId },
      include: {
        invoice: {
          include: {
            student: { include: { user: true } },
          },
        },
        bankAccount: true,
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    // Tenant boundary check
    if (user.role !== 'SUPER_ADMIN' && user.schoolId && receipt.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Forbidden: Cross-tenant access denied' }, { status: 403 });
    }

    const maxRefundable = receipt.amountPaid - (receipt.refundedAmount || 0);
    if (parsedRefundAmount > maxRefundable + 0.01) {
      return NextResponse.json(
        {
          error: `Refund amount (₹${parsedRefundAmount}) exceeds max available refundable balance of ₹${maxRefundable}.`,
        },
        { status: 400 }
      );
    }

    const curYear = new Date().getFullYear();
    const refundNo = `RFD-${curYear}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRefundedAmount = (receipt.refundedAmount || 0) + parsedRefundAmount;
    const isFullRefund = Math.abs(newRefundedAmount - receipt.amountPaid) < 0.01;
    const receiptStatus = isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

    // Atomic Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create PaymentRefund record
      const refundRecord = await tx.paymentRefund.create({
        data: {
          schoolId: receipt.schoolId || user.schoolId || 'edvonest-main-school',
          receiptId: receipt.id,
          refundNumber: refundNo,
          amount: parsedRefundAmount,
          refundMode: refundMode || 'BANK_TRANSFER',
          reason: reason || 'Administrative fee adjustment / concession refund',
          processedBy: `${user.firstName} ${user.lastName} (${user.role})`,
          approvedBy: `${user.firstName} ${user.lastName}`,
          status: 'COMPLETED',
          transactionRef: `REV-${Date.now().toString().slice(-8)}`,
        },
      });

      // 2. Update receipt refundedAmount & status
      await tx.feePaymentReceipt.update({
        where: { id: receipt.id },
        data: {
          refundedAmount: newRefundedAmount,
          status: receiptStatus,
        },
      });

      // 3. Revert invoice paidAmount & update invoice status
      const updatedPaidAmount = Math.max(0, receipt.invoice.paidAmount - parsedRefundAmount);
      const effectiveTotal = receipt.invoice.totalAmount + (receipt.invoice.lateFeeAmount || 0);
      const updatedInvoiceStatus =
        updatedPaidAmount >= effectiveTotal
          ? 'PAID'
          : updatedPaidAmount > 0
          ? 'PARTIALLY_PAID'
          : 'PENDING';

      const updatedInvoice = await tx.studentFeeInvoice.update({
        where: { id: receipt.invoice.id },
        data: {
          paidAmount: updatedPaidAmount,
          status: updatedInvoiceStatus,
        },
      });

      // 4. Decrement bank/cash account balance
      if (receipt.bankAccountId) {
        await tx.bankAccount.update({
          where: { id: receipt.bankAccountId },
          data: {
            currentBalance: { decrement: parsedRefundAmount },
          },
        });
      }

      // 5. Create general ledger expense entry for the refund reversal
      await tx.financialLedgerEntry.create({
        data: {
          schoolId: receipt.schoolId || user.schoolId || 'edvonest-main-school',
          entryNumber: `LED-${curYear}-${Math.floor(1000 + Math.random() * 9000)}`,
          entryType: 'EXPENSE',
          categoryName: 'Fee Refund & Reversals',
          amount: parsedRefundAmount,
          paymentMode: refundMode || 'BANK_TRANSFER',
          bankAccountId: receipt.bankAccountId,
          referenceType: 'REFUND',
          referenceId: refundRecord.id,
          description: `Fee refund issued for receipt ${receipt.receiptNumber} (${receipt.invoice.student.user.firstName} ${receipt.invoice.student.user.lastName}) - Reason: ${reason}`,
          createdById: user.id,
        },
      });

      return { refundRecord, updatedInvoice, receiptStatus };
    });

    // 6. Audit Log
    await logAudit({
      schoolId: receipt.schoolId || user.schoolId || 'edvonest-main-school',
      userId: user.id,
      action: 'PROCESS_FEE_REFUND',
      module: 'FEES_FINANCE',
      recordId: result.refundRecord.id,
      newValue: `Issued refund ${refundNo} of ₹${parsedRefundAmount} for receipt ${receipt.receiptNumber}. New receipt status: ${result.receiptStatus}`,
    });

    return NextResponse.json({
      success: true,
      message: `Refund of ₹${parsedRefundAmount} processed successfully.`,
      refund: result.refundRecord,
      updatedInvoice: result.updatedInvoice,
      receiptStatus: result.receiptStatus,
    });
  } catch (error: any) {
    console.error('Refund processing error:', error);
    return NextResponse.json({ error: error.message || 'Refund processing failed' }, { status: 500 });
  }
}
