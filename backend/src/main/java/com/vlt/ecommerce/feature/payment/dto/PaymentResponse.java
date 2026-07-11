package com.vlt.ecommerce.feature.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.vlt.ecommerce.feature.payment.Payment.PaymentMethod;
import com.vlt.ecommerce.feature.payment.Payment.PaymentStatus;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class PaymentResponse {
    Long id;
    PaymentMethod method;
    PaymentStatus status;
    BigDecimal amount;
    LocalDateTime paidAt;
    String transactionRef;
}
