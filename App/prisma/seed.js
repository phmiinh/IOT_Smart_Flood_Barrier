const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create viewer user
  const viewerPasswordHash = await bcrypt.hash('password123', 10);
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      name: 'Viewer User',
      email: 'viewer@example.com',
      passwordHash: viewerPasswordHash,
      role: 'VIEWER',
    },
  });
  console.log('✅ Created viewer user:', viewer.email);

  // Create default device with random API key
  const deviceApiKey = crypto.randomBytes(32).toString('hex');
  const device = await prisma.device.upsert({
    where: { id: 'esp32-001' },
    update: {},
    create: {
      id: 'esp32-001',
      name: 'Main Flood Barrier',
      apiKey: deviceApiKey,
    },
  });
  console.log('✅ Created device:', device.id);
  console.log('🔑 Device API Key:', deviceApiKey);
  console.log('⚠️  Save this API key - you will need it for ESP32 authentication!');

  // Create some fake historical data for charts
  const now = new Date();
  const historicalData = [];
  
  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000)); // Each hour back
    const waterLevel = 30 + Math.random() * 30; // 30-60cm
    const pHeavyRain = Math.random() * 0.5; // 0-0.5
    const temp = 25 + Math.random() * 10; // 25-35°C
    const humidity = 60 + Math.random() * 30; // 60-90%
    
    historicalData.push({
      deviceId: device.id,
      waterLevelCm: waterLevel,
      doorState: waterLevel < 25 ? 'OPEN' : waterLevel < 40 ? 'MID' : 'CLOSE',
      mode: 'AUTO',
      pHeavyRainNext24h: pHeavyRain,
      temperatureC: temp,
      humidityPct: humidity,
      timestamp: timestamp,
    });
  }

  await prisma.deviceStatus.createMany({
    data: historicalData,
  });
  console.log('✅ Created 50 historical status records');

  // Create initial control command
  await prisma.controlCommand.create({
    data: {
      deviceId: device.id,
      command: 'AUTO',
      requestedByUserId: admin.id,
    },
  });
  console.log('✅ Created initial control command (AUTO)');

  console.log('\n🎉 Seed completed!');
  console.log('\n📝 Default credentials:');
  console.log('   Admin: admin@example.com / password123');
  console.log('   Viewer: viewer@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

