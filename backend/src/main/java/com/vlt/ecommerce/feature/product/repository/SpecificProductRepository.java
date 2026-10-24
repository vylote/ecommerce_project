package com.vlt.ecommerce.feature.product.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vlt.ecommerce.feature.product.SpecificProduct;

@Repository
public interface SpecificProductRepository extends JpaRepository<SpecificProduct, Long> {
    List<SpecificProduct> findByProductId(Long productId);
    List<SpecificProduct> findByProductIdAndIsActiveTrue(Long productId);
    Optional<SpecificProduct> findBySku(String sku);
    boolean existsByProductIdAndIsActiveTrue(Long productId);
    boolean existsBySku(String sku);
    boolean existsBySkuAndIdNot(String sku, Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("""
        UPDATE SpecificProduct sp 
        SET sp.stockQuantity = sp.stockQuantity - :qty 
        WHERE sp.id = :variantId AND sp.stockQuantity >= :qty
        """)
    int decrementStock(@org.springframework.data.repository.query.Param("variantId") Long variantId, 
                       @org.springframework.data.repository.query.Param("qty") Integer qty);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("""
        UPDATE SpecificProduct sp 
        SET sp.stockQuantity = sp.stockQuantity + :qty 
        WHERE sp.id = :variantId
        """)
    int incrementStock(@org.springframework.data.repository.query.Param("variantId") Long variantId, 
                       @org.springframework.data.repository.query.Param("qty") Integer qty);
}
