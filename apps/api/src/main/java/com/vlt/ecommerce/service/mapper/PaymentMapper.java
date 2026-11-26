package com.vlt.ecommerce.service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.vlt.ecommerce.domain.Payment;
import com.vlt.ecommerce.service.dto.request.PaymentRequest;
import com.vlt.ecommerce.service.dto.response.PaymentResponse;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    PaymentResponse toPaymentResponse(Payment payment);
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "amount", ignore = true)
    @Mapping(target = "transactionRef", ignore = true)
    @Mapping(target = "gatewayOrderId", ignore = true)
    @Mapping(target = "gatewayPayUrl", ignore = true)
    @Mapping(target = "paidAt", ignore = true)
    @Mapping(target = "order", ignore = true)
    Payment toPayment(PaymentRequest request);
}
