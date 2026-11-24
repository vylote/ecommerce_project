package com.vlt.ecommerce.service;

import org.springframework.web.multipart.MultipartFile;

import com.vlt.ecommerce.service.dto.response.PageResponse;
import com.vlt.ecommerce.service.dto.request.ProductRequest;
import com.vlt.ecommerce.service.dto.request.ProductReviewSearchRequest;
import com.vlt.ecommerce.service.dto.request.ProductSearchRequest;
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

    PageResponse<ProductResponse> getAllProducts(ProductSearchRequest request);

    PageResponse<ReviewResponse> getProductReviews(Long productId, ProductReviewSearchRequest request);

    PageResponse<ProductResponse> getMyProducts(ProductSearchRequest request);

    void updateProductRatingStats(Long productId);
}
