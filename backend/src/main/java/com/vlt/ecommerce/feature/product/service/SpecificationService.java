package com.vlt.ecommerce.feature.product.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.product.ProductSpecification;
import com.vlt.ecommerce.feature.product.Specification;
import com.vlt.ecommerce.feature.product.SpecificationType;
import com.vlt.ecommerce.feature.product.dto.request.ProductSpecificationRequest;
import com.vlt.ecommerce.feature.product.dto.request.SpecificationRequest;
import com.vlt.ecommerce.feature.product.dto.request.SpecificationTypeRequest;
import com.vlt.ecommerce.feature.product.dto.response.ProductSpecificationResponse;
import com.vlt.ecommerce.feature.product.dto.response.SpecificationResponse;
import com.vlt.ecommerce.feature.product.dto.response.SpecificationTypeResponse;
import com.vlt.ecommerce.feature.product.repository.ProductRepository;
import com.vlt.ecommerce.feature.product.repository.ProductSpecificationRepository;
import com.vlt.ecommerce.feature.product.repository.SpecificationRepository;
import com.vlt.ecommerce.feature.product.repository.SpecificationTypeRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SpecificationService {
    SpecificationTypeRepository specificationTypeRepository;
    SpecificationRepository specificationRepository;
    ProductSpecificationRepository productSpecificationRepository;
    ProductRepository productRepository;

    // ================= 1. QUẢN LÝ LOẠI ĐẶC TẢ (SpecificationType) =================
    @Transactional(readOnly = true)
    public List<SpecificationTypeResponse> getAllSpecificationTypes() {
        return specificationTypeRepository.findAll().stream()
                .map(this::toSpecificationTypeResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public SpecificationTypeResponse createSpecificationType(SpecificationTypeRequest request) {
        if (specificationTypeRepository.existsByNameIgnoreCase(request.getName())) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED);
        }

        SpecificationType type = SpecificationType.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .build();

        return toSpecificationTypeResponse(specificationTypeRepository.save(type));
    }

    // ================= 2. QUẢN LÝ GIÁ TRỊ ĐẶC TẢ (Specification) =================
    @Transactional(readOnly = true)
    public List<SpecificationResponse> getSpecificationsByType(Long typeId) {
        return specificationRepository.findBySpecificationTypeId(typeId).stream()
                .map(this::toSpecificationResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public SpecificationResponse createSpecification(SpecificationRequest request) {
        if (request.getSpecificationTypeId() == null) {
            throw new AppException(ErrorCode.INVALID_DATA);
        }

        SpecificationType type = specificationTypeRepository.findById(request.getSpecificationTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (specificationRepository.existsByNameIgnoreCaseAndSpecificationTypeId(request.getName(), type.getId())) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED);
        }

        Specification spec = Specification.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .specificationType(type)
                .build();

        return toSpecificationResponse(specificationRepository.save(spec));
    }

    // ================= 3. GẮN ĐẶC TẢ VÀO SẢN PHẨM (ProductSpecification) =================
    @Transactional(readOnly = true)
    public List<ProductSpecificationResponse> getProductSpecifications(Long productId) {
        return productSpecificationRepository.findByProductId(productId).stream()
                .map(this::toProductSpecificationResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @PreAuthorize("hasRole('SELLER') and @productSecurity.isOwner(#productId)")
    public ProductSpecificationResponse addProductSpecification(Long productId, ProductSpecificationRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Specification spec = specificationRepository.findById(request.getSpecificationId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        ProductSpecification prodSpec = productSpecificationRepository
                .findByProductIdAndSpecificationId(productId, spec.getId())
                .orElse(ProductSpecification.builder()
                        .product(product)
                        .specification(spec)
                        .build());

        prodSpec.setCustomValue(request.getCustomValue());
        return toProductSpecificationResponse(productSpecificationRepository.save(prodSpec));
    }

    @Transactional
    @PreAuthorize("hasRole('SELLER') and @productSecurity.isOwner(#productId)")
    public void removeProductSpecification(Long productId, Long specificationId) {
        productSpecificationRepository.deleteByProductIdAndSpecificationId(productId, specificationId);
    }

    // ================= HELPER MAPPERS =================
    private SpecificationTypeResponse toSpecificationTypeResponse(SpecificationType type) {
        List<SpecificationResponse> specs = type.getSpecifications() != null
                ? type.getSpecifications().stream().map(this::toSpecificationResponse).collect(Collectors.toList())
                : List.of();

        return SpecificationTypeResponse.builder()
                .id(type.getId())
                .name(type.getName())
                .description(type.getDescription())
                .createdAt(type.getCreatedAt())
                .specifications(specs)
                .build();
    }

    private SpecificationResponse toSpecificationResponse(Specification spec) {
        return SpecificationResponse.builder()
                .id(spec.getId())
                .name(spec.getName())
                .description(spec.getDescription())
                .specificationTypeId(spec.getSpecificationType() != null ? spec.getSpecificationType().getId() : null)
                .specificationTypeName(spec.getSpecificationType() != null ? spec.getSpecificationType().getName() : null)
                .build();
    }

    private ProductSpecificationResponse toProductSpecificationResponse(ProductSpecification ps) {
        return ProductSpecificationResponse.builder()
                .id(ps.getId())
                .productId(ps.getProduct().getId())
                .specificationId(ps.getSpecification().getId())
                .specificationName(ps.getSpecification().getName())
                .specificationTypeId(ps.getSpecification().getSpecificationType() != null ? ps.getSpecification().getSpecificationType().getId() : null)
                .specificationTypeName(ps.getSpecification().getSpecificationType() != null ? ps.getSpecification().getSpecificationType().getName() : null)
                .customValue(ps.getCustomValue())
                .build();
    }
}
