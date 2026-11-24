package com.vlt.ecommerce.web.rest;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.service.CartService;
import com.vlt.ecommerce.service.dto.request.CartItemRequest;
import com.vlt.ecommerce.service.dto.response.CartItemResponse;
import com.vlt.ecommerce.service.dto.response.ApiResponse;

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

    @PostMapping({"", "/items"})
    public ApiResponse<CartItemResponse> add(@RequestBody @Valid CartItemRequest request) {
        return ApiResponse.<CartItemResponse>builder()
            .result(cartService.add(request))
            .build();
    }

    @PutMapping({"/items/{identifier}", "/{identifier}"})
    public ApiResponse<CartItemResponse> update(@RequestBody @Valid CartItemRequest request, @PathVariable Long identifier) {
        return ApiResponse.<CartItemResponse>builder()
            .result(cartService.update(request, identifier))
            .build();
    }

    @DeleteMapping({"/items/{identifier}", "/{identifier}"})
    public ApiResponse<String> remove(@PathVariable Long identifier) {
        cartService.remove(identifier);
        return ApiResponse.<String>builder()
            .result("Product was deleted successfully from cart")
            .build();
    }

    @DeleteMapping
    public ApiResponse<String> removeAllProductsFromCart() {
        cartService.removeAllProductsFromCart();
        return ApiResponse.<String>builder()
            .result("All cart were deleted successfully")
            .build();
    }
}
