package com.vlt.ecommerce.feature.commission.dto.response;

import java.math.BigDecimal;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminStatsResponse {
    BigDecimal totalGrossRevenue;
    BigDecimal totalCommissionRevenue;
}
