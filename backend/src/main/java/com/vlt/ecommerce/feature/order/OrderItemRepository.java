package com.vlt.ecommerce.feature.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long>{
    // Dành cho SELLER: Khi lấy OrderItem, kéo luôn thông tin của Order tổng
    @EntityGraph(attributePaths = {"order"})
    Page<OrderItem> findByShopId(Long shopId, Pageable pageable);
}
