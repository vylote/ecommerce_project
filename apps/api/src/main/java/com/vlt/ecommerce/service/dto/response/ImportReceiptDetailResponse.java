package com.vlt.ecommerce.service.dto.response;

import java.math.BigDecimal;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
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
