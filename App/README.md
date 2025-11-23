# Smart Flood Barrier Dashboard

A production-ready Next.js web application for monitoring and controlling an IoT-based Smart Flood Barrier System. This dashboard provides real-time status monitoring, historical data visualization, and remote control capabilities for ESP32-based flood barrier devices.

## Features

- 🔐 **Authentication & Authorization**: NextAuth with role-based access (ADMIN/VIEWER)
- 📊 **Real-time Dashboard**: Live status updates with charts and metrics
- 🎛️ **Remote Control**: Send commands to ESP32 devices (OPEN/CLOSE/AUTO)
- 📈 **Data Visualization**: Historical charts for water level and rain probability
- 🔔 **Telegram Alerts**: Automated alerts for flood risk conditions
- 🛡️ **Device API Security**: Secure API key authentication for ESP32 devices
- 📱 **Responsive UI**: Modern, clean interface with Tailwind CSS and shadcn/ui

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Charts**: Recharts
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js (Auth.js)
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js 18+ and npm
- SQLite (included with Node.js)

## Installation

1. **Navigate to the App directory**:
   ```bash
   cd App
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the `App` directory:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

   # Telegram Bot (optional, for alerts)
   TELEGRAM_BOT_TOKEN=""
   TELEGRAM_CHAT_ID=""
   ```

   **Important**: Generate a secure `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**:
   ```bash
   # Create database and run migrations
   npx prisma migrate dev --name init

   # Seed the database with default data
   npm run db:seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Credentials

After running the seed script, you can log in with:

- **Admin User**:
  - Email: `admin@example.com`
  - Password: `password123`
  - Role: `ADMIN` (can control devices)

- **Viewer User**:
  - Email: `viewer@example.com`
  - Password: `password123`
  - Role: `VIEWER` (read-only access)

## Device API Key

After seeding, the script will output a device API key for `esp32-001`. **Save this key** - you'll need it for ESP32 authentication.

You can also retrieve it later:
```bash
npx prisma studio
# Navigate to Device table and copy the apiKey
```

## ESP32 Integration

### Sending Status Updates

Your ESP32 should periodically POST status updates to `/api/status`:

```bash
curl -X POST http://localhost:3000/api/status \
  -H "Content-Type: application/json" \
  -H "x-device-id: esp32-001" \
  -H "x-api-key: YOUR_DEVICE_API_KEY" \
  -d '{
    "deviceId": "esp32-001",
    "waterLevelCm": 23.5,
    "doorState": "OPEN",
    "mode": "AUTO",
    "pHeavyRainNext24h": 0.78,
    "temperatureC": 29.5,
    "humidityPct": 90.0,
    "timestamp": "2025-11-24T12:34:56Z"
  }'
```

### Polling for Commands

ESP32 should poll `/api/control/latest` to get control commands:

```bash
curl -X GET "http://localhost:3000/api/control/latest?deviceId=esp32-001" \
  -H "x-device-id: esp32-001" \
  -H "x-api-key: YOUR_DEVICE_API_KEY"
```

Response:
```json
{
  "deviceId": "esp32-001",
  "command": "AUTO",
  "createdAt": "2025-11-24T12:34:56.000Z"
}
```

## Understanding the Data

### Water Level (`waterLevelCm`)

- **Smaller values = Higher water level**
- The HC-SR04 ultrasonic sensor measures distance from sensor to water surface
- **Safe**: > 40cm (green)
- **Warning**: 20-40cm (orange)
- **Critical**: < 20cm (red)

### Heavy Rain Probability (`pHeavyRainNext24h`)

- ML model prediction (logistic regression) for heavy rain in next ~24 hours
- Range: 0.0 to 1.0 (0% to 100%)
- **Low Risk**: < 40% (green)
- **Medium Risk**: 40-70% (yellow)
- **High Risk**: > 70% (red)

### Alert Conditions

Telegram alerts are triggered when:
- `pHeavyRainNext24h >= 0.8` (80% probability), OR
- `waterLevelCm <= 20` (critical water level)

## API Routes

### User-Facing APIs (Require NextAuth Session)

- `GET /api/status/latest?deviceId=esp32-001` - Get latest device status
- `GET /api/logs?deviceId=esp32-001&limit=100` - Get historical logs
- `POST /api/control` - Send control command (ADMIN only)

### Device APIs (Require Device API Key)

- `POST /api/status` - ESP32 sends status updates
- `GET /api/control/latest?deviceId=esp32-001` - ESP32 polls for commands

## Project Structure

```
App/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth routes
│   │   ├── status/        # Status endpoints
│   │   ├── logs/          # Logs endpoint
│   │   └── control/       # Control endpoints
│   ├── login/             # Login page
│   ├── logs/               # Logs page
│   ├── settings/           # Settings page
│   ├── layout.jsx          # Root layout
│   ├── page.jsx            # Dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── dashboard/          # Dashboard components
│   └── layout/             # Layout components
├── lib/
│   ├── auth.js             # Auth helpers
│   ├── authDevice.js       # Device authentication
│   ├── prisma.js           # Prisma client
│   ├── telegram.js         # Telegram integration
│   └── utils.js            # Utility functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js             # Seed script
└── public/                 # Static assets
```

## Database Schema

- **User**: Authentication and authorization
- **Device**: ESP32 devices with API keys
- **DeviceStatus**: Historical status records
- **ControlCommand**: Commands sent to devices
- **AlertLog**: Alert history

## Development

### Database Commands

```bash
# Create migration
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Build for Production

```bash
npm run build
npm start
```

## Security Notes

- **Never commit** `.env` files or API keys
- Change default passwords in production
- Use strong `NEXTAUTH_SECRET` in production
- Rotate device API keys periodically
- Use HTTPS in production

## Troubleshooting

### Database Issues

If you encounter database errors:
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset
npm run db:seed
```

### Authentication Issues

- Ensure `NEXTAUTH_SECRET` is set in `.env`
- Check that `NEXTAUTH_URL` matches your app URL
- Clear browser cookies if login fails

### Device API Issues

- Verify device API key matches database
- Check `x-device-id` and `x-api-key` headers
- Ensure device exists in database

## License

This project is part of a university IoT final project.

## Support

For issues or questions, please refer to the project documentation or contact the development team.

