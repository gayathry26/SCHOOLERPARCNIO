import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    const whereClause: any = {};
    if (studentId) {
      whereClause.studentId = studentId;
    } else if (user.role === 'STUDENT') {
      const sp = await prisma.studentProfile.findFirst({ where: { userId: user.id } });
      if (sp) whereClause.studentId = sp.id;
    }

    const [achievements, students] = await Promise.all([
      prisma.studentAchievement.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: true,
              enrollments: { include: { class: true, section: true } },
            },
          },
        },
        orderBy: { achievementDate: 'desc' },
      }),
      prisma.studentProfile.findMany({
        include: {
          user: true,
          enrollments: { include: { class: true, section: true } },
        },
      }),
    ]);

    return NextResponse.json({ achievements, students });
  } catch (error: any) {
    console.error('Portfolio API error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    const staffName = `${user.firstName} ${user.lastName || ''}`.trim();

    if (action === 'VERIFY_ACHIEVEMENT') {
      const PRIVILEGED_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'CLASS_TEACHER'];
      if (!PRIVILEGED_ROLES.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden: Only faculty can verify achievements.' }, { status: 403 });
      }

      const { achievementId, isVerified } = body;
      const updated = await prisma.studentAchievement.update({
        where: { id: achievementId },
        data: {
          isVerified: isVerified !== false,
          verifiedByStaff: staffName,
        },
        include: {
          student: {
            include: { user: true, enrollments: { include: { class: true, section: true } } },
          },
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'VERIFY_PORTFOLIO_ACHIEVEMENT',
        module: 'STUDENTS',
        recordId: achievementId,
        newValue: `Verified status: ${isVerified !== false ? 'Approved' : 'Unverified'} by ${staffName}`,
      });

      return NextResponse.json({ success: true, achievement: updated });
    }

    const { studentId, title, category, achievementDate, rankOrPosition, issuingAuthority, certificateUrl } = body;
    if (!studentId || !title) {
      return NextResponse.json({ error: 'Student and Title are required' }, { status: 400 });
    }

    const isPrivileged = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'].includes(user.role);

    const achievement = await prisma.studentAchievement.create({
      data: {
        studentId,
        title,
        category: category || 'ACADEMIC',
        achievementDate: new Date(achievementDate || Date.now()),
        rankOrPosition: rankOrPosition || 'Winner / 1st Position',
        issuingAuthority: issuingAuthority || 'School / Authority',
        certificateUrl: certificateUrl || null,
        isVerified: isPrivileged,
        verifiedByStaff: isPrivileged ? staffName : null,
      },
      include: {
        student: {
          include: { user: true, enrollments: { include: { class: true, section: true } } },
        },
      },
    });

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'CREATE_PORTFOLIO_ACHIEVEMENT',
      module: 'STUDENTS',
      recordId: achievement.id,
      newValue: `Created achievement: ${title} (${category}) for student ${studentId}`,
    });

    return NextResponse.json({ success: true, achievement });
  } catch (error: any) {
    console.error('Portfolio POST error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
