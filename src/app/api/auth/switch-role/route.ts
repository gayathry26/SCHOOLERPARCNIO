import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signToken, SessionUser, UserRole } from '@/lib/auth';

const ROLE_USER_MAP: Record<string, string> = {
  SUPER_ADMIN: 'superadmin@edvonest.com',
  SCHOOL_ADMIN: 'admin@edvonest.com',
  PRINCIPAL: 'principal@edvonest.com',
  VICE_PRINCIPAL: 'viceprincipal@edvonest.com',
  TEACHER: 'teacher.math@edvonest.com',
  CLASS_TEACHER: 'teacher.science@edvonest.com',
  ACCOUNTANT: 'accountant@edvonest.com',
  HR_MANAGER: 'hr@edvonest.com',
  STUDENT: 'student1@edvonest.com',
  PARENT: 'parent1@edvonest.com',
  TRANSPORT_MANAGER: 'transport.manager@edvonest.com',
  TRANSPORT_STAFF: 'transport@edvonest.com',
  LIBRARIAN: 'librarian@edvonest.com',
  COUNSELLOR: 'counsellor@edvonest.com',
  NURSE: 'nurse@edvonest.com',
  RECEPTIONIST: 'reception@edvonest.com',
};

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();
    const targetEmail = ROLE_USER_MAP[role] || 'admin@edvonest.com';

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        studentProfile: true,
        teacherProfile: true,
        parentProfile: true,
        staffProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Role user not found' }, { status: 404 });
    }

    const payload: SessionUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName,
      schoolId: user.schoolId,
      studentProfileId: user.studentProfile?.id,
      teacherProfileId: user.teacherProfile?.id,
      parentProfileId: user.parentProfile?.id,
      staffProfileId: user.staffProfile?.id,
    };

    const token = signToken(payload);

    const response = NextResponse.json({
      success: true,
      user: payload,
    });

    response.cookies.set('edvonest_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Error switching role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
