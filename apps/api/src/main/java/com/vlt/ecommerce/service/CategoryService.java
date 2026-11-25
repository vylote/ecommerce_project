package com.vlt.ecommerce.service;

import java.util.List;

import com.vlt.ecommerce.service.dto.request.CategoryRequest;
import com.vlt.ecommerce.service.dto.request.CreateCategoryRequest;
import com.vlt.ecommerce.service.dto.response.CategoryDetailResponse;
import com.vlt.ecommerce.service.dto.response.CategoryResponse;

public interface CategoryService {

    CategoryResponse create(CreateCategoryRequest request);

    CategoryDetailResponse getCategoryDetailWithBreadcrumbs(Long id);

    List<CategoryResponse> getAll();

    List<CategoryResponse> getParentCategories();

    CategoryResponse update(CategoryRequest request, Long id);

    void delete(Long id);

    List<CategoryResponse> getChildrenCategories(Long parentId);
}
