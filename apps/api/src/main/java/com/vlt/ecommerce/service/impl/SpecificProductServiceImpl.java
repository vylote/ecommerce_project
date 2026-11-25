package com.vlt.ecommerce.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.service.SpecificProductService;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.domain.Product;
import com.vlt.ecommerce.domain.SpecificProduct;
import com.vlt.ecommerce.service.dto.request.SpecificProductRequest;
import com.vlt.ecommerce.service.dto.response.SpecificProductResponse;
import com.vlt.ecommerce.repository.ProductRepository;
import com.vlt.ecommerce.repository.SpecificProductRepository;

import com.vlt.ecommerce.service.mapper.SpecificProductMapper;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SpecificProductServiceImpl implements SpecificProductService {
    SpecificProductRepository specificProductRepository;
    ProductRepository productRepository;
    SpecificProductMapper specificProductMapper;

    @Override
    @Transactional(readOnly = true)
    public List<SpecificProductResponse> getVariantsByProductId(Long productId, boolean onlyActive) {
        List<SpecificProduct> variants = onlyActive
                ? specificProductRepository.findByProductIdAndIsActiveTrue(productId)
                : specificProductRepository.findByProductId(productId);

        return variants.stream()
                .map(specificProductMapper::toSpecificProductResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SpecificProductResponse getVariantById(Long variantId) {
        SpecificProduct variant = specificProductRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        return specificProductMapper.toSpecificProductResponse(variant);
    }

    @Override
    @Transactional
    public SpecificProductResponse createVariant(Long productId, SpecificProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        String sku = request.getSku();
        if (sku == null || sku.trim().isEmpty()) {
            sku = "SKU-" + productId + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } else {
            sku = sku.trim();
        }

        if (specificProductRepository.existsBySku(sku)) {
            throw new AppException(ErrorCode.VARIANT_SKU_ALREADY_EXISTS);
        }

        SpecificProduct variant = SpecificProduct.builder()
                .product(product)
                .name(request.getName().trim())
                .sku(sku)
                .price(request.getPrice())
                .stockQuantity(0)
                .imageUrl(request.getImageUrl())
                .isActive(request.getIsActive() == null || request.getIsActive())
                .build();

        return specificProductMapper.toSpecificProductResponse(specificProductRepository.save(variant));
    }

    @Override
    @Transactional
    public SpecificProductResponse updateVariant(Long variantId, SpecificProductRequest request) {
        SpecificProduct variant = specificProductRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        String newSku = request.getSku() != null ? request.getSku().trim() : variant.getSku();
        if (!newSku.equalsIgnoreCase(variant.getSku()) && specificProductRepository.existsBySkuAndIdNot(newSku, variantId)) {
            throw new AppException(ErrorCode.VARIANT_SKU_ALREADY_EXISTS);
        }

        variant.setName(request.getName().trim());
        variant.setSku(newSku);
        variant.setPrice(request.getPrice());
        variant.setImageUrl(request.getImageUrl());
        if (request.getIsActive() != null) {
            variant.setIsActive(request.getIsActive());
        }

        return specificProductMapper.toSpecificProductResponse(specificProductRepository.save(variant));
    }

    @Override
    @Transactional
    public void deleteVariant(Long variantId) {
        SpecificProduct variant = specificProductRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        if (variant.getOrderItems() != null && !variant.getOrderItems().isEmpty()) {
            variant.setIsActive(false);
            specificProductRepository.save(variant);
            log.info("Soft-deleting variant #{} because it has order items", variantId);
        } else {
            specificProductRepository.delete(variant);
        }
    }
}
