package com.vlt.ecommerce.feature.cart;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long>{
    Optional<CartItem> findByBuyerIdAndProductId(Long buyerId, Long productId);
}
