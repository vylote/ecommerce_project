package com.vlt.ecommerce.service;

import com.vlt.ecommerce.service.dto.request.PaymentRequest;
import com.vlt.ecommerce.service.dto.response.PaymentResponse;

public interface PaymentService {

    PaymentResponse create(Long orderId, PaymentRequest request);

    PaymentResponse confirmMockPayment(Long paymentId);

    PaymentResponse getPaymentByOrderId(Long orderId);
}
