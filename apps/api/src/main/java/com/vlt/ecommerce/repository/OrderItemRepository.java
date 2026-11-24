package com.vlt.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vlt.ecommerce.domain.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long>{
}
