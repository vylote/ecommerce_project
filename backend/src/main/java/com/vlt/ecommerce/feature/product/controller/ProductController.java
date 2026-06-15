package com.vlt.ecommerce.feature.product.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.common.dto.PageResponse;
import com.vlt.ecommerce.feature.product.dto.request.ProductImageRequest;
import com.vlt.ecommerce.feature.product.dto.request.ProductRequest;
import com.vlt.ecommerce.feature.product.dto.response.ProductImageResponse;
import com.vlt.ecommerce.feature.product.dto.response.ProductResponse;
import com.vlt.ecommerce.feature.product.service.ProductService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/products")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class ProductController {
    ProductService productService;

    @PostMapping
    public ApiResponse<ProductResponse> create(@RequestBody @Valid ProductRequest request) {
        return ApiResponse.<ProductResponse>builder()
            .result(productService.create(request))
            .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> update(@RequestBody @Valid ProductRequest request, @PathVariable Long id) {
        return ApiResponse.<ProductResponse>builder()
            .result(productService.update(request, id))
            .build();
    }

    @PostMapping("/{id}/images")
    public ApiResponse<ProductImageResponse> addImage(@RequestBody @Valid ProductImageRequest request, @PathVariable Long id) {
        return ApiResponse.<ProductImageResponse>builder()
            .result(productService.addProductImage(request, id))
            .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getDetailProduct(@PathVariable Long id) {
        return ApiResponse.<ProductResponse>builder()
            .result(productService.getDetailProduct(id))
            .build();
    }

    @GetMapping
    public ApiResponse<PageResponse<ProductResponse>> getAllProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long shopId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {

        return ApiResponse.<PageResponse<ProductResponse>>builder()
                .result(productService.getAllProducts(categoryId, shopId, keyword, page, size, sortBy, order))
                .build();
    }
}
/* ==============================================================================
     * CHUẨN MỰC THIẾT KẾ RESTFUL API: @RequestParam vs @PathVariable
     * ==============================================================================
     * 1. @PathVariable: Dùng để CHỈ ĐÍCH DANH 1 thực thể. Nằm TRƯỚC dấu '?' trên URL.
     * VD: GET /products/15 (Lấy chi tiết SP số 15). Bắt buộc phải có.
     * * 2. @RequestParam: Dùng để LỌC (Filter) một DANH SÁCH. Nằm SAU dấu '?' trên URL.
     * VD: GET /products?keyword=iphone&page=2
     * - Không bắt buộc (required = false). 
     * - Nếu User gọi trần trụi (GET /products), Spring sẽ tự động lấy các giá trị 
     * 'defaultValue' bù vào -> Không bao giờ lo sập API vì thiếu tham số.
     * ============================================================================== */