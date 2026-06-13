package com.vlt.ecommerce.feature.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vlt.ecommerce.feature.product.Product;

public interface ProductRepository extends JpaRepository<Product, Long>{

}
