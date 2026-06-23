package com.vlt.ecommerce.feature.payment.dto;

import com.vlt.ecommerce.feature.payment.Payment.PaymentMethod;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRequest {
    PaymentMethod method; 
}
