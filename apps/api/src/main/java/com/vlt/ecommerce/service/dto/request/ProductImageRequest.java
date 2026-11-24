package com.vlt.ecommerce.service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductImageRequest {
    @NotBlank(message = "{validation.image.url.required}")
    private String url;
    
    private Boolean isPrimary;
    
    private Integer sortOrder;
}
