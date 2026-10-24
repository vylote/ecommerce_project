package com.vlt.ecommerce.feature.inventory.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vlt.ecommerce.feature.inventory.ImportReceiptDetail;

@Repository
public interface ImportReceiptDetailRepository extends JpaRepository<ImportReceiptDetail, Long> {
    List<ImportReceiptDetail> findByImportReceiptId(Long receiptId);
    List<ImportReceiptDetail> findBySpecificProductId(Long specificProductId);
}
