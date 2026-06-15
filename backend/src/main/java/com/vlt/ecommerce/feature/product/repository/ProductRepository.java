package com.vlt.ecommerce.feature.product.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vlt.ecommerce.feature.product.Product;

public interface ProductRepository extends JpaRepository<Product, Long>{
    List<Product> findByShopId(Long shopId);

    @EntityGraph(attributePaths = {"category", "shop"})
    @Query("SELECT p FROM Product p WHERE " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:shopId IS NULL OR p.shop.id = :shopId) AND "+
           "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "p.status = 'ACTIVE'")
    Page<Product> filterProducts(
        @Param("categoryId") Long categoryId,
        @Param("shopId") Long shopId,
        @Param("keyword") String keyword,
        Pageable pageable
    );
}
/* ==============================================================================
     * NGHỊCH LÝ LAZY CHỐNG N+1 VÀ KỸ THUẬT LỌC ĐỘNG (DYNAMIC FILTER)
     * ==============================================================================
     * 1. @EntityGraph - Lệnh bài ép buộc Eager Fetching:
     * - Mặc định biến 'category' và 'shop' là LAZY (tránh kéo data thừa).
     * - NHƯNG khi Frontend cần hiển thị thông tin, MapStruct lặp qua 10 Sản phẩm 
     * sẽ gọi 10 lần getCategory() -> Đánh thức 10 Proxy -> Sinh ra 10 câu SQL phụ (Lỗi N+1).
     * - @EntityGraph ép Hibernate tạo câu lệnh LEFT OUTER JOIN để gom cả 'category' 
     * và 'shop' về chung trong 1 câu SQL gốc. 
     * - (Dùng LEFT JOIN thay vì INNER JOIN để lỡ Sản phẩm chưa gán Danh mục thì 
     * nó vẫn hiển thị ra được, không bị lỗi mất tích).
     *
     * 2. @Query - Lọc động bằng "Công tắc IS NULL":
     * - Nếu tham số truyền vào bị null (FE không gửi), vế '... IS NULL' sẽ TRUE 
     * -> Toán tử OR bỏ qua vế sau -> Điều kiện bị vô hiệu hóa. Rất sạch sẽ!
     * - LOWER(...) LIKE LOWER(CONCAT(...)): Tìm kiếm chuỗi có chứa từ khóa (%), 
     * không phân biệt viết hoa/thường.
     * * 3. Pageable & Page<Product> - Tự động hóa phân trang:
     * - Tự động chèn thêm LIMIT và OFFSET vào cuối lệnh SQL.
     * - Tự động bắn thêm 1 câu truy vấn SELECT COUNT(*) để lấy biến totalElements.
     * ============================================================================== */
