package com.vlt.ecommerce.feature.shop;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.common.dto.PageResponse;
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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ShopResponse> create(
            @RequestPart(value = "request") @Valid ShopRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ApiResponse.<ShopResponse>builder()
                .result(shopService.create(request, file))
                .build();
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ShopResponse> update(
            @RequestPart(value = "request") @Valid ShopRequest request,
            @PathVariable Long id,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ApiResponse.<ShopResponse>builder()
                .result(shopService.update(request, id, file))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ShopResponse> get(@PathVariable Long id) {
        return ApiResponse.<ShopResponse>builder()
                .result(shopService.get(id))
                .build();
    }

    @GetMapping("/me")
    public ApiResponse<ShopResponse> getMyShop() {
        return ApiResponse.<ShopResponse>builder()
                .result(shopService.getMyShop())
                .build();
    }

    @GetMapping("/{shopId}/products")
    public ApiResponse<List<ProductResponse>> getProductsShop(@PathVariable Long shopId) {
        return ApiResponse.<List<ProductResponse>>builder()
            .result(shopService.getProductsShop(shopId))
            .build();
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<ShopResponse>> searchShops(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ApiResponse.<PageResponse<ShopResponse>>builder()
            .result(shopService.searchShops(keyword, page, size))
            .build();
    }
}
