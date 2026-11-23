package com.vlt.ecommerce.service;

import com.vlt.ecommerce.service.dto.response.AdminAnalyticsResponse;
import com.vlt.ecommerce.service.dto.response.AdminStatsResponse;
import com.vlt.ecommerce.service.dto.response.SellerStatsResponse;

public interface CommissionAnalyticsService {

    SellerStatsResponse getSellerStats();

    AdminStatsResponse getAdminStats();

    AdminAnalyticsResponse getAdminAnalytics(String periodType, int range);
}
