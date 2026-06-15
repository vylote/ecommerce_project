package com.vlt.ecommerce.feature.order;

public enum OrderStatus {
    PENDING,    // Chờ xác nhận (Buyer vừa đặt)
    CONFIRMED,  // Đã xác nhận (Seller đồng ý)
    SHIPPING,   // Đang giao hàng
    COMPLETED,  // Hoàn thành (Buyer đã nhận hàng)
    CANCELLED   // Đã hủy
}
