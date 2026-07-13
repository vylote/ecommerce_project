package com.vlt.ecommerce.feature.user;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.vlt.ecommerce.feature.cart.CartItem;
import com.vlt.ecommerce.feature.order.Order;
import com.vlt.ecommerce.feature.review.Review;
import com.vlt.ecommerce.feature.shop.Shop;

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
    @Column(nullable = false, unique = true, length = 100)
    String email;
    @Column(nullable = false)
    String password;
    @Column(name = "full_name", nullable = false, length = 30)
    String fullName;
    @Column(length = 20) 
    String phone;
    @Column(name = "avatar_url", length = 500)
    String avatarUrl;
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    Boolean isActive = true;
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    Set<Role> roles = new HashSet<>();

    @OneToOne(mappedBy = "seller", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    Shop shop;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<Address> addresses;

    @OneToMany(mappedBy = "buyer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<CartItem> cartItems;

    @OneToMany(mappedBy = "buyer", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<Order> orders;

    @OneToMany(mappedBy = "buyer", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<Review> reviews;
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
