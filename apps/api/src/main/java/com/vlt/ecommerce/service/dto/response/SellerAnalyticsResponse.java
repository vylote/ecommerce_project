package com.vlt.ecommerce.service.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.vlt.ecommerce.domain.enumeration.OrderStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SellerAnalyticsResponse {
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private BigDecimal pendingRevenue;
    private Long totalOrdersAll;
    private BigDecimal averageOrderValue;
    private Map<OrderStatus, Long> statusBreakdown;
    private List<DailyTimeline> timeline;

    @Getter
    @Builder
    public static class DailyTimeline {
        private String date;
        private String label;
        private BigDecimal revenue;
        private Long orderCount;
        private Long totalCount;
    }
}
