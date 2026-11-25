package com.vlt.ecommerce.service.impl;

import java.util.List;
import java.util.Optional;

import org.jspecify.annotations.Nullable;
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
    public List<CartItemResponse> getCurrentCart() {
        User user = currentUserProvider.getUser();

        List<CartItem> cartItems = cartItemRepository.findByBuyerId(user.getId());
        return cartMapper.toCartItemsResponse(cartItems);
    }

    @Override
    @Transactional
    public CartItemResponse add(CartItemRequest request) {
        User user = currentUserProvider.getUser();

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (product.getShop().getSeller().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.CANNOT_BUY_OWN_PRODUCT);
        }

        Long productId = product.getId();
        SpecificProduct variant = resolveVariant(productId, request.getSpecificProductId());
        int availableStock = switch (variant) {
            case null -> product.getStockQuantity();
            case SpecificProduct selectedVariant -> selectedVariant.getStockQuantity();
        };
        Optional<CartItem> existing = cartItemRepository
                .findByBuyerIdAndProductIdAndSpecificProduct(user.getId(), productId, variant);

        long quantity = (long) existing.map(CartItem::getQuantity).orElse(0) + request.getQuantity();
        if (quantity > availableStock) {
            throw new AppException(ErrorCode.OUT_OF_STOCK);
        }

        CartItem cartItem = existing.orElseGet(() -> CartItem.builder()
                .buyer(user)
                .product(product)
                .specificProduct(variant)
                .build());
        cartItem.setQuantity((int) quantity);
        return cartMapper.toCartItemResponse(cartItemRepository.save(cartItem));
    }

    private @Nullable SpecificProduct resolveVariant(Long productId, @Nullable Long variantId) {
        if (variantId == null) {
            if (specificProductRepository.existsByProductIdAndIsActiveTrue(productId)) {
                throw new AppException(ErrorCode.PLEASE_SELECT_VARIANT);
            }
            return null;
        }

        SpecificProduct variant = specificProductRepository.findById(variantId).orElse(null);
        boolean belongsToProduct = variant != null && variant.getProduct().getId().equals(productId);
        if (variant != null && belongsToProduct && Boolean.TRUE.equals(variant.getIsActive())) {
            return variant;
        }

        if (!specificProductRepository.existsByProductIdAndIsActiveTrue(productId)) {
            throw new AppException(ErrorCode.PRODUCT_HAS_NO_VARIANTS);
        }
        if (variant == null) {
            throw new AppException(ErrorCode.VARIANT_NOT_FOUND);
        }
        if (!belongsToProduct) {
            throw new AppException(ErrorCode.VARIANT_PRODUCT_MISMATCH);
        }
        throw new AppException(ErrorCode.OUT_OF_STOCK);
    }

    @Override
    @Transactional
    public CartItemResponse update(CartItemRequest request, Long cartItemId) {
        CartItem cartItem = getOwnedCartItem(cartItemId);

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
    public void remove(Long cartItemId) {
        CartItem cartItem = getOwnedCartItem(cartItemId);

        cartItemRepository.delete(cartItem);
    }

    private CartItem getOwnedCartItem(Long cartItemId) {
        return cartItemRepository.findByIdAndBuyerId(cartItemId, currentUserProvider.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));
    }

    @Override
    @Transactional
    public void removeAllProductsFromCart() {
        User user = currentUserProvider.getUser();
        cartItemRepository.deleteAllByBuyerId(user.getId());
    }
}
