package com.vlt.ecommerce.web.rest;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.service.CommissionAnalyticsService;
import com.vlt.ecommerce.service.CommissionService;
import com.vlt.ecommerce.config.Constants;
import com.vlt.ecommerce.service.dto.response.ApiResponse;
import com.vlt.ecommerce.service.dto.request.CommissionConfigRequest;
import com.vlt.ecommerce.service.dto.response.AdminAnalyticsResponse;
import com.vlt.ecommerce.service.dto.response.AdminStatsResponse;
import com.vlt.ecommerce.service.dto.response.CommissionConfigResponse;
import com.vlt.ecommerce.service.dto.response.SellerStatsResponse;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/commission")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class CommissionController {
    CommissionService commissionService;
    CommissionAnalyticsService commissionAnalyticsService;

    @PostMapping("/configs")
    public ApiResponse<CommissionConfigResponse> createOrUpdateConfig(@RequestBody @Valid CommissionConfigRequest request) {
        return ApiResponse.<CommissionConfigResponse>builder()
            .result(commissionService.createOrUpdateConfig(request))
            .build();
    }

    @GetMapping("/configs")
    public ApiResponse<List<CommissionConfigResponse>> getConfigs() {
        return ApiResponse.<List<CommissionConfigResponse>>builder()
            .result(commissionService.getConfigs())
            .build();
    }

    @GetMapping("/stats/seller")
    public ApiResponse<SellerStatsResponse> getSellerStats() {
        return ApiResponse.<SellerStatsResponse>builder()
                .result(commissionAnalyticsService.getSellerStats())
                .build();
    }

    @GetMapping("/stats/admin")
    public ApiResponse<AdminStatsResponse> getAdminStats() {
        return ApiResponse.<AdminStatsResponse>builder()
                .result(commissionAnalyticsService.getAdminStats())
                .build();
    }

    @GetMapping("/stats/admin/analytics")
    public ApiResponse<AdminAnalyticsResponse> getAdminAnalytics(
            @RequestParam(defaultValue = Constants.ANALYTICS_PERIOD_DAY) String period,
            @RequestParam(defaultValue = "7") int range) {
        return ApiResponse.<AdminAnalyticsResponse>builder()
                .result(commissionAnalyticsService.getAdminAnalytics(period, range))
                .build();
    }
}
