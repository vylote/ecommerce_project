# TÀI LIỆU ĐẶC TẢ YÊU CẦU DỰ ÁN
**Tên đề tài:** Xây dựng Nền tảng Thương mại điện tử (VLT E-Commerce Platform)

---

## I. Giới thiệu chung

### 1. Mục tiêu hệ thống
VLT E-Commerce là nền tảng thương mại điện tử đa người bán (Multi-vendor), kết nối trực tiếp Người mua và Người bán trên cùng một hệ thống. Mục tiêu cốt lõi:
* Cung cấp môi trường mua sắm trực tuyến thuận tiện, an toàn với quy trình đặt hàng và thanh toán khép kín.
* Hỗ trợ người bán tạo lập và quản lý cửa hàng, sản phẩm, và theo dõi doanh thu một cách trực quan.
* Quản lý tự động các khoản hoa hồng, chiết khấu và đối soát minh bạch giữa chủ sàn và người bán.

### 2. Phạm vi dự án
* **Nền tảng triển khai:** Ứng dụng Web (Web Application), thiết kế dạng Single Page Application (React) kết hợp RESTful API Backend.
* **Đối tượng sử dụng:**
  * **Khách vãng lai (Guest):** Tìm kiếm và xem sản phẩm, cửa hàng.
  * **Người mua (Buyer):** Tài khoản đã đăng ký (Thêm giỏ hàng, đặt mua, đánh giá).
  * **Người bán (Seller):** Người mua đã đăng ký nâng cấp mở cửa hàng.
  * **Quản trị viên (Admin):** Quản lý danh mục, tỷ lệ hoa hồng, và giám sát hệ thống.
* **Phạm vi xử lý:** Quản lý tài khoản, cửa hàng, sản phẩm, giỏ hàng, đặt hàng, đánh giá, thông báo realtime, và đối soát hoa hồng.

---

## II. Đặc tả yêu cầu tổng quát

### 1. Người mua (Buyer)
- Có thể đăng ký, đăng nhập và quản lý hồ sơ cá nhân, sổ địa chỉ.
- Tra cứu, tìm kiếm và lọc sản phẩm theo danh mục, từ khóa.
- Quản lý giỏ hàng: Thêm, sửa số lượng, xóa sản phẩm.
- Đặt hàng: Chọn địa chỉ giao hàng, xác nhận giỏ hàng, sử dụng cơ chế chống trùng lặp đơn hàng (Idempotency).
- Theo dõi trạng thái đơn hàng và thanh toán (Momo, VNPay, COD).
- Viết đánh giá, bình luận sản phẩm sau khi mua thành công.
- Nhận thông báo realtime về trạng thái đơn hàng.

### 2. Người bán (Seller)
- Bao gồm toàn bộ quyền của Người mua.
- Có thể đăng ký thông tin mở cửa hàng (Shop).
- Quản lý sản phẩm: Đăng sản phẩm mới, upload nhiều ảnh (Cloudinary), thiết lập giá, kho hàng.
- Xử lý đơn hàng: Tiếp nhận, xác nhận, và cập nhật tiến độ giao hàng.
- Xem thống kê doanh thu và báo cáo hoa hồng đã trừ của sàn.

### 3. Quản trị viên (Admin)
- Quản lý cây danh mục ngành hàng (Category đa cấp).
- Thiết lập cấu hình tỷ lệ hoa hồng (Commission Config) cho từng ngành hàng hoặc mốc thời gian.
- Xem báo cáo tổng quan toàn sàn (Tổng giao dịch, doanh thu hoa hồng).

---

## III. Sơ đồ phân rã chức năng (WBS)

