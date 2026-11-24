package com.vlt.ecommerce.repository;

import com.vlt.ecommerce.domain.SpecificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpecificationTypeRepository extends JpaRepository<SpecificationType, Long> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    @Query("SELECT DISTINCT st FROM SpecificationType st LEFT JOIN st.categories c WHERE c.id = :categoryId OR c.id IS NULL")
    List<SpecificationType> findByCategoryIdOrCommon(@Param("categoryId") Long categoryId);

}
