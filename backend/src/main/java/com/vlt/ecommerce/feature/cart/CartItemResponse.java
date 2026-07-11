package com.vlt.ecommerce.feature.cart;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemResponse {
    Long id;
    Long productId;
    String productName;
    String imageUrl;       // Thêm ảnh sản phẩm
    Long shopId;           // Thêm ID để Frontend gộp nhóm
    String shopName;
    BigDecimal productPrice;
    Integer quantity;
    BigDecimal totalPrice; // Tổng tiền = quantity * price
    LocalDateTime addedAt;
}
