import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const school = await prisma.school.findFirst();
    return NextResponse.json({ success: true, school });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!canAccessModule(user.role, 'SETTINGS')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to modify school settings' }, { status: 403 });
    }

    const body = await req.json();
    const { name, affiliationNo, board, email, phone, address, city, state, pincode, currencySymbol, currencyCode, attendanceThreshold } = body;

    if (!name || !affiliationNo) {
      return NextResponse.json({ error: 'School name and affiliation number are required' }, { status: 400 });
    }

    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'School profile not found' }, { status: 404 });
    }

    const updated = await prisma.school.update({
      where: { id: school.id },
      data: {
        name,
        affiliationNo,
        board: board || 'CBSE',
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        pincode: pincode || undefined,
        currencySymbol: currencySymbol || '₹',
        currencyCode: currencyCode || 'INR',
        attendanceThreshold: parseFloat(attendanceThreshold) || 75.0,
      },
    });

    await logAudit({
      schoolId: school.id,
      userId: user.id,
      action: 'UPDATE_SCHOOL_SETTINGS',
      module: 'SETTINGS',
      recordId: school.id,
      newValue: `Updated school profile: ${name} (${board}, ${affiliationNo})`,
    });

    return NextResponse.json({ success: true, school: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
