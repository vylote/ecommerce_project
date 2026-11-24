package com.vlt.ecommerce.service.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CategoryDetailResponse {
    private Long id;
    private String name;
    private String slug;
    private String imageUrl;
    private boolean isActive;
    // Chuỗi danh mục cha kéo theo từ cấp cao nhất đến sát danh mục hiện tại
    private List<CategoryResponse> breadcrumbs;
}
