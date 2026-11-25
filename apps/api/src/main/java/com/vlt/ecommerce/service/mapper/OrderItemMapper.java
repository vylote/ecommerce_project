package com.vlt.ecommerce.service.mapper;

import java.math.BigDecimal;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.util.StringUtils;

import com.vlt.ecommerce.domain.CartItem;
import com.vlt.ecommerce.domain.Order;
import com.vlt.ecommerce.domain.OrderItem;
import com.vlt.ecommerce.domain.Product;
import com.vlt.ecommerce.domain.ProductImage;
import com.vlt.ecommerce.domain.SpecificProduct;
import com.vlt.ecommerce.service.dto.response.OrderItemResponse;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "specificProductId", source = "specificProduct.id")
    @Mapping(target = "variantName", source = "specificProduct.name")
    @Mapping(target = "shopId", source = "shop.id")
    @Mapping(target = "productImageUrl", source = "productImageUrl")
    OrderItemResponse toOrderItemResponse(OrderItem orderItem);

    List<OrderItemResponse> toOrderItemResponses(List<OrderItem> orderItems);

    default OrderItem toOrderItem(Order order, CartItem cartItem) {
        Product product = cartItem.getProduct();
        SpecificProduct variant = cartItem.getSpecificProduct();
        int quantity = cartItem.getQuantity();
        BigDecimal unitPrice = variant == null ? product.getPrice() : variant.getPrice();
        String itemImage = resolveOrderItemImage(product, variant);
        String itemName = product.getName();
        if (variant != null && StringUtils.hasText(variant.getName())) {
            itemName = itemName + " - " + variant.getName();
        }

        return OrderItem.builder()
                .order(order)
                .product(product)
                .specificProduct(variant)
                .shop(product.getShop())
                .productName(itemName)
                .productPrice(unitPrice)
                .quantity(quantity)
                .totalPrice(unitPrice.multiply(BigDecimal.valueOf(quantity)))
                .productImageUrl(itemImage)
                .build();
    }

    private String resolveOrderItemImage(Product product, SpecificProduct variant) {
        if (variant != null && StringUtils.hasText(variant.getImageUrl())) {
            return variant.getImageUrl();
        }
        List<ProductImage> images = product.getImages();
        if (images == null || images.isEmpty()) {
            return null;
        }
        return images.stream()
                .filter(image -> Boolean.TRUE.equals(image.getIsPrimary()))
                .map(ProductImage::getUrl)
                .findFirst()
                .orElse(images.getFirst().getUrl());
    }
}
