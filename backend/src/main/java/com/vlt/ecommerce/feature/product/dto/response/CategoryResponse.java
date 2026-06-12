package com.vlt.ecommerce.feature.product.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class CategoryResponse {
    Long id;
    String name;
    String slug;
    Long parentId;
    String imageUrl;
    Boolean isActive;
}
