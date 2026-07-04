package com.vlt.ecommerce.feature.product.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.product.Category;
import com.vlt.ecommerce.feature.product.dto.request.CategoryRequest;
import com.vlt.ecommerce.feature.product.dto.response.CategoryResponse;
import com.vlt.ecommerce.feature.product.mapper.CategoryMapper;
import com.vlt.ecommerce.feature.product.repository.CategoryRepository;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CategoryService {
    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;
    
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED);
        }

        if (request.getParentId() != null && !categoryRepository.existsById(request.getParentId())) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        Category newCategory = categoryMapper.toCategory(request);
        
        return categoryMapper.toCategoryResponse(categoryRepository.save(newCategory));
    }

    public CategoryResponse get(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        return categoryMapper.toCategoryResponse(category);
    }

    public List<CategoryResponse> getAll() {
        return categoryMapper.toCategoriesResponse(categoryRepository.findAll());
    }

    public List<CategoryResponse> getParentCategories() {
        List<Category> parents = categoryRepository.findByParentIsNull();
        if (parents == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        return categoryMapper.toCategoriesResponse(parents);
    }

    public CategoryResponse update(CategoryRequest request, Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!category.getSlug().equals(request.getSlug()) && 
            categoryRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED);
        }

        if (request.getParentId() != null) {
            if (!categoryRepository.existsById(request.getParentId())) {
                throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
            }
            if (request.getParentId().equals(id)) {
                throw new AppException(ErrorCode.INVALID_HIERARCHY);
            }
        }

        categoryMapper.updateCategoryFromRequest(request, category);

        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }

    public void delete(Long id) {
        categoryRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        categoryRepository.deleteById(id);
    }

    public List<CategoryResponse> getChildrenCategories(Long parentId) {
        if (!categoryRepository.existsById(parentId)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        List<Category> childs = categoryRepository.findByParentIdAndIsActiveTrue(parentId);
        if (childs.isEmpty()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        return categoryMapper.toCategoriesResponse(childs);
    }
}
