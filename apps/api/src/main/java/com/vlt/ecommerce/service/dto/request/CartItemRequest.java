package com.vlt.ecommerce.service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemRequest {
    @NotNull(message = "{validation.product.id.required}")
    Long productId;

    Long specificProductId;

    @NotNull(message = "{validation.cart.quantity.required}")
    @Min(value = 1, message = "{validation.cart.quantity.min}")
    Integer quantity;
}
