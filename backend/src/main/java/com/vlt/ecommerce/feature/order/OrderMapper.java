package com.vlt.ecommerce.feature.order;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.vlt.ecommerce.feature.order.dto.response.OrderResponse;

@Mapper(componentModel = "spring", uses = {OrderItemMapper.class})
public interface OrderMapper {
    @Mapping(target = "id", source = "id")
    @Mapping(target = "addressSnapshot", source = "addressSnapshot")
    @Mapping(target = "totalAmount", source = "totalAmount")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "buyerId", source = "buyer.id")
    @Mapping(target = "items", source = "items")
    @Mapping(target = "createdAt", source = "createdAt")
    OrderResponse toOrderResponse(Order order);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "addressSnapshot", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "buyer", ignore = true)
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "shop", ignore = true)
    @Mapping(target = "commissionRecords", ignore = true)
    Order toOrder(OrderRequest request);

    List<OrderResponse> toOrderResponses(List<Order> orders);
}
