package com.vlt.ecommerce.feature.shop.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vlt.ecommerce.feature.shop.Shop;

public interface ShopRepository extends JpaRepository<Shop, Long>{
    Boolean existsBySellerId(Long id);
    Shop findBySellerId(Long id);
    @Query("SELECT s FROM Shop s WHERE " +
           "(:keyword IS NULL OR " +
           " LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "s.isActive = true")
    Page<Shop> searchShopsByKeyword(
        @Param("keyword") String keyword, 
        Pageable pageable
    );

    @Query("SELECT s FROM Shop s LEFT JOIN s.seller u WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           " LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:isActive IS NULL OR s.isActive = :isActive)")
    Page<Shop> findShopsForAdmin(
        @Param("keyword") String keyword, 
        @Param("isActive") Boolean isActive, 
        Pageable pageable
    );

    long countByIsActive(Boolean isActive);
}
