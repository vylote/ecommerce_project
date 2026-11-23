package com.vlt.ecommerce.feature.order.dto.response;

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
public class SellerAnalyticsResponse {
    BigDecimal totalRevenue;
    Long totalOrders;
    BigDecimal pendingRevenue;
    Long totalOrdersAll;
    BigDecimal averageOrderValue;
    Map<OrderStatus, Long> statusBreakdown;
    List<DailyTimeline> timeline;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class DailyTimeline {
        String date;
        String label;
        BigDecimal revenue;
        Long orderCount;
        Long totalCount;
    }
}