```plantuml
@startwbs
<style>
wbsDiagram {
  node {
    BackgroundColor white
    LineColor black
    FontName Arial
    Padding 10
    Margin 15
    RoundCorner 0
    MaximumWidth 160
    HorizontalAlignment center
  }
  arrow {
    LineColor black
  }
}
</style>

* \n**Hệ thống Thương mại điện tử**
** 1 Quản lý tài khoản và xác thực
*** 1.1 Đăng ký, đăng nhập, đăng xuất
*** 1.2 Cấp mới mã xác thực và thu hồi phiên
*** 1.3 Cập nhật hồ sơ người dùng
*** 1.4 Khóa và mở khóa tài khoản
*** 1.5 Quản lý sổ địa chỉ giao hàng
** 2 Quản lý cửa hàng
*** 2.1 Đăng ký và cập nhật cửa hàng
*** 2.2 Tra cứu thông tin và sản phẩm
*** 2.3 Tìm kiếm cửa hàng
*** 2.4 Bảng thống kê dành cho người bán
** 3 Quản lý sản phẩm và danh mục
*** 3.1 Quản lý cây phân cấp danh mục
*** 3.2 Thêm, sửa, xóa sản phẩm
*** 3.3 Quản lý hình ảnh sản phẩm
*** 3.4 Quản lý đánh giá sản phẩm
** 4 Quản lý giỏ hàng và đơn hàng
*** 4.1 Thêm, sửa, xóa sản phẩm trong giỏ
*** 4.2 Tiến hành đặt hàng
*** 4.3 Cập nhật tiến độ đơn hàng
*** 4.4 Theo dõi lịch sử đơn mua và bán
** 5 Quản lý thanh toán và hoa hồng
*** 5.1 Khởi tạo và xác nhận thanh toán
*** 5.2 Thiết lập tỷ lệ hoa hồng
*** 5.3 Báo cáo thống kê doanh thu hoa hồng
** 6 Hệ thống thông báo
*** 6.1 Truy xuất danh sách thông báo
*** 6.2 Thống kê số lượng chưa đọc
*** 6.3 Đánh dấu trạng thái đã đọc
@endwbs
```

---

## IV. Đặc tả chi tiết các lớp và phương thức (UML Class Diagram)

