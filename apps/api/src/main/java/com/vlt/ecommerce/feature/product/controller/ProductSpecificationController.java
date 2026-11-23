package com.vlt.ecommerce.feature.product.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.feature.product.dto.request.ProductSpecificationRequest;
import com.vlt.ecommerce.feature.product.dto.response.ProductSpecificationResponse;
import com.vlt.ecommerce.feature.product.service.SpecificationService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/products/{productId}/specifications")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class ProductSpecificationController {
    SpecificationService specificationService;

    @GetMapping
    public ApiResponse<List<ProductSpecificationResponse>> getProductSpecifications(
            @PathVariable Long productId) {
        return ApiResponse.<List<ProductSpecificationResponse>>builder()
                .result(specificationService.getProductSpecifications(productId))
                .build();
    }

    @PostMapping
    public ApiResponse<ProductSpecificationResponse> addProductSpecification(
            @PathVariable Long productId,
            @RequestBody @Valid ProductSpecificationRequest request) {
        return ApiResponse.<ProductSpecificationResponse>builder()
                .result(specificationService.addProductSpecification(productId, request))
                .build();
    }

    @DeleteMapping("/{specificationId}")
    public ApiResponse<String> removeProductSpecification(
            @PathVariable Long productId,
            @PathVariable Long specificationId) {
        specificationService.removeProductSpecification(productId, specificationId);
        return ApiResponse.<String>builder()
                .result("Đã gỡ đặc tả khỏi sản phẩm thành công")
                .build();
    }
}
