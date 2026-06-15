package com.vlt.ecommerce.feature.user;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.vlt.ecommerce.feature.cart.CartItem;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "users")
@Data 
@Builder 
@NoArgsConstructor 
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String email;
    @Column(nullable = false, unique = true, length = 200)
    String password;
    @Column(name = "full_name", nullable = false, length = 30)
    String fullName;
    @Column(length = 10)
    String phone;
    @Column(name = "avatar_url", length = 500)
    String avatarUrl;
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    Role role = Role.BUYER;
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    Boolean isActive = true;
    @Column(name = "create_at", nullable = false, updatable = false)
    @CreationTimestamp
    LocalDateTime createdAt;
    @Column(name = "update_at", nullable = false)
    @UpdateTimestamp
    LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Address> addresses;

    @OneToMany(mappedBy = "buyer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<CartItem> cartItems;
}

/* ==============================================================================
     * CHỐNG VÒNG LẶP VÔ TẬN (STACKOVERFLOW) VÀ QUẢN LÝ VÒNG ĐỜI TỰ ĐỘNG
     * ==============================================================================
     * 1. @ToString.Exclude & @EqualsAndHashCode.Exclude:
     * - BẮT BUỘC phải có khi dùng @Data của Lombok trong các mối quan hệ 2 chiều.
     * - Nếu không có, khi in log User -> gọi toString() của List<Address> -> List này 
     * lại gọi ngược toString() của User -> Tạo thành vòng lặp vô tận gây sập ứng dụng 
     * lập tức với lỗi StackOverflowError.
     * * 2. cascade = CascadeType.ALL:
     * - Tạo hiệu ứng Domino dữ liệu: Khi xóa tài khoản User, Hibernate sẽ tự động 
     * kích hoạt lệnh xóa sạch toàn bộ Địa chỉ và Giỏ hàng của người đó, tránh để lại 
     * rác dữ liệu mồ côi trong DB.
     * * 3. fetch = FetchType.LAZY:
     * - Viết tường minh (Explicit) để khẳng định: Chỉ khi nào gọi .getAddresses() hoặc 
     * .getCartItems() thì Hibernate mới truy vấn xuống DB lấy dữ liệu.
     */
