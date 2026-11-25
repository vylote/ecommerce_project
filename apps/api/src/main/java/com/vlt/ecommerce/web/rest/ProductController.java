package com.vlt.ecommerce.web.rest;

import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.vlt.ecommerce.service.dto.response.ApiResponse;
import com.vlt.ecommerce.service.dto.response.PageResponse;
import com.vlt.ecommerce.service.dto.request.ProductRequest;
import com.vlt.ecommerce.service.dto.request.ProductReviewSearchRequest;
import com.vlt.ecommerce.service.dto.request.ProductSearchRequest;
import com.vlt.ecommerce.service.dto.response.ProductImageResponse;
import com.vlt.ecommerce.service.dto.response.ProductResponse;
import com.vlt.ecommerce.service.ProductService;
import com.vlt.ecommerce.service.dto.response.ReviewResponse;

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
    @PreAuthorize("hasAuthority('PRODUCT_CREATE')")
    public ApiResponse<ProductResponse> create(@RequestBody @Valid ProductRequest request) {
        return ApiResponse.<ProductResponse>builder()
            .result(productService.create(request))
            .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_UPDATE') and @productSecurity.isOwner(#id)")
    public ApiResponse<ProductResponse> update(@RequestBody @Valid ProductRequest request, @PathVariable Long id) {
        return ApiResponse.<ProductResponse>builder()
            .result(productService.update(request, id))
            .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_DELETE') and @productSecurity.isOwner(#id)")
    public ApiResponse<String> delete(@PathVariable Long id) {
        productService.delete(id);
        return ApiResponse.<String>builder()
            .result("Xoa thanh cong")
            .build();
    } 

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('PRODUCT_IMAGE_UPLOAD') and @productSecurity.isOwner(#id)")
    public ApiResponse<ProductImageResponse> addImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") Boolean isPrimary,
            @RequestParam(defaultValue = "0") Integer sortOrder) {
        return ApiResponse.<ProductImageResponse>builder()
            .result(productService.addProductImage(file, id, isPrimary, sortOrder))
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
            @ModelAttribute ProductSearchRequest request) {

        return ApiResponse.<PageResponse<ProductResponse>>builder()
                .result(productService.getAllProducts(request))
                .build();
    }

    @GetMapping("/{id}/reviews")
    public ApiResponse<PageResponse<ReviewResponse>> getProductReviews(
            @PathVariable Long id,
            @ModelAttribute ProductReviewSearchRequest request) {

        return ApiResponse.<PageResponse<ReviewResponse>>builder()
                .result(productService.getProductReviews(id, request))
                .build();
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAuthority('PRODUCT_SHOP_LIST')")
    public ApiResponse<PageResponse<ProductResponse>> getMyProducts(
            @ModelAttribute ProductSearchRequest request) {

        return ApiResponse.<PageResponse<ProductResponse>>builder()
                .result(productService.getMyProducts(request))
                .build();
    }
}
