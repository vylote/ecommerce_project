package com.vlt.ecommerce.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.vlt.ecommerce.domain.Product;
import com.vlt.ecommerce.domain.SpecificProduct;
import com.vlt.ecommerce.repository.ProductRepository;
import com.vlt.ecommerce.repository.SpecificProductRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Component("productSecurity")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class ProductSecurity {
    ProductRepository productRepository;
    SpecificProductRepository specificProductRepository;

    public Boolean isOwner(Long productId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = (Long) authentication.getDetails();

        Product product = productRepository.findById(productId).orElse(null);

        if (product == null) return true;
        return product.getShop().getSeller().getId().equals(currentUserId);
    }

    public Boolean isVariantOwner(Long variantId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = (Long) authentication.getDetails();

        SpecificProduct variant = specificProductRepository.findById(variantId).orElse(null);
        if (variant == null) return true;
        return variant.getProduct().getShop().getSeller().getId().equals(currentUserId);
    }
}
