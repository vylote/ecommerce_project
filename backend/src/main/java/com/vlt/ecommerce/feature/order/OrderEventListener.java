package com.vlt.ecommerce.feature.order;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.common.event.PaymentSuccessEvent;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderEventListener {
    OrderRepository orderRepository;
    //TODO NotificationService notificationService; // Chờ Sprint 5

    @EventListener
    @Transactional(readOnly = true) // Chỉ đọc dữ liệu, tuyệt đối không ghi đè trạng thái
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        Order order = orderRepository.findById(event.getOrderId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Long sellerId = order.getShop().getSeller().getId();
        String message = String.format(
            "Ting ting! Đơn hàng #%d (PENDING) đã được thanh toán. Bạn có thể an tâm xác nhận đơn và đóng gói!", 
            order.getId()
        );

        log.info("EVENT TRIGGERED: Gửi thông báo tới Seller ID {}: {}", sellerId, message);
        
        // TODO: (Sprint 5) Truyền message này vào NotificationService để bắn qua WebSocket / Firebase
        // notificationService.notifyUser(sellerId, message);
    }
}
