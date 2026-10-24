package com.vlt.ecommerce.feature.product.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
public class SpecificProductResponse {
    Long id;
    Long productId;
    String productName;
    String name;
    String sku;
    BigDecimal price;
    Integer stockQuantity;
    String imageUrl;
    Boolean isActive;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
