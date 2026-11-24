package com.vlt.ecommerce.service.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
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
