package com.vlt.ecommerce.feature.payment;

import com.vlt.ecommerce.feature.payment.dto.PaymentRequest;
import com.vlt.ecommerce.feature.payment.dto.PaymentResponse;

public interface PaymentService {

    PaymentResponse create(Long orderId, PaymentRequest request);

    PaymentResponse confirmMockPayment(Long paymentId);

    PaymentResponse getPaymentByOrderId(Long orderId);
}
