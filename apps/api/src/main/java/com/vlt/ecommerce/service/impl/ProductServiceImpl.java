package com.vlt.ecommerce.service.impl;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
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
import com.vlt.ecommerce.service.dto.request.ProductReviewSearchRequest;
import com.vlt.ecommerce.service.dto.request.ProductSearchRequest;
import com.vlt.ecommerce.service.dto.response.ProductImageResponse;
import com.vlt.ecommerce.service.dto.response.ProductResponse;
import com.vlt.ecommerce.service.mapper.ProductDetailMapper;
import com.vlt.ecommerce.service.mapper.ProductImageMapper;
import com.vlt.ecommerce.service.mapper.ProductMapper;
import com.vlt.ecommerce.repository.CategoryRepository;
import com.vlt.ecommerce.repository.ProductImageRepository;
import com.vlt.ecommerce.repository.ProductFilter;
import com.vlt.ecommerce.repository.ProductFilter.ProductFilterBuilder;
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
    ProductDetailMapper productDetailMapper;
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
    public ProductResponse create(ProductRequest request) {
        Long sellerId = currentUserProvider.getUserId();

        Shop shop = shopRepository.findBySellerId(sellerId)
                .orElseThrow(() -> new AppException(ErrorCode.SHOP_NOT_FOUND));

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
    public ProductResponse update(ProductRequest request, Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        productMapper.updateProduct(request, product);
        return productMapper.toProductResponse(productRepository.save(product));
    }

    @Override
    public void delete(Long id) {
        productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        productRepository.deleteById(id);
    }

    @Override
    @Transactional
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

        List<SpecificProduct> variants = specificProductRepository.findByProductIdAndIsActiveTrue(id);
        return productDetailMapper.toProductDetailResponse(product, variants);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getAllProducts(ProductSearchRequest request) {
        ProductFilter filter = productFilterBuilder(request)
                .shopId(request.shopId())
                .status("ACTIVE")
                .build();

        if ("random".equalsIgnoreCase(request.sortBy())) {
            Pageable pageable = PageRequest.of(request.page() - 1, request.size());
            PageResponse<ProductResponse> response = searchProducts(filter, pageable);
            Collections.shuffle(response.getData());
            return response;
        }

        return searchProducts(filter, toPageable(request));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getProductReviews(Long productId, ProductReviewSearchRequest request) {
        Pageable pageable = PageRequest.of(request.page() - 1, request.size(), Sort.by("createdAt").descending());

        Page<Review> reviewPage = reviewRepository.findByProductIdWithBuyer(productId, request.rating(), pageable);

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
    public PageResponse<ProductResponse> getMyProducts(ProductSearchRequest request) {
        Long sellerId = currentUserProvider.getUserId();
        Shop shop = shopRepository.findBySellerId(sellerId)
                .orElseThrow(() -> new AppException(ErrorCode.SHOP_NOT_FOUND));

        String status = StringUtils.hasText(request.status()) ? request.status() : "ALL";
        ProductFilter filter = productFilterBuilder(request)
                .shopId(shop.getId())
                .status(status)
                .build();
        return searchProducts(filter, toPageable(request));
    }

    private ProductFilterBuilder productFilterBuilder(ProductSearchRequest request) {
        return ProductFilter.builder()
                .categoryId(request.categoryId())
                .keyword(request.keyword())
                .minPrice(request.minPrice())
                .maxPrice(request.maxPrice())
                .minRating(request.minRating());
    }

    private Pageable toPageable(ProductSearchRequest request) {
        Sort.Direction direction = "asc".equalsIgnoreCase(request.order())
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, request.sortBy());
        return PageRequest.of(request.page() - 1, request.size(), sort);
    }

    private PageResponse<ProductResponse> searchProducts(ProductFilter filter, Pageable pageable) {
        Page<Product> productPage = productRepository.filterProducts(filter, pageable);
        List<ProductResponse> content = productMapper.toProductResponseList(productPage.getContent());
        return PageResponse.of(productPage, content);
    }
}
