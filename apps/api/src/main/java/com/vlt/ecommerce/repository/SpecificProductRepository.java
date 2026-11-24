package com.vlt.ecommerce.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vlt.ecommerce.domain.SpecificProduct;

@Repository
public interface SpecificProductRepository extends JpaRepository<SpecificProduct, Long> {
    List<SpecificProduct> findByProductId(Long productId);
    List<SpecificProduct> findByProductIdAndIsActiveTrue(Long productId);

    boolean existsByProductIdAndIsActiveTrue(Long productId);
    boolean existsBySku(String sku);
    boolean existsBySkuAndIdNot(String sku, Long id);

    @Modifying
    @Query("""
        UPDATE SpecificProduct sp 
        SET sp.stockQuantity = sp.stockQuantity - :qty 
        WHERE sp.id = :variantId AND sp.stockQuantity >= :qty
        """)
    int decrementStock(@Param("variantId") Long variantId, 
                       @Param("qty") Integer qty);

    @Modifying
    @Query("""
        UPDATE SpecificProduct sp 
        SET sp.stockQuantity = sp.stockQuantity + :qty 
        WHERE sp.id = :variantId
        """)
    void incrementStock(@Param("variantId") Long variantId,
                       @Param("qty") Integer qty);
}
