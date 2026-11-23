package com.vlt.ecommerce.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vlt.ecommerce.domain.ImportReceipt;
import com.vlt.ecommerce.domain.enumeration.ImportReceiptStatus;

@Repository
public interface ImportReceiptRepository extends JpaRepository<ImportReceipt, Long> {
    Page<ImportReceipt> findByShopId(Long shopId, Pageable pageable);
    Page<ImportReceipt> findByShopIdAndStatus(Long shopId, ImportReceiptStatus status, Pageable pageable);
    Page<ImportReceipt> findByShopIdAndProductId(Long shopId, Long productId, Pageable pageable);
    Page<ImportReceipt> findByShopIdAndProductIdAndStatus(Long shopId, Long productId, ImportReceiptStatus status, Pageable pageable);
    Optional<ImportReceipt> findByReceiptCode(String receiptCode);
    boolean existsByReceiptCode(String receiptCode);
}
