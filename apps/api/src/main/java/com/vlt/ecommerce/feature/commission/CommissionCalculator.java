package com.vlt.ecommerce.feature.commission;

import com.vlt.ecommerce.feature.order.Order;

public interface CommissionCalculator {

    void calculateCommission(Order order);
}
