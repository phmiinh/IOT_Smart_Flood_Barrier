# Smart Flood Barrier Dashboard

Ứng dụng web Next.js chuyên nghiệp để giám sát và điều khiển hệ thống chống ngập thông minh dựa trên IoT. Dashboard này cung cấp khả năng giám sát trạng thái thời gian thực, trực quan hóa dữ liệu lịch sử và điều khiển từ xa cho các thiết bị chống ngập dựa trên ESP32.

## 📋 Mục Lục

- [Tổng Quan](#tổng-quan)
- [Tính Năng Chi Tiết](#tính-năng-chi-tiết)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Cài Đặt](#cài-đặt)
- [Hướng Dẫn Sử Dụng](#hướng-dẫn-sử-dụng)
- [Tích Hợp ESP32](#tích-hợp-esp32)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)

## 🎯 Tổng Quan

Smart Flood Barrier Dashboard là một hệ thống quản lý và giám sát hoàn chỉnh cho hệ thống chống ngập thông minh. Ứng dụng cho phép:

- **Giám sát thời gian thực**: Theo dõi mực nước, nhiệt độ, độ ẩm và trạng thái cửa chống ngập
- **Dự đoán rủi ro**: Sử dụng mô hình Machine Learning để dự đoán khả năng mưa lớn trong 24 giờ tới
- **Điều khiển từ xa**: Gửi lệnh điều khiển (MỞ/ĐÓNG/TỰ ĐỘNG) đến thiết bị ESP32
- **Cảnh báo tự động**: Gửi thông báo Telegram khi phát hiện rủi ro ngập lụt
- **Bảo mật**: Hệ thống xác thực 2 lớp cho người dùng và thiết bị

## ✨ Tính Năng Chi Tiết

### 1. 🔐 Hệ Thống Xác Thực và Phân Quyền

#### Xác Thực Người Dùng (NextAuth)
- **Đăng nhập an toàn**: Sử dụng email và mật khẩu với mã hóa bcrypt
- **Session management**: Quản lý phiên đăng nhập tự động
- **Bảo vệ routes**: Tất cả các trang dashboard đều được bảo vệ, yêu cầu đăng nhập

#### Phân Quyền Theo Vai Trò
- **ADMIN (Quản trị viên)**:
  - Xem toàn bộ dashboard và dữ liệu
  - Gửi lệnh điều khiển thiết bị (MỞ/ĐÓNG/TỰ ĐỘNG)
  - Quản lý người dùng và thiết bị (tính năng tương lai)
  - Xem lịch sử cảnh báo và nhật ký hệ thống

- **VIEWER (Người xem)**:
  - Xem dashboard và dữ liệu giám sát
  - Xem biểu đồ và lịch sử
  - **KHÔNG** thể gửi lệnh điều khiển
  - Chỉ có quyền đọc (read-only)

#### Xác Thực Thiết Bị (Device API Key)
- Mỗi thiết bị ESP32 có một API key duy nhất
- ESP32 gửi kèm `x-device-id` và `x-api-key` trong headers
- Hệ thống xác thực và chỉ cho phép thiết bị hợp lệ truy cập API
- Bảo mật 2 lớp: API key + Device ID verification

### 2. 📊 Dashboard Thời Gian Thực

#### Summary Cards (Thẻ Tóm Tắt)
Dashboard hiển thị 4 thẻ thông tin chính:

**a) Mực Nước (Water Level)**
- Hiển thị khoảng cách từ cảm biến đến mặt nước (cm)
- **Lưu ý quan trọng**: Giá trị nhỏ hơn = mực nước cao hơn
  - Cảm biến HC-SR04 đo khoảng cách, nên khi nước dâng cao, khoảng cách giảm
- Mã màu trạng thái:
  - 🟢 **An toàn**: > 40cm (màu xanh lá)
  - 🟠 **Cảnh báo**: 20-40cm (màu cam)
  - 🔴 **Nguy hiểm**: < 20cm (màu đỏ)
- Hiển thị trạng thái hiện tại và giải thích ngắn gọn

**b) Trạng Thái Cửa và Chế Độ (Door & Mode)**
- **Door State**: Trạng thái cửa chống ngập
  - `OPEN`: Cửa mở
  - `MID`: Cửa ở vị trí giữa
  - `CLOSE`: Cửa đóng
- **Mode**: Chế độ hoạt động
  - `AUTO`: Tự động (dựa trên cảm biến và ML model)
  - `MANUAL`: Thủ công (điều khiển bằng nút vật lý)
- Hiển thị với badge màu sắc để dễ nhận biết

**c) Rủi Ro Mưa Lớn 24h (Heavy Rain Risk)**
- Hiển thị xác suất mưa lớn trong 24 giờ tới từ mô hình ML
- Giá trị: 0% - 100%
- Mã màu rủi ro:
  - 🟢 **Thấp**: < 40% (màu xanh lá)
  - 🟡 **Trung bình**: 40-70% (màu vàng)
  - 🔴 **Cao**: > 70% (màu đỏ)
- Giải thích: "Đây là xác suất dự đoán mưa lớn trong ~24h từ mô hình ML"

**d) Môi Trường (Environment)**
- **Nhiệt độ**: Hiển thị độ C từ cảm biến DHT22
- **Độ ẩm**: Hiển thị phần trăm độ ẩm
- Cập nhật thời gian thực mỗi 5 giây

