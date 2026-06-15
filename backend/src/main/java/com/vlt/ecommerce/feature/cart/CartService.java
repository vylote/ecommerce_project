package com.vlt.ecommerce.feature.cart;

import java.util.Optional;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.product.repository.ProductRepository;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CartService {
    CartItemRepository cartItemRepository;
    CartMapper cartMapper;
    UserRepository userRepository;
    ProductRepository productRepository;

    @PreAuthorize("hasRole('BUYER')")
    public CartItemResponse add(CartItemRequest request) {
        User user = getCurrentUser();

        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));    

        Optional<CartItem> existingItem = cartItemRepository.findByBuyerIdAndProductId(user.getId(), product.getId());    

        CartItem cartItem;
        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity()+request.getQuantity());
        } else {
            cartItem = cartMapper.toCartItem(request);
            cartItem.setBuyer(user);
            cartItem.setProduct(product);
        }

        return cartMapper.toCartItemResponse(cartItemRepository.save(cartItem));
    }

    @PreAuthorize("hasRole('BUYER')")
    public void remove(Long id) {
        User user = getCurrentUser();
        CartItem cartItem = cartItemRepository.findByBuyerIdAndProductId(user.getId(), id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
            
        cartItemRepository.delete(cartItem);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }
}
