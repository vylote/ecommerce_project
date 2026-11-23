package com.vlt.ecommerce.feature.product.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.feature.product.dto.request.SpecificProductRequest;
import com.vlt.ecommerce.feature.product.dto.response.SpecificProductResponse;
import com.vlt.ecommerce.feature.product.service.SpecificProductService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class SpecificProductController {
    SpecificProductService specificProductService;

    // ================= LẤY DANH SÁCH BIẾN THỂ =================
    @GetMapping("/products/{productId}/variants")
    public ApiResponse<List<SpecificProductResponse>> getVariants(
            @PathVariable Long productId,
            @RequestParam(name = "onlyActive", defaultValue = "true") boolean onlyActive) {
        return ApiResponse.<List<SpecificProductResponse>>builder()
                .result(specificProductService.getVariantsByProductId(productId, onlyActive))
                .build();
    }

    // ================= XEM CHI TIẾT 1 BIẾN THỂ =================
    @GetMapping("/variants/{id}")
    public ApiResponse<SpecificProductResponse> getVariantById(@PathVariable Long id) {
        return ApiResponse.<SpecificProductResponse>builder()
                .result(specificProductService.getVariantById(id))
                .build();
    }

    // ================= TẠO BIẾN THỂ MỚI CHO SẢN PHẨM =================
    @PostMapping("/products/{productId}/variants")
    public ApiResponse<SpecificProductResponse> createVariant(
            @PathVariable Long productId,
            @RequestBody @Valid SpecificProductRequest request) {
        return ApiResponse.<SpecificProductResponse>builder()
                .result(specificProductService.createVariant(productId, request))
                .build();
    }

    // ================= CẬP NHẬT BIẾN THỂ =================
    @PutMapping("/variants/{id}")
    public ApiResponse<SpecificProductResponse> updateVariant(
            @PathVariable Long id,
            @RequestBody @Valid SpecificProductRequest request) {
        return ApiResponse.<SpecificProductResponse>builder()
                .result(specificProductService.updateVariant(id, request))
                .build();
    }

    // ================= XÓA BIẾN THỂ =================
    @DeleteMapping("/variants/{id}")
    public ApiResponse<String> deleteVariant(@PathVariable Long id) {
        specificProductService.deleteVariant(id);
        return ApiResponse.<String>builder()
                .result("Đã xóa biến thể sản phẩm thành công")
                .build();
    }
}
