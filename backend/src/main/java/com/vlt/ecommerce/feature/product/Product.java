package com.vlt.ecommerce.feature.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.vlt.ecommerce.feature.cart.CartItem;
import com.vlt.ecommerce.feature.order.OrderItem;
import com.vlt.ecommerce.feature.shop.Shop;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "products")
@Data 
@Builder 
@NoArgsConstructor 
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @Column(nullable = false, length = 200)
    String name;
    @Column(columnDefinition = "TEXT")
    String description;
    // Dùng BigDecimal cho tiền tệ (rất quan trọng khi phỏng vấn)
    //lấy 15 chữ số, 2 số sau dấu phẩy 
    @Column(nullable = false, precision = 15, scale = 2)
    BigDecimal price;
    @Column(name = "stock_quantity", nullable = false)
    Integer stockQuantity;
    @Builder.Default
    @Column(name = "sold_count", nullable = false)
    Integer soldCount = 0;
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ProductStatus status = ProductStatus.ACTIVE;
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    Shop shop;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    Category category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<ProductImage> images;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<CartItem> cartItems;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<OrderItem> orderItems;
}
