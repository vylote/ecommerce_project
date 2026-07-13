package com.vlt.ecommerce.feature.shop.dto.response;

import java.util.Set;

import com.vlt.ecommerce.feature.product.dto.response.CategoryResponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShopResponse {
    Long id;
    String name;
    String description;
    String logoUrl;
    String address;
    Long sellerId;
    Double rating;
    Set<CategoryResponse> categories;
}
