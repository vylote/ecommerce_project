# Ecommerce Marketplace

Ứng dụng gồm backend Spring Boot, frontend React và realtime gateway Node.js.

## Cấu trúc thư mục

```text
apps/
  api/                 # Spring Boot, Maven, nghiệp vụ và dữ liệu
  web/                 # React, Vite
  realtime-gateway/    # RabbitMQ consumer và Socket.IO
scripts/               # Script hỗ trợ phát triển
docker-compose.yml     # MySQL, Redis, RabbitMQ
.env                   # Cấu hình môi trường duy nhất ở root, không commit
```

Các thư mục cũ đã được chuyển: `backend` sang `apps/api`, `frontend` sang
`apps/web`, `notification` sang `apps/realtime-gateway`. Java package, API và
cấu trúc nghiệp vụ bên trong các ứng dụng được giữ nguyên.

## Chạy local

Yêu cầu Java 21, Node.js/npm và Docker Compose.

Chạy từ root của repository. Nếu chưa cài dependencies:

```bash
npm ci
npm --prefix apps/web ci
npm --prefix apps/realtime-gateway ci
```

Giữ cấu hình của bạn trong `.env` ở root. Vite và realtime gateway tự đọc file
này. Với Spring Boot, cấu hình chạy Java trong `.vscode/launch.json` sử dụng
root `.env`; khi chạy Maven từ terminal, cần nạp các biến vào môi trường của
terminal trước. Maven không tự đọc `.env`.

```bash
docker compose up -d
npm run dev
```

Có thể chạy từng ứng dụng từ root:

```bash
npm run dev:api
npm run dev:web
npm run dev:realtime
```

## Build và kiểm tra

```bash
npm run build:web
npm run build:api
npm run test:api
```

Frontend build ra `apps/web/dist`; Maven build ra `apps/api/target`.
Lệnh `build:api` bỏ qua test; dùng `test:api` để chạy test riêng.

Trong IDE, mở root repository và import Maven project tại `apps/api/pom.xml`.
Nếu cấu hình chạy cũ trỏ đến `backend`, cập nhật working directory thành
`apps/api`; giữ đường dẫn env file là `.env` ở root.
