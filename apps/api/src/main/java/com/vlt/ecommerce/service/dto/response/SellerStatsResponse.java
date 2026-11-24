package com.vlt.ecommerce.service.dto.response;

import java.math.BigDecimal;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SellerStatsResponse {
    BigDecimal totalGrossRevenue;
    BigDecimal totalCommissionPaid;
    BigDecimal totalNetRevenue;
}
