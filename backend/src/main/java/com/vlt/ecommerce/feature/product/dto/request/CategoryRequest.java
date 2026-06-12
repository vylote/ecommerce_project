package com.vlt.ecommerce.feature.product.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryRequest {
    @NotBlank(message = "Tên danh mục không được để trống")
    String name;
    @NotBlank(message = "Slug không được để trống")
    String slug;
    Long parentId;
    String imageUrl;
}