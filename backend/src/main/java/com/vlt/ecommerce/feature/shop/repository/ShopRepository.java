package com.vlt.ecommerce.feature.shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vlt.ecommerce.feature.shop.Shop;

public interface ShopRepository extends JpaRepository<Shop, Long>{
    Boolean existsBySellerId(Long id);
    Shop findBySellerId(Long id);
}
