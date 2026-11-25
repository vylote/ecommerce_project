package com.vlt.ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.jspecify.annotations.Nullable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vlt.ecommerce.domain.CartItem;
import com.vlt.ecommerce.domain.SpecificProduct;

public interface CartItemRepository extends JpaRepository<CartItem, Long>{
    Optional<CartItem> findByIdAndBuyerId(Long id, Long buyerId);
    Optional<CartItem> findByBuyerIdAndProductIdAndSpecificProduct(
            Long buyerId, Long productId, @Nullable SpecificProduct variant);
    @Modifying
    @Query("DELETE FROM CartItem c WHERE c.buyer.id = :buyerId")
    void deleteAllByBuyerId(@Param("buyerId") Long buyerId);
    @EntityGraph(attributePaths = {"product"})
    List<CartItem> findByBuyerId(Long buyerId);

    List<CartItem> findAllByIdInAndBuyerId(List<Long> ids, Long buyerId);
}
