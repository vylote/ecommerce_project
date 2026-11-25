package com.vlt.ecommerce.service.mapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.vlt.ecommerce.domain.Order;
import com.vlt.ecommerce.domain.Shop;
import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.service.dto.request.OrderRequest;
import com.vlt.ecommerce.service.dto.response.OrderResponse;

@Mapper(componentModel = "spring", uses = {OrderItemMapper.class})
public interface OrderMapper {
    @Mapping(target = "id", source = "id")
    @Mapping(target = "addressSnapshot", source = "addressSnapshot")
    @Mapping(target = "totalAmount", source = "totalAmount")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "buyerId", source = "buyer.id")
    @Mapping(target = "items", source = "items")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "shopName", source = "shop.name")
    @Mapping(target = "shopId", source = "shop.id")
    @Mapping(target = "reviewed", ignore = true)
    @Mapping(target = "paymentMethod", source = "payment.method")
    @Mapping(target = "paymentStatus", source = "payment.status")
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
    @Mapping(target = "payment", ignore = true)
    @Mapping(target = "idempotencyKey", ignore = true)
    Order toOrder(OrderRequest request);

    default Order toShopOrder(OrderRequest request, User buyer, Shop shop) {
        Order order = toOrder(request);
        order.setBuyer(buyer);
        order.setShop(shop);
        order.setNote(request.getNote());
        if (request.getIdempotencyKey() != null) {
            order.setIdempotencyKey(request.getIdempotencyKey() + "-shop" + shop.getId());
        }
        order.setItems(new ArrayList<>());
        order.setTotalAmount(BigDecimal.ZERO);
        return order;
    }

    List<OrderResponse> toOrderResponses(List<Order> orders);
}
