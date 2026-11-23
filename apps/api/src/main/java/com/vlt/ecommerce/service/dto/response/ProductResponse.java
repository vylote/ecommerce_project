package com.vlt.ecommerce.service.dto.response;

import java.math.BigDecimal;
import java.util.List;

import com.vlt.ecommerce.domain.enumeration.ProductStatus;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    Long id;
    String name;
    String description;
    BigDecimal price;
    BigDecimal minPrice;
    BigDecimal maxPrice;
    Boolean hasVariants;
    Integer stockQuantity;
    Integer soldCount;
    ProductStatus status;
    ShopResponse shop;
    CategoryResponse category;
    Double averageRating;
    Integer reviewCount;
    List<ProductImageResponse> images;
    List<SpecificProductResponse> variants;
}