```plantuml
@startuml
skinparam linetype ortho
skinparam classAttributeIconSize 0
skinparam nodesep 100
skinparam ranksep 120
skinparam ArrowFontSize 12
skinparam class {
    BackgroundColor white
    ArrowColor black
    BorderColor black
    FontName Arial
}

hide circle
hide empty members

' ================= 1. AUTH =================
class User {
    - id: Long
    - email: String
    - password: String
    - fullName: String
    - phone: String
    - avatarUrl: String
    - isActive: Boolean
    - createdAt: LocalDateTime
    - updatedAt: LocalDateTime
    - roles: Set<Role>
    - shop: Shop
    - addresses: List<Address>
    - cartItems: List<CartItem>
    - orders: List<Order>
    - reviews: List<Review>
    --
    + register(RegisterRequest)
    + login(LoginRequest)
    + getMyInfo()
    + updateProfile(MultipartFile)
    + updateStatus(Long)
}

class Role {
    - id: Long
    - name: String
    - description: String
    - permissions: Set<Permission>
}

class Permission {
    - id: Long
    - name: String
    - description: String
}

class UserRole {
    - userId: Long
    - roleId: Long
}

class RolePermission {
    - roleId: Long
    - permissionId: Long
}

class UserSession {
    - id: String
    - user: User
    - deviceInfo: String
    - expires_at: LocalDateTime
    - createdAt: LocalDateTime
    --
    + revokeSession(String)
}

' ================= 2. CATALOG =================
class Address {
    - id: Long
    - fullName: String
    - phone: String
    - province: String
    - district: String
    - ward: String
    - detail: String
    - isDefault: Boolean
    - user: User
    --
    + getAddresses()
    + addAddress(AddressRequest)
    + updateAddress(Long)
    + deleteAddress(Long)
}

class Shop {
    - id: Long
    - name: String
    - description: String
    - logoUrl: String
    - address: String
    - isActive: Boolean
    - createdAt: LocalDateTime
    - rating: Double
    - seller: User
    - products: List<Product>
    - categories: Set<Category>
    --
    + createShop(ShopRequest)
    + updateShop(Long)
    + getShopDetails(Long)
    + searchShops(String)
}

class ShopCategory {
    - shopId: Long
    - categoryId: Long
}

class Category {
    - id: Long
    - name: String
    - slug: String
    - parent: Category
    - children: List<Category>
    - imageUrl: String
    - isActive: Boolean
    - products: List<Product>
    - configs: List<CommissionConfig>
    - version: Long
    - shops: Set<Shop>
    --
    + createCategory(CategoryRequest)
    + updateCategory(Long)
    + deleteCategory(Long)
    + getChildrens(Long)
}

class Product {
    - id: Long
    - name: String
    - description: String
    - price: BigDecimal
    - stockQuantity: Integer
    - soldCount: Integer
    - status: ProductStatus
    - createdAt: LocalDateTime
    - updatedAt: LocalDateTime
    - averageRating: Double
    - reviewCount: Integer
    - shop: Shop
    - category: Category
    - images: List<ProductImage>
    - cartItems: List<CartItem>
    - orderItems: List<OrderItem>
    - reviews: List<Review>
    - version: Long
    --
    + createProduct(ProductRequest)
    + updateProduct(Long)
    + deleteProduct(Long)
    + uploadImages(Long, MultipartFile)
}

class ProductImage {
    - id: Long
    - url: String
    - isPrimary: Boolean
    - sortOrder: Integer
    - product: Product
}

' ================= 3. ORDER =================
class CartItem {
    - id: Long
    - quantity: Integer
    - addedAt: LocalDateTime
    - buyer: User
    - product: Product
    --
    + getCart()
    + addItem(CartRequest)
    + updateItem(Long)
    + removeItem(Long)
    + clearCart()
}

class Order {
    - id: Long
    - addressSnapshot: String
    - totalAmount: BigDecimal
    - status: OrderStatus
    - note: String
    - idempotencyKey: String
    - createdAt: LocalDateTime
    - updatedAt: LocalDateTime
    - buyer: User
    - items: List<OrderItem>
    - shop: Shop
    - commissionRecords: List<CommissionRecord>
    - payment: Payment
    --
    + createOrder(OrderRequest)
    + confirmOrder(Long)
    + shipOrder(Long)
    + completeOrder(Long)
    + cancelOrder(Long)
    + getSellerStats()
}

class OrderItem {
    - id: Long
    - productName: String
    - productPrice: BigDecimal
    - quantity: Integer
    - totalPrice: BigDecimal
    - order: Order
    - product: Product
    - shop: Shop
    - productImageUrl: String
}

class Payment {
    - id: Long
    - method: PaymentMethod
    - status: PaymentStatus
    - amount: BigDecimal
    - transactionRef: String
    - paidAt: LocalDateTime
    - order: Order
    --
    + createPayment(Long)
    + confirmPayment(Long)
}

' ================= 4. INTERACTION & COMMISSION =================
class Review {
    - id: Long
    - rating: int
    - comment: String
    - createdAt: LocalDateTime
    - product: Product
    - buyer: User
    - order: Order
    --
    + createReview(ReviewRequest)
}

class Notification {
    - id: Long
    - type: String
    - title: String
    - message: String
    - isRead: boolean
    - refId: Long
    - createdAt: LocalDateTime
    - user: User
    --
    + getNotifications()
    + markAsRead(Long)
    + markAllAsRead()
    + getUnreadCount()
}

class CommissionConfig {
    - id: Long
    - rate: BigDecimal
    - effectiveFrom: LocalDate
    - category: Category
    - createdBy: User
    - version: Long
    --
    + createConfig(ConfigRequest)
    + getConfig()
}

class CommissionRecord {
    - id: Long
    - commissionRate: BigDecimal
    - itemRevenue: BigDecimal
    - commissionAmount: BigDecimal
    - netRevenue: BigDecimal
    - recordedAt: LocalDateTime
    - order: Order
    - orderItem: OrderItem
    - seller: User
    --
    + getSellerStats()
    + getAdminStats()
}

' ================= LAYOUT =================
Permission -[hidden]right- RolePermission
RolePermission -[hidden]right- Role
Role -[hidden]right- UserRole
UserRole -[hidden]right- User
User -[hidden]right- UserSession

Notification -[hidden]right- Address
Address -[hidden]right- CartItem
CartItem -[hidden]right- Shop
Shop -[hidden]right- Order
Order -[hidden]right- Review

ShopCategory -[hidden]right- Category
Category -[hidden]right- Product
Product -[hidden]right- OrderItem
OrderItem -[hidden]right- Payment
Payment -[hidden]right- CommissionRecord

' ================= RELATIONSHIPS =================
' --- 1. Junction Tables (Association Classes) ---
RolePermission "*" -left-> "1" Permission
RolePermission "*" -right-> "1" Role
UserRole "*" -left-> "1" Role
UserRole "*" -right-> "1" User
ShopCategory "*" -up-> "1" Shop
ShopCategory "*" -right-> "1" Category

' --- 2. Composition (CascadeType.ALL) ---
User "1" *-down- "*" Address
User "1" *-down- "1" Shop : Owns
User "1" *-down- "*" CartItem
Shop "1" *-down- "*" Product
Product "1" *-down- "*" ProductImage
Product "1" *-up- "*" Review
Order "1" *-down- "*" OrderItem
Order "1" *-down- "1" Payment
Order "1" *-down- "*" CommissionRecord

' --- 3. Aggregation ---
Category "1" o-right- "*" Product
Category "1" o-up- "*" Category : Parent/Children

' --- 4. Association ---
User "1" -down- "*" Order : Buyer
User "1" -down- "*" Review
Order "1" -right- "*" Review

' --- 5. Unidirectional association ---
UserSession "*" -left-> "1" User
Notification "*" -up-> "1" User
CartItem "*" -down-> "1" Product
OrderItem "*" -left-> "1" Product
OrderItem "*" -up-> "1" Shop
Order "*" -up-> "1" Shop : Seller
CommissionRecord "*" -up-> "1" User : Seller
CommissionConfig "*" -down-> "1" Category
CommissionConfig "*" -up-> "1" User : CreatedBy
@enduml
```

