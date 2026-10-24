package com.vlt.ecommerce.feature.order;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.common.dto.PageResponse;
import com.vlt.ecommerce.feature.order.dto.request.OrderRequest;
import com.vlt.ecommerce.feature.order.dto.response.OrderResponse;
import com.vlt.ecommerce.feature.order.dto.response.SellerAnalyticsResponse;

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

    @PostMapping
    public ApiResponse<List<OrderResponse>> create(@RequestBody @Valid OrderRequest request) {
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderService.create(request))
                .build();
    }

    @RequestMapping(value = "/{id}/confirm", method = { RequestMethod.PATCH, RequestMethod.POST })
    public ApiResponse<OrderResponse> confirmOrder(@PathVariable Long id) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.confirmOrder(id))
                .build();
    }

    @RequestMapping(value = "/{id}/ship", method = { RequestMethod.PATCH, RequestMethod.POST })
    public ApiResponse<OrderResponse> shipOrder(@PathVariable Long id) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.shipOrder(id))
                .build();
    }

    @RequestMapping(value = "/{id}/complete", method = { RequestMethod.PATCH, RequestMethod.POST })
    public ApiResponse<OrderResponse> completeOrder(@PathVariable Long id) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.completeOrder(id))
                .build();
    }

    @GetMapping({ "", "/history" })
    public ApiResponse<PageResponse<OrderResponse>> getOwnHistoryOrder(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) OrderStatus status) {

        return ApiResponse.<PageResponse<OrderResponse>>builder()
                .result(orderService.getOwnHistoryOrder(page, size, status))
                .build();
    }

    @RequestMapping(value = "/{id}/cancel", method = { RequestMethod.PATCH, RequestMethod.POST })
    public ApiResponse<OrderResponse> cancelOrder(@PathVariable Long id) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.cancelOrder(id))
                .build();
    }

    @GetMapping("/seller")
    public ApiResponse<PageResponse<OrderResponse>> getSellerOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) OrderStatus status) {

        return ApiResponse.<PageResponse<OrderResponse>>builder()
                .result(orderService.getSellerOrders(page, size, status))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getDetailOrder(@PathVariable Long id) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.getDetailOrder(id))
                .build();
    }

    @GetMapping("/seller/dashboard/stats")
    public ApiResponse<Map<OrderStatus, Long>> getSellerDashboardStats() {
        return ApiResponse.<Map<OrderStatus, Long>>builder()
                .result(orderService.getDashboardStats())
                .build();
    }

    @GetMapping("/seller/dashboard/analytics")
    public ApiResponse<SellerAnalyticsResponse> getSellerAnalytics(
            @RequestParam(defaultValue = "DAY") String period,
            @RequestParam(defaultValue = "7") int range,
            @RequestParam(required = false) Integer days) {
        int finalRange = (days != null) ? days : range;
        return ApiResponse.<SellerAnalyticsResponse>builder()
                .result(orderService.getSellerAnalytics(period, finalRange))
                .build();
    }
}
