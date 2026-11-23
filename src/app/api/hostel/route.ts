import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!canAccessModule(user.role, 'HOSTEL')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const [buildings, allocations, attendances, outpasses, students] = await Promise.all([
      prisma.hostelBuilding.findMany({
        where: { isActive: true },
        include: {
          rooms: {
            orderBy: { roomNumber: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.hostelBedAllocation.findMany({
        where: { status: 'ACTIVE' },
        include: {
          room: { include: { building: true } },
          student: {
            include: {
              user: true,
              enrollments: {
                where: { academicYear: { isCurrent: true } },
                include: { class: true, section: true },
              },
            },
          },
        },
        orderBy: { allocatedDate: 'desc' },
      }),
      prisma.hostelAttendance.findMany({
        where: {
          date: {
            gte: targetDate,
            lt: nextDay,
          },
        },
        include: {
          student: { include: { user: true } },
        },
      }),
      prisma.hostelOutpass.findMany({
        include: {
          student: {
            include: {
              user: true,
              enrollments: {
                where: { academicYear: { isCurrent: true } },
                include: { class: true, section: true },
              },
            },
          },
        },
        orderBy: { departureTime: 'desc' },
        take: 50,
      }),
      prisma.studentProfile.findMany({
        where: { isArchived: false },
        include: {
          user: true,
          enrollments: {
            where: { academicYear: { isCurrent: true } },
            include: { class: true, section: true },
          },
        },
        orderBy: { admissionNumber: 'asc' },
      }),
    ]);

    return NextResponse.json({
      buildings,
      allocations,
      attendances,
      outpasses,
      students: students.map((s) => ({
        id: s.id,
        admissionNumber: s.admissionNumber,
        name: `${s.user.firstName} ${s.user.lastName}`,
        className: s.enrollments[0]?.class?.name || 'Class 10',
        sectionName: s.enrollments[0]?.section?.name || 'A',
      })),
    });
  } catch (error: any) {
    console.error('Error fetching hostel data:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!canAccessModule(user.role, 'HOSTEL')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // 1. Create Building
    if (action === 'create_building') {
      const { name, code, type, capacity, wardenName, wardenPhone, address } = body;
      if (!name || !code) {
        return NextResponse.json({ error: 'Building name and code are required' }, { status: 400 });
      }

      const building = await prisma.hostelBuilding.create({
        data: {
          name,
          code: code.toUpperCase().trim(),
          type: type || 'BOYS',
          capacity: parseInt(capacity) || 100,
          wardenName: wardenName || 'Resident Warden',
          wardenPhone: wardenPhone || '+91 98765 43210',
          address: address || 'Campus Residential Complex',
        },
      });

      return NextResponse.json({ success: true, building });
    }

    // 2. Create Room
    if (action === 'create_room') {
      const { buildingId, roomNumber, floor, capacity, roomType, monthlyFee } = body;
      if (!buildingId || !roomNumber) {
        return NextResponse.json({ error: 'Building ID and Room Number are required' }, { status: 400 });
      }

      const room = await prisma.hostelRoom.create({
        data: {
          buildingId,
          roomNumber: roomNumber.trim(),
          floor: parseInt(floor) || 1,
          capacity: parseInt(capacity) || 4,
          roomType: roomType || 'NON_AC',
          monthlyFee: parseFloat(monthlyFee) || 6500,
          status: 'AVAILABLE',
        },
      });

      return NextResponse.json({ success: true, room });
    }

    // 3. Allocate Bed to Student
    if (action === 'allocate_bed') {
      const { roomId, studentId, bedNumber, monthlyRent, depositPaid } = body;
      if (!roomId || !studentId) {
        return NextResponse.json({ error: 'Room and Student are required' }, { status: 400 });
      }

      // Check room capacity
      const room = await prisma.hostelRoom.findUnique({ where: { id: roomId } });
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }
      if (room.occupiedBeds >= room.capacity) {
        return NextResponse.json({ error: 'Room is already at full capacity' }, { status: 400 });
      }

      // Check if student already has active allocation
      const existing = await prisma.hostelBedAllocation.findFirst({
        where: { studentId, status: 'ACTIVE' },
      });
      if (existing) {
        return NextResponse.json({ error: 'Student already has an active hostel bed allocated' }, { status: 400 });
      }

      // Create allocation and increment occupied beds
      const allocation = await prisma.$transaction(async (tx) => {
        const alloc = await tx.hostelBedAllocation.create({
          data: {
            roomId,
            studentId,
            bedNumber: bedNumber || `Bed ${room.occupiedBeds + 1}`,
            monthlyRent: parseFloat(monthlyRent) || room.monthlyFee,
            depositPaid: parseFloat(depositPaid) || 10000,
            status: 'ACTIVE',
          },
        });

        const newOccupied = room.occupiedBeds + 1;
        await tx.hostelRoom.update({
          where: { id: roomId },
          data: {
            occupiedBeds: newOccupied,
            status: newOccupied >= room.capacity ? 'FULL' : 'AVAILABLE',
          },
        });

        return alloc;
      });

      return NextResponse.json({ success: true, allocation });
    }

    // 4. Record Daily Roll-Call Attendance
    if (action === 'record_attendance') {
      const { buildingId, date, records } = body;
      if (!buildingId || !records || !Array.isArray(records)) {
        return NextResponse.json({ error: 'Invalid attendance payload' }, { status: 400 });
      }

      const attendanceDate = date ? new Date(date) : new Date();
      attendanceDate.setHours(0, 0, 0, 0);

      await prisma.$transaction(async (tx) => {
        for (const item of records) {
          // Check if record exists for this student on this date
          const nextDay = new Date(attendanceDate);
          nextDay.setDate(nextDay.getDate() + 1);

          const existing = await tx.hostelAttendance.findFirst({
            where: {
              studentId: item.studentId,
              date: { gte: attendanceDate, lt: nextDay },
            },
          });

          if (existing) {
            await tx.hostelAttendance.update({
              where: { id: existing.id },
              data: {
                status: item.status || 'PRESENT',
                remarks: item.remarks || null,
                recordedById: user.id,
              },
            });
          } else {
            await tx.hostelAttendance.create({
              data: {
                buildingId,
                studentId: item.studentId,
                date: attendanceDate,
                status: item.status || 'PRESENT',
                remarks: item.remarks || null,
                recordedById: user.id,
              },
            });
          }
        }
      });

      return NextResponse.json({ success: true, message: 'Hostel attendance recorded successfully' });
    }

    // 5. Request Outpass
    if (action === 'request_outpass') {
      const { studentId, destination, purpose, departureTime, expectedReturnTime, parentConsentGiven } = body;
      if (!studentId || !destination || !purpose) {
        return NextResponse.json({ error: 'Student, destination, and purpose are required' }, { status: 400 });
      }

      const outpass = await prisma.hostelOutpass.create({
        data: {
          studentId,
          destination: destination.trim(),
          purpose: purpose.trim(),
          departureTime: new Date(departureTime || Date.now()),
          expectedReturnTime: new Date(expectedReturnTime || Date.now() + 6 * 3600 * 1000),
          parentConsentGiven: Boolean(parentConsentGiven !== false),
          status: 'APPROVED',
          approvedBy: user.id,
        },
      });

      return NextResponse.json({ success: true, outpass });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling hostel POST request:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!canAccessModule(user.role, 'HOSTEL')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // 1. Update Outpass Status (Approved, Rejected, Returned)
    if (action === 'update_outpass_status') {
      const { outpassId, status } = body;
      if (!outpassId || !status) {
        return NextResponse.json({ error: 'Outpass ID and status are required' }, { status: 400 });
      }

      const outpass = await prisma.hostelOutpass.update({
        where: { id: outpassId },
        data: {
          status,
          actualReturnTime: status === 'RETURNED' ? new Date() : undefined,
          approvedBy: user.id,
        },
      });

      return NextResponse.json({ success: true, outpass });
    }

    // 2. Vacate Bed
    if (action === 'vacate_bed') {
      const { allocationId } = body;
      if (!allocationId) {
        return NextResponse.json({ error: 'Allocation ID is required' }, { status: 400 });
      }

      const allocation = await prisma.hostelBedAllocation.findUnique({
        where: { id: allocationId },
        include: { room: true },
      });

      if (!allocation) {
        return NextResponse.json({ error: 'Allocation not found' }, { status: 404 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.hostelBedAllocation.update({
          where: { id: allocationId },
          data: {
            status: 'VACATED',
            vacateDate: new Date(),
          },
        });

        const newOccupied = Math.max(0, allocation.room.occupiedBeds - 1);
        await tx.hostelRoom.update({
          where: { id: allocation.roomId },
          data: {
            occupiedBeds: newOccupied,
            status: 'AVAILABLE',
          },
        });
      });

      return NextResponse.json({ success: true, message: 'Bed vacated successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling hostel PUT request:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