---

## V. Danh sách thực thể, bộ khóa, thuộc tính

### 1. Thực thể users (Người dùng)
* **Mô tả:** Lưu trữ thông tin tài khoản, hồ sơ và trạng thái hoạt động của người dùng trên hệ thống.
* **Bộ khóa duy nhất (Unique Keys):**
  * **Khóa chính (PK):** id (BIGINT)
  * **Khóa ứng viên (Unique):** email
* **Thuộc tính:**
  * `id` (PK, BIGINT): Mã định danh duy nhất của người dùng.
  * `email` (VARCHAR(100), NOT NULL, UNIQUE): Địa chỉ email dùng để đăng nhập.
  * `password` (VARCHAR(255), NOT NULL): Mật khẩu đã được băm an toàn (bcrypt).
  * `full_name` (VARCHAR(30), NOT NULL): Họ và tên đầy đủ.
  * `phone` (VARCHAR(20), NULL): Số điện thoại liên hệ.
  * `avatar_url` (VARCHAR(500), NULL): Đường dẫn ảnh đại diện.
  * `is_active` (BOOLEAN, DEFAULT TRUE): Trạng thái tài khoản (Đang hoạt động/Bị khóa).
  * `created_at` (TIMESTAMP, NOT NULL): Thời điểm đăng ký.
  * `updated_at` (TIMESTAMP, NOT NULL): Thời điểm cập nhật hồ sơ gần nhất.

### 2. Thực thể roles (Vai trò)
* **Mô tả:** Phân loại vai trò người dùng (Ví dụ: ROLE_BUYER, ROLE_SELLER).
* **Bộ khóa duy nhất:**
  * **Khóa chính (PK):** id (BIGINT)
  * **Khóa ứng viên (Unique):** name
* **Thuộc tính:**
  * `id` (PK, BIGINT): Mã định danh vai trò.
  * `name` (VARCHAR(50), NOT NULL, UNIQUE): Tên vai trò hệ thống.
  * `description` (VARCHAR(255), NULL): Mô tả chi tiết vai trò.

### 3. Thực thể permissions (Quyền hạn)
* **Mô tả:** Định nghĩa các quyền chi tiết tương ứng với các thao tác trên hệ thống.
* **Bộ khóa duy nhất:**
  * **Khóa chính (PK):** id (BIGINT)
  * **Khóa ứng viên (Unique):** name
* **Thuộc tính:**
  * `id` (PK, BIGINT): Mã định danh quyền.
  * `name` (VARCHAR(50), NOT NULL, UNIQUE): Mã quyền hệ thống (vd: CREATE_PRODUCT).
  * `description` (VARCHAR(255), NULL): Mô tả mục đích của quyền.

### 4. Thực thể user_roles (Bảng trung gian User - Role)
* **Mô tả:** Ánh xạ tài khoản người dùng thuộc các vai trò nào.
* **Bộ khóa duy nhất:**
  * **Khóa chính phức hợp (Composite PK):** (user_id, role_id)
* **Thuộc tính:**
  * `user_id` (PK, FK -> users.id): ID người dùng.
  * `role_id` (PK, FK -> roles.id): ID vai trò.

### 5. Thực thể role_permissions (Bảng trung gian Role - Permission)
* **Mô tả:** Ánh xạ vai trò bao gồm những quyền hạn nào.
* **Bộ khóa duy nhất:**
  * **Khóa chính phức hợp (Composite PK):** (role_id, permission_id)
