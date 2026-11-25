package com.vlt.ecommerce.web.rest;

import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.domain.enumeration.OrderStatus;
import com.vlt.ecommerce.service.OrderAnalyticsService;
import com.vlt.ecommerce.service.OrderService;
import com.vlt.ecommerce.config.Constants;
import com.vlt.ecommerce.service.dto.response.ApiResponse;
import com.vlt.ecommerce.service.dto.response.PageResponse;
import com.vlt.ecommerce.service.dto.request.OrderRequest;
import com.vlt.ecommerce.service.dto.response.OrderResponse;
import com.vlt.ecommerce.service.dto.response.SellerAnalyticsResponse;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/orders")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class OrderController {
    OrderService orderService;
    OrderAnalyticsService orderAnalyticsService;

    @PostMapping
    @PreAuthorize("hasAuthority('ORDER_CREATE')")
    public ApiResponse<List<OrderResponse>> create(@RequestBody @Valid OrderRequest request) {
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderService.create(request))
                .build();
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAuthority('ORDER_CONFIRM')")
    public ApiResponse<OrderResponse> confirmOrder(@PathVariable Long id) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.confirmOrder(id))
                .build();
    }

    @PatchMapping("/{id}/ship")
    @PreAuthorize("hasAuthority('ORDER_SHIP')")
    public ApiResponse<OrderResponse> shipOrder(@PathVariable Long id) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.shipOrder(id))
                .build();
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAuthority('ORDER_COMPLETE')")
    public ApiResponse<OrderResponse> completeOrder(@PathVariable Long id) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.completeOrder(id))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ORDER_BUYER_LIST')")
    public ApiResponse<PageResponse<OrderResponse>> getOwnHistoryOrder(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) OrderStatus status) {

        return ApiResponse.<PageResponse<OrderResponse>>builder()
                .result(orderService.getOwnHistoryOrder(page, size, status))
                .build();
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('ORDER_CANCEL')")
    public ApiResponse<OrderResponse> cancelOrder(@PathVariable Long id) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.cancelOrder(id))
                .build();
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAuthority('ORDER_SHOP_LIST')")
    public ApiResponse<PageResponse<OrderResponse>> getSellerOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) OrderStatus status) {

        return ApiResponse.<PageResponse<OrderResponse>>builder()
                .result(orderService.getSellerOrders(page, size, status))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ORDER_READ_OWN', 'ORDER_READ_ANY')")
    public ApiResponse<OrderResponse> getDetailOrder(@PathVariable Long id) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.getDetailOrder(id))
                .build();
    }

    @GetMapping("/seller/dashboard/stats")
    @PreAuthorize("hasAuthority('ORDER_SHOP_STATS_READ')")
    public ApiResponse<Map<OrderStatus, Long>> getSellerDashboardStats() {
        return ApiResponse.<Map<OrderStatus, Long>>builder()
                .result(orderAnalyticsService.getDashboardStats())
                .build();
    }

    @GetMapping("/seller/dashboard/analytics")
    @PreAuthorize("hasAuthority('ORDER_SHOP_ANALYTICS_READ')")
    public ApiResponse<SellerAnalyticsResponse> getSellerAnalytics(
            @RequestParam(defaultValue = Constants.ANALYTICS_PERIOD_DAY) String period,
            @RequestParam(defaultValue = "7") int range,
            @RequestParam(required = false) Integer days) {
        int finalRange = (days != null) ? days : range;
        return ApiResponse.<SellerAnalyticsResponse>builder()
                .result(orderAnalyticsService.getSellerAnalytics(period, finalRange))
                .build();
    }
}
