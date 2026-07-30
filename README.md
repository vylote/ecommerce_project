# 🛒 VLT E-COMMERCE PLATFORM

```text
__      __ _   _______   ______                                     
\ \    / /| | |__   __| |  ____|                                    
 \ \  / / | |    | |    | |__   ___ ___  _ __ ___  _ __ ___   ___  _ __ ___ ___ 
  \ \/ /  | |    | |    |  __| / __/ _ \| '_ ` _ \| '_ ` _ \ / _ \| '__/ __/ _ \
   \  /   | |____| |    | |___| (_| (_) | | | | | | | | | | |  __/| | | (_|  __/
    \/    |______|_|    |______\___\___/|_| |_| |_|_| |_| |_|\___||_|  \___\___|

 :: Spring Boot ::      (v4.x)      :: Redis (JWT Blacklist) ::      :: React + Vite ::
```

---

## 🌟 Giới Thiệu Dự Án

**VLT E-Commerce** là một sàn thương mại điện tử thu nhỏ mô phỏng các tính năng cốt lõi của Shopee/Tiki, tập trung vào chất lượng code tối ưu, kiến trúc phân tầng sạch sẽ (Clean Layered Architecture) và áp dụng các giải pháp kỹ thuật giải quyết các bài toán thực tế thường gặp trong môi trường Production.

Dự án được xây dựng theo mô hình **Monorepo** giúp quản lý dễ dàng toàn bộ mã nguồn của cả Backend, Frontend và các dịch vụ bổ trợ.

---

## 🛠️ Tech Stack & Architecture

| Thành phần | Công nghệ | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Backend chính** | Spring Boot 4.x (Java 21) | Xây dựng RESTful API, quản lý Business Logic chính. |
| **Security** | Spring Security + Custom JWT | Xác thực Stateless qua HttpOnly Cookie, phân quyền theo Role + Permission chi tiết. |
| **Database** | MySQL 8.x | Hệ quản trị cơ sở dữ liệu quan hệ lưu trữ dữ liệu chính. |
| **Cache & Session** | Redis (Alpine) | Blacklist JWT khi logout — cho phép revoke token dù JWT vốn stateless. |
| **Mapping** | MapStruct | Ánh xạ mượt mà giữa Entity và DTO, loại bỏ boilerplate code. |
| **Real-time** | Node.js + Socket.io | Đẩy thông báo tức thời (Real-time Notification) tới client, tách riêng khỏi backend chính. |
| **Frontend** | React 19 + Vite + Redux Toolkit | UI/UX cho cả Buyer, Seller Dashboard. |
| **Container** | Docker & Docker Compose | Chạy nhất quán MySQL + Redis cho môi trường local. |

> **Ghi chú:** `docker-compose.yml` có khai báo thêm RabbitMQ, nhưng hiện **chưa được tích hợp vào code nghiệp vụ** — dự kiến dùng cho xử lý sự kiện bất đồng bộ ở giai đoạn phát triển tiếp theo.

---

## 🚀 Tính Năng Nổi Bật

### 🛡️ 1. Bảo mật đa tầng (RBAC & Permission-Based Access Control)
- **Vượt trội hơn RBAC thông thường:** Không chỉ check cứng `ROLE_BUYER`/`ROLE_SELLER`. Hệ thống có thêm tầng Permission chi tiết, lưu trong Database, ví dụ: `ACCESS_SELLER_PORTAL`, `CREATE_PRODUCT`, `VIP_EXCLUSIVE_VOUCHER`, `CONFIGURE_COMMISSION`. Có cả tier `ROLE_BUYER_VIP` với quyền riêng (`VIP_FREE_SHIPPING`, `VIP_EXCLUSIVE_VOUCHER`).
- **Mô hình Kênh Người Bán liền mạch:** Khi đăng ký bán hàng thành công, hệ thống gán thêm `ROLE_SELLER` ngay trên tài khoản hiện tại, sau đó Frontend tự động gọi `POST /auth/refresh` để cấp JWT mới có role cập nhật — người dùng chuyển sang "Kênh Người Bán" ngay lập tức mà **không cần đăng xuất/đăng nhập lại**.

### ⚡ 2. Chống trùng lặp đơn hàng (Idempotency qua Unique Constraint)
- Bảo vệ API `POST /orders` khỏi lỗi trùng lặp dữ liệu do người dùng bấm đúp (Double Submit) hoặc cơ chế Retry khi mạng chập chờn.
- Cơ chế: mỗi order được gắn `idempotency_key` (kết hợp UUID từ Frontend + ID shop), có **ràng buộc UNIQUE ở tầng MySQL**. Khi request trùng lặp cố insert lần 2, `GlobalExceptionHandler` bắt `DataIntegrityViolationException` và trả về lỗi nghiệp vụ rõ ràng thay vì lỗi 500.

### 🔒 3. Chống Race Condition khi đặt hàng đồng thời
- Trừ tồn kho bằng **Atomic Conditional Update** (`UPDATE ... WHERE stockQuantity >= :qty`) — kiểm tra và ghi trong cùng 1 câu lệnh SQL, tận dụng row-level lock của InnoDB, tránh oversell khi nhiều buyer cùng mua 1 sản phẩm sắp hết hàng.
- Riêng thao tác hoàn tất đơn hàng (tính hoa hồng) dùng **Pessimistic Lock** (`@Lock(PESSIMISTIC_WRITE)`), đảm bảo không bị tính hoa hồng 2 lần nếu buyer bấm nút nhiều lần liên tiếp.

### 📈 4. Dashboard thống kê tối ưu cho Seller
- Thay vì gọi nhiều câu `SELECT COUNT` riêng lẻ cho từng trạng thái đơn hàng, hệ thống dùng **1 câu truy vấn `GROUP BY` duy nhất** để đếm toàn bộ trạng thái đơn hàng (Pending/Confirmed/Shipping/Completed) cùng lúc.
- *(Đang phát triển tiếp: thống kê sản phẩm hết hàng/tạm khóa hiện vẫn hiển thị dữ liệu mẫu ở Frontend, chưa có API riêng.)*

### 🧹 5. Tự động dọn ảnh cũ trên Cloudinary khi cập nhật ảnh đại diện
- Khi người dùng đổi ảnh đại diện, hệ thống tự bóc tách `public_id` từ URL ảnh cũ và gọi `destroy()` của Cloudinary để xóa file cũ, tránh tồn đọng ảnh mồ côi (orphan files) trên cloud.
- *(Cơ chế này hiện áp dụng cho ảnh đại diện; ảnh sản phẩm là hướng mở rộng tiếp theo.)*

---

## 💻 Khởi Động Nhanh (Local Setup)

### Bước 1: Clone dự án
```bash
git clone https://github.com/vylote/ecommerce_project.git
cd ecommerce_project
```

### Bước 2: Khởi động hạ tầng (MySQL + Redis) bằng Docker
```bash
docker compose up -d
```
> Lưu ý: `docker-compose.yml` hiện chỉ dựng MySQL + Redis (+ RabbitMQ chưa dùng tới). Backend/Frontend/Notification chạy trực tiếp bằng Node/Maven ở bước dưới, chưa được đóng gói thành container riêng.

### Bước 3: Cài dependencies & chạy toàn bộ hệ thống
```bash
cd frontend && npm install && cd ../notification && npm install && cd ..
npm install        # cài concurrently ở thư mục gốc
npm run dev         # chạy song song cả 3 service
```

### 💡 Mẹo cá nhân: shell alias cho WSL2/Ubuntu

Nếu bạn làm việc thường xuyên trên WSL2/Ubuntu, có thể thêm 2 alias sau vào `~/.bashrc` (hoặc `~/.zshrc`) để rút gọn thao tác bật/tắt hạ tầng mỗi lần làm việc:

```bash
alias startdev='sudo service docker start; cd ~/ecommerce_project; docker compose up -d; code .'
alias stopdev='docker compose down'
```

`startdev` sẽ khởi động Docker daemon, `cd` vào thư mục project, dựng MySQL + Redis, rồi mở VS Code — **chưa tự chạy** `npm run dev`, bạn vẫn cần chạy lệnh đó riêng ở Bước 3 sau khi editor mở lên. Đây là alias cá nhân, không phải script có sẵn trong repo — cần tự thêm vào file cấu hình shell của bạn nếu muốn dùng.

- **Backend:** `http://localhost:8080/api/v1`
- **Swagger API Docs:** `http://localhost:8080/api/v1/swagger-ui.html`
- **Frontend UI:** `http://localhost:5173`
- **Notification service:** `http://localhost:3000`