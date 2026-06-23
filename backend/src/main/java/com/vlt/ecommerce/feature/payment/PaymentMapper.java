package com.vlt.ecommerce.feature.payment;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.vlt.ecommerce.feature.payment.dto.PaymentRequest;
import com.vlt.ecommerce.feature.payment.dto.PaymentResponse;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    PaymentResponse toPaymentResponse(Payment payment);
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "amount", ignore = true)
    @Mapping(target = "transactionRef", ignore = true)
    @Mapping(target = "paidAt", ignore = true)
    @Mapping(target = "order", ignore = true)
    Payment toPayment(PaymentRequest request);
}