#### Biểu Đồ Thời Gian Thực (Real-time Charts)

**Biểu Đồ 1: Mực Nước Theo Thời Gian**
- Biểu đồ đường (line chart) hiển thị mực nước trong khoảng thời gian gần đây
- Trục X: Thời gian (giờ:phút)
- Trục Y: Mực nước (cm)
- Tooltip hiển thị thông tin chi tiết khi hover
- Tự động cập nhật khi có dữ liệu mới
- Hiển thị tối đa 50 điểm dữ liệu gần nhất

**Biểu Đồ 2: Xác Suất Mưa Lớn Theo Thời Gian**
- Biểu đồ đường hiển thị xác suất mưa lớn (%)
- Trục X: Thời gian
- Trục Y: Xác suất (0-100%)
- Màu đỏ để nhấn mạnh rủi ro
- Tooltip giải thích: "ML model prediction for next 24h"

#### Cập Nhật Tự Động
- Dashboard tự động làm mới dữ liệu mỗi 5 giây
- Không cần reload trang
- Hiển thị trạng thái loading khi đang tải dữ liệu
- Phát hiện thiết bị offline nếu không nhận được dữ liệu > 60 giây

### 3. 🎛️ Bảng Điều Khiển (Control Panel)

#### Tính Năng
- **Chỉ dành cho ADMIN**: VIEWER không thể thấy hoặc sử dụng bảng điều khiển
- **3 nút điều khiển chính**:
  - **OPEN**: Mở cửa chống ngập
  - **CLOSE**: Đóng cửa chống ngập
  - **AUTO**: Chuyển sang chế độ tự động (hệ thống tự quyết định dựa trên cảm biến)

#### Quy Trình Hoạt Động
1. Người dùng nhấn nút điều khiển
2. Hệ thống gửi lệnh đến API `/api/control`
3. Lệnh được lưu vào database
4. ESP32 sẽ poll (truy vấn) endpoint `/api/control/latest` để lấy lệnh mới nhất
5. ESP32 thực thi lệnh (điều khiển servo motor)
6. Hiển thị thông báo thành công/lỗi cho người dùng

#### Thông Tin Hiển Thị
- **Lệnh cuối cùng**: Hiển thị lệnh gần nhất đã gửi
- **Thời gian**: Hiển thị thời gian gửi lệnh
- **Trạng thái**: Loading khi đang gửi, disabled khi không có quyền

### 4. 📈 Trực Quan Hóa Dữ Liệu

#### Biểu Đồ Tương Tác
- Sử dụng thư viện **Recharts** - thư viện biểu đồ React mạnh mẽ
- **Responsive**: Tự động điều chỉnh kích thước theo màn hình
- **Tooltip**: Hiển thị thông tin chi tiết khi di chuột
- **Màu sắc**: Phù hợp với theme (light/dark mode)
- **Trục tọa độ**: Có nhãn rõ ràng, dễ đọc

#### Dữ Liệu Lịch Sử
- Lưu trữ tất cả các bản ghi trạng thái thiết bị
- Có thể xem lịch sử trong trang "Logs"
- Hỗ trợ phân trang và giới hạn số lượng bản ghi
- Sắp xếp theo thời gian (mới nhất trước)

