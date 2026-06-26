package com.vlt.ecommerce.feature.order;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.vlt.ecommerce.common.event.OrderStatusChangedEvent;
import com.vlt.ecommerce.common.event.PaymentSuccessEvent;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.notification.NotificationService;

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
    NotificationService notificationService;

    @Async
    @EventListener
    @Transactional
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        Order order = orderRepository.findByIdWithShopAndSeller(event.getOrderId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Long sellerId = order.getShop().getSeller().getId();
        String message = String.format(
                "Ting ting! Đơn hàng #%d (PENDING) đã được thanh toán. Bạn có thể an tâm xác nhận đơn và đóng gói!",
                order.getId());

        log.info("EVENT TRIGGERED: Gửi thông báo tới Seller ID {}: {}", sellerId, message);

        notificationService.createAndPushNotification(
                sellerId,
                "PAYMENT_SUCCESS",
                "Đơn hàng đã thanh toán",
                message,
                order.getId());
    }

    @Async
    // XÓA DÒNG NÀY: @EventListener 
    // THAY BẰNG DÒNG DƯỚI ĐÂY: Bắt luồng ngầm phải CHỜ luồng chính commit xong mới được chạy
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderStatusChanged(OrderStatusChangedEvent event) {
        Order order = orderRepository.findOrderForNotification(event.getOrderId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Long buyerId = order.getBuyer().getId();
        Long sellerId = order.getShop().getSeller().getId();

        String type = "";
        String title = "";
        String message = "";
        Long targetUserId = null; // Xác định ai sẽ nhận thông báo

        switch (order.getStatus()) {
            case PENDING:
                targetUserId = sellerId; // Báo cho chủ Shop biết có nổ đơn
                type = "NEW_ORDER";
                title = "Đơn hàng mới 🚀";
                message = String.format("Bạn vừa nhận được đơn hàng mới #%d. Hãy chuẩn bị sẵn sàng khi khách thanh toán nhé!", order.getId());
                break;

            case CONFIRMED:
                targetUserId = buyerId;
                type = "ORDER_CONFIRMED";
                title = "Đơn hàng đã được xác nhận";
                message = String.format("Shop đã xác nhận đơn hàng #%d của bạn và đang đóng gói.", order.getId());
                break;

            case SHIPPING:
                targetUserId = buyerId;
                type = "ORDER_SHIPPING";
                title = "Đơn hàng đang giao";
                message = String.format("Đơn hàng #%d đã được giao cho đơn vị vận chuyển.", order.getId());
                break;

            case CANCELLED:
                targetUserId = sellerId; // Khách hủy thì báo cho Shop biết
                type = "ORDER_CANCELLED";
                title = "Khách hàng hủy đơn";
                message = String.format("Đơn hàng #%d đã bị khách hàng hủy. Đã hoàn lại tồn kho.", order.getId());
                break;

            case COMPLETED:
                targetUserId = sellerId; // Tiền về túi Shop
                type = "ORDER_COMPLETED";
                title = "Giao dịch hoàn tất";
                message = String.format("Đơn hàng #%d đã giao thành công. Doanh thu đã được cộng vào ví.",
                        order.getId());
                break;

            default:
                log.warn("Trạng thái {} không có kịch bản thông báo", order.getStatus());
                return; // Không làm gì cả nếu là PENDING hoặc trạng thái lạ
        }

        log.info("EVENT TRIGGERED: Thông báo [{}] tới User ID {}", type, targetUserId);

        notificationService.createAndPushNotification(
                targetUserId, type, title, message, order.getId());
    }
}
