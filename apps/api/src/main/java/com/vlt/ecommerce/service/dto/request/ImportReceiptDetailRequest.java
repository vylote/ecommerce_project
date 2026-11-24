package com.vlt.ecommerce.service.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
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
public class ImportReceiptDetailRequest {
    @NotNull(message = "{validation.variant.id.required}")
    Long specificProductId;

    @NotNull(message = "{validation.receipt.quantity.required}")
    @Min(value = 1, message = "{validation.receipt.quantity.min}")
    Integer quantity;

    @NotNull(message = "{validation.receipt.cost.required}")
    @DecimalMin(value = "0.0", inclusive = true, message = "{validation.receipt.cost.min}")
    BigDecimal importPrice;
}
