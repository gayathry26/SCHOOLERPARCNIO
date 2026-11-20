import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const branches = await prisma.campusBranch.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ branches });
  } catch (error: any) {
    console.error('Multi-campus GET error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'];
    if (!ALLOWED.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Access restricted to institutional directors' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'CREATE_BRANCH') {
      const { name, branchCode, address, city, state, principalName, contactPhone, studentCapacity } = body;
      if (!name || !branchCode) {
        return NextResponse.json({ error: 'Branch name and branch code are required' }, { status: 400 });
      }

      const school = await prisma.school.findFirst();
      if (!school) {
        return NextResponse.json({ error: 'Main institution record missing' }, { status: 500 });
      }

      const branch = await prisma.campusBranch.create({
        data: {
          schoolId: school.id,
          name,
          branchCode,
          address: address || 'Sector 128, Expressway',
          city: city || 'Noida',
          state: state || 'Uttar Pradesh',
          principalName: principalName || 'Dr. Preeti Saxena',
          contactPhone: contactPhone || '+91 120 4567890',
          studentCapacity: parseInt(studentCapacity) || 1500,
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'CREATE_CAMPUS_BRANCH',
        module: 'MULTI_CAMPUS',
        recordId: branch.id,
        newValue: `Created branch ${name} (${branchCode}) in ${city}, capacity ${studentCapacity}`,
      });

      return NextResponse.json({ success: true, branch });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Multi-campus POST error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
