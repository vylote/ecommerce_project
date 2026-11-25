package com.vlt.ecommerce.service;

import com.vlt.ecommerce.service.dto.request.CartItemRequest;
import com.vlt.ecommerce.service.dto.response.CartItemResponse;
import java.util.List;

public interface CartService {

    List<CartItemResponse> getCurrentCart();

    CartItemResponse add(CartItemRequest request);

    CartItemResponse update(CartItemRequest request, Long cartItemId);

    void remove(Long cartItemId);

    void removeAllProductsFromCart();
}
