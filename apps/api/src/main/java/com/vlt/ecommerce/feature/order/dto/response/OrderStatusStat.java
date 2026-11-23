package com.vlt.ecommerce.feature.order.dto.response;

import com.vlt.ecommerce.feature.order.OrderStatus;

public interface OrderStatusStat {
    OrderStatus getStatus();
    Long getCount();
}
