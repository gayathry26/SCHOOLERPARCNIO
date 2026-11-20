import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const status = searchParams.get('status');
    const schoolId = user.role === 'SUPER_ADMIN' ? searchParams.get('schoolId') || user.schoolId || 'edvonest-main-school' : user.schoolId || 'edvonest-main-school';

    // Base filter for invoices
    const invoiceWhere: any = { schoolId };
    if (status && status !== 'ALL') invoiceWhere.status = status;
    if (user.role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findFirst({ where: { userId: user.id } });
      if (studentProfile) invoiceWhere.studentId = studentProfile.id;
    } else if (user.role === 'PARENT') {
      const parentProfile = await prisma.parentProfile.findFirst({
        where: { userId: user.id },
        include: { students: true },
      });
      const studentIds = parentProfile?.students.map((s) => s.studentId) || [];
      invoiceWhere.studentId = { in: studentIds };
    }

    const [invoices, structures, concessions, receipts, feeCategories] = await Promise.all([
      prisma.studentFeeInvoice.findMany({
        where: invoiceWhere,
        include: {
          student: {
            include: {
              user: true,
              enrollments: {
                where: { status: 'ACTIVE' },
                include: { class: true, section: true },
                take: 1,
              },
            },
          },
          payments: {
            include: { refunds: true, bankAccount: true },
            orderBy: { paidAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.feeStructure.findMany({
        where: { schoolId },
        include: {
          items: { include: { category: true } },
          installments: { orderBy: { order: 'asc' } },
          class: true,
          academicYear: true,
        },
      }),
      prisma.studentFeeConcession.findMany({
        where: { schoolId },
        include: {
          student: {
            include: {
              user: true,
              enrollments: {
                where: { status: 'ACTIVE' },
                include: { class: true, section: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.feePaymentReceipt.findMany({
        where: { schoolId },
        include: {
          invoice: {
            include: {
              student: { include: { user: true } },
            },
          },
          refunds: true,
          bankAccount: true,
        },
        orderBy: { paidAt: 'desc' },
        take: 100,
      }),
      prisma.feeCategory.findMany(),
    ]);

    // Analytics Aggregations
    const totalExpected = invoices.reduce((acc, inv) => acc + inv.totalAmount + (inv.lateFeeAmount || 0), 0);
    const totalCollected = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
    const totalOutstanding = Math.max(0, totalExpected - totalCollected);
    const collectionPercentage = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    // Class-wise collection breakdown
    const classRevenueMap: Record<string, { className: string; expected: number; collected: number; students: number }> = {};
    invoices.forEach((inv) => {
      const className = inv.student?.enrollments?.[0]?.class?.name || 'General / Unallocated';
      if (!classRevenueMap[className]) {
        classRevenueMap[className] = { className, expected: 0, collected: 0, students: 0 };
      }
      classRevenueMap[className].expected += inv.totalAmount + (inv.lateFeeAmount || 0);
      classRevenueMap[className].collected += inv.paidAmount;
      classRevenueMap[className].students += 1;
    });

    return NextResponse.json({
      success: true,
      invoices,
      structures,
      concessions,
      receipts,
      categories: feeCategories,
      analytics: {
        totalExpected,
        totalCollected,
        totalOutstanding,
        collectionPercentage,
        classBreakdown: Object.values(classRevenueMap),
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter((i) => i.status === 'PAID').length,
        pendingInvoices: invoices.filter((i) => i.status === 'PENDING').length,
        overdueInvoices: invoices.filter((i) => i.status === 'OVERDUE').length,
      },
    });
  } catch (error: any) {
    console.error('Fees API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED_STAFF = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PRINCIPAL'];
    if (!ALLOWED_STAFF.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges.' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;
    const schoolId = user.schoolId || 'edvonest-main-school';

    // ----------------------------------------------------
    // ACTION 1: GENERATE_BATCH_INVOICES
    // Auto-generates student fee invoices for a class or entire school
    // Automatically applies student concessions (scholarships, sibling discounts)
    // ----------------------------------------------------
    if (action === 'GENERATE_BATCH_INVOICES') {
      const { classId, feeStructureId, title, dueDate } = body;

      if (!feeStructureId || !dueDate) {
        return NextResponse.json({ error: 'Fee Structure and Due Date are required.' }, { status: 400 });
      }

      const feeStructure = await prisma.feeStructure.findUnique({
        where: { id: feeStructureId },
        include: { items: { include: { category: true } } },
      });

      if (!feeStructure) {
        return NextResponse.json({ error: 'Fee Structure not found' }, { status: 404 });
      }

      // Base fee total from items
      const baseFeeAmount = feeStructure.items.reduce((sum, item) => sum + item.amount, 0);

      // Find target students
      const enrollmentWhere: any = { status: 'ACTIVE' };
      if (classId && classId !== 'ALL') {
        enrollmentWhere.classId = classId;
      }

      const activeEnrollments = await prisma.studentEnrollment.findMany({
        where: enrollmentWhere,
        include: {
          student: {
            include: {
              user: true,
              concessions: { where: { isActive: true } },
            },
          },
        },
      });

      if (activeEnrollments.length === 0) {
        return NextResponse.json({ error: 'No active students found matching criteria.' }, { status: 404 });
      }

      const curYear = new Date().getFullYear();
      const invoiceTitle = title || `${feeStructure.title} - Session ${curYear}`;
      const targetDueDate = new Date(dueDate);

      const generatedInvoices = await prisma.$transaction(async (tx) => {
        const createdList = [];

        for (const enrollment of activeEnrollments) {
          const student = enrollment.student;

          // Check if invoice with this title already exists for this student
          const existing = await tx.studentFeeInvoice.findFirst({
            where: {
              studentId: student.id,
              title: invoiceTitle,
            },
          });

          if (existing) continue; // Skip to prevent duplicate invoice generation

          // Calculate student concessions
          let concessionAmount = 0;
          const concessionDetails: string[] = [];

          for (const conc of student.concessions) {
            if (conc.discountType === 'PERCENTAGE') {
              const discount = (baseFeeAmount * conc.discountValue) / 100;
              concessionAmount += discount;
              concessionDetails.push(`${conc.concessionType}: ${conc.discountValue}% (₹${discount})`);
            } else {
              concessionAmount += conc.discountValue;
              concessionDetails.push(`${conc.concessionType}: Flat ₹${conc.discountValue}`);
            }
          }

          concessionAmount = Math.min(concessionAmount, baseFeeAmount);
          const finalPayable = Math.max(0, baseFeeAmount - concessionAmount);
          const invNumber = `INV-${curYear}-${Math.floor(100000 + Math.random() * 900000)}`;

          const itemsSnapshot = {
            baseFeeItems: feeStructure.items.map((i) => ({ category: i.category.name, amount: i.amount })),
            baseTotal: baseFeeAmount,
            concessionTotal: concessionAmount,
            concessionsApplied: concessionDetails,
            finalPayable,
          };

          const invoice = await tx.studentFeeInvoice.create({
            data: {
              schoolId,
              invoiceNumber: invNumber,
              studentId: student.id,
              title: invoiceTitle,
              totalAmount: finalPayable,
              concessionAmount,
              paidAmount: 0,
              status: finalPayable === 0 ? 'PAID' : 'PENDING',
              dueDate: targetDueDate,
              itemsJson: JSON.stringify(itemsSnapshot),
            },
          });

          createdList.push(invoice);
        }

        return createdList;
      });

      await logAudit({
        schoolId,
        userId: user.id,
        action: 'GENERATE_BATCH_INVOICES',
        module: 'FEES_FINANCE',
        newValue: `Generated ${generatedInvoices.length} fee invoices under structure "${feeStructure.title}"`,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully generated ${generatedInvoices.length} invoices.`,
        count: generatedInvoices.length,
        invoices: generatedInvoices,
      });
    }

    // ----------------------------------------------------
    // ACTION 2: APPLY_CONCESSION
    // Configures scholarship / sibling discount for a student
    // ----------------------------------------------------
    if (action === 'APPLY_CONCESSION') {
      const { studentId, concessionType, discountType, discountValue, reason, academicYearId } = body;

      const parsedDiscount = Number(discountValue);
      if (!studentId || isNaN(parsedDiscount) || parsedDiscount <= 0) {
        return NextResponse.json({ error: 'Student ID and a positive discount value are required.' }, { status: 400 });
      }

      const concession = await prisma.studentFeeConcession.create({
        data: {
          schoolId,
          studentId,
          concessionType: concessionType || 'SCHOLARSHIP',
          discountType: discountType || 'PERCENTAGE',
          discountValue: parsedDiscount,
          reason: reason || 'Approved scholarship',
          approvedBy: `${user.firstName} ${user.lastName} (${user.role})`,
          academicYearId: academicYearId || null,
          isActive: true,
        },
        include: {
          student: { include: { user: true } },
        },
      });

      await logAudit({
        schoolId,
        userId: user.id,
        action: 'APPLY_FEE_CONCESSION',
        module: 'FEES_FINANCE',
        recordId: concession.id,
        newValue: `Granted ${concessionType} of ${parsedDiscount}${discountType === 'PERCENTAGE' ? '%' : ' INR'} to ${concession.student.user.firstName} ${concession.student.user.lastName}`,
      });

      return NextResponse.json({ success: true, concession });
    }

    // ----------------------------------------------------
    // ACTION 3: CREATE_FEE_STRUCTURE
    // Sets up class-wise fee schedules, items & installments
    // ----------------------------------------------------
    if (action === 'CREATE_FEE_STRUCTURE') {
      const { title, classId, frequency, dueDateDays, lateFeePerDay, graceDays, items, installments } = body;

      if (!title || !items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: 'Title and at least one fee line item are required.' }, { status: 400 });
      }

      const structure = await prisma.$transaction(async (tx) => {
        const createdStructure = await tx.feeStructure.create({
          data: {
            schoolId,
            title,
            classId: classId && classId !== 'ALL' ? classId : null,
            frequency: frequency || 'Quarterly',
            dueDateDays: Number(dueDateDays) || 10,
            lateFeePerDay: Number(lateFeePerDay) || 50,
            graceDays: Number(graceDays) || 7,
          },
        });

        // Add line items
        for (const item of items) {
          await tx.feeItem.create({
            data: {
              feeStructureId: createdStructure.id,
              categoryId: item.categoryId,
              amount: Number(item.amount),
            },
          });
        }

        // Add installments if provided
        if (installments && Array.isArray(installments)) {
          for (let i = 0; i < installments.length; i++) {
            const inst = installments[i];
            await tx.feeInstallmentPlan.create({
              data: {
                feeStructureId: createdStructure.id,
                title: inst.title,
                dueDate: new Date(inst.dueDate),
                percentage: Number(inst.percentage) || 25,
                amount: Number(inst.amount) || 0,
                order: i + 1,
              },
            });
          }
        }

        return createdStructure;
      });

      const fullStructure = await prisma.feeStructure.findUnique({
        where: { id: structure.id },
        include: {
          items: { include: { category: true } },
          installments: true,
          class: true,
        },
      });

      await logAudit({
        schoolId,
        userId: user.id,
        action: 'CREATE_FEE_STRUCTURE',
        module: 'FEES_FINANCE',
        recordId: structure.id,
        newValue: `Created fee structure "${title}" with ${items.length} line items`,
      });

      return NextResponse.json({ success: true, structure: fullStructure });
    }

    // ----------------------------------------------------
    // ACTION 4: SEND_REMINDERS
    // Dispatches alerts for pending & overdue fee invoices
    // ----------------------------------------------------
    if (action === 'SEND_REMINDERS') {
      const overdueOrPendingInvoices = await prisma.studentFeeInvoice.findMany({
        where: {
          schoolId,
          status: { in: ['PENDING', 'OVERDUE', 'PARTIALLY_PAID'] },
        },
        include: {
          student: {
            include: {
              user: true,
              parents: { include: { parent: { include: { user: true } } } },
            },
          },
        },
      });

      let remindersCount = 0;
      await prisma.$transaction(async (tx) => {
        for (const inv of overdueOrPendingInvoices) {
          const balance = inv.totalAmount + (inv.lateFeeAmount || 0) - inv.paidAmount;
          const parentUser = inv.student.parents[0]?.parent?.user;
          const recipientContact = parentUser?.phone || parentUser?.email || inv.student.user.email;

          const msg = `Dear Parent, a pending fee balance of ₹${balance.toLocaleString('en-IN')} is due for ${inv.student.user.firstName} (Invoice #${inv.invoiceNumber}, ${inv.title}). Please complete the payment online.`;

          await tx.feeReminderLog.create({
            data: {
              schoolId,
              studentId: inv.studentId,
              invoiceId: inv.id,
              channel: 'IN_APP',
              recipient: recipientContact,
              message: msg,
              status: 'DELIVERED',
            },
          });

          if (parentUser) {
            await tx.notification.create({
              data: {
                userId: parentUser.id,
                title: 'Fee Payment Due Alert',
                message: msg,
                type: 'FEE',
                link: '/dashboard/fees',
              },
            });
          }

          remindersCount++;
        }
      });

      await logAudit({
        schoolId,
        userId: user.id,
        action: 'SEND_FEE_REMINDERS',
        module: 'FEES_FINANCE',
        newValue: `Dispatched payment reminders for ${remindersCount} outstanding invoices.`,
      });

      return NextResponse.json({
        success: true,
        message: `Dispatched ${remindersCount} payment reminders successfully.`,
        remindersCount,
      });
    }

    // ----------------------------------------------------
    // ACTION 5: CALCULATE_LATE_FEES
    // Scans overdue invoices past grace period and applies daily penalties
    // ----------------------------------------------------
    if (action === 'CALCULATE_LATE_FEES') {
      const now = new Date();
      const openInvoices = await prisma.studentFeeInvoice.findMany({
        where: {
          schoolId,
          status: { in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'] },
        },
      });

      let updatedCount = 0;
      await prisma.$transaction(async (tx) => {
        for (const inv of openInvoices) {
          if (new Date(inv.dueDate) < now) {
            // Days overdue
            const diffMs = now.getTime() - new Date(inv.dueDate).getTime();
            const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const graceDays = 7;

            if (daysOverdue > graceDays) {
              const penaltyDays = daysOverdue - graceDays;
              const calculatedLateFee = penaltyDays * 50; // ₹50/day

              if (calculatedLateFee !== inv.lateFeeAmount) {
                await tx.studentFeeInvoice.update({
                  where: { id: inv.id },
                  data: {
                    lateFeeAmount: calculatedLateFee,
                    status: 'OVERDUE',
                  },
                });
                updatedCount++;
              }
            } else {
              if (inv.status !== 'OVERDUE') {
                await tx.studentFeeInvoice.update({
                  where: { id: inv.id },
                  data: { status: 'OVERDUE' },
                });
                updatedCount++;
              }
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: `Updated penalty calculations for ${updatedCount} overdue invoices.`,
        updatedCount,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Fees POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
