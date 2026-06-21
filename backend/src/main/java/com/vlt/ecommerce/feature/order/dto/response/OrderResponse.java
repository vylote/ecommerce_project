package com.vlt.ecommerce.feature.order.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
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
