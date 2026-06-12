package com.vlt.ecommerce.feature.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vlt.ecommerce.feature.product.Category;

public interface CategoryRepository extends JpaRepository<Category, Long>{
    Boolean existsBySlug(String slug);
}
