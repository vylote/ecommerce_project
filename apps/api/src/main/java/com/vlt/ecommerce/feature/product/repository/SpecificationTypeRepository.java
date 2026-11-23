package com.vlt.ecommerce.feature.product.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vlt.ecommerce.feature.product.SpecificationType;

@Repository
public interface SpecificationTypeRepository extends JpaRepository<SpecificationType, Long> {
    Optional<SpecificationType> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    @Query("SELECT DISTINCT st FROM SpecificationType st LEFT JOIN st.categories c WHERE c.id = :categoryId OR c.id IS NULL")
    List<SpecificationType> findByCategoryIdOrCommon(@Param("categoryId") Long categoryId);

    @Query("SELECT DISTINCT st FROM SpecificationType st JOIN st.categories c WHERE c.id = :categoryId")
    List<SpecificationType> findByCategoryId(@Param("categoryId") Long categoryId);
}
