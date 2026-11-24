package com.vlt.ecommerce.integration.rabbitmq;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;


import com.vlt.ecommerce.config.Constants;
import com.vlt.ecommerce.domain.OrderItem;
import com.vlt.ecommerce.domain.enumeration.OrderStatus;
import com.vlt.ecommerce.domain.event.OrderStatusChangedEvent;
import com.vlt.ecommerce.config.properties.OrderProperties;
import com.vlt.ecommerce.repository.OrderRepository;
import com.vlt.ecommerce.repository.ProductRepository;
import com.vlt.ecommerce.repository.SpecificProductRepository;

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

    OrderProperties orderProperties;

    @Transactional
    @RabbitListener(queues = Constants.ORDER_CANCEL_QUEUE)
    public void handleExpiredOrder(Long orderId) {
        log.info("[RabbitMQ DLX] Nhận tín hiệu kiểm tra hết hạn cho đơn hàng #{}", orderId);

        orderRepository.findByIdForUpdate(orderId).ifPresent(order -> {
            if (order.getStatus() == OrderStatus.PENDING) {
                int ttlMs = orderProperties.expirationTtlMs();
                String durationStr = (ttlMs < 60000)
                        ? (ttlMs / 1000) + " giây"
                        : (ttlMs < 3600000)
                        ? (ttlMs / 60000) + " phút"
                        : (ttlMs / 3600000) + " giờ";
                log.info("[ORDER EXPIRATION] Don hang #{} da qua han cho thanh toan (TTL {}). Tien hanh tu dong huy va hoan kho!", orderId, durationStr);
                order.setStatus(OrderStatus.CANCELLED);

                for (OrderItem item : order.getItems()) {
                    if (item.getSpecificProduct() != null) {
                        specificProductRepository.incrementStock(item.getSpecificProduct().getId(), item.getQuantity());
                    }
                    productRepository.restoreStockAndDecrementSold(item.getProduct().getId(), item.getQuantity());
                }

                orderRepository.save(order);
                eventPublisher.publishEvent(new OrderStatusChangedEvent(this, order.getId()));
                log.info("[ORDER EXPIRATION] Da tu dong huy don hang #{} va hoan kho thanh cong qua RabbitMQ Dead Letter Queue!", orderId);
            } else {
                log.info("[ORDER EXPIRATION] Don hang #{} co trang thai {} (khong phai PENDING), bo qua huy tu dong.", orderId, order.getStatus());
            }
        });
    }
}
