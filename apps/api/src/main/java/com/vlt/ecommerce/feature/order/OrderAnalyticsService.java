package com.vlt.ecommerce.feature.order;

import java.util.Map;

import com.vlt.ecommerce.feature.order.dto.response.SellerAnalyticsResponse;

public interface OrderAnalyticsService {

    Map<OrderStatus, Long> getDashboardStats();

    SellerAnalyticsResponse getSellerAnalytics(String periodType, int range);
}
