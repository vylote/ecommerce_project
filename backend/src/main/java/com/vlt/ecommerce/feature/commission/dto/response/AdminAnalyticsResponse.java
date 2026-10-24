package com.vlt.ecommerce.feature.commission.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.vlt.ecommerce.feature.order.OrderStatus;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminAnalyticsResponse {
    BigDecimal totalGrossRevenue;
    BigDecimal totalCommissionRevenue;
    BigDecimal totalNetRevenue;
    BigDecimal pendingGrossRevenue;
    BigDecimal averageOrderValue;
    
    Long totalOrders;
    Long totalOrdersAll;
    Long totalUsers;
    Long totalShops;
    Long totalProducts;

    Map<OrderStatus, Long> statusBreakdown;
    List<AdminTimeline> timeline;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class AdminTimeline {
        String date;
        String label;
        BigDecimal grossRevenue;
        BigDecimal commissionRevenue;
        Long orderCount;
        Long totalCount;
    }
}
