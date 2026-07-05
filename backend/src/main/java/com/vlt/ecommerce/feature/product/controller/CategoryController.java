package com.vlt.ecommerce.feature.product.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.feature.product.dto.request.CategoryRequest;
import com.vlt.ecommerce.feature.product.dto.response.CategoryDetailResponse;
import com.vlt.ecommerce.feature.product.dto.response.CategoryResponse;
import com.vlt.ecommerce.feature.product.service.CategoryService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/categories")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class CategoryController {
    CategoryService categoryService;

    @PostMapping
    public ApiResponse<CategoryResponse> create(@RequestBody @Valid CategoryRequest request) {
        return ApiResponse.<CategoryResponse>builder()
                .result(categoryService.create(request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<CategoryDetailResponse> getCategoryDetail(@PathVariable Long id) {
        return ApiResponse.<CategoryDetailResponse>builder()
                .result(categoryService.getCategoryDetailWithBreadcrumbs(id))
                .build();
    }

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAll() {
        return ApiResponse.<List<CategoryResponse>>builder()
                .result(categoryService.getAll())
                .build();
    }

    @GetMapping("/parents")
    public ApiResponse<List<CategoryResponse>> getParentCategories() {
        return ApiResponse.<List<CategoryResponse>>builder()
                .result(categoryService.getParentCategories())
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> update(@RequestBody @Valid CategoryRequest request, @PathVariable Long id) {
        return ApiResponse.<CategoryResponse>builder()
                .result(categoryService.update(request, id))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ApiResponse.<String>builder()
                .result("Đã xóa danh mục")
                .build();
    }

    @GetMapping("/{id}/childrens")
    public ApiResponse<List<CategoryResponse>> getChildrenCategories(@PathVariable Long id) {
        return ApiResponse.<List<CategoryResponse>>builder()
                .result(categoryService.getChildrenCategories(id))
                .build();
    }
}
