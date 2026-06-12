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

        Long parentId = request.getParentId();
        Category parent = null;
        if (parentId != null) {
            parent = categoryRepository.findById(parentId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        }

        Category newCategory = categoryMapper.toCategory(request);
        newCategory.setName(request.getName());
        newCategory.setSlug(request.getSlug());
        if (parent != null) newCategory.setParent(parent);
        newCategory.setImageUrl(request.getImageUrl());
        newCategory.setIsActive(true);
        
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

    public CategoryResponse update(CategoryRequest request, Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!category.getSlug().equals(request.getSlug()) && 
            categoryRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED);
        }

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
            
            if (parent.getId().equals(id)) {
                throw new AppException(ErrorCode.INVALID_HIERARCHY);
            }
        }

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setParent(parent);
        category.setImageUrl(request.getImageUrl());

        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }

    public void delete(Long id) {
        categoryRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        categoryRepository.deleteById(id);
    }
}
