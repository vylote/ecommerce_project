package com.vlt.ecommerce.service.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpecificProductRequest {
    @NotBlank(message = "{validation.variant.name.required}")
    @Size(max = 255, message = "{validation.variant.name.maxLength}")
    String name;

    @Size(max = 100, message = "{validation.variant.sku.maxLength}")
    String sku;

    @NotNull(message = "{validation.variant.price.required}")
    @DecimalMin(value = "0.0", inclusive = true, message = "{validation.variant.price.min}")
    BigDecimal price;

    @Size(max = 500, message = "{validation.image.url.maxLength}")
    String imageUrl;

    @Builder.Default
    Boolean isActive = true;
}
