package com.vlt.ecommerce.service.impl;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.vlt.ecommerce.service.ProductService;
import com.vlt.ecommerce.service.dto.response.PageResponse;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.integration.cloudinary.ImageStorageService;
import com.vlt.ecommerce.domain.Category;
import com.vlt.ecommerce.domain.Product;
import com.vlt.ecommerce.domain.ProductImage;
import com.vlt.ecommerce.domain.SpecificProduct;
import com.vlt.ecommerce.service.dto.request.ProductRequest;
import com.vlt.ecommerce.service.dto.response.ProductImageResponse;
import com.vlt.ecommerce.service.dto.response.ProductResponse;
import com.vlt.ecommerce.service.dto.response.SpecificProductResponse;
import com.vlt.ecommerce.service.mapper.ProductImageMapper;
import com.vlt.ecommerce.service.mapper.ProductMapper;
import com.vlt.ecommerce.repository.CategoryRepository;
import com.vlt.ecommerce.repository.ProductImageRepository;
import com.vlt.ecommerce.repository.ProductRepository;
import com.vlt.ecommerce.repository.SpecificProductRepository;
import com.vlt.ecommerce.domain.Review;
import com.vlt.ecommerce.service.mapper.ReviewMapper;
import com.vlt.ecommerce.repository.ReviewRepository;
import com.vlt.ecommerce.service.dto.response.ReviewResponse;
import com.vlt.ecommerce.domain.Shop;
import com.vlt.ecommerce.service.ShopService;
import com.vlt.ecommerce.repository.ShopRepository;

