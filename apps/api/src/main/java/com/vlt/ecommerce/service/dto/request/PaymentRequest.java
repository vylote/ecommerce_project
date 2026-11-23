package com.vlt.ecommerce.service.dto.request;

import com.vlt.ecommerce.domain.Payment.PaymentMethod;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRequest {
    PaymentMethod method; 
}
