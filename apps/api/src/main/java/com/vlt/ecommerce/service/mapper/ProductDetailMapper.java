package com.vlt.ecommerce.service.mapper;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Component;

import com.vlt.ecommerce.domain.Product;
import com.vlt.ecommerce.domain.SpecificProduct;
import com.vlt.ecommerce.service.dto.response.ProductResponse;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ProductDetailMapper {

    private final ProductMapper productMapper;
    private final SpecificProductMapper specificProductMapper;

    public ProductResponse toProductDetailResponse(Product product, List<SpecificProduct> variants) {
        ProductResponse response = productMapper.toProductResponse(product);
        response.setHasVariants(!variants.isEmpty());

        if (variants.isEmpty()) {
            response.setMinPrice(product.getPrice());
            response.setMaxPrice(product.getPrice());
            response.setVariants(List.of());
            return response;
        }

        response.setMinPrice(variants.stream()
                .map(SpecificProduct::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(product.getPrice()));
        response.setMaxPrice(variants.stream()
                .map(SpecificProduct::getPrice)
                .max(BigDecimal::compareTo)
                .orElse(product.getPrice()));
        response.setStockQuantity(variants.stream()
                .mapToInt(SpecificProduct::getStockQuantity)
                .sum());
        response.setVariants(variants.stream()
                .map(variant -> specificProductMapper.toSpecificProductResponse(variant, product))
                .toList());
        return response;
    }
}
