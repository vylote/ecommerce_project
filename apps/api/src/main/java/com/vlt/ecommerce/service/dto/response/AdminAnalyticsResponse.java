package com.vlt.ecommerce.service.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.vlt.ecommerce.domain.enumeration.OrderStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminAnalyticsResponse {
    private BigDecimal totalGrossRevenue;
    private BigDecimal totalCommissionRevenue;
    private BigDecimal totalNetRevenue;
    private BigDecimal pendingGrossRevenue;
    private BigDecimal averageOrderValue;
    
    private Long totalOrders;
    private Long totalOrdersAll;
    private Long totalUsers;
    private Long totalShops;
    private Long totalProducts;

    private Map<OrderStatus, Long> statusBreakdown;
    private List<AdminTimeline> timeline;

    @Getter
    @Builder
    public static class AdminTimeline {
        private String date;
        private String label;
        private BigDecimal grossRevenue;
        private BigDecimal commissionRevenue;
        private Long orderCount;
        private Long totalCount;
    }
}
