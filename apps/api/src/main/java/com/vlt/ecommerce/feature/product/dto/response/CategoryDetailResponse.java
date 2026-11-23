package com.vlt.ecommerce.feature.product.dto.response;

import java.util.List;

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
public class CategoryDetailResponse {
    Long id;
    String name;
    String slug;
    String imageUrl;
    boolean isActive;
    // Chuỗi danh mục cha kéo theo từ cấp cao nhất đến sát danh mục hiện tại
    List<CategoryResponse> breadcrumbs; 
}
