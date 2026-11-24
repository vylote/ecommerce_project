package com.vlt.ecommerce.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vlt.ecommerce.domain.Product;

public interface ProductRepository extends JpaRepository<Product, Long>{
    List<Product> findByShopId(Long shopId);

    @EntityGraph(attributePaths = {"category", "shop"})
    @Query("SELECT p FROM Product p WHERE " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:shopId IS NULL OR p.shop.id = :shopId) AND "+
           "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:minRating IS NULL OR p.averageRating >= :minRating) AND " +
           "((:statusFilter = 'ALL' AND p.status != 'DELETED') OR " +
           " (:statusFilter = 'ACTIVE' AND p.status = 'ACTIVE') OR " +
           " (:statusFilter = 'INACTIVE' AND p.status = 'INACTIVE') OR " +
           " (:statusFilter = 'OUT_OF_STOCK' AND p.stockQuantity = 0 AND p.status != 'DELETED'))")
    Page<Product> filterProducts(
        @Param("categoryId") Long categoryId,
        @Param("shopId") Long shopId,
        @Param("keyword") String keyword,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("minRating") Double minRating,
        @Param("statusFilter") String statusFilter,
        Pageable pageable
    );

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