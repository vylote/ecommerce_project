package com.vlt.ecommerce.feature.product.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.feature.product.dto.request.ProductRequest;
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
}
