import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { canAccessModule } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canAccessModule(user.role, 'LIFECYCLE')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const academicYearId = searchParams.get('yearId');

    // Fetch Academic Years
    const academicYears = await prisma.academicYear.findMany({
      include: {
        _count: { select: { enrollments: true, classes: true, exams: true } },
        closingLogs: { orderBy: { closedAt: 'desc' }, take: 1 },
      },
      orderBy: { startDate: 'desc' },
    });

    const activeYear = academicYears.find((y) => y.isCurrent) || academicYears[0];
    const selectedYearId = academicYearId || activeYear?.id;

    // Parallel fetch of lifecycle data
    const [
      classes,
      teachers,
      teacherAllocations,
      enrollments,
      applications,
      alumniRecords,
      closingLogs,
      recentPromotions,
      sectionTransfers,
      unpaidInvoices,
      examSchedules,
    ] = await Promise.all([
      prisma.class.findMany({
        include: {
          sections: {
            include: {
              classTeacher: { include: { user: true } },
              _count: { select: { enrollments: true } },
            },
          },
          subjects: true,
        },
        orderBy: { numericOrder: 'asc' },
      }),
      prisma.teacherProfile.findMany({
        include: { user: true },
        orderBy: { user: { firstName: 'asc' } },
      }),
      selectedYearId
        ? prisma.teacherAllocation.findMany({
            where: { academicYearId: selectedYearId },
            include: {
              teacher: { include: { user: true } },
              class: true,
              section: true,
              subject: true,
            },
          })
        : [],
      selectedYearId
        ? prisma.studentEnrollment.findMany({
            where: { academicYearId: selectedYearId },
            include: {
              student: {
                include: {
                  user: true,
                  parents: { include: { parent: { include: { user: true } } } },
                  markEntries: {
                    where: { examSchedule: { exam: { academicYearId: selectedYearId } } },
                    include: { examSchedule: { include: { exam: true, subject: true } } },
                  },
                  attendance: {
                    where: { academicYearId: selectedYearId },
                  },
                  invoices: true,
                  alumniRecord: true,
                },
              },
              class: true,
              section: true,
            },
            orderBy: [{ class: { numericOrder: 'asc' } }, { rollNumber: 'asc' }],
          })
        : [],
      prisma.admissionApplication.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.alumniRecord.findMany({
        include: { student: { include: { user: true } } },
        orderBy: { graduationYear: 'desc' },
      }),
      prisma.yearEndClosingLog.findMany({
        include: { academicYear: true },
        orderBy: { closedAt: 'desc' },
      }),
      prisma.studentPromotionLog.findMany({
        include: {
          student: { include: { user: true } },
          fromYear: true,
          toYear: true,
          fromClass: true,
          toClass: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.sectionTransferLog.findMany({
        include: { student: { include: { user: true } } },
        orderBy: { transferredAt: 'desc' },
        take: 30,
      }),
      prisma.studentFeeInvoice.findMany({
        where: {
          status: { in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'] },
        },
        include: { student: { include: { user: true } } },
      }),
      selectedYearId
        ? prisma.examSchedule.findMany({
            where: { exam: { academicYearId: selectedYearId } },
            include: { exam: true, subject: true },
          })
        : [],
    ]);

    return NextResponse.json({
      academicYears,
      activeYear,
      selectedYearId,
      classes,
      teachers,
      teacherAllocations,
      enrollments,
      applications,
      alumniRecords,
      closingLogs,
      recentPromotions,
      sectionTransfers,
      unpaidInvoices,
      examSchedules,
    });
  } catch (error: any) {
    console.error('Lifecycle GET error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canAccessModule(user.role, 'LIFECYCLE')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // ----------------------------------------------------
    // 1. ACADEMIC YEAR MANAGEMENT
    // ----------------------------------------------------
    if (action === 'CREATE_ACADEMIC_YEAR') {
      const { name, startDate, endDate, setAsActive } = body;
      if (!name || !startDate || !endDate) {
        return NextResponse.json({ error: 'Name, start date, and end date are required' }, { status: 400 });
      }

      if (new Date(startDate) >= new Date(endDate)) {
        return NextResponse.json({ error: 'Start date must be earlier than end date' }, { status: 400 });
      }

      if (setAsActive) {
        await prisma.academicYear.updateMany({ data: { isCurrent: false } });
      }

      const year = await prisma.academicYear.create({
        data: {
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isCurrent: Boolean(setAsActive),
          status: setAsActive ? 'ACTIVE' : 'UPCOMING',
          isLocked: false,
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'CREATE_ACADEMIC_YEAR',
        module: 'ACADEMICS',
        recordId: year.id,
        newValue: `Created academic session ${name} (${startDate} to ${endDate})`,
      });

      return NextResponse.json({ success: true, academicYear: year });
    }

    if (action === 'ACTIVATE_ACADEMIC_YEAR') {
      const { yearId } = body;
      if (!yearId) return NextResponse.json({ error: 'Year ID is required' }, { status: 400 });

      const target = await prisma.academicYear.findUnique({ where: { id: yearId } });
      if (!target) return NextResponse.json({ error: 'Academic session not found' }, { status: 404 });

      if (target.isLocked || target.status === 'CLOSED') {
        return NextResponse.json({ error: 'Cannot activate a locked/closed academic session' }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.academicYear.updateMany({ data: { isCurrent: false } }),
        prisma.academicYear.update({
          where: { id: yearId },
          data: { isCurrent: true, status: 'ACTIVE' },
        }),
      ]);

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'ACTIVATE_ACADEMIC_YEAR',
        module: 'ACADEMICS',
        recordId: yearId,
        newValue: `Activated academic session ${target.name}`,
      });

      return NextResponse.json({ success: true, activatedYearId: yearId });
    }

    if (action === 'CLOSE_ACADEMIC_YEAR') {
      const { yearId, summaryNotes } = body;
      if (!yearId) return NextResponse.json({ error: 'Year ID is required' }, { status: 400 });

      const target = await prisma.academicYear.findUnique({
        where: { id: yearId },
        include: {
          enrollments: true,
          exams: true,
        },
      });

      if (!target) return NextResponse.json({ error: 'Academic session not found' }, { status: 404 });
      if (target.isLocked || target.status === 'CLOSED') {
        return NextResponse.json({ error: 'Academic session is already closed and archived' }, { status: 400 });
      }

      // Compute statistics for audit & closing report
      const [unpaidInvoices, studentEnrollments] = await Promise.all([
        prisma.studentFeeInvoice.findMany({
          where: { status: { in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'] } },
        }),
        prisma.studentEnrollment.findMany({
          where: { academicYearId: yearId },
        }),
      ]);

      const totalPendingFees = unpaidInvoices.reduce((acc, inv) => acc + (inv.totalAmount - inv.paidAmount), 0);
      const promotedCount = studentEnrollments.filter((e) => e.status === 'PROMOTED').length;
      const detainedCount = studentEnrollments.filter((e) => e.status === 'DETAINED').length;
      const graduatedCount = studentEnrollments.filter((e) => e.status === 'ALUMNI' || e.status === 'TC_ISSUED').length;
      const allExamsLocked = target.exams.every((ex) => ex.isLocked);

      // Execute atomic close
      await prisma.$transaction([
        prisma.academicYear.update({
          where: { id: yearId },
          data: {
            status: 'CLOSED',
            isLocked: true,
            isCurrent: false,
            closedAt: new Date(),
            closedById: user.id,
          },
        }),
        prisma.yearEndClosingLog.create({
          data: {
            academicYearId: yearId,
            closedById: user.id,
            totalStudents: studentEnrollments.length,
            promotedCount,
            detainedCount,
            graduatedCount,
            unpaidFeeInvoices: unpaidInvoices.length,
            totalPendingFees,
            allExamsLocked,
            summaryNotes: summaryNotes || `Session closed with ${promotedCount} promotions, ${unpaidInvoices.length} pending fee invoices.`,
          },
        }),
      ]);

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'CLOSE_ACADEMIC_YEAR',
        module: 'ACADEMICS',
        recordId: yearId,
        newValue: `Permanently closed session ${target.name}. Total students: ${studentEnrollments.length}. Promoted: ${promotedCount}`,
      });

      return NextResponse.json({
        success: true,
        closedYearId: yearId,
        metrics: {
          totalStudents: studentEnrollments.length,
          promotedCount,
          detainedCount,
          graduatedCount,
          unpaidFeeInvoices: unpaidInvoices.length,
          totalPendingFees,
          allExamsLocked,
        },
      });
    }

    // ----------------------------------------------------
    // 2. CLASS PROMOTION ENGINE
    // ----------------------------------------------------
    if (action === 'PROMOTE_STUDENTS') {
      const { fromYearId, toYearId, promotions } = body;

      if (!fromYearId || !toYearId || !Array.isArray(promotions) || promotions.length === 0) {
        return NextResponse.json({ error: 'From year, to year, and student promotions list required' }, { status: 400 });
      }

      const targetYear = await prisma.academicYear.findUnique({ where: { id: toYearId } });
      if (!targetYear || targetYear.isLocked) {
        return NextResponse.json({ error: 'Target academic year is invalid or locked' }, { status: 400 });
      }

      let promotedSuccess = 0;
      let detainedSuccess = 0;

      for (const item of promotions) {
        const { studentId, fromClassId, toClassId, toSectionId, status = 'PROMOTED', eligibilityNotes, attendancePercent, marksPercent } = item;

        // Check active enrollment in source year
        const sourceEnrollment = await prisma.studentEnrollment.findFirst({
          where: { studentId, academicYearId: fromYearId },
        });

        if (!sourceEnrollment) continue;

        // Prevent duplicate active enrollment in destination year
        const existingTargetEnrollment = await prisma.studentEnrollment.findFirst({
          where: { studentId, academicYearId: toYearId },
        });

        if (existingTargetEnrollment) {
          // Already has an enrollment in destination year, update class/section
          await prisma.studentEnrollment.update({
            where: { id: existingTargetEnrollment.id },
            data: {
              classId: toClassId,
              sectionId: toSectionId,
              status: 'ACTIVE',
            },
          });
        } else {
          // 1. Mark previous year enrollment as PROMOTED or DETAINED
          await prisma.studentEnrollment.update({
            where: { id: sourceEnrollment.id },
            data: {
              status,
              promotedToYearId: toYearId,
              promotedToClassId: toClassId,
            },
          });

          // 2. Create new enrollment in the destination academic session
          await prisma.studentEnrollment.create({
            data: {
              studentId,
              academicYearId: toYearId,
              classId: toClassId,
              sectionId: toSectionId,
              status: 'ACTIVE',
            },
          });
        }

        // 3. Update student profile lifecycle stage
        await prisma.studentProfile.update({
          where: { id: studentId },
          data: {
            lifecycleStage: status === 'DETAINED' ? 'DETAINED' : 'PROMOTED',
          },
        });

        // 4. Create promotion audit record
        await prisma.studentPromotionLog.create({
          data: {
            studentId,
            fromYearId,
            toYearId,
            fromClassId: fromClassId || sourceEnrollment.classId,
            toClassId,
            fromSectionId: sourceEnrollment.sectionId,
            toSectionId,
            status,
            eligibilityNotes: eligibilityNotes || 'Automated session promotion',
            attendancePercent: attendancePercent ? parseFloat(attendancePercent) : undefined,
            marksPercent: marksPercent ? parseFloat(marksPercent) : undefined,
            processedById: user.id,
          },
        });

        if (status === 'PROMOTED') promotedSuccess++;
        else detainedSuccess++;
      }

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'EXECUTE_CLASS_PROMOTION',
        module: 'STUDENTS',
        newValue: `Processed batch promotion: ${promotedSuccess} promoted, ${detainedSuccess} detained from ${fromYearId} to ${toYearId}`,
      });

      return NextResponse.json({
        success: true,
        promotedCount: promotedSuccess,
        detainedCount: detainedSuccess,
      });
    }

    // ----------------------------------------------------
    // 3. STUDENT LIFECYCLE: SECTION TRANSFER
    // ----------------------------------------------------
    if (action === 'TRANSFER_SECTION') {
      const { studentId, academicYearId, toSectionId, reason } = body;
      if (!studentId || !toSectionId) {
        return NextResponse.json({ error: 'Student ID and target Section ID are required' }, { status: 400 });
      }

      const activeEnrollment = await prisma.studentEnrollment.findFirst({
        where: { studentId, academicYearId: academicYearId || undefined, status: 'ACTIVE' },
      });

      if (!activeEnrollment) {
        return NextResponse.json({ error: 'No active enrollment found for student' }, { status: 404 });
      }

      const fromSectionId = activeEnrollment.sectionId;

      await prisma.$transaction([
        prisma.studentEnrollment.update({
          where: { id: activeEnrollment.id },
          data: { sectionId: toSectionId },
        }),
        prisma.sectionTransferLog.create({
          data: {
            studentId,
            academicYearId: activeEnrollment.academicYearId,
            fromSectionId,
            toSectionId,
            reason: reason || 'Administrative / Parent request section re-allocation',
            transferredById: user.id,
          },
        }),
      ]);

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'TRANSFER_STUDENT_SECTION',
        module: 'STUDENTS',
        recordId: studentId,
        newValue: `Transferred student from section ${fromSectionId} to ${toSectionId}. Reason: ${reason || 'N/A'}`,
      });

      return NextResponse.json({ success: true });
    }

    // ----------------------------------------------------
    // 4. STUDENT LIFECYCLE: SCHOOL LEAVING & TC
    // ----------------------------------------------------
    if (action === 'ISSUE_TC_LEAVING') {
      const { studentId, tcNumber, leavingReason, remarks } = body;
      if (!studentId || !tcNumber) {
        return NextResponse.json({ error: 'Student ID and TC Number are required' }, { status: 400 });
      }

      const student = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: { user: true, enrollments: { where: { status: 'ACTIVE' } } },
      });

      if (!student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });

      await prisma.$transaction([
        prisma.studentProfile.update({
          where: { id: studentId },
          data: {
            isArchived: true,
            archivedReason: leavingReason || 'Transfer Certificate Issued',
            lifecycleStage: 'TC_ISSUED',
            tcNumber,
            tcDate: new Date(),
            leavingReason: leavingReason || 'Relocation / Completed Schooling',
          },
        }),
        prisma.studentEnrollment.updateMany({
          where: { studentId, status: 'ACTIVE' },
          data: { status: 'TC_ISSUED' },
        }),
        prisma.issuedCertificate.create({
          data: {
            certificateNo: tcNumber,
            studentId,
            certificateType: 'TRANSFER_CERTIFICATE',
            purpose: remarks || 'Official Transfer Certificate / School Leaving Document',
            generatedBy: `${user.firstName} ${user.lastName} (${user.role})`,
          },
        }),
      ]);

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'ISSUE_TRANSFER_CERTIFICATE',
        module: 'STUDENTS',
        recordId: studentId,
        newValue: `Issued TC #${tcNumber} to student ${student.user.firstName} ${student.user.lastName}. Reason: ${leavingReason}`,
      });

      return NextResponse.json({ success: true, tcNumber });
    }

    // ----------------------------------------------------
    // 5. STUDENT LIFECYCLE: ALUMNI REGISTRATION
    // ----------------------------------------------------
    if (action === 'REGISTER_ALUMNI') {
      const {
        studentId,
        graduationYear,
        finalClass,
        passingMarksPercent,
        conduct,
        currentPursuit,
        contactEmail,
        contactPhone,
        notes,
      } = body;

      if (!studentId || !graduationYear) {
        return NextResponse.json({ error: 'Student ID and Graduation Year are required' }, { status: 400 });
      }

      const alumni = await prisma.alumniRecord.upsert({
        where: { studentId },
        update: {
          graduationYear,
          finalClass: finalClass || 'Class 12',
          passingMarksPercent: passingMarksPercent ? parseFloat(passingMarksPercent) : undefined,
          conduct: conduct || 'EXCELLENT',
          currentPursuit: currentPursuit || 'Higher Studies / University',
          contactEmail,
          contactPhone,
          notes,
        },
        create: {
          studentId,
          graduationYear,
          finalClass: finalClass || 'Class 12',
          passingMarksPercent: passingMarksPercent ? parseFloat(passingMarksPercent) : undefined,
          conduct: conduct || 'EXCELLENT',
          currentPursuit: currentPursuit || 'Higher Studies / University',
          contactEmail,
          contactPhone,
          notes,
        },
      });

      await prisma.studentProfile.update({
        where: { id: studentId },
        data: {
          lifecycleStage: 'ALUMNI',
          isArchived: true,
          archivedReason: `Graduated in ${graduationYear}`,
        },
      });

      await prisma.studentEnrollment.updateMany({
        where: { studentId, status: 'ACTIVE' },
        data: { status: 'ALUMNI' },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'REGISTER_ALUMNI_RECORD',
        module: 'STUDENTS',
        recordId: alumni.id,
        newValue: `Registered alumni record for student ${studentId} (Graduation: ${graduationYear})`,
      });

      return NextResponse.json({ success: true, alumni });
    }

    // ----------------------------------------------------
    // 6. TEACHER ALLOCATION MATRIX
    // ----------------------------------------------------
    if (action === 'ALLOCATE_TEACHER') {
      const { academicYearId, teacherId, classId, sectionId, subjectId, role = 'SUBJECT_TEACHER', periodsPerWeek = 5 } = body;

      if (!academicYearId || !teacherId || !classId || !sectionId) {
        return NextResponse.json({ error: 'Academic session, teacher, class, and section are required' }, { status: 400 });
      }

      const allocation = await prisma.teacherAllocation.create({
        data: {
          academicYearId,
          teacherId,
          classId,
          sectionId,
          subjectId: subjectId || null,
          role,
          periodsPerWeek: parseInt(periodsPerWeek) || 5,
        },
        include: {
          teacher: { include: { user: true } },
          class: true,
          section: true,
          subject: true,
        },
      });

      if (role === 'CLASS_TEACHER') {
        await prisma.section.update({
          where: { id: sectionId },
          data: { classTeacherId: teacherId },
        });
      }

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'ALLOCATE_TEACHER_SUBJECT',
        module: 'ACADEMICS',
        recordId: allocation.id,
        newValue: `Assigned teacher ${teacherId} as ${role} for ${classId} Section ${sectionId} in session ${academicYearId}`,
      });

      return NextResponse.json({ success: true, allocation });
    }

    if (action === 'REMOVE_TEACHER_ALLOCATION') {
      const { allocationId } = body;
      if (!allocationId) return NextResponse.json({ error: 'Allocation ID is required' }, { status: 400 });

      const existing = await prisma.teacherAllocation.findUnique({ where: { id: allocationId } });
      if (existing) {
        if (existing.role === 'CLASS_TEACHER') {
          await prisma.section.update({
            where: { id: existing.sectionId },
            data: { classTeacherId: null },
          });
        }
        await prisma.teacherAllocation.delete({ where: { id: allocationId } });
      }

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'REMOVE_TEACHER_ALLOCATION',
        module: 'ACADEMICS',
        recordId: allocationId,
        newValue: `Removed teacher allocation ${allocationId}`,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid lifecycle action' }, { status: 400 });
  } catch (error: any) {
    console.error('Lifecycle POST error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
