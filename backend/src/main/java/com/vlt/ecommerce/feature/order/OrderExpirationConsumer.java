package com.vlt.ecommerce.feature.order;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.experimental.NonFinal;

import com.vlt.ecommerce.common.event.OrderStatusChangedEvent;
import com.vlt.ecommerce.config.RabbitMQConfig;
import com.vlt.ecommerce.feature.order.repository.OrderRepository;
import com.vlt.ecommerce.feature.product.repository.ProductRepository;
import com.vlt.ecommerce.feature.product.repository.SpecificProductRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderExpirationConsumer {
    OrderRepository orderRepository;
    ProductRepository productRepository;
    SpecificProductRepository specificProductRepository;
    ApplicationEventPublisher eventPublisher;

    @NonFinal
    @Value("${app.order.expiration-ttl-ms:900000}")
    int orderExpirationTtlMs;

    @Transactional
    @RabbitListener(queues = RabbitMQConfig.ORDER_CANCEL_QUEUE)
    public void handleExpiredOrder(Long orderId) {
        log.info("[RabbitMQ DLX] Nhận tín hiệu kiểm tra hết hạn cho đơn hàng #{}", orderId);

        orderRepository.findByIdForUpdate(orderId).ifPresent(order -> {
            // Chỉ tự động hủy nếu đơn hàng vẫn đang ở trạng thái PENDING (chưa được thanh toán hoặc xác nhận)
            if (order.getStatus() == OrderStatus.PENDING) {
                int ttlMs = orderExpirationTtlMs;
                String durationStr = (ttlMs < 60000)
                        ? (ttlMs / 1000) + " giây"
                        : (ttlMs < 3600000)
                        ? (ttlMs / 60000) + " phút"
                        : (ttlMs / 3600000) + " giờ";
                log.info("⏰ Đơn hàng #{} đã quá hạn chờ thanh toán (TTL {}). Tiến hành tự động hủy và hoàn kho!", orderId, durationStr);
                order.setStatus(OrderStatus.CANCELLED);

                // Hoàn lại tồn kho cho sản phẩm và biến thể
                for (OrderItem item : order.getItems()) {
                    if (item.getSpecificProduct() != null) {
                        specificProductRepository.incrementStock(item.getSpecificProduct().getId(), item.getQuantity());
                    }
                    productRepository.restoreStockAndDecrementSold(item.getProduct().getId(), item.getQuantity());
                }

                orderRepository.save(order);
                eventPublisher.publishEvent(new OrderStatusChangedEvent(this, order.getId()));
                log.info(" Đã tự động hủy đơn hàng #{} và hoàn kho thành công qua RabbitMQ Dead Letter Queue!", orderId);
            } else {
                log.info("ℹ️ Đơn hàng #{} có trạng thái {} (không phải PENDING), bỏ qua hủy tự động.", orderId, order.getStatus());
            }
        });
    }
}
