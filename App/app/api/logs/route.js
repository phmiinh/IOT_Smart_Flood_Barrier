import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/logs?deviceId=esp32-001&limit=100
 * 
 * Returns recent DeviceStatus records for a device.
 * Requires user authentication (VIEWER or ADMIN role).
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
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Missing deviceId parameter' },
        { status: 400 }
      );
    }

    const logs = await prisma.deviceStatus.findMany({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
      take: Math.min(limit, 1000), // Cap at 1000
    });

    return NextResponse.json(
      logs.map((log) => ({
        id: log.id,
        deviceId: log.deviceId,
        waterLevelCm: log.waterLevelCm,
        doorState: log.doorState,
        mode: log.mode,
        pHeavyRainNext24h: log.pHeavyRainNext24h,
        temperatureC: log.temperatureC,
        humidityPct: log.humidityPct,
        timestamp: log.timestamp.toISOString(),
        createdAt: log.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error in GET /api/logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

