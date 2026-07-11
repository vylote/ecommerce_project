package com.vlt.ecommerce.feature.cart;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/cart")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class CartController {
    CartService cartService;

    @GetMapping
    public ApiResponse<List<CartItemResponse>> getCurrentCart() {
        return ApiResponse.<List<CartItemResponse>>builder()
            .result(cartService.getCurrentCart())
            .build();
    }

    @PostMapping("/items")
    public ApiResponse<CartItemResponse> add(@RequestBody @Valid CartItemRequest request) {
        return ApiResponse.<CartItemResponse>builder()
            .result(cartService.add(request))
            .build();
    }

    @PutMapping("/items/{productId}")
    public ApiResponse<CartItemResponse> update(@RequestBody @Valid CartItemRequest request, @PathVariable Long productId) {
        return ApiResponse.<CartItemResponse>builder()
            .result(cartService.update(request, productId))
            .build();
    }

    @DeleteMapping("/items/{productId}")
    public ApiResponse<String> remove(@PathVariable Long productId) {
        cartService.remove(productId);
        return ApiResponse.<String>builder()
            .result("da xoa san pham khoi gio hang")
            .build();
    }

    @DeleteMapping
    public ApiResponse<String> removeAllProductsFromCart() {
        cartService.removeAllProductsFromCart();
        return ApiResponse.<String>builder()
            .result("Da xoa toan bo gio hang")
            .build();
    }
}
