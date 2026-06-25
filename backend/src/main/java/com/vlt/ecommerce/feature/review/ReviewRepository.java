package com.vlt.ecommerce.feature.review;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long>{
    boolean existsByBuyerIdAndOrderIdAndProductId(Long buyerId, Long orderId, Long productId);
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    @Query("SELECT r FROM Review r JOIN FETCH r.buyer WHERE r.product.id = :productId")
    Page<Review> findByProductIdWithBuyer(@Param("productId") Long productId, Pageable pageable);
}