### 5. 📋 Bảng Sự Kiện (Event Log)

#### Tính Năng
- Hiển thị bảng dữ liệu dạng bảng (table)
- **Các cột thông tin**:
  - Thời gian (Timestamp)
  - Mực nước (Water Level)
  - Trạng thái cửa (Door State)
  - Chế độ (Mode)
  - Rủi ro mưa (Rain Risk %)
  - Nhiệt độ (Temperature)
  - Độ ẩm (Humidity)

#### Trang Logs Riêng
- Trang `/logs` hiển thị toàn bộ lịch sử
- Hỗ trợ xem tối đa 100 bản ghi
- Có nút refresh để cập nhật dữ liệu
- Hiển thị loading state khi đang tải

### 6. 🔔 Hệ Thống Cảnh Báo Telegram

#### Điều Kiện Kích Hoạt
Hệ thống tự động gửi cảnh báo Telegram khi:

1. **Xác suất mưa lớn cao**: `pHeavyRainNext24h >= 0.8` (≥ 80%)
2. **Mực nước nguy hiểm**: `waterLevelCm <= 20` (≤ 20cm - mực nước rất cao)

#### Nội Dung Cảnh Báo
Thông báo Telegram bao gồm:
- 🚨 Tiêu đề cảnh báo
- ID thiết bị
- Mực nước hiện tại
- Xác suất mưa lớn (%)
- Trạng thái cửa
- Chế độ hoạt động
- Nhiệt độ và độ ẩm
- Thời gian phát hiện

#### Lưu Trữ Lịch Sử
- Mỗi cảnh báo được lưu vào bảng `AlertLog`
- Phân loại mức độ: INFO, WARN, CRITICAL
- Có thể xem lại lịch sử cảnh báo trong tương lai

#### Cấu Hình
- Cần thiết lập `TELEGRAM_BOT_TOKEN` và `TELEGRAM_CHAT_ID` trong `.env`
- Nếu không cấu hình, hệ thống vẫn hoạt động nhưng không gửi cảnh báo
- Hỗ trợ HTML formatting trong tin nhắn

### 7. 🛡️ Bảo Mật

#### Bảo Mật Người Dùng
- **Mật khẩu được mã hóa**: Sử dụng bcrypt với salt rounds
- **Session tokens**: JWT tokens an toàn
- **CSRF protection**: NextAuth tự động bảo vệ
- **Route protection**: Middleware bảo vệ các routes quan trọng

#### Bảo Mật Thiết Bị
- **API Key duy nhất**: Mỗi thiết bị có một API key ngẫu nhiên
- **Header validation**: Kiểm tra cả device ID và API key
- **Device ID verification**: Đảm bảo device ID trong body/query khớp với authenticated device

#### Best Practices
- Không commit `.env` files
- Sử dụng HTTPS trong production
- Rotate API keys định kỳ
- Strong NEXTAUTH_SECRET

### 8. 📱 Giao Diện Người Dùng

#### Thiết Kế
- **Modern & Clean**: Giao diện hiện đại, sạch sẽ
- **Responsive**: Hoạt động tốt trên mọi kích thước màn hình
- **Dark Mode Support**: Hỗ trợ chế độ tối (có thể mở rộng)
- **Accessibility**: Tuân thủ các tiêu chuẩn accessibility

#### Components
- Sử dụng **shadcn/ui**: Thư viện UI components dựa trên Radix UI
- **Consistent Design**: Tất cả components có thiết kế nhất quán
- **Loading States**: Skeleton loaders và spinners
- **Error Handling**: Thông báo lỗi thân thiện với người dùng
- **Toast Notifications**: Thông báo phản hồi khi thực hiện hành động

#### Navigation
- **Sidebar**: Menu điều hướng bên trái
  - Dashboard
  - Logs
  - Settings
- **User Info**: Hiển thị tên và vai trò người dùng
- **Logout**: Nút đăng xuất dễ truy cập

### 9. 🔄 Phát Hiện Thiết Bị Offline

