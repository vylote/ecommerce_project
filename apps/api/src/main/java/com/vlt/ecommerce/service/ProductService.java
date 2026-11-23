package com.vlt.ecommerce.service;

import java.math.BigDecimal;

import org.springframework.web.multipart.MultipartFile;

import com.vlt.ecommerce.service.dto.response.PageResponse;
import com.vlt.ecommerce.service.dto.request.ProductRequest;
import com.vlt.ecommerce.service.dto.response.ProductImageResponse;
import com.vlt.ecommerce.service.dto.response.ProductResponse;
import com.vlt.ecommerce.service.dto.response.ReviewResponse;

public interface ProductService {

    ProductResponse create(ProductRequest request);

    ProductResponse update(ProductRequest request, Long id);

    void delete(Long id);

    ProductImageResponse addProductImage(MultipartFile file, Long productId, Boolean isPrimary,
            Integer sortOrder);

    ProductResponse getDetailProduct(Long id);

    PageResponse<ProductResponse> getAllProducts(
            Long categoryId, Long shopId, String keyword, BigDecimal minPrice, BigDecimal maxPrice, Double minRating,
            int page, int size, String sortBy, String order);

    PageResponse<ReviewResponse> getProductReviews(Long productId, Integer rating, int page, int size);

    PageResponse<ProductResponse> getMyProducts(
            Long categoryId, String keyword, BigDecimal minPrice, BigDecimal maxPrice, Double minRating,
            String statusFilter,
            int page, int size, String sortBy, String order);

    void updateProductRatingStats(Long productId);
}
