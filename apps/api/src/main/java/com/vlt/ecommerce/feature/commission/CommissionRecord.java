package com.vlt.ecommerce.feature.commission;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.vlt.ecommerce.feature.order.Order;
import com.vlt.ecommerce.feature.order.OrderItem;
import com.vlt.ecommerce.feature.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "commission_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommissionRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    // Tỉ lệ phí tại thời điểm mua (Tránh Admin đổi phí thì lịch sử bị sai)
    @Column(name = "commission_rate", nullable = false, precision = 5, scale = 4)
    BigDecimal commissionRate;
    // Doanh thu gộp của món hàng (Bằng OrderItem.totalPrice)
    @Column(name = "item_revenue", nullable = false, precision = 15, scale = 2)
    BigDecimal itemRevenue;
    // Số tiền hoa hồng sàn thu (Bằng itemRevenue * commissionRate)
    @Column(name = "commission_amount", nullable = false, precision = 15, scale = 2)
    BigDecimal commissionAmount;
    // Doanh thu thực nhận của Seller (Bằng itemRevenue - commissionAmount)
    @Column(name = "net_revenue", nullable = false, precision = 15, scale = 2)
    BigDecimal netRevenue;
    @Column(name = "recorded_at", nullable = false, updatable = false)
    @CreationTimestamp
    LocalDateTime recordedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false, unique = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    OrderItem orderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    User seller;
}
