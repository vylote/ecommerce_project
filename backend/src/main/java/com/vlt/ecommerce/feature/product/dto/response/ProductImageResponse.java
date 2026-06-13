package com.vlt.ecommerce.feature.product.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductImageResponse {
    private Long id;
    private Long productId;
    private String url;
    private Boolean isPrimary;
    private Integer sortOrder;
}
