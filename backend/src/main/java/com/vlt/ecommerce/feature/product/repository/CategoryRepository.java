package com.vlt.ecommerce.feature.product.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vlt.ecommerce.feature.product.Category;

public interface CategoryRepository extends JpaRepository<Category, Long>{
    Boolean existsBySlug(String slug);

    List<Category> findByParentIdAndIsActiveTrue(Long parentId);

    boolean existsById(Long id);
    // Lấy tất cả danh mục gốc (không có danh mục cha)
    List<Category> findByParentIsNull();
}
