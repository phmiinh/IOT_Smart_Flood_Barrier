import { NextResponse } from 'next/server';
import { authenticateDevice } from '@/lib/authDevice';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/control/latest?deviceId=esp32-001
 * 
 * Returns the latest control command for a device.
 * ESP32 polls this endpoint to get commands.
 * Requires device authentication via x-device-id and x-api-key headers.
 * 
 * Returns default "AUTO" if no command exists.
 */
export async function GET(request) {
  try {
    // Authenticate device
    const device = await authenticateDevice(request.headers);
    if (!device) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid device credentials' },
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

    // Verify deviceId matches authenticated device
    if (deviceId !== device.id) {
      return NextResponse.json(
        { error: 'Device ID mismatch' },
        { status: 403 }
      );
    }

    // Get latest command
    const command = await prisma.controlCommand.findFirst({
      where: { deviceId },
      orderBy: { createdAt: 'desc' },
    });

    // Return latest command or default to AUTO
    return NextResponse.json({
      deviceId,
      command: command?.command || 'AUTO',
      createdAt: command?.createdAt.toISOString() || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in GET /api/control/latest:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

