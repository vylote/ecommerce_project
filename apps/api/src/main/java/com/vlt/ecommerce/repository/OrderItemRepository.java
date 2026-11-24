package com.vlt.ecommerce.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.vlt.ecommerce.domain.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long>{
    @EntityGraph(attributePaths = {"order"})
    Page<OrderItem> findByShopId(Long shopId, Pageable pageable);
}
