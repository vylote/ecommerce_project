package com.vlt.ecommerce.service.dto.request;

import java.math.BigDecimal;

import com.vlt.ecommerce.domain.enumeration.ProductStatus;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductRequest {
    @NotBlank
    String name;
    String description;
    @NotNull(message = "{validation.product.price.required}")
    @Min(value = 0, message = "{validation.product.price.min}")
    BigDecimal price;
    @NotNull(message = "{validation.product.stock.required}")
    @Min(value = 0, message = "{validation.product.stock.min}")
    Integer stockQuantity;
    @NotNull(message = "{validation.product.category.required}")
    Long categoryId;
    ProductStatus status;
}
