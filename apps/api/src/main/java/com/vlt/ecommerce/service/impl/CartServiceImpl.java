package com.vlt.ecommerce.service.impl;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.domain.CartItem;
import com.vlt.ecommerce.repository.CartItemRepository;
import com.vlt.ecommerce.service.CartService;
import com.vlt.ecommerce.service.dto.request.CartItemRequest;
import com.vlt.ecommerce.service.dto.response.CartItemResponse;
import com.vlt.ecommerce.service.mapper.CartMapper;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.domain.Product;
import com.vlt.ecommerce.domain.SpecificProduct;
import com.vlt.ecommerce.repository.ProductRepository;
import com.vlt.ecommerce.repository.SpecificProductRepository;
import com.vlt.ecommerce.domain.User;

import com.vlt.ecommerce.security.CurrentUserProvider;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    CurrentUserProvider currentUserProvider;
    CartItemRepository cartItemRepository;
    CartMapper cartMapper;
    ProductRepository productRepository;
    SpecificProductRepository specificProductRepository;

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('BUYER')")
    public List<CartItemResponse> getCurrentCart() {
        User user = currentUserProvider.getUser();

        List<CartItem> cartItems = cartItemRepository.findByBuyerId(user.getId());
        return cartMapper.toCartItemsResponse(cartItems);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public CartItemResponse add(CartItemRequest request) {
        User user = currentUserProvider.getUser();

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

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
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

            if (!variant.getProduct().getId().equals(product.getId())) {
                throw new AppException(ErrorCode.VARIANT_PRODUCT_MISMATCH);
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

    @Override
    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public CartItemResponse update(CartItemRequest request, Long identifier) {
        User user = currentUserProvider.getUser();
        // Hỗ trợ cả identifier là cartItemId hoặc productId (tương thích ngược)
        CartItem cartItem = cartItemRepository.findById(identifier)
                .filter(c -> c.getBuyer().getId().equals(user.getId()))
                .orElseGet(() -> cartItemRepository.findByBuyerIdAndProductId(user.getId(), identifier)
                        .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND)));

        int availableStock = cartItem.getSpecificProduct() != null
                ? cartItem.getSpecificProduct().getStockQuantity()
                : cartItem.getProduct().getStockQuantity();

        if (request.getQuantity() > availableStock) {
            throw new AppException(ErrorCode.OUT_OF_STOCK);
        }

        cartItem.setQuantity(request.getQuantity());
        return cartMapper.toCartItemResponse(cartItemRepository.save(cartItem));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public void remove(Long identifier) {
        User user = currentUserProvider.getUser();
        CartItem cartItem = cartItemRepository.findById(identifier)
                .filter(c -> c.getBuyer().getId().equals(user.getId()))
                .orElseGet(() -> cartItemRepository.findByBuyerIdAndProductId(user.getId(), identifier)
                        .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND)));

        cartItemRepository.delete(cartItem);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public void removeAllProductsFromCart() {
        User user = currentUserProvider.getUser();
        // Gọi 1 lệnh duy nhất. Nếu giỏ hàng đang trống, nó xóa 0 dòng (không báo lỗi).
        cartItemRepository.deleteAllByBuyerId(user.getId());
    }
}