import com.vlt.ecommerce.security.CurrentUserProvider;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    CurrentUserProvider currentUserProvider;
    ProductRepository productRepository;
    ProductMapper productMapper;
    ProductImageMapper productImageMapper;
    ShopRepository shopRepository;
    ProductImageRepository productImageRepository;
    ReviewRepository reviewRepository;
    ReviewMapper reviewMapper;
    CategoryRepository categoryRepository;
    SpecificProductRepository specificProductRepository;

    ImageStorageService imageStorageService;
    ShopService shopService;

    @Override
    @PreAuthorize("hasRole('SELLER')")
    public ProductResponse create(ProductRequest request) {
        Long sellerId = currentUserProvider.getUserId();

        Shop shop = shopRepository.findBySellerId(sellerId);
        if (shop == null)
            throw new AppException(ErrorCode.SHOP_NOT_FOUND);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        Product newProduct = productMapper.toProduct(request);
        newProduct.setShop(shop);
        newProduct.setCategory(category);

        if (request.getStatus() != null) {
            newProduct.setStatus(request.getStatus());
        }

        return productMapper.toProductResponse(productRepository.save(newProduct));
    }

    @Override
    @PreAuthorize("hasRole('SELLER') and @productSecurity.isOwner(#id)")
    public ProductResponse update(ProductRequest request, Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        productMapper.updateProduct(request, product);
        return productMapper.toProductResponse(productRepository.save(product));
    }

    @Override
    @PreAuthorize("hasRole('SELLER') and @productSecurity.isOwner(#id)")
    public void delete(Long id) {
        productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        productRepository.deleteById(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('SELLER') and @productSecurity.isOwner(#productId)")
    public ProductImageResponse addProductImage(MultipartFile file, Long productId, Boolean isPrimary,
            Integer sortOrder) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.UPLOAD_FILE_REQUIRED);
        }

        try {
            String imageUrl = imageStorageService.uploadFile(file, "ecommerce/products");

            ProductImage productImage = new ProductImage();
            productImage.setProduct(product);
            productImage.setUrl(imageUrl);
            productImage.setIsPrimary(isPrimary);
            productImage.setSortOrder(sortOrder);

            return productImageMapper.toProductImageResponse(productImageRepository.save(productImage));
        } catch (IOException e) {
            throw new AppException(ErrorCode.IMAGE_UPLOAD_FAILED);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getDetailProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        ProductResponse response = productMapper.toProductResponse(product);
        List<SpecificProduct> variants = specificProductRepository.findByProductIdAndIsActiveTrue(id);
        if (variants != null && !variants.isEmpty()) {
            response.setHasVariants(true);
            BigDecimal minP = variants.stream().map(SpecificProduct::getPrice).min(BigDecimal::compareTo).orElse(product.getPrice());
            BigDecimal maxP = variants.stream().map(SpecificProduct::getPrice).max(BigDecimal::compareTo).orElse(product.getPrice());
            int totalStock = variants.stream().mapToInt(SpecificProduct::getStockQuantity).sum();
            response.setMinPrice(minP);
            response.setMaxPrice(maxP);
            response.setStockQuantity(totalStock);
            response.setVariants(variants.stream().map(v -> SpecificProductResponse.builder()
                    .id(v.getId())
                    .productId(product.getId())
                    .productName(product.getName())
                    .name(v.getName())
                    .sku(v.getSku())
                    .price(v.getPrice())
                    .stockQuantity(v.getStockQuantity())
                    .imageUrl(v.getImageUrl())
                    .isActive(v.getIsActive())
                    .createdAt(v.getCreatedAt())
                    .updatedAt(v.getUpdatedAt())
                    .build()).toList());
        } else {
            response.setHasVariants(false);
            response.setMinPrice(product.getPrice());
            response.setMaxPrice(product.getPrice());
            response.setVariants(Collections.emptyList());
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getAllProducts(
            Long categoryId, Long shopId, String keyword, BigDecimal minPrice, BigDecimal maxPrice, Double minRating,
            int page, int size, String sortBy, String order) {

        Sort sort = Sort.unsorted();
        if (!sortBy.equalsIgnoreCase("random")) {
            sort = order.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        }

        Pageable pageable = PageRequest.of(page - 1, size, sort);

        Page<Product> productPage = productRepository.filterProducts(
                categoryId, shopId, keyword, minPrice, maxPrice, minRating, "ACTIVE", pageable);

        List<ProductResponse> content = productMapper.toProductResponseList(productPage.getContent());

        if (sortBy.equalsIgnoreCase("random")) {
            Collections.shuffle(content);
        }

        return PageResponse.of(productPage, content);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getProductReviews(Long productId, Integer rating, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());

        Page<Review> reviewPage = reviewRepository.findByProductIdWithBuyer(productId, rating, pageable);

        List<ReviewResponse> content = reviewMapper.toReviewResponses(reviewPage.getContent());

        return PageResponse.of(reviewPage, content);
    }

    @Override
    @Transactional
    public void updateProductRatingStats(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        Object result = reviewRepository.getRatingStatsByProductId(productId);
        Object[] stats = (Object[]) result;

        Long count = (Long) stats[0];
        Double average = (Double) stats[1];

        product.setReviewCount(count.intValue());
        product.setAverageRating(average);
        shopService.updateShopRating(product.getShop().getId());
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('SELLER')")
    public PageResponse<ProductResponse> getMyProducts(
            Long categoryId, String keyword, BigDecimal minPrice, BigDecimal maxPrice, Double minRating,
            String statusFilter,
            int page, int size, String sortBy, String order) {

        Long sellerId = currentUserProvider.getUserId();

        Shop shop = shopRepository.findBySellerId(sellerId);
        if (shop == null) {
            throw new AppException(ErrorCode.SHOP_NOT_FOUND);
        }

        Sort sort = order.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        String finalStatus = (statusFilter == null || statusFilter.isBlank()) ? "ALL" : statusFilter;

        Page<Product> productPage = productRepository.filterProducts(
                categoryId, shop.getId(), keyword, minPrice, maxPrice, minRating, finalStatus, pageable);

        List<ProductResponse> content = productMapper.toProductResponseList(productPage.getContent());

        return PageResponse.of(productPage, content);
    }
}