#### Tính Năng
- Tự động phát hiện khi thiết bị không gửi dữ liệu > 60 giây
- Hiển thị cảnh báo màu vàng trên dashboard
- Thông báo rõ ràng: "Device Offline - No status updates received"

#### Xử Lý
- Vẫn hiển thị dữ liệu cũ nếu có
- Tiếp tục poll để phát hiện khi thiết bị online lại
- Không chặn các tính năng khác của dashboard

### 10. 📊 Quản Lý Dữ Liệu

#### Database Schema
- **User**: Thông tin người dùng và phân quyền
- **Device**: Thông tin thiết bị và API keys
- **DeviceStatus**: Lịch sử trạng thái thiết bị
- **ControlCommand**: Lịch sử lệnh điều khiển
- **AlertLog**: Lịch sử cảnh báo

#### Data Retention
- Lưu trữ tất cả dữ liệu lịch sử
- Có thể cấu hình giới hạn số lượng bản ghi (hiện tại: giữ tất cả)
- Indexes để tối ưu truy vấn

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **Next.js 14+**: Framework React với App Router
- **JavaScript**: Ngôn ngữ lập trình chính
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: UI component library (Radix UI)
- **Recharts**: Thư viện biểu đồ React
- **Lucide React**: Icon library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Type-safe database client
- **SQLite**: Database (có thể chuyển sang PostgreSQL)
- **NextAuth.js**: Authentication library
- **bcryptjs**: Password hashing

### DevOps & Tools
- **Prisma Migrate**: Database migrations
- **Prisma Studio**: Database GUI
- **ESLint**: Code linting

## 📦 Cài Đặt

### Yêu Cầu Hệ Thống
- Node.js 18+ và npm
- SQLite (đã có sẵn với Node.js)

### Các Bước Cài Đặt

1. **Di chuyển vào thư mục App**:
   ```bash
   cd App
   ```

2. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

3. **Tạo file `.env`**:
   Tạo file `.env` trong thư mục `App` với nội dung:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

   # Telegram Bot (tùy chọn, cho cảnh báo)
   TELEGRAM_BOT_TOKEN=""
   TELEGRAM_CHAT_ID=""
   ```

   **Quan trọng**: Tạo `NEXTAUTH_SECRET` an toàn:
   ```bash
   openssl rand -base64 32
   ```

4. **Thiết lập database**:
   ```bash
   # Tạo database và chạy migrations
   npx prisma migrate dev --name init

   # Seed database với dữ liệu mặc định
   npm run db:seed
   ```

5. **Chạy ứng dụng**:
   ```bash
   npm run dev
   ```

6. **Mở trình duyệt**:
   Truy cập [http://localhost:3000](http://localhost:3000)

## 👤 Thông Tin Đăng Nhập Mặc Định

Sau khi chạy seed script, bạn có thể đăng nhập với:

### Tài Khoản Admin
- **Email**: `admin@example.com`
- **Mật khẩu**: `password123`
- **Vai trò**: `ADMIN` (có thể điều khiển thiết bị)

### Tài Khoản Viewer
- **Email**: `viewer@example.com`
- **Mật khẩu**: `password123`
- **Vai trò**: `VIEWER` (chỉ xem, không điều khiển)

## 🔑 Device API Key

Sau khi seed, script sẽ hiển thị API key cho thiết bị `esp32-001`. **Lưu lại key này** - bạn sẽ cần nó để xác thực ESP32.

Bạn cũng có thể xem lại sau:
```bash
npx prisma studio
# Điều hướng đến bảng Device và copy apiKey
```

## 🔌 Tích Hợp ESP32

### Gửi Status Updates

ESP32 nên gửi POST request định kỳ đến `/api/status`:

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

### Polling cho Commands

ESP32 nên poll `/api/control/latest` để lấy lệnh điều khiển:

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

Xem file `ESP32_INTEGRATION.md` để biết hướng dẫn chi tiết và code mẫu cho ESP32.

## 📖 Hiểu Về Dữ Liệu

### Mực Nước (`waterLevelCm`)

- **Giá trị nhỏ hơn = Mực nước cao hơn**
- Cảm biến HC-SR04 đo khoảng cách từ cảm biến đến mặt nước
- **An toàn**: > 40cm (xanh lá)
- **Cảnh báo**: 20-40cm (cam)
- **Nguy hiểm**: < 20cm (đỏ)

**Ví dụ**:
- 20cm = nước cách cảm biến 20cm (mực nước cao)
- 60cm = nước cách cảm biến 60cm (mực nước thấp)

### Xác Suất Mưa Lớn (`pHeavyRainNext24h`)

- Dự đoán từ mô hình ML (logistic regression) cho mưa lớn trong ~24 giờ tới
- Phạm vi: 0.0 đến 1.0 (0% đến 100%)
- **Rủi ro thấp**: < 40% (xanh lá)
- **Rủi ro trung bình**: 40-70% (vàng)
- **Rủi ro cao**: > 70% (đỏ)

### Điều Kiện Cảnh Báo

Cảnh báo Telegram được kích hoạt khi:
- `pHeavyRainNext24h >= 0.8` (≥ 80% xác suất), HOẶC
- `waterLevelCm <= 20` (mực nước nguy hiểm)

## 🔌 API Routes

### APIs Cho Người Dùng (Yêu Cầu NextAuth Session)

- `GET /api/status/latest?deviceId=esp32-001` - Lấy trạng thái thiết bị mới nhất
- `GET /api/logs?deviceId=esp32-001&limit=100` - Lấy lịch sử logs
- `POST /api/control` - Gửi lệnh điều khiển (chỉ ADMIN)

### APIs Cho Thiết Bị (Yêu Cầu Device API Key)

- `POST /api/status` - ESP32 gửi status updates
- `GET /api/control/latest?deviceId=esp32-001` - ESP32 poll để lấy commands

## 📁 Cấu Trúc Dự Án

```
App/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth routes
│   │   ├── status/        # Status endpoints
│   │   ├── logs/          # Logs endpoint
│   │   └── control/       # Control endpoints
│   ├── login/             # Trang đăng nhập
│   ├── logs/               # Trang logs
│   ├── settings/           # Trang settings
│   ├── layout.jsx          # Root layout
│   ├── page.jsx            # Trang dashboard
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

