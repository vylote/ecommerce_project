package com.vlt.ecommerce.feature.inventory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.shop.Shop;
import com.vlt.ecommerce.feature.user.User;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "import_receipts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImportReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "receipt_code", nullable = false, unique = true, length = 50)
    String receiptCode;

    // Quan hệ N-1 với User: một user/tài khoản có nhiều phiếu nhập kho
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    // Quan hệ N-1 với Sản phẩm: mỗi phiếu nhập kho cho 1 sản phẩm
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    Product product;

    // Thuộc cửa hàng nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    Shop shop;

    @Builder.Default
    @Column(name = "total_cost", nullable = false, precision = 15, scale = 2)
    BigDecimal totalCost = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    String note;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    ImportReceiptStatus status = ImportReceiptStatus.COMPLETED;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    // Quan hệ 1-N với Chi tiết phiếu nhập kho
    @OneToMany(mappedBy = "importReceipt", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<ImportReceiptDetail> details = new ArrayList<>();
}
