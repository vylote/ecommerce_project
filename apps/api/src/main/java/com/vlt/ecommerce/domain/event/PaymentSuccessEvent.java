package com.vlt.ecommerce.domain.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PaymentSuccessEvent {
    private Long orderId;
}
