package com.vlt.ecommerce.service;

import com.vlt.ecommerce.domain.Order;

public interface CommissionCalculator {

    void calculateCommission(Order order);
}
