package com.vlt.ecommerce.feature.commission;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommissionConfigRepository extends JpaRepository<CommissionConfig, Long>{
    @Query(value = "SELECT * FROM commission_configs WHERE category_id = :categoryId AND effective_from <= :currentDate ORDER BY effective_from DESC LIMIT 1", nativeQuery = true)
    Optional<CommissionConfig> findActiveConfigByCategory(@Param("categoryId") Long categoryId, @Param("currentDate") LocalDate currentDate);

    // 2. Tìm cấu hình Mặc định toàn sàn (Tên đã được làm ngắn)
    @Query(value = "SELECT * FROM commission_configs WHERE category_id IS NULL AND effective_from <= :currentDate ORDER BY effective_from DESC LIMIT 1", nativeQuery = true)
    Optional<CommissionConfig> findActiveGlobalConfig(@Param("currentDate") LocalDate currentDate);

    // Tìm cấu hình phí hoa hồng dựa theo Category của sản phẩm
    Optional<CommissionConfig> findByCategoryId(Long categoryId);
    List<CommissionConfig> findByCreatedById(Long id);
}

/*  // 1. Tìm cấu hình của 1 Category cụ thể, ưu tiên ngày áp dụng gần nhất với hiện tại
    Optional<CommissionConfig> findTopByCategoryIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(
            Long categoryId, 
            LocalDate currentDate
    );

    // 2. Tìm cấu hình Mặc định (Category IS NULL), ưu tiên ngày áp dụng gần nhất với hiện tại
    Optional<CommissionConfig> findTopByCategoryIsNullAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(
            LocalDate currentDate
    );

    /* findTop: Tìm và lấy ra đúng 1 dòng đầu tiên (Tương đương LIMIT 1).
    ByCategoryId: Điều kiện lọc theo ID danh mục (WHERE category_id = ?).
    AndEffectiveFromLessThanEqual: Và ngày bắt đầu áp dụng phải nhỏ hơn hoặc bằng ngày hiện tại (AND effective_from <= ?).
    Điều này để tránh lấy nhầm cấu hình của tương lai.OrderByEffectiveFromDesc: Sắp xếp ngày áp dụng giảm dần từ mới nhất
    đến cũ nhất (ORDER BY effective_from DESC). */ 