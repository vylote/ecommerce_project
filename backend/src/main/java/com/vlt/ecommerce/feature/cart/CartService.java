package com.vlt.ecommerce.feature.cart;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('BUYER')")
    public List<CartItemResponse> getCurrentCart() {
        User user = getCurrentUser();

        List<CartItem> cartItems = cartItemRepository.findByBuyerId(user.getId());
        return cartMapper.toCartItemsResponse(cartItems);
    }

    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public CartItemResponse add(CartItemRequest request) {
        User user = getCurrentUser();

        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));    

        // Optional<CartItem> existingItem = cartItemRepository.findByBuyerIdAndProductId(user.getId(), product.getId());    

        // CartItem cartItem;
        // if (existingItem.isPresent()) {
        //     cartItem = existingItem.get();
        //     cartItem.setQuantity(cartItem.getQuantity()+request.getQuantity());
        // } else {
        //     cartItem = cartMapper.toCartItem(request);
        //     cartItem.setBuyer(user);
        //     cartItem.setProduct(product);
        // }
        cartItemRepository.upsertCartItem(user.getId(), request.getProductId(), request.getQuantity());
        // 2. Query ngược lại để lấy dữ liệu mới nhất (đã được cộng dồn) lên
        CartItem updatedCartItem = cartItemRepository.findByBuyerIdAndProductId(user.getId(), product.getId())
            .orElseThrow(() -> new AppException(ErrorCode.SYSTEM_ERROR));

        return cartMapper.toCartItemResponse(cartItemRepository.save(updatedCartItem));
    }

    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public CartItemResponse update(CartItemRequest request, Long productId) {
        User user = getCurrentUser();
        CartItem cartItem = cartItemRepository.findByBuyerIdAndProductId(user.getId(), productId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        cartMapper.updateQuantityCartItem(request, cartItem);
        return cartMapper.toCartItemResponse(cartItem);
    }

    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public void remove(Long productId) {
        User user = getCurrentUser();
        CartItem cartItem = cartItemRepository.findByBuyerIdAndProductId(user.getId(), productId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
            
        cartItemRepository.delete(cartItem);
    }

    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public void removeAllProductsFromCart() {
        User user = getCurrentUser();
        // Gọi 1 lệnh duy nhất. Nếu giỏ hàng đang trống, nó xóa 0 dòng (không báo lỗi).
        cartItemRepository.deleteAllByBuyerId(user.getId());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }
}
