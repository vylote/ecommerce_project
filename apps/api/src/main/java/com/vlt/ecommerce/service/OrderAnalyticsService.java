package com.vlt.ecommerce.service;

import java.util.Map;

import com.vlt.ecommerce.domain.enumeration.OrderStatus;
import com.vlt.ecommerce.service.dto.response.SellerAnalyticsResponse;

public interface OrderAnalyticsService {

    Map<OrderStatus, Long> getDashboardStats();

    SellerAnalyticsResponse getSellerAnalytics(String periodType, int range);
}
