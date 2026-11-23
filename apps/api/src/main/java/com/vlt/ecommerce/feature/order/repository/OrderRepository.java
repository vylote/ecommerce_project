package com.vlt.ecommerce.feature.order.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vlt.ecommerce.feature.order.Order;
import com.vlt.ecommerce.feature.order.OrderStatus;
import com.vlt.ecommerce.feature.order.dto.response.OrderStatusStat;

import jakarta.persistence.LockModeType;

public interface OrderRepository extends JpaRepository<Order, Long>{
    // Dành cho BUYER: Kéo luôn danh sách items và payment để tránh N+1 Query
    @EntityGraph(attributePaths = {"items", "payment"})
    Page<Order> findByBuyerIdAndStatus(Long buyerId, OrderStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"items", "payment"})
    Page<Order> findByBuyerId(Long buyerId, Pageable pageable);

    // Dành cho SHOP: Kéo luôn danh sách items và payment để tránh N+1 Query
    @EntityGraph(attributePaths = {"items", "payment"})
    Page<Order> findByShopId(Long shopId, Pageable pageable);

    @EntityGraph(attributePaths = {"items", "payment"})
    Page<Order> findByShopIdAndStatus(Long shopId, OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM Order o JOIN FETCH o.shop s JOIN FETCH s.seller WHERE o.id = :id")
    Optional<Order> findByIdWithShopAndSeller(@Param("id") Long id);

    @Query("SELECT o FROM Order o JOIN FETCH o.buyer b JOIN FETCH o.shop s JOIN FETCH s.seller WHERE o.id = :id")
    Optional<Order> findOrderForNotification(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") Long id);

    // KỸ THUẬT GOM NHÓM (GROUP BY) TỐI ƯU DASHBOARD
    @Query("SELECT o.status AS status, COUNT(o.id) AS count " +
           "FROM Order o WHERE o.shop.id = :shopId " +
           "GROUP BY o.status")
    List<OrderStatusStat> countOrdersByStatusForShop(@Param("shopId") Long shopId);

    @EntityGraph(attributePaths = {"payment"})
    List<Order> findByShopIdAndCreatedAtAfter(Long shopId, LocalDateTime after);

    @EntityGraph(attributePaths = {"payment"})
    List<Order> findByShopId(Long shopId);

    @EntityGraph(attributePaths = {"payment"})
    List<Order> findByCreatedAtAfter(LocalDateTime after);

    @Query("SELECT o.status AS status, COUNT(o.id) AS count FROM Order o GROUP BY o.status")
    List<OrderStatusStat> countAllOrdersByStatus();
}
