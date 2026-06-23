package com.vlt.ecommerce.feature.commission;

import java.math.BigDecimal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommissionRecordRepository extends JpaRepository<CommissionRecord, Long>{
    // DÀNH CHO SELLER: Tính tổng theo ID của Seller
    @Query("SELECT SUM(c.itemRevenue) FROM CommissionRecord c WHERE c.seller.id = :sellerId")
    BigDecimal sumGrossRevenueBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT SUM(c.commissionAmount) FROM CommissionRecord c WHERE c.seller.id = :sellerId")
    BigDecimal sumCommissionPaidBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT SUM(c.netRevenue) FROM CommissionRecord c WHERE c.seller.id = :sellerId")
    BigDecimal sumNetRevenueBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT SUM(c.itemRevenue) FROM CommissionRecord c")
    BigDecimal sumTotalGrossRevenue();

    @Query("SELECT SUM(c.commissionAmount) FROM CommissionRecord c")
    BigDecimal sumTotalCommissionRevenue();
}
