package com.vlt.ecommerce.feature.order;

import java.util.List;

import com.vlt.ecommerce.common.dto.PageResponse;
import com.vlt.ecommerce.feature.order.dto.request.OrderRequest;
import com.vlt.ecommerce.feature.order.dto.response.OrderResponse;

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
