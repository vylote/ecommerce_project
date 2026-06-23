package com.vlt.ecommerce.feature.payment;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.feature.payment.dto.PaymentRequest;
import com.vlt.ecommerce.feature.payment.dto.PaymentResponse;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/payments")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class PaymentController {
    PaymentService paymentService;

    @PostMapping("/orders/{orderId}")
    public ApiResponse<PaymentResponse> create(@PathVariable Long orderId, @RequestBody @Valid PaymentRequest request) {
        return ApiResponse.<PaymentResponse>builder()
            .result(paymentService.create(orderId, request))
            .build();
    }

    @PostMapping("/{paymentId}/confirm")
    public ApiResponse<PaymentResponse> confirmMockPayment(@PathVariable Long paymentId) {
        return ApiResponse.<PaymentResponse>builder()
            .result(paymentService.confirmMockPayment(paymentId))
            .build();
    }   

    @GetMapping("/orders/{orderId}")
    public ApiResponse<PaymentResponse> getPaymentByOrderId(@PathVariable Long orderId) {
        return ApiResponse.<PaymentResponse>builder()
            .result(paymentService.getPaymentByOrderId(orderId))
            .build();
    }
}
