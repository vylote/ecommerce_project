package com.vlt.ecommerce.repository;

import com.vlt.ecommerce.domain.Review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long>{
    boolean existsByBuyerIdAndOrderIdAndProductId(Long buyerId, Long orderId, Long productId);
    boolean existsByOrderId(Long orderId);

    @Query("SELECT r FROM Review r JOIN FETCH r.buyer WHERE r.product.id = :productId AND "+
        "(:rating IS NULL OR r.rating = :rating)")
    Page<Review> findByProductIdWithBuyer(
        @Param("productId") Long productId, 
        @Param("rating") Integer rating,  
        Pageable pageable
    );
    @Query("SELECT COUNT(r), COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.product.id = :productId")
    Object getRatingStatsByProductId(@Param("productId") Long productId);
}
