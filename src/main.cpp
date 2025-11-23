#include <Arduino.h>

// Định nghĩa các chân cho cảm biến HC-SR04
const int TRIG_PIN = 5;
const int ECHO_PIN = 18;

// Định nghĩa hằng số
const float SOUND_SPEED = 0.0343; // Tốc độ âm thanh (cm/microsecond)

void setup() {
  Serial.begin(115200);
  
  // Cấu hình chân
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  Serial.println("HC-SR04 Test");
}

void loop() {
  // Tạo một xung ngắn 10 microsecond để kích hoạt cảm biến
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Đo thời gian của xung ECHO
  // pulseIn() sẽ đợi chân ECHO lên HIGH, bắt đầu đếm thời gian,
  // và dừng đếm khi chân ECHO về LOW. Kết quả là độ dài của xung (microsecond)
  long duration = pulseIn(ECHO_PIN, HIGH);

  // Tính toán khoảng cách
  // Khoảng cách = (Thời gian * Tốc độ âm thanh) / 2
  // Chia 2 vì sóng siêu âm đi và về
  float distance = (duration * SOUND_SPEED) / 2;

  // In kết quả ra Serial Monitor
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  delay(1000); // Đợi 1 giây trước khi đo lại
}