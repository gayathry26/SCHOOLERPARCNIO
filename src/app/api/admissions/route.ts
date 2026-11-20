import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { dispatchNotification } from '@/lib/notifications';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const applications = await prisma.admissionApplication.findMany({
      include: {
        documents: true,
        interviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ applications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { action } = body;

    // Document Verification Action
    if (action === 'VERIFY_DOCUMENT') {
      const { documentId, status: docStatus, notes } = body;
      if (!documentId) return NextResponse.json({ error: 'Document ID required' }, { status: 400 });

      const updatedDoc = await prisma.admissionDocument.update({
        where: { id: documentId },
        data: {
          status: docStatus || 'VERIFIED',
          verifiedBy: user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Admissions Officer',
          notes: notes || undefined,
        },
      });
      return NextResponse.json({ success: true, document: updatedDoc });
    }

    // Schedule Interview Action
    if (action === 'SCHEDULE_INTERVIEW') {
      const { applicationId, scheduledAt, interviewerName, feedback, outcome, score } = body;
      if (!applicationId || !scheduledAt) {
        return NextResponse.json({ error: 'Application ID and schedule date required' }, { status: 400 });
      }

      const interview = await prisma.admissionInterview.create({
        data: {
          applicationId,
          scheduledAt: new Date(scheduledAt),
          interviewerName: interviewerName || 'Principal & Admissions Panel',
          score: score ? parseFloat(score) : undefined,
          feedback: feedback || 'Assessment completed successfully.',
          outcome: outcome || 'RECOMMENDED',
        },
      });

      await prisma.admissionApplication.update({
        where: { id: applicationId },
        data: {
          interviewDate: new Date(scheduledAt),
          status: 'UNDER_REVIEW',
        },
      });

      return NextResponse.json({ success: true, interview });
    }

    // Upload Document Action
    if (action === 'UPLOAD_DOCUMENT') {
      const { applicationId, documentType, fileUrl } = body;
      if (!applicationId || !documentType) {
        return NextResponse.json({ error: 'Application ID and document type required' }, { status: 400 });
      }

      const doc = await prisma.admissionDocument.create({
        data: {
          applicationId,
          documentType,
          fileUrl: fileUrl || '/documents/sample_doc.pdf',
          status: 'PENDING',
        },
      });

      return NextResponse.json({ success: true, document: doc });
    }

    // Standard Application Enquiry Creation
    const { studentName, gender, dob, applyingForClass, parentName, parentEmail, parentPhone, address } = body;
    if (!studentName || !parentName || !parentPhone) {
      return NextResponse.json({ error: 'Student name, parent name, and phone are required' }, { status: 400 });
    }

    const appNo = `ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const application = await prisma.admissionApplication.create({
      data: {
        applicationNo: appNo,
        studentName,
        gender: gender || 'MALE',
        dob: new Date(dob || '2012-01-01'),
        applyingForClass: applyingForClass || 'Class 10',
        parentName,
        parentEmail: parentEmail || `parent.${appNo.toLowerCase()}@example.com`,
        parentPhone,
        address: address || 'Noida, UP',
        status: 'ENQUIRY',
        documents: {
          create: [
            { documentType: 'BIRTH_CERTIFICATE', fileUrl: '/docs/birth_cert.pdf', status: 'PENDING' },
            { documentType: 'TRANSFER_CERTIFICATE', fileUrl: '/docs/tc.pdf', status: 'PENDING' },
            { documentType: 'REPORT_CARD', fileUrl: '/docs/prev_report.pdf', status: 'PENDING' },
          ],
        },
      },
      include: {
        documents: true,
        interviews: true,
      },
    });

    if (user) {
      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'CREATE_ADMISSION_ENQUIRY',
        module: 'ADMISSIONS',
        recordId: application.id,
        newValue: `Created admission enquiry ${appNo} for ${studentName}`,
      });
    }

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    console.error('Admission API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canAccessModule(user.role, 'ADMISSIONS')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const { applicationId, status, interviewDate, interviewNotes } = await req.json();

    const app = await prisma.admissionApplication.findUnique({
      where: { id: applicationId },
      include: { documents: true, interviews: true },
    });
    if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    let createdStudentId = app.createdStudentId;

    // If status is changed to ADMITTED, automatically create student & parent records
    if (status === 'ADMITTED' && !app.createdStudentId) {
      const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
      const targetClass = await prisma.class.findFirst({
        where: { name: app.applyingForClass },
        include: { sections: true },
      });

      const defaultPassword = await hashPassword('password123');
      const admNo = `EDV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const [firstName, ...rest] = app.studentName.split(' ');
      const lastName = rest.join(' ') || 'Student';

      // 1. Create Student User
      const sUser = await prisma.user.create({
        data: {
          email: `student.${admNo.toLowerCase()}@edvonest.com`,
          username: admNo.toLowerCase(),
          passwordHash: defaultPassword,
          role: 'STUDENT',
          firstName,
          lastName,
          phone: app.parentPhone,
        },
      });

      // 2. Create Student Profile
      const sProfile = await prisma.studentProfile.create({
        data: {
          userId: sUser.id,
          admissionNumber: admNo,
          dob: app.dob,
          gender: app.gender,
          address: app.address || 'Noida, UP',
          emergencyContact: app.parentPhone,
        },
      });

      createdStudentId = sProfile.id;

      // 3. Create Enrollment
      if (currentYear && targetClass && targetClass.sections[0]) {
        await prisma.studentEnrollment.create({
          data: {
            studentId: sProfile.id,
            academicYearId: currentYear.id,
            classId: targetClass.id,
            sectionId: targetClass.sections[0].id,
            status: 'ACTIVE',
          },
        });
      }

      // 4. Create Parent User & Profile
      const [parentFirst, ...parentRest] = app.parentName.split(' ');
      const pUser = await prisma.user.create({
        data: {
          email: app.parentEmail,
          username: `parent.${admNo.toLowerCase()}`,
          passwordHash: defaultPassword,
          role: 'PARENT',
          firstName: parentFirst,
          lastName: parentRest.join(' ') || 'Guardian',
          phone: app.parentPhone,
        },
      });

      const pProfile = await prisma.parentProfile.create({
        data: {
          userId: pUser.id,
          phone: app.parentPhone,
          address: app.address || 'Noida, UP',
        },
      });

      await prisma.studentParentMap.create({
        data: {
          studentId: sProfile.id,
          parentId: pProfile.id,
          isPrimary: true,
        },
      });

      // Send admission confirmation notice
      await dispatchNotification({
        userId: pUser.id,
        title: `🎉 Admission Confirmed: ${app.studentName}`,
        message: `Congratulations! ${app.studentName} has been admitted to ${app.applyingForClass} at EdvoNest School. Student Portal ID: ${admNo}.`,
        type: 'ADMISSION_CONFIRMED',
        channels: ['IN_APP', 'WHATSAPP', 'EMAIL'],
        link: '/dashboard',
      });
    }

    const updated = await prisma.admissionApplication.update({
      where: { id: applicationId },
      data: {
        status,
        interviewDate: interviewDate ? new Date(interviewDate) : undefined,
        interviewNotes: interviewNotes || undefined,
        createdStudentId,
      },
      include: {
        documents: true,
        interviews: true,
      },
    });

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'UPDATE_ADMISSION_STATUS',
      module: 'ADMISSIONS',
      recordId: applicationId,
      newValue: `Updated application ${app.applicationNo} status to ${status}`,
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error: any) {
    console.error('Admissions update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
