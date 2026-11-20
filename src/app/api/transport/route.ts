import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { triggerBusBoardingAlert, dispatchNotification } from '@/lib/notifications';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [vehicles, routes, assignments, trips, maintenance] = await Promise.all([
      prisma.vehicle.findMany({ include: { driverStaff: { include: { user: true } } } }),
      prisma.route.findMany({ include: { stops: true, vehicle: true } }),
      prisma.studentTransportAssignment.findMany({
        include: {
          student: { include: { user: true } },
          route: true,
          stop: true,
        },
      }),
      prisma.busTripLog.findMany({
        include: { vehicle: true },
        orderBy: { startTime: 'desc' },
        take: 20,
      }),
      prisma.vehicleMaintenance.findMany({
        include: { vehicle: true },
        orderBy: { scheduledDate: 'desc' },
      }),
    ]);

    return NextResponse.json({ vehicles, routes, assignments, trips, maintenance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canAccessModule(user.role, 'TRANSPORT')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'SIMULATE_GPS_PING') {
      const { tripId, lat, lng, speed, etaMinutes, status, deviationAlert } = body;
      if (!tripId) {
        return NextResponse.json({ error: 'Trip ID required' }, { status: 400 });
      }

      const updatedTrip = await prisma.busTripLog.update({
        where: { id: tripId },
        data: {
          currentLat: lat ?? undefined,
          currentLng: lng ?? undefined,
          currentSpeedKm: speed ?? undefined,
          etaMinutes: etaMinutes ?? undefined,
          status: status || 'IN_TRANSIT',
          deviationAlert: deviationAlert ?? false,
        },
        include: { vehicle: true },
      });

      // If deviation alert, dispatch warning
      if (deviationAlert) {
        await dispatchNotification({
          userId: user.id,
          title: `⚠️ Route Deviation Detected: Bus ${updatedTrip.vehicle.vehicleNumber}`,
          message: `Bus ${updatedTrip.vehicle.vehicleNumber} has deviated from designated stops or is delayed by ${etaMinutes || 15} minutes.`,
          type: 'TRANSPORT_ALERT',
          channels: ['IN_APP', 'SMS'],
          link: '/dashboard/transport',
        });
      }

      return NextResponse.json({ success: true, trip: updatedTrip });
    }

    if (action === 'STUDENT_BOARDING') {
      const { studentId, busNumber, vehicleNumber, stopName, status: boardStatus } = body;
      const vNum = vehicleNumber || busNumber;
      if (!studentId || !vNum) {
        return NextResponse.json({ error: 'Student ID and Bus/Vehicle Number are required' }, { status: 400 });
      }

      const student = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: {
          user: true,
          parents: {
            include: { parent: { include: { user: true } } },
          },
        },
      });

      await triggerBusBoardingAlert(
        studentId,
        vNum,
        stopName || 'Designated Stop',
        boardStatus || 'BOARDED'
      );

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'TRANSPORT_BOARDING_LOG',
        module: 'TRANSPORT',
        recordId: studentId,
        newValue: `${boardStatus || 'BOARDED'} bus ${vNum} at ${stopName || 'Designated Stop'}`,
      });

      return NextResponse.json({
        success: true,
        message: `Boarding update logged for ${student?.user?.firstName || 'student'} ${student?.user?.lastName || ''}. Parent notified.`,
      });
    }

    if (action === 'LOG_MAINTENANCE') {
      const { vehicleId, maintenanceType, scheduledDate, cost, vendorName, status } = body;
      if (!vehicleId || !maintenanceType) {
        return NextResponse.json({ error: 'Vehicle and maintenance type required' }, { status: 400 });
      }

      const maintenance = await prisma.vehicleMaintenance.create({
        data: {
          vehicleId,
          maintenanceType,
          scheduledDate: new Date(scheduledDate || Date.now()),
          cost: parseFloat(cost) || 4500,
          vendorName: vendorName || 'Authorized Service Station',
          status: status || 'COMPLETED',
        },
        include: { vehicle: true },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'LOG_VEHICLE_MAINTENANCE',
        module: 'TRANSPORT',
        recordId: maintenance.id,
        newValue: `Scheduled ${maintenanceType} for vehicle ${maintenance.vehicle.vehicleNumber} (₹${cost})`,
      });

      return NextResponse.json({ success: true, maintenance });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Transport API error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
