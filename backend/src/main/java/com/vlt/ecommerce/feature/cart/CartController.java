package com.vlt.ecommerce.feature.cart;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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

    @PostMapping("/items")
    public ApiResponse<CartItemResponse> add(@RequestBody @Valid CartItemRequest request) {
        return ApiResponse.<CartItemResponse>builder()
            .result(cartService.add(request))
            .build();
    }

    @DeleteMapping("/items/{productId}")
    public ApiResponse<String> remove(@PathVariable Long productId) {
        cartService.remove(productId);
        return ApiResponse.<String>builder()
            .result("xoa thanh cong gio hang")
            .build();
    }
}
