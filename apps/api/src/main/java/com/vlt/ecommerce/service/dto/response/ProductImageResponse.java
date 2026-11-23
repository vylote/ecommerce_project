package com.vlt.ecommerce.service.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductImageResponse {
    Long id;
    Long productId;
    String url;
    Boolean isPrimary;
    Integer sortOrder;
}
