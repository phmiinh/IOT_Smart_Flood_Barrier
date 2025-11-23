# ESP32 Integration Guide

This guide explains how to integrate your ESP32 device with the web dashboard.

## Device Registration

1. **Get your device API key**:
   After running `npm run db:seed`, the script will output an API key for device `esp32-001`.
   Save this key securely - you'll need it for all API requests.

2. **Verify device in database**:
   ```bash
   npx prisma studio
   # Navigate to Device table to see your device and API key
   ```

## API Endpoints for ESP32

### 1. Send Status Updates

**Endpoint**: `POST /api/status`

**Headers**:
- `Content-Type: application/json`
- `x-device-id: esp32-001`
- `x-api-key: YOUR_DEVICE_API_KEY`

**Request Body**:
```json
{
  "deviceId": "esp32-001",
  "waterLevelCm": 23.5,
  "doorState": "OPEN",
  "mode": "AUTO",
  "pHeavyRainNext24h": 0.78,
  "temperatureC": 29.5,
  "humidityPct": 90.0,
  "timestamp": "2025-11-24T12:34:56Z"
}
```

**Response**:
```json
{
  "ok": true,
  "id": "clx123..."
}
```

**ESP32 Code Example** (Arduino/PlatformIO):
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://YOUR_SERVER_IP:3000/api/status";
const char* deviceId = "esp32-001";
const char* apiKey = "YOUR_DEVICE_API_KEY";

void sendStatus(float waterLevel, String doorState, String mode, 
                float pHeavyRain, float temp, float humidity) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected");
    return;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-id", deviceId);
  http.addHeader("x-api-key", apiKey);

  // Get current timestamp
  time_t now = time(nullptr);
  char timestamp[30];
  strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%SZ", gmtime(&now));

  // Create JSON payload
  StaticJsonDocument<512> doc;
  doc["deviceId"] = deviceId;
  doc["waterLevelCm"] = waterLevel;
  doc["doorState"] = doorState;
  doc["mode"] = mode;
  doc["pHeavyRainNext24h"] = pHeavyRain;
  doc["temperatureC"] = temp;
  doc["humidityPct"] = humidity;
  doc["timestamp"] = timestamp;

  String payload;
  serializeJson(doc, payload);

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    Serial.printf("Status sent: %d\n", httpResponseCode);
    String response = http.getString();
    Serial.println(response);
  } else {
    Serial.printf("Error: %d\n", httpResponseCode);
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  // Configure time (for timestamp)
  configTime(0, 0, "pool.ntp.org");
}

void loop() {
  // Read sensors
  float waterLevel = readWaterLevel(); // Your sensor reading
  String doorState = "AUTO"; // Current door state
  String mode = "AUTO";
  float pHeavyRain = calculateRainProbability(); // Your ML model
  float temp = readTemperature(); // DHT22
  float humidity = readHumidity(); // DHT22

  // Send status every 30 seconds
  sendStatus(waterLevel, doorState, mode, pHeavyRain, temp, humidity);
  delay(30000);
}
```

### 2. Poll for Control Commands

**Endpoint**: `GET /api/control/latest?deviceId=esp32-001`

**Headers**:
- `x-device-id: esp32-001`
- `x-api-key: YOUR_DEVICE_API_KEY`

**Response**:
```json
{
  "deviceId": "esp32-001",
  "command": "AUTO",
  "createdAt": "2025-11-24T12:34:56.000Z"
}
```

**ESP32 Code Example**:
```cpp
String getLatestCommand() {
  if (WiFi.status() != WL_CONNECTED) {
    return "AUTO"; // Default
  }

  HTTPClient http;
  String url = String("http://YOUR_SERVER_IP:3000/api/control/latest?deviceId=") + deviceId;
  http.begin(url);
  http.addHeader("x-device-id", deviceId);
  http.addHeader("x-api-key", apiKey);

  int httpResponseCode = http.GET();

  if (httpResponseCode == 200) {
    String response = http.getString();
    
    StaticJsonDocument<256> doc;
    deserializeJson(doc, response);
    String command = doc["command"].as<String>();
    
    http.end();
    return command;
  }

  http.end();
  return "AUTO"; // Default on error
}

void loop() {
  // Poll for commands every 5 seconds
  String command = getLatestCommand();
  
  if (command == "OPEN") {
    openDoor();
  } else if (command == "CLOSE") {
    closeDoor();
  } else if (command == "AUTO") {
    // Use automatic logic based on sensors
    runAutoLogic();
  }
  
  delay(5000);
}
```

## Data Format Notes

### Water Level (`waterLevelCm`)
- **Smaller values = Higher water level**
- HC-SR04 measures distance from sensor to water surface
- Example: 20cm = water is 20cm from sensor (high water)
- Example: 60cm = water is 60cm from sensor (low water)

### Door State
- Must be one of: `"OPEN"`, `"MID"`, `"CLOSE"`

### Mode
- Must be one of: `"AUTO"`, `"MANUAL"`

### Heavy Rain Probability (`pHeavyRainNext24h`)
- Range: 0.0 to 1.0 (0% to 100%)
- This is your ML model's prediction output

### Timestamp
- Format: ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ssZ`)
- Example: `"2025-11-24T12:34:56Z"`

## Testing with cURL

### Test Status Endpoint
```bash
curl -X POST http://localhost:3000/api/status \
  -H "Content-Type: application/json" \
  -H "x-device-id: esp32-001" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "deviceId": "esp32-001",
    "waterLevelCm": 25.0,
    "doorState": "OPEN",
    "mode": "AUTO",
    "pHeavyRainNext24h": 0.65,
    "temperatureC": 28.0,
    "humidityPct": 85.0,
    "timestamp": "2025-11-24T12:34:56Z"
  }'
```

### Test Control Endpoint
```bash
curl -X GET "http://localhost:3000/api/control/latest?deviceId=esp32-001" \
  -H "x-device-id: esp32-001" \
  -H "x-api-key: YOUR_API_KEY"
```

## Error Handling

### 401 Unauthorized
- Check that `x-device-id` and `x-api-key` headers are correct
- Verify device exists in database
- Verify API key matches database

### 400 Bad Request
- Check that all required fields are present
- Verify data types match schema
- Check timestamp format

### 403 Forbidden
- Device ID in body/query doesn't match authenticated device

## Best Practices

1. **Send status updates regularly**: Every 30-60 seconds
2. **Poll for commands frequently**: Every 5-10 seconds
3. **Handle network errors gracefully**: Use default values (e.g., "AUTO" mode)
4. **Include proper timestamps**: Use NTP for accurate time
5. **Validate sensor readings**: Check for reasonable values before sending
6. **Implement retry logic**: Retry failed requests with exponential backoff

## Security

- **Never commit API keys** to version control
- **Use HTTPS in production** (not HTTP)
- **Rotate API keys periodically**
- **Monitor for unauthorized access attempts**

