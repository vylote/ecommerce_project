package com.vlt.ecommerce.feature.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long>{
    // Dành cho BUYER: Kéo luôn danh sách items để tránh N+1 Query
    @EntityGraph(attributePaths = {"items"})
    Page<Order> findByBuyerId(Long buyerId, Pageable pageable);
}
