package com.vlt.ecommerce.repository.projection;

import com.vlt.ecommerce.domain.enumeration.OrderStatus;

public interface OrderStatusStat {
    OrderStatus getStatus();
    Long getCount();
}
