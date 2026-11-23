package com.vlt.ecommerce.feature.commission;

import com.vlt.ecommerce.feature.commission.dto.response.AdminAnalyticsResponse;
import com.vlt.ecommerce.feature.commission.dto.response.AdminStatsResponse;
import com.vlt.ecommerce.feature.commission.dto.response.SellerStatsResponse;

public interface CommissionAnalyticsService {

    SellerStatsResponse getSellerStats();

    AdminStatsResponse getAdminStats();

    AdminAnalyticsResponse getAdminAnalytics(String periodType, int range);
}
