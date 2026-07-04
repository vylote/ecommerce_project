package com.vlt.ecommerce.feature.shop;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.user.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "shops")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Shop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @Column(nullable = false, length = 100)
    String name;
    @Column(columnDefinition = "TEXT")
    String description;
    @Column(name = "logo_url", length = 500)
    String logoUrl;
    @Column(length = 50)
    String address;
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    Boolean isActive = false;
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Builder.Default
    @Column(name = "rating", nullable = false)
    Double rating = 0.0;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false, unique = true)
    User seller;

    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<Product> products;
}

/* ==============================================================================
     * BẢN CHẤT CỦA FETCHTYPE.LAZY & @TRANSACTIONAL
     * ==============================================================================
     * 1. Kẻ đóng thế (Proxy): 
     * Khi SELECT Shop, Hibernate tuyệt đối KHÔNG JOIN với bảng users. 
     * Nó tạo ra một Object User giả (Proxy) chỉ chứa duy nhất cái 'seller_id' (lấy từ cột khóa ngoại của bảng shops).
     * * 2. Kích hoạt truy vấn ngầm (Lazy Loading): 
     * Kẻ đóng thế chỉ thực sự chạy lệnh SQL thứ 2 (SELECT * FROM users) 
     * khi ta chạm vào dữ liệu thật của nó (Ví dụ: gọi shop.getSeller().getEmail()).
     * * 3. Vai trò của @Transactional (Tránh lỗi LazyInitializationException):
     * Bình thường sau lệnh Find, kết nối CSDL (Session) sẽ bị đóng ngay. 
     * @Transactional giúp giữ kết nối mở xuyên suốt hàm, để Kẻ đóng thế 
     * có đường truyền chạy lệnh SQL thứ 2 lấy email về so khớp.
     * ============================================================================== */
