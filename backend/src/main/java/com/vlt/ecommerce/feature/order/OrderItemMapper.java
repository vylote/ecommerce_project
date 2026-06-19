package com.vlt.ecommerce.feature.order;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.vlt.ecommerce.feature.order.dto.response.OrderItemResponse;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "shopId", source = "shop.id")
    OrderItemResponse toOrderItemResponse(OrderItem orderItem);
}
