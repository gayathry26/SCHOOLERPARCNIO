import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, signToken, SessionUser, UserRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = body.email || body.usernameOrEmail || body.username;
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Email/Username and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
      include: {
        studentProfile: true,
        teacherProfile: true,
        parentProfile: true,
        staffProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid credentials or inactive account' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
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
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
