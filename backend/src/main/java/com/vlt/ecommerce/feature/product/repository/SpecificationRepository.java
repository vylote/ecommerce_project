package com.vlt.ecommerce.feature.product.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vlt.ecommerce.feature.product.Specification;

@Repository
public interface SpecificationRepository extends JpaRepository<Specification, Long> {
    List<Specification> findBySpecificationTypeId(Long typeId);
    boolean existsByNameIgnoreCaseAndSpecificationTypeId(String name, Long typeId);
}
