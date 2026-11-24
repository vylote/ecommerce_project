package com.vlt.ecommerce.service.mapper;

import org.mapstruct.Mapper;

import com.vlt.ecommerce.domain.Product;
import com.vlt.ecommerce.domain.SpecificProduct;
import com.vlt.ecommerce.service.dto.response.SpecificProductResponse;

@Mapper(componentModel = "spring")
public interface SpecificProductMapper {
    default SpecificProductResponse toSpecificProductResponse(SpecificProduct variant) {
        return toSpecificProductResponse(variant, variant.getProduct());
    }

    default SpecificProductResponse toSpecificProductResponse(SpecificProduct variant, Product product) {
        return SpecificProductResponse.builder()
                .id(variant.getId())
                .productId(product.getId())
                .productName(product.getName())
                .name(variant.getName())
                .sku(variant.getSku())
                .price(variant.getPrice())
                .stockQuantity(variant.getStockQuantity())
                .imageUrl(variant.getImageUrl())
                .isActive(variant.getIsActive())
                .createdAt(variant.getCreatedAt())
                .updatedAt(variant.getUpdatedAt())
                .build();
    }
}
