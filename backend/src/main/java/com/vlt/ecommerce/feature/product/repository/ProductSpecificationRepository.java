package com.vlt.ecommerce.feature.product.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vlt.ecommerce.feature.product.ProductSpecification;

@Repository
public interface ProductSpecificationRepository extends JpaRepository<ProductSpecification, Long> {
    List<ProductSpecification> findByProductId(Long productId);
    Optional<ProductSpecification> findByProductIdAndSpecificationId(Long productId, Long specificationId);
    boolean existsByProductIdAndSpecificationId(Long productId, Long specificationId);
    void deleteByProductIdAndSpecificationId(Long productId, Long specificationId);
}
