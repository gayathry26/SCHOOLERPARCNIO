import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [templates, issuedCertificates] = await Promise.all([
      prisma.certificateTemplate.findMany(),
      prisma.issuedCertificate.findMany({
        include: {
          student: {
            include: {
              user: true,
              enrollments: { include: { class: true, section: true } },
            },
          },
        },
        orderBy: { issueDate: 'desc' },
      }),
    ]);

    return NextResponse.json({ templates, issuedCertificates });
  } catch (error: any) {
    console.error('Certificates GET error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'RECEPTIONIST'];
    if (!ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only authorized administrative staff can generate certificates.' }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, certificateType, purpose, templateId } = body;

    if (!studentId || !certificateType) {
      return NextResponse.json({ error: 'Student ID and Certificate Type are required' }, { status: 400 });
    }

    const certNo = `EDV/CERT/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
    const staffName = `${user.firstName} ${user.lastName || ''}`.trim() || 'Principal Office';

    const cert = await prisma.issuedCertificate.create({
      data: {
        certificateNo: certNo,
        studentId,
        certificateType,
        purpose: purpose || 'Official Verification',
        generatedBy: staffName,
        templateId: templateId || undefined,
      },
      include: {
        student: {
          include: {
            user: true,
            enrollments: { include: { class: true, section: true } },
          },
        },
      },
    });

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'ISSUE_DIGITAL_CERTIFICATE',
      module: 'CERTIFICATES',
      recordId: cert.id,
      newValue: `Issued ${certificateType} (#${certNo}) for ${cert.student.user.firstName} ${cert.student.user.lastName || ''}`,
    });

    return NextResponse.json({ success: true, certificate: cert });
  } catch (error: any) {
    console.error('Certificates POST error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