* **Thuộc tính:**
  * `role_id` (PK, FK -> roles.id): ID vai trò.
  * `permission_id` (PK, FK -> permissions.id): ID quyền hạn.

### 6. Thực thể user_sessions (Phiên đăng nhập)
* **Mô tả:** Quản lý các phiên đăng nhập (refresh token) để hỗ trợ thu hồi quyền truy cập.
* **Bộ khóa duy nhất:**
  * **Khóa chính (PK):** id (VARCHAR)
* **Thuộc tính:**
  * `id` (PK, VARCHAR(255)): Mã token ID hoặc session ID.
  * `device_info` (VARCHAR(255), NULL): Thông tin thiết bị đăng nhập.
  * `expires_at` (TIMESTAMP, NOT NULL): Thời điểm hết hạn của phiên.
  * `created_at` (TIMESTAMP, NOT NULL): Thời điểm bắt đầu phiên.
  * `user_id` (FK -> users.id, NOT NULL): Người dùng sở hữu phiên.

### 7. Thực thể addresses (Sổ địa chỉ)
* **Mô tả:** Lưu trữ danh sách địa chỉ nhận hàng của người mua.
* **Bộ khóa duy nhất:**
  * **Khóa chính (PK):** id (BIGINT)
* **Thuộc tính:**
  * `id` (PK, BIGINT): Định danh địa chỉ.
  * `full_name` (VARCHAR(50), NOT NULL): Tên người nhận.
  * `phone` (VARCHAR(20), NOT NULL): Số điện thoại nhận hàng.
  * `province`, `district`, `ward` (VARCHAR(50), NOT NULL): Thông tin Tỉnh/Thành, Quận/Huyện, Phường/Xã.
  * `detail` (VARCHAR(200), NOT NULL): Số nhà, tên đường.
  * `is_default` (BOOLEAN, DEFAULT FALSE): Đánh dấu địa chỉ mặc định.
  * `user_id` (FK -> users.id, NOT NULL): Thuộc về người dùng nào.

### 8. Thực thể shops (Cửa hàng)
* **Mô tả:** Thông tin cửa hàng của người bán trên hệ thống.
* **Bộ khóa duy nhất:**
  * **Khóa chính (PK):** id (BIGINT)
  * **Khóa ứng viên (Unique):** seller_id
* **Thuộc tính:**
  * `id` (PK, BIGINT): Mã định danh cửa hàng.
  * `name` (VARCHAR(100), NOT NULL): Tên cửa hàng.
  * `description` (TEXT, NULL): Mô tả cửa hàng.
  * `logo_url` (VARCHAR(500), NULL): Ảnh logo cửa hàng.
  * `address` (VARCHAR(200), NULL): Địa chỉ kinh doanh.
  * `is_active` (BOOLEAN, DEFAULT TRUE): Trạng thái cửa hàng.
  * `rating` (DOUBLE, DEFAULT 0.0): Điểm đánh giá trung bình.
  * `created_at` (TIMESTAMP, NOT NULL): Ngày tạo.
  * `seller_id` (FK -> users.id, NOT NULL, UNIQUE): Tài khoản chủ cửa hàng.

### 9. Thực thể categories (Danh mục)
* **Mô tả:** Hệ thống phân cấp danh mục ngành hàng.
* **Bộ khóa duy nhất:**
  * **Khóa chính (PK):** id (BIGINT)
  * **Khóa ứng viên (Unique):** slug
* **Thuộc tính:**
  * `id` (PK, BIGINT): Mã danh mục.
  * `name` (VARCHAR(100), NOT NULL): Tên danh mục.
  * `slug` (VARCHAR(100), NOT NULL, UNIQUE): Định danh URL an toàn.
  * `image_url` (VARCHAR(500), NULL): Ảnh minh họa danh mục.
  * `is_active` (BOOLEAN, DEFAULT TRUE): Đang hiển thị hay không.
  * `version` (BIGINT): Quản lý concurrency (Pessimistic/Optimistic lock).
  * `parent_id` (FK -> categories.id, NULL): Danh mục cha.

### 10. Thực thể shop_categories (Bảng trung gian Shop - Category)
* **Mô tả:** Lưu trữ danh sách các ngành hàng mà cửa hàng đang đăng ký kinh doanh.
* **Bộ khóa duy nhất:**
  * **Khóa chính phức hợp (Composite PK):** (shop_id, category_id)
