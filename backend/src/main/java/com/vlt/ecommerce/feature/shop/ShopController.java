package com.vlt.ecommerce.feature.shop;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.feature.product.dto.response.ProductResponse;
import com.vlt.ecommerce.feature.shop.dto.request.ShopRequest;
import com.vlt.ecommerce.feature.shop.dto.response.ShopResponse;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/shops")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class ShopController {
    ShopService shopService;

    @PostMapping
    public ApiResponse<ShopResponse> create(@RequestBody @Valid ShopRequest request) {
        return ApiResponse.<ShopResponse>builder()
                .result(shopService.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<ShopResponse> update(@RequestBody @Valid ShopRequest request, @PathVariable Long id) {
        return ApiResponse.<ShopResponse>builder()
                .result(shopService.update(request, id))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ShopResponse> get(@PathVariable Long id) {
        return ApiResponse.<ShopResponse>builder()
                .result(shopService.get(id))
                .build();
    }

    @GetMapping("/{shopId}/products")
    public ApiResponse<List<ProductResponse>> getProductsShop(@PathVariable Long shopId) {
        return ApiResponse.<List<ProductResponse>>builder()
            .result(shopService.getProductsShop(shopId))
            .build();
    }
}
