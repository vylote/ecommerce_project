package com.vlt.ecommerce.service.mapper;

import java.math.BigDecimal;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import com.vlt.ecommerce.domain.CartItem;
import com.vlt.ecommerce.service.dto.request.CartItemRequest;
import com.vlt.ecommerce.service.dto.response.CartItemResponse;
import com.vlt.ecommerce.domain.Product;
import com.vlt.ecommerce.domain.SpecificProduct;

@Mapper(componentModel = "spring")
public interface CartMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "addedAt", ignore = true)
    @Mapping(target = "product", source = "productId", qualifiedByName = "idToProduct")
    @Mapping(target = "buyer", ignore = true)
    @Mapping(target = "specificProduct", ignore = true)
    CartItem toCartItem(CartItemRequest request);

    default CartItemResponse toCartItemResponse(CartItem cartItem) {
        if (cartItem == null) return null;
        Product product = cartItem.getProduct();
        SpecificProduct variant = cartItem.getSpecificProduct();

        BigDecimal price = (variant != null && variant.getPrice() != null)
                ? variant.getPrice()
                : (product != null ? product.getPrice() : BigDecimal.ZERO);

        BigDecimal totalPrice = price.multiply(BigDecimal.valueOf(cartItem.getQuantity()));

        String imageUrl = null;
        if (variant != null && variant.getImageUrl() != null && !variant.getImageUrl().isEmpty() && !variant.getImageUrl().startsWith("blob:")) {
            imageUrl = variant.getImageUrl();
        } else if (product != null && product.getImages() != null && !product.getImages().isEmpty()) {
            imageUrl = product.getImages().getFirst().getUrl();
        }

        return CartItemResponse.builder()
                .id(cartItem.getId())
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : null)
                .productPrice(price)
                .totalPrice(totalPrice)
                .quantity(cartItem.getQuantity())
                .addedAt(cartItem.getAddedAt())
                .shopId(product != null && product.getShop() != null ? product.getShop().getId() : null)
                .shopName(product != null && product.getShop() != null ? product.getShop().getName() : null)
                .imageUrl(imageUrl)
                .specificProductId(variant != null ? variant.getId() : null)
                .variantName(variant != null ? variant.getName() : null)
                .sku(variant != null ? variant.getSku() : null)
                .build();
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "addedAt", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "buyer", ignore = true)
    @Mapping(target = "specificProduct", ignore = true)
    void updateQuantityCartItem(CartItemRequest request, @MappingTarget CartItem cartItem);

    List<CartItemResponse> toCartItemsResponse(List<CartItem> cartItems);

    @Named("idToProduct")
    default Product idToProduct(Long id) {
        if (id == null) return null;
        Product product = new Product();
        product.setId(id);
        return product;
    }
}
