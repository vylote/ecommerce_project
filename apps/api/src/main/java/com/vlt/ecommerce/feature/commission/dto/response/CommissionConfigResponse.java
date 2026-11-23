package com.vlt.ecommerce.feature.commission.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommissionConfigResponse {
    BigDecimal rate;
    Long categoryId;
    Long createdById;
    LocalDate effectiveFrom;
}
