package com.vlt.ecommerce.service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryRequest {
    @NotBlank(message = "{validation.category.name.required}")
    String name;
    @NotBlank(message = "{validation.category.slug.required}")
    String slug;
    Long parentId;
    String imageUrl;
    Boolean isActive;
}