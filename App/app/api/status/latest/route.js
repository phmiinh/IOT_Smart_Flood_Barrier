import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/status/latest?deviceId=esp32-001
 * 
 * Returns the latest status for a device.
 * Requires user authentication (NextAuth session).
 */
export async function GET(request) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Missing deviceId parameter' },
        { status: 400 }
      );
    }

    const status = await prisma.deviceStatus.findFirst({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
      include: {
        device: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!status) {
      return NextResponse.json(
        { error: 'No status found for device' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: status.id,
      deviceId: status.deviceId,
      deviceName: status.device.name,
      waterLevelCm: status.waterLevelCm,
      doorState: status.doorState,
      mode: status.mode,
      pHeavyRainNext24h: status.pHeavyRainNext24h,
      temperatureC: status.temperatureC,
      humidityPct: status.humidityPct,
      timestamp: status.timestamp.toISOString(),
      createdAt: status.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error in GET /api/status/latest:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

