import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { dispatchNotification } from '@/lib/notifications';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const HR_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HR_MANAGER'];
    if (!HR_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [teachers, staff, leaves, salarySlips, substitutes, attendance, appraisals] = await Promise.all([
      prisma.teacherProfile.findMany({ include: { user: true } }),
      prisma.staffProfile.findMany({ include: { user: true, department: true } }),
      prisma.leaveRequest.findMany({
        include: { teacher: { include: { user: true } }, staff: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.staffSalarySlip.findMany({
        include: { teacher: { include: { user: true } }, staff: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.substituteAssignment.findMany({
        include: {
          absentTeacher: { include: { user: true } },
          substituteTeacher: { include: { user: true } },
          section: { include: { class: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.staffAttendanceRecord.findMany({
        include: { teacher: { include: { user: true } }, staff: { include: { user: true } } },
        orderBy: { date: 'desc' },
      }),
      prisma.staffAppraisal.findMany({
        include: { teacher: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      teachers,
      staff,
      leaves,
      salarySlips,
      substitutes,
      attendance,
      appraisals,
    });
  } catch (error: any) {
    console.error('HR API error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const HR_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HR_MANAGER'];
    if (!HR_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'ASSIGN_SUBSTITUTE') {
      const { absentTeacherId, substituteTeacherId, sectionId, periodIndex, date } = body;
      if (!absentTeacherId || !substituteTeacherId || !sectionId) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }

      const sub = await prisma.substituteAssignment.create({
        data: {
          absentTeacherId,
          substituteTeacherId,
          sectionId,
          periodIndex: parseInt(periodIndex) || 1,
          date: new Date(date || Date.now()),
          status: 'ASSIGNED',
        },
        include: {
          absentTeacher: { include: { user: true } },
          substituteTeacher: { include: { user: true } },
          section: { include: { class: true } },
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'ASSIGN_SUBSTITUTE_TEACHER',
        module: 'HR',
        recordId: sub.id,
        newValue: `Assigned substitute for period ${sub.periodIndex}`,
      });

      // Dispatch notification to substitute teacher
      if (sub.substituteTeacher?.user) {
        await dispatchNotification({
          userId: sub.substituteTeacher.user.id,
          title: `Substitute Class Assignment: Period ${sub.periodIndex}`,
          message: `You have been assigned to cover Period ${sub.periodIndex} for ${sub.absentTeacher?.user?.firstName || 'Faculty'} ${sub.absentTeacher?.user?.lastName || ''} in ${sub.section?.class?.name} - ${sub.section?.name}.`,
          type: 'SUBSTITUTE_ALERT',
          channels: ['IN_APP', 'WHATSAPP'],
          link: '/dashboard/timetable',
        });
      }

      return NextResponse.json({ success: true, assignment: sub });
    }

    if (action === 'CREATE_APPRAISAL') {
      const { teacherProfileId, appraisalYear, teachingQualityScore, studentFeedbackScore, administrativeScore, finalRating, reviewRemarks } = body;
      if (!teacherProfileId) {
        return NextResponse.json({ error: 'Teacher profile required' }, { status: 400 });
      }

      const appraisal = await prisma.staffAppraisal.create({
        data: {
          teacherProfileId,
          appraisalYear: appraisalYear || '2025-2026',
          teachingQualityScore: parseFloat(teachingQualityScore) || 4.5,
          studentFeedbackScore: parseFloat(studentFeedbackScore) || 4.5,
          administrativeScore: parseFloat(administrativeScore) || 4.5,
          finalRating: finalRating || 'VERY_GOOD',
          reviewRemarks: reviewRemarks || 'Consistent performance and syllabus completion.',
          reviewedByStaff: `${user.firstName} ${user.lastName || ''}`.trim() || 'Principal',
        },
        include: { teacher: { include: { user: true } } },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'CREATE_STAFF_APPRAISAL',
        module: 'HR',
        recordId: appraisal.id,
        newValue: `Created appraisal for faculty ${teacherProfileId}: ${finalRating}`,
      });

      return NextResponse.json({ success: true, appraisal });
    }

    if (action === 'LOG_ATTENDANCE') {
      const { teacherProfileId, staffProfileId, status, checkInTime, checkOutTime } = body;

      const record = await prisma.staffAttendanceRecord.create({
        data: {
          teacherProfileId: teacherProfileId || undefined,
          staffProfileId: staffProfileId || undefined,
          date: new Date(),
          status: status || 'PRESENT',
          checkInTime: checkInTime || '08:00 AM',
          checkOutTime: checkOutTime || '03:30 PM',
        },
        include: { teacher: { include: { user: true } } },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'LOG_STAFF_ATTENDANCE',
        module: 'HR',
        recordId: record.id,
        newValue: `Logged staff attendance: ${status}`,
      });

      return NextResponse.json({ success: true, record });
    }

    // ---------------------------------------------------------
    // STAFF LIFECYCLE & REASSIGNMENT ACTIONS
    // ---------------------------------------------------------

    if (action === 'UPDATE_LIFECYCLE_STATUS') {
      const { profileType, profileId, newStatus, exitReason, lifecycleNotes, effectiveDate } = body;
      if (!profileId || !newStatus) {
        return NextResponse.json({ error: 'Profile ID and status are required' }, { status: 400 });
      }

      const effDate = effectiveDate ? new Date(effectiveDate) : new Date();
      const isTeacher = profileType === 'TEACHER';
      let empCode = '';
      let oldStatus = 'ACTIVE';

      if (isTeacher) {
        const existing = await prisma.teacherProfile.findUnique({ where: { id: profileId } });
        if (!existing) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
        empCode = existing.employeeCode;
        oldStatus = existing.status;

        const updateData: any = {
          status: newStatus,
          exitReason: exitReason || existing.exitReason,
          lifecycleNotes: lifecycleNotes || existing.lifecycleNotes,
        };

        if (newStatus === 'RESIGNED') updateData.resignationDate = effDate;
        if (newStatus === 'RETIRED') updateData.retirementDate = effDate;
        if (newStatus === 'TERMINATED') updateData.terminationDate = effDate;

        await prisma.teacherProfile.update({
          where: { id: profileId },
          data: updateData,
        });

        await prisma.staffLifecycleLog.create({
          data: {
            teacherId: profileId,
            employeeCode: empCode,
            action: 'STATUS_CHANGE',
            previousValue: oldStatus,
            newValue: newStatus,
            effectiveDate: effDate,
            remarks: exitReason || lifecycleNotes || `Status updated to ${newStatus}`,
            recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
          },
        });
      } else {
        const existing = await prisma.staffProfile.findUnique({ where: { id: profileId } });
        if (!existing) return NextResponse.json({ error: 'Staff profile not found' }, { status: 404 });
        empCode = existing.employeeCode;
        oldStatus = existing.status;

        const updateData: any = {
          status: newStatus,
          exitReason: exitReason || existing.exitReason,
          lifecycleNotes: lifecycleNotes || existing.lifecycleNotes,
        };

        if (newStatus === 'RESIGNED') updateData.resignationDate = effDate;
        if (newStatus === 'RETIRED') updateData.retirementDate = effDate;
        if (newStatus === 'TERMINATED') updateData.terminationDate = effDate;

        await prisma.staffProfile.update({
          where: { id: profileId },
          data: updateData,
        });

        await prisma.staffLifecycleLog.create({
          data: {
            staffId: profileId,
            employeeCode: empCode,
            action: 'STATUS_CHANGE',
            previousValue: oldStatus,
            newValue: newStatus,
            effectiveDate: effDate,
            remarks: exitReason || lifecycleNotes || `Status updated to ${newStatus}`,
            recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
          },
        });
      }

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'UPDATE_STAFF_LIFECYCLE',
        module: 'HR',
        recordId: profileId,
        newValue: `Updated staff ${empCode} status: ${oldStatus} -> ${newStatus}`,
      });

      return NextResponse.json({ success: true, message: `Staff status updated to ${newStatus}` });
    }

    if (action === 'REJOIN_STAFF') {
      const { profileType, profileId, remarks } = body;
      if (!profileId) return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });

      const isTeacher = profileType === 'TEACHER';
      let empCode = '';
      let prevStatus = '';

      if (isTeacher) {
        const existing = await prisma.teacherProfile.findUnique({ where: { id: profileId } });
        if (!existing) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
        empCode = existing.employeeCode;
        prevStatus = existing.status;

        await prisma.teacherProfile.update({
          where: { id: profileId },
          data: {
            status: 'ACTIVE',
            rejoiningDate: new Date(),
            exitReason: null,
            resignationDate: null,
            retirementDate: null,
            terminationDate: null,
          },
        });

        await prisma.staffLifecycleLog.create({
          data: {
            teacherId: profileId,
            employeeCode: empCode,
            action: 'REJOINED',
            previousValue: prevStatus,
            newValue: 'ACTIVE',
            effectiveDate: new Date(),
            remarks: remarks || 'Staff rejoined institution under permanent employee identity',
            recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
          },
        });
      } else {
        const existing = await prisma.staffProfile.findUnique({ where: { id: profileId } });
        if (!existing) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
        empCode = existing.employeeCode;
        prevStatus = existing.status;

        await prisma.staffProfile.update({
          where: { id: profileId },
          data: {
            status: 'ACTIVE',
            rejoiningDate: new Date(),
            exitReason: null,
            resignationDate: null,
            retirementDate: null,
            terminationDate: null,
          },
        });

        await prisma.staffLifecycleLog.create({
          data: {
            staffId: profileId,
            employeeCode: empCode,
            action: 'REJOINED',
            previousValue: prevStatus,
            newValue: 'ACTIVE',
            effectiveDate: new Date(),
            remarks: remarks || 'Staff member rejoined under permanent identity',
            recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
          },
        });
      }

      return NextResponse.json({ success: true, message: `Permanent employee ${empCode} reactivated & rejoined successfully` });
    }

    if (action === 'TRANSFER_DEPARTMENT') {
      const { profileType, profileId, departmentId, remarks } = body;
      if (!profileId || !departmentId) {
        return NextResponse.json({ error: 'Profile ID and Department ID required' }, { status: 400 });
      }

      const dept = await prisma.department.findUnique({ where: { id: departmentId } });
      if (!dept) return NextResponse.json({ error: 'Target department not found' }, { status: 404 });

      const isTeacher = profileType === 'TEACHER';
      if (isTeacher) {
        const t = await prisma.teacherProfile.findUnique({ where: { id: profileId }, include: { department: true } });
        if (!t) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

        await prisma.teacherProfile.update({
          where: { id: profileId },
          data: { departmentId },
        });

        await prisma.staffLifecycleLog.create({
          data: {
            teacherId: profileId,
            employeeCode: t.employeeCode,
            action: 'DEPARTMENT_TRANSFER',
            previousValue: t.department?.name || 'Unassigned',
            newValue: dept.name,
            effectiveDate: new Date(),
            remarks: remarks || `Transferred to ${dept.name}`,
            recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
          },
        });
      } else {
        const s = await prisma.staffProfile.findUnique({ where: { id: profileId }, include: { department: true } });
        if (!s) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

        await prisma.staffProfile.update({
          where: { id: profileId },
          data: { departmentId },
        });

        await prisma.staffLifecycleLog.create({
          data: {
            staffId: profileId,
            employeeCode: s.employeeCode,
            action: 'DEPARTMENT_TRANSFER',
            previousValue: s.department?.name || 'Unassigned',
            newValue: dept.name,
            effectiveDate: new Date(),
            remarks: remarks || `Transferred to ${dept.name}`,
            recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
          },
        });
      }

      return NextResponse.json({ success: true, message: `Department transfer complete to ${dept.name}` });
    }

    if (action === 'CHANGE_DESIGNATION') {
      const { profileType, profileId, designation, remarks } = body;
      if (!profileId || !designation) {
        return NextResponse.json({ error: 'Profile ID and designation required' }, { status: 400 });
      }

      const isTeacher = profileType === 'TEACHER';
      if (isTeacher) {
        const t = await prisma.teacherProfile.findUnique({ where: { id: profileId } });
        if (!t) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

        await prisma.teacherProfile.update({
          where: { id: profileId },
          data: { designation },
        });

        await prisma.staffLifecycleLog.create({
          data: {
            teacherId: profileId,
            employeeCode: t.employeeCode,
            action: 'DESIGNATION_CHANGE',
            previousValue: t.designation,
            newValue: designation,
            effectiveDate: new Date(),
            remarks: remarks || `Designation updated to ${designation}`,
            recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
          },
        });
      } else {
        const s = await prisma.staffProfile.findUnique({ where: { id: profileId } });
        if (!s) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

        await prisma.staffProfile.update({
          where: { id: profileId },
          data: { designation },
        });

        await prisma.staffLifecycleLog.create({
          data: {
            staffId: profileId,
            employeeCode: s.employeeCode,
            action: 'DESIGNATION_CHANGE',
            previousValue: s.designation,
            newValue: designation,
            effectiveDate: new Date(),
            remarks: remarks || `Designation updated to ${designation}`,
            recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
          },
        });
      }

      return NextResponse.json({ success: true, message: `Designation updated to ${designation}` });
    }

    if (action === 'REVISE_SALARY') {
      const { profileType, profileId, newSalary, effectiveDate, reason } = body;
      if (!profileId || !newSalary) {
        return NextResponse.json({ error: 'Profile ID and new salary required' }, { status: 400 });
      }

      const salaryVal = parseFloat(newSalary);
      const effDate = effectiveDate ? new Date(effectiveDate) : new Date();
      const isTeacher = profileType === 'TEACHER';

      if (isTeacher) {
        const t = await prisma.teacherProfile.findUnique({ where: { id: profileId } });
        if (!t) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

        const prevSalary = t.basicSalary;
        await prisma.teacherProfile.update({
          where: { id: profileId },
          data: { basicSalary: salaryVal },
        });

        await prisma.staffSalaryHistory.create({
          data: {
            teacherId: profileId,
            previousSalary: prevSalary,
            newSalary: salaryVal,
            effectiveDate: effDate,
            reason: reason || 'Annual performance revision',
            revisedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
          },
        });

        await prisma.staffLifecycleLog.create({
          data: {
            teacherId: profileId,
            employeeCode: t.employeeCode,
            action: 'SALARY_REVISION',
            previousValue: `₹ ${prevSalary}`,
            newValue: `₹ ${salaryVal}`,
            effectiveDate: effDate,
            remarks: reason || 'Salary revised',
            recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
          },
        });
      } else {
        const s = await prisma.staffProfile.findUnique({ where: { id: profileId } });
        if (!s) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

        const prevSalary = s.basicSalary;
        await prisma.staffProfile.update({
          where: { id: profileId },
          data: { basicSalary: salaryVal },
        });

        await prisma.staffSalaryHistory.create({
          data: {
            staffId: profileId,
            previousSalary: prevSalary,
            newSalary: salaryVal,
            effectiveDate: effDate,
            reason: reason || 'Annual revision',
            revisedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
          },
        });

        await prisma.staffLifecycleLog.create({
          data: {
            staffId: profileId,
            employeeCode: s.employeeCode,
            action: 'SALARY_REVISION',
            previousValue: `₹ ${prevSalary}`,
            newValue: `₹ ${salaryVal}`,
            effectiveDate: effDate,
            remarks: reason || 'Salary revised',
            recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Salary revised to ₹ ${salaryVal.toLocaleString('en-IN')}`,
      });
    }

    if (action === 'ALLOCATE_TEACHING_ASSIGNMENT') {
      const { teacherId, academicYearId, classId, sectionId, subjectId, role, periodsPerWeek } = body;
      if (!teacherId || !academicYearId || !classId || !sectionId) {
        return NextResponse.json({ error: 'Teacher, Academic Year, Class, and Section are required' }, { status: 400 });
      }

      const teacher = await prisma.teacherProfile.findUnique({
        where: { id: teacherId },
        include: { user: true },
      });
      if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

      const targetSection = await prisma.section.findUnique({
        where: { id: sectionId },
        include: { class: true },
      });
      if (!targetSection) return NextResponse.json({ error: 'Section not found' }, { status: 404 });

      // If assigning as Class Teacher, update section
      if (role === 'CLASS_TEACHER') {
        await prisma.section.update({
          where: { id: sectionId },
          data: { classTeacherId: teacherId },
        });
      }

      // Check if duplicate allocation exists
      const existing = await prisma.teacherAllocation.findFirst({
        where: {
          academicYearId,
          teacherId,
          sectionId,
          subjectId: subjectId || null,
          role: role || 'SUBJECT_TEACHER',
        },
      });

      let allocation = existing;
      if (!existing) {
        allocation = await prisma.teacherAllocation.create({
          data: {
            academicYearId,
            teacherId,
            classId,
            sectionId,
            subjectId: subjectId || null,
            role: role || 'SUBJECT_TEACHER',
            periodsPerWeek: parseInt(periodsPerWeek) || 5,
          },
          include: {
            class: true,
            section: true,
            subject: true,
            academicYear: true,
          },
        });
      }

      // If subject was assigned, ensure TeacherSubject mapping exists
      if (subjectId) {
        const existingTS = await prisma.teacherSubject.findFirst({
          where: { teacherId, subjectId },
        });
        if (!existingTS) {
          await prisma.teacherSubject.create({
            data: { teacherId, subjectId },
          });
        }
      }

      await prisma.staffLifecycleLog.create({
        data: {
          teacherId,
          employeeCode: teacher.employeeCode,
          action: 'ASSIGNMENT_ALLOCATED',
          previousValue: 'None',
          newValue: `${targetSection.class.name} - Section ${targetSection.name} (${role || 'SUBJECT_TEACHER'})`,
          effectiveDate: new Date(),
          remarks: `Teaching assignment allocated for academic year`,
          recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
        },
      });

      return NextResponse.json({ success: true, allocation });
    }

    if (action === 'REMOVE_TEACHING_ASSIGNMENT') {
      const { allocationId } = body;
      if (!allocationId) return NextResponse.json({ error: 'Allocation ID is required' }, { status: 400 });

      const alloc = await prisma.teacherAllocation.findUnique({
        where: { id: allocationId },
        include: { class: true, section: true, teacher: true },
      });
      if (!alloc) return NextResponse.json({ error: 'Allocation not found' }, { status: 404 });

      // If was class teacher, unlink section
      if (alloc.role === 'CLASS_TEACHER') {
        const sec = await prisma.section.findUnique({ where: { id: alloc.sectionId } });
        if (sec && sec.classTeacherId === alloc.teacherId) {
          await prisma.section.update({
            where: { id: alloc.sectionId },
            data: { classTeacherId: null },
          });
        }
      }

      await prisma.teacherAllocation.delete({ where: { id: allocationId } });

      await prisma.staffLifecycleLog.create({
        data: {
          teacherId: alloc.teacherId,
          employeeCode: alloc.teacher.employeeCode,
          action: 'ASSIGNMENT_REMOVED',
          previousValue: `${alloc.class.name} - ${alloc.section.name} (${alloc.role})`,
          newValue: 'Unallocated',
          effectiveDate: new Date(),
          remarks: 'Assignment removed',
          recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
        },
      });

      return NextResponse.json({ success: true, message: 'Teaching assignment removed successfully' });
    }

    if (action === 'BULK_ALLOCATE_NEW_YEAR') {
      const { sourceAcademicYearId, targetAcademicYearId } = body;
      if (!sourceAcademicYearId || !targetAcademicYearId) {
        return NextResponse.json({ error: 'Source and Target Academic Years required' }, { status: 400 });
      }

      const sourceAllocations = await prisma.teacherAllocation.findMany({
        where: { academicYearId: sourceAcademicYearId },
      });

      let count = 0;
      for (const alloc of sourceAllocations) {
        const exists = await prisma.teacherAllocation.findFirst({
          where: {
            academicYearId: targetAcademicYearId,
            teacherId: alloc.teacherId,
            sectionId: alloc.sectionId,
            subjectId: alloc.subjectId,
            role: alloc.role,
          },
        });

        if (!exists) {
          await prisma.teacherAllocation.create({
            data: {
              academicYearId: targetAcademicYearId,
              teacherId: alloc.teacherId,
              classId: alloc.classId,
              sectionId: alloc.sectionId,
              subjectId: alloc.subjectId,
              role: alloc.role,
              periodsPerWeek: alloc.periodsPerWeek,
            },
          });
          count++;
        }
      }

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'BULK_ALLOCATE_TEACHERS',
        module: 'HR',
        recordId: targetAcademicYearId,
        newValue: `Carried forward ${count} teacher allocations to new academic year`,
      });

      return NextResponse.json({
        success: true,
        count,
        message: `Successfully carried forward ${count} teacher allocations to new academic year`,
      });
    }

    if (action === 'CHECK_TIMETABLE_CLASH') {
      const { teacherId, dayOfWeek, periodIndex, academicYearId } = body;
      if (!teacherId || !dayOfWeek || periodIndex === undefined) {
        return NextResponse.json({ error: 'Teacher, day, and period index required' }, { status: 400 });
      }

      const clash = await prisma.timetableEntry.findFirst({
        where: {
          teacherId,
          dayOfWeek,
          periodIndex: parseInt(periodIndex),
          academicYearId: academicYearId || undefined,
        },
        include: {
          section: { include: { class: true } },
          subject: true,
        },
      });

      return NextResponse.json({
        hasClash: !!clash,
        clashDetails: clash
          ? `Clash detected! Faculty is already scheduled in ${clash.section.class.name}-${clash.section.name} for ${clash.subject.name} on ${dayOfWeek}, Period ${periodIndex}.`
          : null,
      });
    }

    if (action === 'ADD_TEACHER') {
      const { firstName, lastName, email, department, designation, employeeCode, specialization, phone } = body;
      if (!firstName || !lastName) {
        return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
      }

      const defaultPassword = await hashPassword('password123');
      const code = employeeCode || `TCH-${Math.floor(1000 + Math.random() * 9000)}`;

      const teacherUser = await prisma.user.create({
        data: {
          schoolId: user.schoolId || 'edvonest-main-school',
          email: email || `teacher.${code.toLowerCase()}@edvonest.com`,
          username: code.toLowerCase(),
          passwordHash: defaultPassword,
          role: 'TEACHER',
          firstName,
          lastName,
          phone: phone || null,
        },
      });

      const teacherProfile = await prisma.teacherProfile.create({
        data: {
          userId: teacherUser.id,
          employeeCode: code,
          specialization: specialization || department || 'General Academics',
          qualification: 'M.Sc, B.Ed',
        },
        include: { user: true },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'ADD_TEACHER',
        module: 'HR',
        recordId: teacherProfile.id,
        newValue: `Added faculty member ${firstName} ${lastName} (${code})`,
      });

      return NextResponse.json({ success: true, teacher: teacherProfile });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('HR POST error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
