package com.vlt.ecommerce.feature.product.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:minRating IS NULL OR p.averageRating >= :minRating) AND " +
           "((:statusFilter = 'ALL' AND p.status != 'DELETED') OR " +
           " (:statusFilter = 'ACTIVE' AND p.status = 'ACTIVE') OR " +
           " (:statusFilter = 'INACTIVE' AND p.status = 'INACTIVE') OR " +
           " (:statusFilter = 'OUT_OF_STOCK' AND p.stockQuantity = 0 AND p.status != 'DELETED'))")
    Page<Product> filterProducts(
        @Param("categoryId") Long categoryId,
        @Param("shopId") Long shopId,
        @Param("keyword") String keyword,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("minRating") Double minRating,
        @Param("statusFilter") String statusFilter,
        Pageable pageable
    );

    @Query("SELECT COALESCE(AVG(p.averageRating), 0.0) FROM Product p WHERE p.shop.id = :shopId AND p.status = 'ACTIVE'")
    Double getAverageRatingByShopId(@Param("shopId") Long shopId);

    //atomic update
    // khi mysql thực thi update, nó áp dụng cơ chế row level lock
    @Modifying
    @Query("""
        UPDATE Product p 
        SET p.stockQuantity = p.stockQuantity - :qty, 
            p.soldCount = p.soldCount + :qty 
        WHERE p.id = :productId AND p.stockQuantity >= :qty
        """)
    int decrementStockAndIncrementSold(@Param("productId") Long productId, @Param("qty") Integer qty);

    @Modifying
    @Query("""
        UPDATE Product p 
        SET p.stockQuantity = p.stockQuantity + :qty, 
            p.soldCount = p.soldCount - :qty 
        WHERE p.id = :productId
        """)
    void restoreStockAndDecrementSold(@Param("productId") Long productId, @Param("qty") Integer qty);
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

//@Modifying cần chạy trong 1 transaction — Spring Data JPA bắt buộc các query @Modifying phải chạy trong ngữ cảnh @Transactional, nếu không sẽ throw lỗi lúc runtime (InvalidDataAccessApiUsageException)

/* Race Condition (Trạng thái tương tranh): Hiện tượng lỗi khi nhiều luồng cùng truy cập và sửa đổi một dữ liệu dùng chung, khiến kết quả cuối cùng phụ thuộc vào thứ tự các luồng được xử lý, dẫn đến kết quả không xác định (non-deterministic) hoặc sai lệch

Atomic Operation: Thao tác nguyên tử, tức là một cụm lệnh thực thi trọn vẹn từ đầu đến cuối mà không thể bị xen ngang hay chia nhỏ.

Row-level Locking: Cơ chế khóa cấp dòng của InnoDB (MySQL) khi thực thi lệnh UPDATE/DELETE, giúp chống ghi đè dữ liệu.

Read-Modify-Write Anti-pattern: Lỗi thiết kế khi kéo dữ liệu lên tầng Application (Java) để sửa rồi lưu lại thay vì dùng Native SQL Update. */