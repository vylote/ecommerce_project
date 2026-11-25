package com.vlt.ecommerce.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.service.SpecificationService;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.domain.Category;
import com.vlt.ecommerce.domain.Product;
import com.vlt.ecommerce.domain.ProductSpecification;
import com.vlt.ecommerce.domain.Specification;
import com.vlt.ecommerce.domain.SpecificationType;
import com.vlt.ecommerce.service.dto.request.ProductSpecificationRequest;
import com.vlt.ecommerce.service.dto.request.SpecificationRequest;
import com.vlt.ecommerce.service.dto.request.SpecificationTypeRequest;
import com.vlt.ecommerce.service.dto.response.ProductSpecificationResponse;
import com.vlt.ecommerce.service.dto.response.SpecificationResponse;
import com.vlt.ecommerce.service.dto.response.SpecificationTypeResponse;
import com.vlt.ecommerce.repository.CategoryRepository;
import com.vlt.ecommerce.repository.ProductRepository;
import com.vlt.ecommerce.repository.ProductSpecificationRepository;
import com.vlt.ecommerce.repository.SpecificationRepository;
import com.vlt.ecommerce.repository.SpecificationTypeRepository;

import com.vlt.ecommerce.service.mapper.SpecificationMapper;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SpecificationServiceImpl implements SpecificationService {
    SpecificationTypeRepository specificationTypeRepository;
    SpecificationRepository specificationRepository;
    ProductSpecificationRepository productSpecificationRepository;
    ProductRepository productRepository;
    CategoryRepository categoryRepository;
    SpecificationMapper specificationMapper;

    @Override
    @Transactional(readOnly = true)
    public List<SpecificationTypeResponse> getAllSpecificationTypes() {
        return specificationTypeRepository.findAll().stream()
                .map(specificationMapper::toSpecificationTypeResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecificationTypeResponse> getSpecificationTypesByCategory(Long categoryId) {
        return specificationTypeRepository.findByCategoryIdOrCommon(categoryId).stream()
                .map(specificationMapper::toSpecificationTypeResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SpecificationTypeResponse getSpecificationTypeById(Long id) {
        SpecificationType type = specificationTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SPECIFICATION_TYPE_NOT_FOUND));
        return specificationMapper.toSpecificationTypeResponse(type);
    }

    @Override
    @Transactional
    public SpecificationTypeResponse createSpecificationType(SpecificationTypeRequest request) {
        if (specificationTypeRepository.existsByNameIgnoreCase(request.getName())) {
            throw new AppException(ErrorCode.SPECIFICATION_TYPE_NAME_ALREADY_EXISTS);
        }

        Set<Category> categories = new HashSet<>();
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            categories.addAll(categoryRepository.findAllById(request.getCategoryIds()));
        }

        SpecificationType type = SpecificationType.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .isVariant(Boolean.TRUE.equals(request.getIsVariant()))
                .categories(categories)
                .build();

        return specificationMapper.toSpecificationTypeResponse(specificationTypeRepository.save(type));
    }

    @Override
    @Transactional
    public SpecificationTypeResponse updateSpecificationType(Long id, SpecificationTypeRequest request) {
        SpecificationType type = specificationTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SPECIFICATION_TYPE_NOT_FOUND));

        String newName = request.getName().trim();
        if (!newName.equalsIgnoreCase(type.getName()) && specificationTypeRepository.existsByNameIgnoreCaseAndIdNot(newName, id)) {
            throw new AppException(ErrorCode.SPECIFICATION_TYPE_NAME_ALREADY_EXISTS);
        }

        type.setName(newName);
        type.setDescription(request.getDescription());
        if (request.getIsVariant() != null) {
            type.setIsVariant(request.getIsVariant());
        }

        if (request.getCategoryIds() != null) {
            Set<Category> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryIds()));
            type.setCategories(categories);
        }

        return specificationMapper.toSpecificationTypeResponse(specificationTypeRepository.save(type));
    }

    @Override
    @Transactional
    public void deleteSpecificationType(Long id) {
        if (!specificationTypeRepository.existsById(id)) {
            throw new AppException(ErrorCode.SPECIFICATION_TYPE_NOT_FOUND);
        }
        specificationTypeRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecificationResponse> getSpecificationsByType(Long typeId) {
        return specificationRepository.findBySpecificationTypeId(typeId).stream()
                .map(specificationMapper::toSpecificationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SpecificationResponse createSpecification(SpecificationRequest request) {
        if (request.getSpecificationTypeId() == null) {
            throw new AppException(ErrorCode.SPECIFICATION_TYPE_REQUIRED);
        }

        SpecificationType type = specificationTypeRepository.findById(request.getSpecificationTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.SPECIFICATION_TYPE_NOT_FOUND));

        if (specificationRepository.existsByNameIgnoreCaseAndSpecificationTypeId(request.getName(), type.getId())) {
            throw new AppException(ErrorCode.SPECIFICATION_NAME_ALREADY_EXISTS);
        }

        Specification spec = Specification.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .specificationType(type)
                .build();

        return specificationMapper.toSpecificationResponse(specificationRepository.save(spec));
    }

    @Override
    @Transactional
    public SpecificationResponse updateSpecification(Long id, SpecificationRequest request) {
        Specification spec = specificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SPECIFICATION_NOT_FOUND));

        String newName = request.getName().trim();
        Long typeId = request.getSpecificationTypeId() != null ? request.getSpecificationTypeId() : spec.getSpecificationType().getId();

        if (!newName.equalsIgnoreCase(spec.getName())
                && specificationRepository.existsByNameIgnoreCaseAndSpecificationTypeIdAndIdNot(newName, typeId, id)) {
            throw new AppException(ErrorCode.SPECIFICATION_NAME_ALREADY_EXISTS);
        }

        if (request.getSpecificationTypeId() != null && !request.getSpecificationTypeId().equals(spec.getSpecificationType().getId())) {
            SpecificationType newType = specificationTypeRepository.findById(request.getSpecificationTypeId())
                    .orElseThrow(() -> new AppException(ErrorCode.SPECIFICATION_TYPE_NOT_FOUND));
            spec.setSpecificationType(newType);
        }

        spec.setName(newName);
        spec.setDescription(request.getDescription());

        return specificationMapper.toSpecificationResponse(specificationRepository.save(spec));
    }

    @Override
    @Transactional
    public void deleteSpecification(Long id) {
        if (!specificationRepository.existsById(id)) {
            throw new AppException(ErrorCode.SPECIFICATION_NOT_FOUND);
        }
        specificationRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductSpecificationResponse> getProductSpecifications(Long productId) {
        return productSpecificationRepository.findByProductId(productId).stream()
                .map(specificationMapper::toProductSpecificationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductSpecificationResponse addProductSpecification(Long productId, ProductSpecificationRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        Specification spec = specificationRepository.findById(request.getSpecificationId())
                .orElseThrow(() -> new AppException(ErrorCode.SPECIFICATION_NOT_FOUND));

        ProductSpecification prodSpec = productSpecificationRepository
                .findByProductIdAndSpecificationId(productId, spec.getId())
                .orElse(ProductSpecification.builder()
                        .product(product)
                        .specification(spec)
                        .build());

        prodSpec.setCustomValue(request.getCustomValue());
        return specificationMapper.toProductSpecificationResponse(productSpecificationRepository.save(prodSpec));
    }

    @Override
    @Transactional
    public void removeProductSpecification(Long productId, Long specificationId) {
        productSpecificationRepository.deleteByProductIdAndSpecificationId(productId, specificationId);
    }
}
