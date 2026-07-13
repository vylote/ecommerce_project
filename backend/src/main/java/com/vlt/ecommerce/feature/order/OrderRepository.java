package com.vlt.ecommerce.feature.order;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface OrderRepository extends JpaRepository<Order, Long>{
    // Dành cho BUYER: Kéo luôn danh sách items để tránh N+1 Query
    @EntityGraph(attributePaths = {"items"})
    Page<Order> findByBuyerIdAndStatus(Long buyerId, OrderStatus status, Pageable pageable);
    @EntityGraph(attributePaths = {"items"})
    Page<Order> findByBuyerId(Long buyerId, Pageable pageable);

    @EntityGraph(attributePaths = {"items"})
    Page<Order> findByShopId(Long shopId, Pageable pageable);

    @Query("SELECT o FROM Order o JOIN FETCH o.shop s JOIN FETCH s.seller WHERE o.id = :id")
    Optional<Order> findByIdWithShopAndSeller(@Param("id") Long id);

    @Query("SELECT o FROM Order o JOIN FETCH o.buyer b JOIN FETCH o.shop s JOIN FETCH s.seller WHERE o.id = :id")
    Optional<Order> findOrderForNotification(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") Long id);
}
