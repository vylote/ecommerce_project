package com.vlt.ecommerce.feature.order;

import java.util.List;

import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.feature.order.dto.response.OrderResponse;

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

    @PatchMapping("/{id}/confirm")
    public ApiResponse<OrderResponse> confirmOrder(@PathVariable Long id) {
        return ApiResponse.<OrderResponse>builder()
            .result(orderService.confirmOrder(id))
            .build();
    }

    @PatchMapping("/{id}/ship")
    public ApiResponse<OrderResponse> shipOrder(@PathVariable Long id) {
        return ApiResponse.<OrderResponse>builder()
            .result(orderService.shipOrder(id))
            .build();
    }

    @PatchMapping("/{id}/complete")
    public ApiResponse<OrderResponse> completeOrder(@PathVariable Long id) {
        return ApiResponse.<OrderResponse>builder()
            .result(orderService.completeOrder(id))
            .build();
    }
}
