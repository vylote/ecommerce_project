package com.vlt.ecommerce.feature.cart;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.product.SpecificProduct;
import com.vlt.ecommerce.feature.product.repository.ProductRepository;
import com.vlt.ecommerce.feature.product.repository.SpecificProductRepository;
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
    SpecificProductRepository specificProductRepository;

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

        if (product.getShop().getSeller().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.CANNOT_BUY_OWN_PRODUCT);
        }

        boolean hasVariants = specificProductRepository.existsByProductIdAndIsActiveTrue(product.getId());
        if (hasVariants && request.getSpecificProductId() == null) {
            throw new AppException(ErrorCode.PLEASE_SELECT_VARIANT);
        }
        if (!hasVariants && request.getSpecificProductId() != null) {
            throw new AppException(ErrorCode.PRODUCT_HAS_NO_VARIANTS);
        }

        // Trường hợp 1: Có chọn biến thể cụ thể (SpecificProduct)
        if (request.getSpecificProductId() != null) {
            SpecificProduct variant = specificProductRepository
                    .findById(request.getSpecificProductId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

            if (!variant.getProduct().getId().equals(product.getId())) {
                throw new AppException(ErrorCode.INVALID_DATA);
            }

            if (Boolean.FALSE.equals(variant.getIsActive())) {
                throw new AppException(ErrorCode.OUT_OF_STOCK);
            }

            CartItem existing = cartItemRepository
                    .findByBuyerIdAndProductIdAndSpecificProductId(user.getId(), product.getId(), variant.getId())
                    .orElse(null);

            if (existing != null) {
                int newQty = existing.getQuantity() + request.getQuantity();
                if (newQty > variant.getStockQuantity()) {
                    throw new AppException(ErrorCode.OUT_OF_STOCK);
                }
                existing.setQuantity(newQty);
                return cartMapper.toCartItemResponse(cartItemRepository.save(existing));
            } else {
                if (request.getQuantity() > variant.getStockQuantity()) {
                    throw new AppException(ErrorCode.OUT_OF_STOCK);
                }
                CartItem newItem = CartItem.builder()
                        .buyer(user)
                        .product(product)
                        .specificProduct(variant)
                        .quantity(request.getQuantity())
                        .build();
                return cartMapper.toCartItemResponse(cartItemRepository.save(newItem));
            }
        }

        // Trường hợp 2: Sản phẩm đơn không có biến thể
        if (request.getQuantity() > product.getStockQuantity()) {
            throw new AppException(ErrorCode.OUT_OF_STOCK);
        }

        CartItem existing = cartItemRepository
                .findByBuyerIdAndProductIdAndSpecificProductIsNull(user.getId(), product.getId())
                .orElse(null);

        if (existing != null) {
            int newQty = existing.getQuantity() + request.getQuantity();
            if (newQty > product.getStockQuantity()) {
                throw new AppException(ErrorCode.OUT_OF_STOCK);
            }
            existing.setQuantity(newQty);
            return cartMapper.toCartItemResponse(cartItemRepository.save(existing));
        } else {
            CartItem newItem = CartItem.builder()
                    .buyer(user)
                    .product(product)
                    .specificProduct(null)
                    .quantity(request.getQuantity())
                    .build();
            return cartMapper.toCartItemResponse(cartItemRepository.save(newItem));
        }
    }

    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public CartItemResponse update(CartItemRequest request, Long identifier) {
        User user = getCurrentUser();
        // Hỗ trợ cả identifier là cartItemId hoặc productId (tương thích ngược)
        CartItem cartItem = cartItemRepository.findById(identifier)
                .filter(c -> c.getBuyer().getId().equals(user.getId()))
                .orElseGet(() -> cartItemRepository.findByBuyerIdAndProductId(user.getId(), identifier)
                        .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND)));

        int availableStock = cartItem.getSpecificProduct() != null
                ? cartItem.getSpecificProduct().getStockQuantity()
                : cartItem.getProduct().getStockQuantity();

        if (request.getQuantity() > availableStock) {
            throw new AppException(ErrorCode.OUT_OF_STOCK);
        }

        cartItem.setQuantity(request.getQuantity());
        return cartMapper.toCartItemResponse(cartItemRepository.save(cartItem));
    }

    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public void remove(Long identifier) {
        User user = getCurrentUser();
        CartItem cartItem = cartItemRepository.findById(identifier)
                .filter(c -> c.getBuyer().getId().equals(user.getId()))
                .orElseGet(() -> cartItemRepository.findByBuyerIdAndProductId(user.getId(), identifier)
                        .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND)));

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
