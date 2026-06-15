package com.vlt.ecommerce.common.dto;

import java.util.List;

import org.springframework.data.domain.Page;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PageResponse<T> {
    int currentPage;
    int pageSize;
    int totalPages;
    long totalElements;
    boolean isLast;
    List<T> data;

    public static <T> PageResponse<T> of(Page<?> page, List<T> data) {
        return PageResponse.<T>builder()
                .currentPage(page.getNumber() + 1) // Cộng 1 vì Spring đếm từ 0
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .isLast(page.isLast())
                .data(data)
                .build();
    }
}
/* ==============================================================================
     * BẢN CHẤT CỦA ĐỐI TƯỢNG PAGE<T> VÀ HÀM BUILDER
     * ==============================================================================
     * Đối tượng 'Page page' do Spring Data JPA trả về không chỉ chứa 10 sản phẩm (content), 
     * mà nó còn chứa sẵn các phép toán (Math) đếm tổng số trang, tổng phần tử.
     * * 1. page.getTotalElements(): Tổng số lượng bản ghi thỏa mãn điều kiện lọc trong CẢ DATABASE 
     * (VD: Lọc theo Shop 1 ra 150 cái, thì nó là 150). Nhờ biến này, FE mới biết đường 
     * vẽ ra bao nhiêu nút phân trang (1, 2, 3...).
     * 2. page.getNumber() + 1: Dịch từ Hệ quy chiếu máy (bắt đầu từ 0) sang Hệ quy chiếu 
     * người (bắt đầu từ 1) để FE hiển thị cho tự nhiên.
     * ============================================================================== */