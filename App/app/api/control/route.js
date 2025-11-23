import { NextResponse } from 'next/server';
import { getSession, requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/control
 * 
 * Creates a new control command for a device.
 * Requires ADMIN role.
 * 
 * Body:
 * {
 *   "deviceId": "esp32-001",
 *   "command": "OPEN"  // "OPEN" | "CLOSE" | "AUTO"
 * }
 */
export async function POST(request) {
  try {
    // Check authentication and admin role
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: ADMIN role required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { deviceId, command } = body;

    if (!deviceId || !command) {
      return NextResponse.json(
        { error: 'Missing deviceId or command' },
        { status: 400 }
      );
    }

    if (!['OPEN', 'CLOSE', 'AUTO'].includes(command)) {
      return NextResponse.json(
        { error: 'Invalid command. Must be OPEN, CLOSE, or AUTO' },
        { status: 400 }
      );
    }

    // Verify device exists
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    // Create control command
    const controlCommand = await prisma.controlCommand.create({
      data: {
        deviceId,
        command,
        requestedByUserId: session.user.id,
      },
    });

    return NextResponse.json({
      ok: true,
      id: controlCommand.id,
      deviceId: controlCommand.deviceId,
      command: controlCommand.command,
      createdAt: controlCommand.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error in POST /api/control:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

