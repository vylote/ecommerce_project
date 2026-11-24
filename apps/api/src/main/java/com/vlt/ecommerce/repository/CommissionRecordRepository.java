package com.vlt.ecommerce.repository;

import com.vlt.ecommerce.domain.CommissionRecord;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommissionRecordRepository extends JpaRepository<CommissionRecord, Long>{

    @Query("SELECT SUM(c.itemRevenue) FROM CommissionRecord c WHERE c.seller.id = :sellerId")
    Optional<BigDecimal> sumGrossRevenueBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT SUM(c.commissionAmount) FROM CommissionRecord c WHERE c.seller.id = :sellerId")
    Optional<BigDecimal> sumCommissionPaidBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT SUM(c.netRevenue) FROM CommissionRecord c WHERE c.seller.id = :sellerId")
    Optional<BigDecimal> sumNetRevenueBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT SUM(c.itemRevenue) FROM CommissionRecord c")
    Optional<BigDecimal> sumTotalGrossRevenue();

    @Query("SELECT SUM(c.commissionAmount) FROM CommissionRecord c")
    Optional<BigDecimal> sumTotalCommissionRevenue();

    boolean existsByOrderItemId(Long orderItemId);

    List<CommissionRecord> findByRecordedAtAfter(LocalDateTime after);
}
