package com.vlt.ecommerce.feature.commission.dto.response;

import java.math.BigDecimal;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SellerStatsResponse {
    BigDecimal totalGrossRevenue;   // Tổng tiền khách mua hàng (Doanh thu gộp)
    BigDecimal totalCommissionPaid; // Tổng tiền phí Shop đã nộp cho sàn
    BigDecimal totalNetRevenue; // doanh thu
}
