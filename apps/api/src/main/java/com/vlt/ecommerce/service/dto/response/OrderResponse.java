package com.vlt.ecommerce.service.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    Long id;
    Long shopId;
    String shopName;
    String addressSnapshot;
    BigDecimal totalAmount;
    String status;
    String note;
    Long buyerId;
    List<OrderItemResponse> items;
    LocalDateTime createdAt;
    Boolean reviewed;
    String paymentMethod;
    String paymentStatus;
}
