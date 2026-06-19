package com.vlt.ecommerce.feature.order.dto.response;

import java.math.BigDecimal;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class OrderItemResponse {
    Long id;
    String productName;
    BigDecimal productPrice;
    Integer quantity;
    BigDecimal totalPrice;
    Long productId;
    Long shopId;
}