## 💾 Database Schema

- **User**: Xác thực và phân quyền người dùng
- **Device**: Thiết bị ESP32 với API keys
- **DeviceStatus**: Lịch sử trạng thái thiết bị
- **ControlCommand**: Lệnh điều khiển gửi đến thiết bị
- **AlertLog**: Lịch sử cảnh báo

## 🚀 Development

### Database Commands

```bash
# Tạo migration
npm run db:migrate

# Seed database
npm run db:seed

# Mở Prisma Studio (database GUI)
npm run db:studio
```

### Build cho Production

```bash
npm run build
npm start
```

## 🔒 Lưu Ý Bảo Mật

- **KHÔNG BAO GIỜ** commit file `.env` hoặc API keys
- Đổi mật khẩu mặc định trong production
- Sử dụng `NEXTAUTH_SECRET` mạnh trong production
- Rotate device API keys định kỳ
- Sử dụng HTTPS trong production

## 🐛 Xử Lý Sự Cố

### Vấn Đề Database

Nếu gặp lỗi database:
```bash
# Reset database (CẢNH BÁO: xóa tất cả dữ liệu)
npx prisma migrate reset
npm run db:seed
```

### Vấn Đề Xác Thực

- Đảm bảo `NEXTAUTH_SECRET` đã được set trong `.env`
- Kiểm tra `NEXTAUTH_URL` khớp với URL của app
- Xóa cookies trình duyệt nếu đăng nhập thất bại

### Vấn Đề Device API

- Xác minh device API key khớp với database
- Kiểm tra headers `x-device-id` và `x-api-key`
- Đảm bảo device tồn tại trong database

## 📝 License

Dự án này là một phần của đồ án cuối kỳ IoT đại học.

## 📞 Hỗ Trợ

Đối với các vấn đề hoặc câu hỏi, vui lòng tham khảo tài liệu dự án hoặc liên hệ nhóm phát triển.

---

**Lưu ý**: Đây là phiên bản dành cho môi trường phát triển. Khi triển khai production, hãy đảm bảo:
- Sử dụng HTTPS
- Thay đổi tất cả mật khẩu mặc định
- Sử dụng database production (PostgreSQL)
- Cấu hình firewall và security headers
- Thiết lập monitoring và logging
