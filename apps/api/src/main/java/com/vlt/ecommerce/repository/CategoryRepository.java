package com.vlt.ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vlt.ecommerce.domain.Category;

import jakarta.persistence.LockModeType;

public interface CategoryRepository extends JpaRepository<Category, Long>{
    Boolean existsBySlug(String slug);

    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("SELECT c FROM Category c WHERE c.id = :id")
    Optional<Category> findForProductAssignment(@Param("id") Long id);

    List<Category> findByParentIdAndIsActiveTrue(Long parentId);

    boolean existsById(Long id);

    List<Category> findByParentIsNull();
}
