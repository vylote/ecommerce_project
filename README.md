@startuml
' --- CẤU HÌNH GIAO DIỆN CHUẨN UML & ĐƯỜNG NÉT CỨNG ---
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


SODOPHANRA

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
