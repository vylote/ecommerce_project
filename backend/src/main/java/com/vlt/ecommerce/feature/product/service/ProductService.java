package com.vlt.ecommerce.feature.product.service;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.product.dto.request.ProductRequest;
import com.vlt.ecommerce.feature.product.dto.response.ProductResponse;
import com.vlt.ecommerce.feature.product.mapper.ProductMapper;
import com.vlt.ecommerce.feature.product.repository.ProductRepository;
import com.vlt.ecommerce.feature.shop.Shop;
import com.vlt.ecommerce.feature.shop.repository.ShopRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ProductService {
    ProductRepository productRepository;
    ProductMapper productMapper;
    ShopRepository shopRepository;

    public ProductResponse create(ProductRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long sellerId = ((Number) jwt.getClaim("userId")).longValue();

        Shop shop = shopRepository.findBySellerId(sellerId);
        if (shop == null) 
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        Product newProduct = productMapper.toProduct(request);
        newProduct.setShop(shop);
        return productMapper.toProductResponse(productRepository.save(newProduct));
    }

    @PreAuthorize("hasRole('SELLER') and @productSecurity.isOwner(#id)")
    public ProductResponse update(ProductRequest request, Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        productMapper.updateProduct(request, product);
        return productMapper.toProductResponse(productRepository.save(product));         
    }

    @PreAuthorize("hasRole('SELLER') and @productSecurity.isOwner(#id)")
    public void delete(Long id) {
        productRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        productRepository.deleteById(id);
    }

    //upload anh san pham
}
