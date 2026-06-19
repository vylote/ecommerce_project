package com.vlt.ecommerce.feature.order.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class OrderResponse {
    Long id;
    String addressSnapshot;
    BigDecimal totalAmount;
    String status;
    String note;
    Long buyerId;
    List<OrderItemResponse> items;
    LocalDateTime createdAt;
}
