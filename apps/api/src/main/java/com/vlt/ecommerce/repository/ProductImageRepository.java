package com.vlt.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vlt.ecommerce.domain.ProductImage;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long>{

}
