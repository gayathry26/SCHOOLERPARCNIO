import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      invoiceId,
      amount,
      paymentMode,
      transactionRef,
      chequeNumber,
      chequeDate,
      bankName,
      upiId,
      bankAccountId,
      notes,
      idempotencyKey,
    } = body;

    const parsedAmount = Number(amount);
    if (!invoiceId || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid invoice or payment amount. Must be greater than 0.' },
        { status: 400 }
      );
    }

    // Idempotency check: prevent duplicate payments
    const effectiveIdempotencyKey = idempotencyKey || (transactionRef ? `IDEMP-${transactionRef}` : null);
    if (effectiveIdempotencyKey) {
      const existingReceipt = await prisma.feePaymentReceipt.findFirst({
        where: {
          OR: [
            { idempotencyKey: effectiveIdempotencyKey },
            ...(transactionRef ? [{ transactionRef }] : []),
          ],
        },
      });

      if (existingReceipt) {
        return NextResponse.json({
          success: true,
          message: 'Payment already processed (Idempotent response)',
          receipt: existingReceipt,
          duplicatePrevented: true,
        });
      }
    }

    // Fetch invoice with student and relations
    const invoice = await prisma.studentFeeInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        student: {
          include: {
            user: true,
            parents: { include: { parent: { include: { user: true } } } },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
    }

    // Role-based permission check
    const STAFF_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PRINCIPAL'];
    const isStaff = STAFF_ROLES.includes(user.role);
    const isOwnerStudent = user.role === 'STUDENT' && invoice.student.userId === user.id;
    const isOwnerParent =
      user.role === 'PARENT' &&
      invoice.student.parents.some((p) => p.parent?.userId === user.id);

    if (!isStaff && !isOwnerStudent && !isOwnerParent) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to pay or record payments for this invoice.' },
        { status: 403 }
      );
    }

    // Calculate effective total due (total + lateFee - paidAmount)
    const effectiveTotal = invoice.totalAmount + (invoice.lateFeeAmount || 0);
    const remainingDue = effectiveTotal - invoice.paidAmount;

    if (parsedAmount > remainingDue + 0.01) {
      return NextResponse.json(
        { error: `Payment amount (₹${parsedAmount}) exceeds the remaining balance due of ₹${remainingDue}.` },
        { status: 400 }
      );
    }

    // Determine target Bank / Cash account
    let selectedAccountId = bankAccountId;
    if (!selectedAccountId) {
      const defaultAccount = await prisma.bankAccount.findFirst({
        where: {
          schoolId: invoice.schoolId || user.schoolId || 'edvonest-main-school',
          accountType: paymentMode === 'CASH' ? 'CASH' : 'BANK',
          isActive: true,
        },
      });
      selectedAccountId = defaultAccount?.id || null;
    }

    const curYear = new Date().getFullYear();
    const receiptNo = `RCP-${curYear}-${Math.floor(10000 + Math.random() * 90000)}`;
    const effectiveTxnRef = transactionRef || `TXN-${Date.now().toString().slice(-8)}`;
    const newPaidAmount = invoice.paidAmount + parsedAmount;
    const newStatus =
      newPaidAmount >= effectiveTotal ? 'PAID' : newPaidAmount > 0 ? 'PARTIALLY_PAID' : 'PENDING';

    // Atomic Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Receipt Record
      const receipt = await tx.feePaymentReceipt.create({
        data: {
          schoolId: invoice.schoolId || user.schoolId || 'edvonest-main-school',
          receiptNumber: receiptNo,
          invoiceId: invoice.id,
          bankAccountId: selectedAccountId,
          amountPaid: parsedAmount,
          paymentMode: paymentMode || 'UPI',
          transactionRef: effectiveTxnRef,
          chequeNumber: chequeNumber || null,
          chequeDate: chequeDate ? new Date(chequeDate) : null,
          bankName: bankName || null,
          upiId: upiId || null,
          gatewayReference: paymentMode === 'RAZORPAY' ? `rzp_order_${Date.now()}` : null,
          razorpayPaymentId: paymentMode === 'RAZORPAY' ? `pay_rzp_${Date.now()}` : null,
          razorpayOrderId: paymentMode === 'RAZORPAY' ? `order_rzp_${Date.now()}` : null,
          status: 'SUCCESS',
          collectedBy: `${user.firstName} ${user.lastName} (${user.role})`,
          notes: notes || 'Counter / Online Fee Payment',
          idempotencyKey: effectiveIdempotencyKey,
        },
      });

      // 2. Update Invoice State
      const updatedInvoice = await tx.studentFeeInvoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
      });

      // 3. Increment Bank or Cash Account Balance
      if (selectedAccountId) {
        await tx.bankAccount.update({
          where: { id: selectedAccountId },
          data: {
            currentBalance: { increment: parsedAmount },
          },
        });
      }

      // 4. Record General Ledger Income Entry
      await tx.financialLedgerEntry.create({
        data: {
          schoolId: invoice.schoolId || user.schoolId || 'edvonest-main-school',
          entryNumber: `LED-${curYear}-${Math.floor(1000 + Math.random() * 9000)}`,
          entryType: 'INCOME',
          categoryName: 'Tuition & Academic Fees',
          amount: parsedAmount,
          paymentMode: paymentMode || 'UPI',
          bankAccountId: selectedAccountId,
          referenceType: 'FEE_PAYMENT',
          referenceId: receipt.id,
          description: `Fee collection for ${invoice.student.user.firstName} ${invoice.student.user.lastName} (Invoice: ${invoice.invoiceNumber})`,
          createdById: user.id,
        },
      });

      // 5. Notify Parent
      const parentUser = invoice.student.parents[0]?.parent?.user;
      if (parentUser) {
        await tx.notification.create({
          data: {
            userId: parentUser.id,
            title: 'Fee Payment Received',
            message: `Payment of ₹${parsedAmount.toLocaleString('en-IN')} for invoice ${invoice.invoiceNumber} (${invoice.title}) received successfully. Receipt #${receiptNo}.`,
            type: 'FEE',
            link: '/dashboard/fees',
          },
        });
      }

      return { receipt, updatedInvoice };
    });

    // 6. Audit Log
    await logAudit({
      schoolId: invoice.schoolId || user.schoolId || 'edvonest-main-school',
      userId: user.id,
      action: 'RECORD_FEE_PAYMENT',
      module: 'FEES_FINANCE',
      recordId: result.receipt.id,
      newValue: `Recorded fee receipt ${receiptNo} for ₹${parsedAmount} via ${paymentMode} on invoice ${invoice.invoiceNumber}`,
    });

    return NextResponse.json({
      success: true,
      receipt: result.receipt,
      newStatus,
      newPaidAmount,
      invoice: result.updatedInvoice,
    });
  } catch (error: any) {
    console.error('Payment execution error:', error);
    return NextResponse.json({ error: error.message || 'Payment execution failed' }, { status: 500 });
  }
}
