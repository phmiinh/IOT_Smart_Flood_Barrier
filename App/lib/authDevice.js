import { prisma } from './prisma';

/**
 * Authenticates a device using device ID and API key from headers.
 * ESP32 devices send these headers:
 * - x-device-id: e.g., "esp32-001"
 * - x-api-key: the device's API key
 * 
 * @param {Headers} headers - Request headers object
 * @returns {Promise<{id: string, name: string} | null>} Device object if authenticated, null otherwise
 */
export async function authenticateDevice(headers) {
  const deviceId = headers.get('x-device-id');
  const apiKey = headers.get('x-api-key');

  if (!deviceId || !apiKey) {
    return null;
  }

  try {
    const device = await prisma.device.findUnique({
      where: {
        id: deviceId,
      },
    });

    if (!device || device.apiKey !== apiKey) {
      return null;
    }

    return {
      id: device.id,
      name: device.name,
    };
  } catch (error) {
    console.error('Device authentication error:', error);
    return null;
  }
}

