package com.vlt.ecommerce.feature.order;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.vlt.ecommerce.common.event.OrderStatusChangedEvent;
import com.vlt.ecommerce.common.event.PaymentSuccessEvent;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.common.utils.LocalizationUtils;
import com.vlt.ecommerce.feature.notification.NotificationService;
import com.vlt.ecommerce.feature.order.repository.OrderRepository;

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
    LocalizationUtils localizationUtils;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        Order order = orderRepository.findByIdWithShopAndSeller(event.getOrderId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Long sellerId = order.getShop().getSeller().getId();
        String title = localizationUtils.getMessage("notification.payment_success.title");
        String message = localizationUtils.getMessage("notification.payment_success.message", order.getId());

        log.info("EVENT TRIGGERED: Gửi thông báo tới Seller ID {}: {}", sellerId, message);

        notificationService.createAndPushNotification(
                sellerId,
                "PAYMENT_SUCCESS",
                title,
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
                title = localizationUtils.getMessage("notification.order_new.title");
                message = localizationUtils.getMessage("notification.order_new.message", order.getId());
                break;

            case CONFIRMED:
                targetUserId = buyerId;
                type = "ORDER_CONFIRMED";
                title = localizationUtils.getMessage("notification.order_confirmed.title");
                message = localizationUtils.getMessage("notification.order_confirmed.message", order.getId());
                break;

            case SHIPPING:
                targetUserId = buyerId;
                type = "ORDER_SHIPPING";
                title = localizationUtils.getMessage("notification.order_shipping.title");
                message = localizationUtils.getMessage("notification.order_shipping.message", order.getId());
                break;

            case CANCELLED:
                targetUserId = sellerId; // Khách hủy thì báo cho Shop biết
                type = "ORDER_CANCELLED";
                title = localizationUtils.getMessage("notification.order_cancelled.title");
                message = localizationUtils.getMessage("notification.order_cancelled.message", order.getId());
                break;

            case COMPLETED:
                targetUserId = sellerId; // Tiền về túi Shop
                type = "ORDER_COMPLETED";
                title = localizationUtils.getMessage("notification.order_completed.title");
                message = localizationUtils.getMessage("notification.order_completed.message", order.getId());
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
