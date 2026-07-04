package com.vlt.ecommerce.feature.product.dto.response;

import java.math.BigDecimal;
import java.util.List;

import com.vlt.ecommerce.feature.product.ProductStatus;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ProductResponse {
    Long id;
    String name;
    String description;
    BigDecimal price;
    Integer stockQuantity;
    Integer soldCount;
    ProductStatus status;
    Long shopId;
    Long categoryId;
    Double averageRating;
    Integer reviewCount;
    List<ProductImageResponse> images; 
}
