package com.vlt.ecommerce.feature.inventory.dto.response;

import java.math.BigDecimal;

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
public class ImportReceiptDetailResponse {
    Long id;
    Long specificProductId;
    String variantName;
    String sku;
    Integer quantity;
    BigDecimal importPrice;
    BigDecimal totalPrice;
}
