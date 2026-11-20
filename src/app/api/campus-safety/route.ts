import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { dispatchNotification } from '@/lib/notifications';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [gateLogs, visitorPasses, pickups, incidents] = await Promise.all([
      prisma.gateLog.findMany({
        orderBy: { entryTime: 'desc' },
        take: 50,
      }),
      prisma.visitorPass.findMany({
        orderBy: { checkInTime: 'desc' },
        take: 50,
      }),
      prisma.authorizedPickup.findMany({
        include: {
          student: {
            include: {
              user: true,
              enrollments: {
                include: {
                  class: { select: { name: true } },
                  section: { select: { name: true } },
                },
              },
            },
          },
        },
        take: 50,
      }),
      prisma.safetyIncident.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      gateLogs,
      visitorPasses,
      pickups,
      incidents,
    });
  } catch (error: any) {
    console.error('Campus safety GET error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    const GATE_STAFF = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'RECEPTIONIST', 'TRANSPORT_STAFF'];

    if (action === 'GATE_SCAN') {
      if (!GATE_STAFF.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden: Access restricted to authorized security and gate staff.' }, { status: 403 });
      }

      const { identifier, scanType = 'ENTRY', gateNumber = 'Gate 1 (Main Gate)' } = body;
      if (!identifier) {
        return NextResponse.json({ error: 'Card identifier or Admission Number is required' }, { status: 400 });
      }

      // Check student
      const student = await prisma.studentProfile.findFirst({
        where: { admissionNumber: identifier },
        include: {
          user: true,
          parents: {
            include: { parent: { include: { user: true } } },
          },
        },
      });

      const studentFullName = student
        ? `${student.user.firstName} ${student.user.lastName || ''}`.trim()
        : `Cardholder #${identifier}`;
      let personName = studentFullName;
      let personId = student?.userId || undefined;
      let personType = student ? 'STUDENT' : 'VISITOR';
      const verifierName = `${user.firstName} ${user.lastName || ''}`.trim();

      let log;
      if (scanType === 'EXIT') {
        const existing = await prisma.gateLog.findFirst({
          where: { identifierCard: identifier, status: 'INSIDE' },
          orderBy: { entryTime: 'desc' },
        });

        if (existing) {
          log = await prisma.gateLog.update({
            where: { id: existing.id },
            data: {
              exitTime: new Date(),
              status: 'EXITED',
            },
          });
        } else {
          log = await prisma.gateLog.create({
            data: {
              personType,
              personId,
              personName,
              identifierCard: identifier,
              gateNumber,
              verifiedBy: verifierName,
              status: 'EXITED',
              exitTime: new Date(),
            },
          });
        }
      } else {
        log = await prisma.gateLog.create({
          data: {
            personType,
            personId,
            personName,
            identifierCard: identifier,
            gateNumber,
            verifiedBy: verifierName,
            status: 'INSIDE',
          },
        });
      }

      // Notify parent if student
      if (student && student.parents.length > 0) {
        const parentUser = student.parents[0]?.parent?.user;
        if (parentUser) {
          await dispatchNotification({
            userId: parentUser.id,
            title: `Campus Gate Alert: ${studentFullName}`,
            message: `${studentFullName} has ${scanType === 'ENTRY' ? 'entered' : 'departed'} through ${gateNumber} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
            type: 'CAMPUS_GATE',
            channels: ['IN_APP', 'WHATSAPP'],
            link: '/dashboard/campus-safety',
          });
        }
      }

      return NextResponse.json({ success: true, log });
    }

    if (action === 'CREATE_VISITOR') {
      if (!GATE_STAFF.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden: Access restricted to authorized front desk staff.' }, { status: 403 });
      }

      const { visitorName, phone, purpose, hostStaffName } = body;
      if (!visitorName || !phone) {
        return NextResponse.json({ error: 'Visitor name and phone are required' }, { status: 400 });
      }

      const passNumber = `VP-${Date.now().toString().slice(-6)}`;
      const pass = await prisma.visitorPass.create({
        data: {
          passNumber,
          visitorName,
          phone,
          purpose: purpose || 'Official School Visit',
          hostStaffName: hostStaffName || 'Principal Office',
          status: 'ACTIVE',
          badgeQr: `QR-${passNumber}`,
        },
      });

      return NextResponse.json({ success: true, pass });
    }

    if (action === 'REPORT_INCIDENT') {
      const { title, severity, category, description, location } = body;
      if (!title || !description) {
        return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
      }

      const incident = await prisma.safetyIncident.create({
        data: {
          title,
          severity: severity || 'LOW',
          category: category || 'PLAYGROUND',
          description,
          location: location || 'School Campus',
          reportedById: user.id,
          status: 'OPEN',
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'SAFETY_INCIDENT_REPORTED',
        module: 'CAMPUS_SAFETY',
        recordId: incident.id,
        newValue: `Incident reported: ${title} (${severity})`,
      });

      return NextResponse.json({ success: true, incident });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Campus safety POST error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
