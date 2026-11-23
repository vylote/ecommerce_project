package com.vlt.ecommerce.common.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.product.SpecificProduct;
import com.vlt.ecommerce.feature.product.repository.ProductRepository;
import com.vlt.ecommerce.feature.product.repository.SpecificProductRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Component("productSecurity") // Tên bean để gọi trong @PreAuthorize
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class ProductSecurity {
    ProductRepository productRepository;
    SpecificProductRepository specificProductRepository;

    public Boolean isOwner(Long productId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = (Long) authentication.getDetails();

        Product product = productRepository.findById(productId).orElse(null);

        // Trả về true để cho đi tiếp (Lỗi Not Found sẽ do Service lo)
        if (product == null) return true;
        return product.getShop().getSeller().getId().equals(currentUserId);
    }

    public Boolean isVariantOwner(Long variantId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = (Long) authentication.getDetails();

        SpecificProduct variant = specificProductRepository.findById(variantId).orElse(null);
        if (variant == null) return true;
        return variant.getProduct().getShop().getSeller().getId().equals(currentUserId);
    }
}
