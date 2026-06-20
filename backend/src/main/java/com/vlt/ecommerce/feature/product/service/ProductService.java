package com.vlt.ecommerce.feature.product.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.common.dto.PageResponse;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.product.ProductImage;
import com.vlt.ecommerce.feature.product.dto.request.ProductImageRequest;
import com.vlt.ecommerce.feature.product.dto.request.ProductRequest;
import com.vlt.ecommerce.feature.product.dto.response.ProductImageResponse;
import com.vlt.ecommerce.feature.product.dto.response.ProductResponse;
import com.vlt.ecommerce.feature.product.mapper.ProductImageMapper;
import com.vlt.ecommerce.feature.product.mapper.ProductMapper;
import com.vlt.ecommerce.feature.product.repository.ProductImageRepository;
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
    ProductImageMapper productImageMapper;
    ShopRepository shopRepository;
    ProductImageRepository productImageRepository;

    @PreAuthorize("hasRole('SELLER')")
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
    @Transactional
    @PreAuthorize("hasRole('SELLER') and @productSecurity.isOwner(#productId)")
    public ProductImageResponse addProductImage(ProductImageRequest request, Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        ProductImage productImage = productImageMapper.toProductImage(request);
        productImage.setProduct(product);
        return productImageMapper.toProductImageResponse(productImageRepository.save(productImage));
    }

    public ProductResponse getDetailProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        return productMapper.toProductResponse(product);
    }

    //lay danh sach san pham phan trang + filter
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getAllProducts(
            Long categoryId, Long shopId, String keyword, int page, int size, String sortBy, String order) {

        Sort sort = order.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        
        // page - 1: Để Frontend được truyền page=1 cho tự nhiên
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        Page<Product> productPage = productRepository.filterProducts(categoryId, shopId, keyword, pageable);

        List<ProductResponse> content = productMapper.toProductResponseList(productPage.getContent()); //10 sản phẩm được căt

        return PageResponse.of(productPage, content);
    }
}
