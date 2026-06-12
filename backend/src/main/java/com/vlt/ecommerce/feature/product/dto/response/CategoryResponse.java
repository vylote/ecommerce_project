package com.vlt.ecommerce.feature.product.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class CategoryResponse {
    String name;
    String slug;
    String imageUrl;
    Boolean isActive;
}
