package com.vlt.ecommerce.feature.commission;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CommissionRecordRepository extends JpaRepository<CommissionRecord, Long>{
    // List<CommissionRecord> getCommissionRecordsBySellerId(Long sellerId);
}
