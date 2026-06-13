package com.vlt.ecommerce.feature.product.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductImageRequest {
    @NotBlank(message = "URL ảnh không được để trống")
    private String url;
    
    private Boolean isPrimary;
    
    private Integer sortOrder;
}
