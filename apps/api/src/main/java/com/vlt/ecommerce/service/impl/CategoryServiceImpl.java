package com.vlt.ecommerce.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.service.CategoryService;
import com.vlt.ecommerce.service.CommissionService;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.domain.Category;
import com.vlt.ecommerce.service.dto.request.CategoryRequest;
import com.vlt.ecommerce.service.dto.request.CreateCategoryRequest;
import com.vlt.ecommerce.service.dto.response.CategoryDetailResponse;
import com.vlt.ecommerce.service.dto.response.CategoryResponse;
import com.vlt.ecommerce.service.mapper.CategoryMapper;
import com.vlt.ecommerce.repository.CategoryRepository;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;
    CommissionService commissionService;

    @Override
    @Transactional
    public CategoryResponse create(CreateCategoryRequest request) {
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.CATEGORY_SLUG_ALREADY_EXISTS);
        }


        Category newCategory = categoryMapper.toCategory(request);
        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.PARENT_CATEGORY_NOT_FOUND));
            newCategory.setParent(parent);
        }
        if (request.getIsActive() != null) {
            newCategory.setIsActive(request.getIsActive());
        }

        Category saved = categoryRepository.save(newCategory);
        commissionService.createInitialConfig(saved, request.getCommissionRate());
        return categoryMapper.toCategoryResponse(saved);
    }

    @Override
    @Transactional
    public CategoryDetailResponse getCategoryDetailWithBreadcrumbs(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        List<Category> parentChain = new ArrayList<>();
        Category currentParent = category.getParent();

        while (currentParent != null) {
            // Thêm vào vị trí đầu tiên (chỉ mục 0) để đảm bảo thứ tự từ gốc -> ngọn (ví dụ: Điện tử -> Điện thoại)
            parentChain.add(0, currentParent);
            currentParent = currentParent.getParent();
        }

        return categoryMapper.toCategoryDetailResponse(category, parentChain);
    }

    @Override
    public List<CategoryResponse> getAll() {
        return categoryMapper.toCategoriesResponse(categoryRepository.findAll());
    }

    @Override
    public List<CategoryResponse> getParentCategories() {
        List<Category> parents = categoryRepository.findByParentIsNull();
        if (parents == null) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        return categoryMapper.toCategoriesResponse(parents);
    }

    @Override
    public CategoryResponse update(CategoryRequest request, Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (!category.getSlug().equals(request.getSlug()) &&
            categoryRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.CATEGORY_SLUG_ALREADY_EXISTS);
        }

        if (request.getParentId() != null) {
            if (!categoryRepository.existsById(request.getParentId())) {
                throw new AppException(ErrorCode.PARENT_CATEGORY_NOT_FOUND);
            }
            if (request.getParentId().equals(id)) {
                throw new AppException(ErrorCode.INVALID_HIERARCHY);
            }
        }

        categoryMapper.updateCategoryFromRequest(request, category);
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }
        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }

    @Override
    public void delete(Long id) {
        categoryRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        categoryRepository.deleteById(id);
    }

    @Override
    public List<CategoryResponse> getChildrenCategories(Long parentId) {
        if (!categoryRepository.existsById(parentId)) {
            throw new AppException(ErrorCode.PARENT_CATEGORY_NOT_FOUND);
        }

        List<Category> childs = categoryRepository.findByParentIdAndIsActiveTrue(parentId);

        return categoryMapper.toCategoriesResponse(childs);
    }
}
