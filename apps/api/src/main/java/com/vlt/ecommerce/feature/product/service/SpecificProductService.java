package com.vlt.ecommerce.feature.product.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.product.SpecificProduct;
import com.vlt.ecommerce.feature.product.dto.request.SpecificProductRequest;
import com.vlt.ecommerce.feature.product.dto.response.SpecificProductResponse;
import com.vlt.ecommerce.feature.product.repository.ProductRepository;
import com.vlt.ecommerce.feature.product.repository.SpecificProductRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SpecificProductService {
    SpecificProductRepository specificProductRepository;
    ProductRepository productRepository;

    // ================= 1. TRUY VẤN BIẾN THỂ =================
    @Transactional(readOnly = true)
    public List<SpecificProductResponse> getVariantsByProductId(Long productId, boolean onlyActive) {
        List<SpecificProduct> variants = onlyActive
                ? specificProductRepository.findByProductIdAndIsActiveTrue(productId)
                : specificProductRepository.findByProductId(productId);

        return variants.stream()
                .map(this::toSpecificProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SpecificProductResponse getVariantById(Long variantId) {
        SpecificProduct variant = specificProductRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        return toSpecificProductResponse(variant);
    }

    // ================= 2. TẠO BIẾN THỂ MỚI =================
    @Transactional
    @PreAuthorize("hasRole('SELLER') and @productSecurity.isOwner(#productId)")
    public SpecificProductResponse createVariant(Long productId, SpecificProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        // Tự động sinh mã SKU nếu người bán không nhập
        String sku = request.getSku();
        if (sku == null || sku.trim().isEmpty()) {
            sku = "SKU-" + productId + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } else {
            sku = sku.trim();
        }

        if (specificProductRepository.existsBySku(sku)) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED);
        }

        SpecificProduct variant = SpecificProduct.builder()
                .product(product)
                .name(request.getName().trim())
                .sku(sku)
                .price(request.getPrice())
                .stockQuantity(0) // Mặc định tồn kho = 0 (bắt buộc qua Phiếu nhập kho mới có hàng)
                .imageUrl(request.getImageUrl())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return toSpecificProductResponse(specificProductRepository.save(variant));
    }

    // ================= 3. CẬP NHẬT BIẾN THỂ =================
    @Transactional
    @PreAuthorize("hasRole('SELLER') and @productSecurity.isVariantOwner(#variantId)")
    public SpecificProductResponse updateVariant(Long variantId, SpecificProductRequest request) {
        SpecificProduct variant = specificProductRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        String newSku = request.getSku() != null ? request.getSku().trim() : variant.getSku();
        if (!newSku.equalsIgnoreCase(variant.getSku()) && specificProductRepository.existsBySkuAndIdNot(newSku, variantId)) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED);
        }

        variant.setName(request.getName().trim());
        variant.setSku(newSku);
        variant.setPrice(request.getPrice());
        variant.setImageUrl(request.getImageUrl());
        if (request.getIsActive() != null) {
            variant.setIsActive(request.getIsActive());
        }

        return toSpecificProductResponse(specificProductRepository.save(variant));
    }

    // ================= 4. XÓA BIẾN THỂ =================
    @Transactional
    @PreAuthorize("hasRole('SELLER') and @productSecurity.isVariantOwner(#variantId)")
    public void deleteVariant(Long variantId) {
        SpecificProduct variant = specificProductRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        // Nếu biến thể đã có đơn hàng thì chuyển sang inactive thay vì xóa cứng
        if (variant.getOrderItems() != null && !variant.getOrderItems().isEmpty()) {
            variant.setIsActive(false);
            specificProductRepository.save(variant);
            log.info("Soft-deleting variant #{} because it has order items", variantId);
        } else {
            specificProductRepository.delete(variant);
        }
    }

    // ================= HELPER MAPPER =================
    private SpecificProductResponse toSpecificProductResponse(SpecificProduct v) {
        return SpecificProductResponse.builder()
                .id(v.getId())
                .productId(v.getProduct().getId())
                .productName(v.getProduct().getName())
                .name(v.getName())
                .sku(v.getSku())
                .price(v.getPrice())
                .stockQuantity(v.getStockQuantity())
                .imageUrl(v.getImageUrl())
                .isActive(v.getIsActive())
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }
}
