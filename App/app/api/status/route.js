import { NextResponse } from 'next/server';
import { authenticateDevice } from '@/lib/authDevice';
import { prisma } from '@/lib/prisma';
import { sendTelegramAlert } from '@/lib/telegram';

/**
 * POST /api/status
 * 
 * ESP32 sends periodic status updates here.
 * Requires device authentication via x-device-id and x-api-key headers.
 * 
 * Body:
 * {
 *   "deviceId": "esp32-001",
 *   "waterLevelCm": 23.5,
 *   "doorState": "OPEN",
 *   "mode": "AUTO",
 *   "pHeavyRainNext24h": 0.78,
 *   "temperatureC": 29.5,
 *   "humidityPct": 90.0,
 *   "timestamp": "2025-11-24T12:34:56Z"
 * }
 */
export async function POST(request) {
  try {
    // Authenticate device
    const device = await authenticateDevice(request.headers);
    if (!device) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid device credentials' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'deviceId',
      'waterLevelCm',
      'doorState',
      'mode',
      'pHeavyRainNext24h',
      'temperatureC',
      'humidityPct',
      'timestamp',
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Verify deviceId matches authenticated device
    if (body.deviceId !== device.id) {
      return NextResponse.json(
        { error: 'Device ID mismatch' },
        { status: 403 }
      );
    }

    // Save status to database
    const status = await prisma.deviceStatus.create({
      data: {
        deviceId: body.deviceId,
        waterLevelCm: parseFloat(body.waterLevelCm),
        doorState: body.doorState,
        mode: body.mode,
        pHeavyRainNext24h: parseFloat(body.pHeavyRainNext24h),
        temperatureC: parseFloat(body.temperatureC),
        humidityPct: parseFloat(body.humidityPct),
        timestamp: new Date(body.timestamp),
      },
    });

    // Check alert conditions
    // Alert if: pHeavyRainNext24h >= 0.8 OR waterLevelCm <= 20 (danger: high water)
    // Note: smaller waterLevelCm = higher water level (distance from sensor to water)
    const shouldAlert =
      status.pHeavyRainNext24h >= 0.8 || status.waterLevelCm <= 20;

    if (shouldAlert) {
      const severity =
        status.waterLevelCm <= 20 || status.pHeavyRainNext24h >= 0.9
          ? 'CRITICAL'
          : 'WARN';

      // Create alert log
      await prisma.alertLog.create({
        data: {
          deviceId: status.deviceId,
          type: 'TELEGRAM',
          message: `⚠️ Flood risk for device ${status.deviceId}: waterLevel=${status.waterLevelCm}cm, pHeavyRainNext24h=${status.pHeavyRainNext24h.toFixed(2)}, doorState=${status.doorState}, mode=${status.mode}`,
          severity,
        },
      });

      // Send Telegram alert
      const alertMessage = `🚨 <b>Flood Risk Alert</b>\n\n` +
        `Device: ${status.deviceId}\n` +
        `Water Level: ${status.waterLevelCm}cm (lower = higher water)\n` +
        `Heavy Rain Probability (24h): ${(status.pHeavyRainNext24h * 100).toFixed(1)}%\n` +
        `Door State: ${status.doorState}\n` +
        `Mode: ${status.mode}\n` +
        `Temperature: ${status.temperatureC}°C\n` +
        `Humidity: ${status.humidityPct}%\n` +
        `Time: ${new Date(status.timestamp).toLocaleString()}`;

      await sendTelegramAlert(alertMessage);
    }

    // Optionally: Keep only last 1000 records per device to prevent DB bloat
    // (Uncomment if needed)
    // const count = await prisma.deviceStatus.count({ where: { deviceId: status.deviceId } });
    // if (count > 1000) {
    //   const toDelete = await prisma.deviceStatus.findMany({
    //     where: { deviceId: status.deviceId },
    //     orderBy: { timestamp: 'asc' },
    //     take: count - 1000,
    //   });
    //   await prisma.deviceStatus.deleteMany({
    //     where: { id: { in: toDelete.map(d => d.id) } },
    //   });
    // }

    return NextResponse.json({ ok: true, id: status.id });
  } catch (error) {
    console.error('Error in POST /api/status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

