package com.vlt.ecommerce.feature.product.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.vlt.ecommerce.feature.product.Category;
import com.vlt.ecommerce.feature.product.dto.request.CategoryRequest;
import com.vlt.ecommerce.feature.product.dto.response.CategoryResponse;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponse toCategoryResponse(Category category);
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    Category toCategory(CategoryRequest request);
    List<CategoryResponse> toCategoriesResponse(List<Category> categories);
} 
