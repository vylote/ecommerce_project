package com.vlt.ecommerce.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vlt.ecommerce.domain.Product;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    List<Product> findByShopId(Long shopId);

    default Page<Product> filterProducts(ProductFilter filter, Pageable pageable) {
        return findAll(ProductSearchSpecification.matching(filter), pageable);
    }

    @Override
    @EntityGraph(attributePaths = {"category", "shop"})
    Page<Product> findAll(Specification<Product> specification, Pageable pageable);

    @Query("SELECT COALESCE(AVG(p.averageRating), 0.0) FROM Product p WHERE p.shop.id = :shopId AND p.status = 'ACTIVE'")
    Double getAverageRatingByShopId(@Param("shopId") Long shopId);

    @Modifying
    @Query("""
        UPDATE Product p
        SET p.stockQuantity = p.stockQuantity - :qty,
            p.soldCount = p.soldCount + :qty
        WHERE p.id = :productId AND p.stockQuantity >= :qty
        """)
    int decrementStockAndIncrementSold(@Param("productId") Long productId, @Param("qty") Integer qty);

    @Modifying
    @Query("""
        UPDATE Product p
        SET p.stockQuantity = p.stockQuantity + :qty,
            p.soldCount = p.soldCount - :qty
        WHERE p.id = :productId
        """)
    void restoreStockAndDecrementSold(@Param("productId") Long productId, @Param("qty") Integer qty);
}