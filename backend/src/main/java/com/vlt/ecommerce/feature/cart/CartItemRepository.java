package com.vlt.ecommerce.feature.cart;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CartItemRepository extends JpaRepository<CartItem, Long>{
    Optional<CartItem> findByBuyerIdAndProductId(Long buyerId, Long productId);
    @Modifying
    @Query("DELETE FROM CartItem c WHERE c.buyer.id = :buyerId")
    void deleteAllByBuyerId(@Param("buyerId") Long buyerId);
    @EntityGraph(attributePaths = {"product"})
    List<CartItem> findByBuyerId(Long buyerId);
}