* **Thuộc tính:**
  * `shop_id` (PK, FK -> shops.id): ID cửa hàng.
  * `category_id` (PK, FK -> categories.id): ID ngành hàng.

### 11. Thực thể products (Sản phẩm)
* **Mô tả:** Quản lý thông tin chi tiết về sản phẩm đăng bán.
* **Bộ khóa duy nhất:**
  * **Khóa chính (PK):** id (BIGINT)
* **Thuộc tính:**
  * `id` (PK, BIGINT): Mã sản phẩm.
  * `name` (VARCHAR(200), NOT NULL): Tên sản phẩm.
  * `description` (TEXT): Mô tả chi tiết.
  * `price` (DECIMAL(15,2), NOT NULL): Giá bán.
  * `stock_quantity` (INT, NOT NULL): Số lượng tồn kho.
  * `sold_count` (INT, DEFAULT 0): Số lượng đã bán.
  * `status` (VARCHAR(20), NOT NULL): Trạng thái (ACTIVE, HIDDEN...).
  * `average_rating` (DOUBLE, DEFAULT 0.0): Điểm đánh giá trung bình.
  * `review_count` (INT, DEFAULT 0): Số lượng đánh giá.
  * `version` (BIGINT): Quản lý lock khi trừ tồn kho.
  * `created_at`, `updated_at` (TIMESTAMP): Dấu vết thời gian.
  * `shop_id` (FK -> shops.id, NOT NULL): Cửa hàng phân phối.
  * `category_id` (FK -> categories.id, NOT NULL): Ngành hàng.

### 12. Thực thể product_images (Ảnh sản phẩm)
* **Mô tả:** Album ảnh minh họa cho sản phẩm.
* **Bộ khóa duy nhất:**
  * **Khóa chính (PK):** id (BIGINT)
* **Thuộc tính:**
  * `id` (PK, BIGINT): Mã ảnh.
  * `url` (VARCHAR(200), NOT NULL): Đường dẫn lưu trữ.
  * `is_primary` (BOOLEAN, DEFAULT FALSE): Ảnh đại diện chính.
  * `sort_order` (INT, DEFAULT 0): Vị trí sắp xếp.
  * `product_id` (FK -> products.id, NOT NULL): Thuộc sản phẩm nào.

### 13. Thực thể cart_items (Giỏ hàng)
* **Mô tả:** Các sản phẩm khách hàng đang thêm vào giỏ.
* **Bộ khóa duy nhất:**
  * **Khóa chính (PK):** id (BIGINT)
* **Thuộc tính:**
  * `id` (PK, BIGINT): Mã giỏ hàng.
  * `quantity` (INT, NOT NULL): Số lượng chọn mua.
  * `added_at` (TIMESTAMP, NOT NULL): Thời điểm thêm vào giỏ.
  * `buyer_id` (FK -> users.id, NOT NULL): Của người mua nào.
  * `product_id` (FK -> products.id, NOT NULL): Sản phẩm nào.

### 14. Thực thể orders (Đơn hàng)
* **Mô tả:** Lưu trữ thông tin đơn hàng đã đặt.
* **Bộ khóa duy nhất:**
  * **Khóa chính (PK):** id (BIGINT)
  * **Khóa ứng viên (Unique):** idempotency_key
* **Thuộc tính:**
  * `id` (PK, BIGINT): Mã đơn hàng.
  * `address_snapshot` (TEXT, NOT NULL): Lưu lại bản cứng của địa chỉ tại thời điểm đặt.
  * `total_amount` (DECIMAL(15,2), NOT NULL): Tổng tiền thanh toán.
  * `status` (VARCHAR(20), NOT NULL): Trạng thái đơn (PENDING, SHIPPING, COMPLETED...).
  * `note` (VARCHAR(500), NULL): Ghi chú của khách.
  * `idempotency_key` (VARCHAR(100), UNIQUE): Key chống trùng lặp đơn hàng.
  * `created_at`, `updated_at` (TIMESTAMP): Dấu vết thời gian.
  * `buyer_id` (FK -> users.id, NOT NULL): Người đặt hàng.
  * `shop_id` (FK -> shops.id, NOT NULL): Cửa hàng cung cấp.

