package com.vlt.ecommerce.feature.commission.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommissionConfigRequest {
    BigDecimal rate;
    Long categoryId;
    Long userId;
    LocalDate effectiveFrom;
}
