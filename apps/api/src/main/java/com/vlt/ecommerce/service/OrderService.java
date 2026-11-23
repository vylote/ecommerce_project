package com.vlt.ecommerce.service;

import java.util.List;

import com.vlt.ecommerce.domain.enumeration.OrderStatus;
import com.vlt.ecommerce.service.dto.response.PageResponse;
import com.vlt.ecommerce.service.dto.request.OrderRequest;
import com.vlt.ecommerce.service.dto.response.OrderResponse;

public interface OrderService {

    List<OrderResponse> create(OrderRequest request);

    OrderResponse confirmOrder(Long id);

    OrderResponse shipOrder(Long id);

    OrderResponse completeOrder(Long id);

    PageResponse<OrderResponse> getOwnHistoryOrder(int page, int size, OrderStatus status);

    OrderResponse getDetailOrder(Long id);

    OrderResponse cancelOrder(Long id);

    PageResponse<OrderResponse> getSellerOrders(int page, int size, OrderStatus status);
}