### 15. Thực thể order_items (Chi tiết đơn hàng)
* **Mô tả:** Lưu lại bản cứng thông tin các sản phẩm tại thời điểm chốt đơn.
* **Bộ khóa duy nhất:**
  * **Khóa chính (PK):** id (BIGINT)
* **Thuộc tính:**
  * `id` (PK, BIGINT): Mã chi tiết đơn.
  * `product_name` (VARCHAR(500), NOT NULL): Tên sản phẩm khi mua.
  * `product_price` (DECIMAL(15,2), NOT NULL): Giá chốt khi mua.
  * `quantity` (INT, NOT NULL): Số lượng.
  * `total_price` (DECIMAL(15,2), NOT NULL): Thành tiền.
  * `product_image_url` (VARCHAR(500)): Ảnh tại thời điểm mua.
  * `order_id` (FK -> orders.id, NOT NULL): Thuộc đơn hàng nào.
  * `product_id` (FK -> products.id, NOT NULL): Tham chiếu sản phẩm gốc.
  * `shop_id` (FK -> shops.id, NOT NULL): Tham chiếu cửa hàng.

### 16. Thực thể payments (Thanh toán)
* **Mô tả:** Quản lý giao dịch thanh toán cho đơn hàng.
* **Bộ khóa duy nhất:**
  * **Khóa chính (PK):** id (BIGINT)
  * **Khóa ứng viên (Unique):** order_id
* **Thuộc tính:**
  * `id` (PK, BIGINT): Mã giao dịch thanh toán nội bộ.
  * `method` (VARCHAR(20), NOT NULL): Phương thức (COD, VNPay...).
  * `status` (VARCHAR(20), NOT NULL): Trạng thái (PENDING, SUCCESS...).
  * `amount` (DECIMAL(15,2), NOT NULL): Số tiền giao dịch.
  * `transaction_ref` (VARCHAR(200), NULL): Mã giao dịch từ cổng thanh toán.
  * `paid_at` (TIMESTAMP, NULL): Thời điểm thanh toán thành công.
  * `order_id` (FK -> orders.id, NOT NULL, UNIQUE): Ánh xạ 1-1 với đơn hàng.

### 17. Thực thể reviews (Đánh giá)
* **Mô tả:** Phản hồi của người mua về sản phẩm sau khi hoàn tất đơn.
* **Bộ khóa duy nhất:**
  * **Khóa chính (PK):** id (BIGINT)
* **Thuộc tính:**
  * `id` (PK, BIGINT): Mã đánh giá.
  * `rating` (INT, NOT NULL): Số sao (1 đến 5).
  * `comment` (TEXT): Nội dung bình luận.
  * `created_at` (TIMESTAMP, NOT NULL): Thời gian gửi đánh giá.
  * `product_id` (FK -> products.id, NOT NULL): Sản phẩm được đánh giá.
  * `buyer_id` (FK -> users.id, NOT NULL): Người viết đánh giá.
  * `order_id` (FK -> orders.id, NOT NULL): Đánh giá cho đơn hàng nào.

### 18. Thực thể notifications (Thông báo)
* **Mô tả:** Hệ thống thông báo in-app realtime cho người dùng.
* **Bộ khóa duy nhất:**
  * **Khóa chính (PK):** id (BIGINT)
* **Thuộc tính:**
  * `id` (PK, BIGINT): Mã thông báo.
  * `type` (VARCHAR(50), NOT NULL): Loại thông báo (ORDER_STATUS...).
  * `title` (VARCHAR(200), NOT NULL): Tiêu đề thông báo.
  * `message` (TEXT, NOT NULL): Nội dung chi tiết.
  * `is_read` (BOOLEAN, NOT NULL): Trạng thái đã đọc.
  * `ref_id` (BIGINT): ID tham chiếu tới thực thể liên quan.
  * `created_at` (TIMESTAMP, NOT NULL): Thời điểm báo.
  * `user_id` (FK -> users.id, NOT NULL): Người nhận.

### 19. Thực thể commission_configs (Cấu hình hoa hồng)
* **Mô tả:** Thiết lập tỷ lệ chiết khấu sàn thu của Seller theo từng ngành hàng.
* **Bộ khóa duy nhất:**
  * **Khóa chính (PK):** id (BIGINT)
