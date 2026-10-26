package com.vlt.ecommerce.feature.product.dto.response;

import java.math.BigDecimal;
import java.util.List;

import com.vlt.ecommerce.feature.product.ProductStatus;
import com.vlt.ecommerce.feature.shop.dto.response.ShopResponse;

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
