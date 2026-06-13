package com.vlt.ecommerce.common.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.product.repository.ProductRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Component("productSecurity") // Tên bean để gọi trong @PreAuthorize
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class ProductSecurity {
    ProductRepository productRepository;

    public Boolean isOwner(Long productId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long currentUserId = ((Number) jwt.getClaim("userId")).longValue();

        Product product = productRepository.findById(productId).orElse(null);

        // Trả về true để cho đi tiếp (Lỗi Not Found sẽ do Service lo)
        if (product == null) return true;
        return product.getShop().getSeller().getId().equals(currentUserId);
    }
}