* **Thuộc tính:**
  * `id` (PK, BIGINT): Mã cấu hình.
  * `rate` (DECIMAL(5,4), NOT NULL): Tỷ lệ phần trăm.
  * `effective_from` (DATE, NOT NULL): Ngày bắt đầu áp dụng.
  * `version` (BIGINT): Quản lý lock.
  * `category_id` (FK -> categories.id, NOT NULL): Áp dụng cho ngành hàng nào.
  * `created_by` (FK -> users.id, NOT NULL): Quản trị viên nào thiết lập.

### 20. Thực thể commission_records (Hồ sơ hoa hồng)
* **Mô tả:** Bản ghi đối soát số tiền hoa hồng mà sàn đã thu.
* **Bộ khóa duy nhất:**
  * **Khóa chính (PK):** id (BIGINT)
  * **Khóa ứng viên (Unique):** order_item_id
* **Thuộc tính:**
  * `id` (PK, BIGINT): Mã bản ghi đối soát.
  * `commission_rate` (DECIMAL(5,4), NOT NULL): Tỷ lệ thu tại thời điểm chốt đơn.
  * `item_revenue` (DECIMAL(15,2), NOT NULL): Doanh thu của mặt hàng.
  * `commission_amount` (DECIMAL(15,2), NOT NULL): Tiền phí sàn giữ lại.
  * `net_revenue` (DECIMAL(15,2), NOT NULL): Tiền thực nhận của Seller.
  * `recorded_at` (TIMESTAMP, NOT NULL): Thời điểm chốt sổ.
  * `order_id` (FK -> orders.id, NOT NULL): Thuộc đơn nào.
  * `order_item_id` (FK -> order_items.id, NOT NULL, UNIQUE): Thuộc mặt hàng nào (1-1).
  * `seller_id` (FK -> users.id, NOT NULL): Shop bị thu phí.

---

## VI. Quan hệ giữa các thực thể (Cascade Rules)

1. **User – 1 : N – Shop:** Một người dùng có thể mở 1 cửa hàng. `ON DELETE CASCADE`.
2. **User – 1 : N – Address:** `ON DELETE CASCADE` (Xóa tài khoản thì xóa hết địa chỉ).
3. **User – 1 : N – CartItem:** `ON DELETE CASCADE`.
4. **Shop – 1 : N – Product:** `ON DELETE CASCADE` (Xóa shop thì mất hết sản phẩm).
5. **Product – 1 : N – ProductImage:** `ON DELETE CASCADE`.
6. **Order – 1 : N – OrderItem:** `ON DELETE CASCADE`.
7. **Order – 1 : 1 – Payment:** `ON DELETE CASCADE`.
8. **Product – 1 : N – Review:** `ON DELETE CASCADE`.
9. **User – 1 : N – Order:** `ON DELETE RESTRICT` (Để bảo toàn lịch sử mua hàng, hệ thống không cho phép xóa tài khoản nếu họ đã có đơn hàng; chỉ được đổi `is_active` = false).

---

## VII. Các ràng buộc toàn vẹn

### 1. Ràng buộc miền giá trị (Check Constraints)
* **Đánh giá sản phẩm:**
  `CHECK (rating BETWEEN 1 AND 5)`
* **Số lượng hàng hóa:**
  `CHECK (stock_quantity >= 0)`
  `CHECK (quantity > 0)` (Trong chi tiết đơn hàng / Giỏ hàng)
* **Tiền tệ:**
  `CHECK (price >= 0 AND total_amount >= 0 AND amount >= 0)`
* **Trạng thái đơn hàng:**
  `CHECK (status IN ('PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'))`

### 2. Ràng buộc duy nhất có điều kiện (Unique Indexes)
* **Chống tạo trùng đơn hàng mạng chập chờn (Idempotency):**
  `CREATE UNIQUE INDEX uq_order_idempotency ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;`
* **Đảm bảo tính duy nhất 1 mặt hàng chỉ đối soát hoa hồng 1 lần:**
  `CREATE UNIQUE INDEX uq_commission_order_item ON commission_records(order_item_id);`

### 3. Ràng buộc cấp ứng dụng (Application Level / Locking)
* **Chống trừ âm kho hàng (Race Condition):**
  Lệnh trừ kho phải đảm bảo cơ chế Atomic: `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?`
* **Tránh tính hoa hồng 2 lần (Pessimistic Lock):**
  Sử dụng `@Lock(LockModeType.PESSIMISTIC_WRITE)` trên bản ghi `Order` tại thời điểm thay đổi trạng thái sang `COMPLETED`.
