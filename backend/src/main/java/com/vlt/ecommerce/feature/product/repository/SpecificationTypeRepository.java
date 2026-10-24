package com.vlt.ecommerce.feature.product.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vlt.ecommerce.feature.product.SpecificationType;

@Repository
public interface SpecificationTypeRepository extends JpaRepository<SpecificationType, Long> {
    Optional<SpecificationType> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
