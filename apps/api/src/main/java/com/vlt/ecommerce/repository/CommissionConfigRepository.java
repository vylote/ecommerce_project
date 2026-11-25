package com.vlt.ecommerce.repository;

import com.vlt.ecommerce.domain.CommissionConfig;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommissionConfigRepository extends JpaRepository<CommissionConfig, Long>{
    @Query(value = "SELECT * FROM commission_configs WHERE category_id = :categoryId AND effective_from <= :currentDate ORDER BY effective_from DESC LIMIT 1", nativeQuery = true)
    Optional<CommissionConfig> findActiveConfigByCategory(@Param("categoryId") Long categoryId, @Param("currentDate") LocalDate currentDate);

    Optional<CommissionConfig> findByCategoryId(Long categoryId);

    boolean existsByCategoryIdAndEffectiveFromLessThanEqual(Long categoryId, LocalDate date);

    List<CommissionConfig> findByCreatedById(Long id);
}