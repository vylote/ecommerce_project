package com.vlt.ecommerce.feature.product.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vlt.ecommerce.feature.product.Product;

public interface ProductRepository extends JpaRepository<Product, Long>{
    List<Product> findByShopId(Long shopId);
}
