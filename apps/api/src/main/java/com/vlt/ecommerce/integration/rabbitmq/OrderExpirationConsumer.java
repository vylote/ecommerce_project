package com.vlt.ecommerce.integration.rabbitmq;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;


import com.vlt.ecommerce.config.Constants;
import com.vlt.ecommerce.domain.OrderItem;
import com.vlt.ecommerce.domain.Payment;
import com.vlt.ecommerce.domain.Payment.PaymentMethod;
import com.vlt.ecommerce.domain.Payment.PaymentStatus;
import com.vlt.ecommerce.domain.enumeration.OrderStatus;
import com.vlt.ecommerce.domain.event.OrderStatusChangedEvent;
import com.vlt.ecommerce.config.properties.OrderProperties;
import com.vlt.ecommerce.repository.OrderRepository;
import com.vlt.ecommerce.repository.ProductRepository;
import com.vlt.ecommerce.repository.SpecificProductRepository;
import com.vlt.ecommerce.service.ZalopayPaymentService;

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
    RabbitTemplate rabbitTemplate;
    TransactionTemplate transactions;
    ZalopayPaymentService zalopayPaymentService;

    @RabbitListener(queues = Constants.ORDER_CANCEL_QUEUE)
    public void handleExpiredOrder(Long orderId) {
        log.info("[RabbitMQ DLX] Nhận tín hiệu kiểm tra hết hạn cho đơn hàng #{}", orderId);

        zalopayPaymentService.reconcilePending(orderId);
        transactions.executeWithoutResult(transaction -> cancelIfExpired(orderId));
    }

    private void cancelIfExpired(Long orderId) {
        orderRepository.findByIdForUpdate(orderId).ifPresent(order -> {
            if (order.getStatus() == OrderStatus.PENDING) {
                int ttlMs = orderProperties.expirationTtlMs();
                Payment payment = order.getPayment();
                if (payment != null && payment.getMethod() == PaymentMethod.ZALOPAY) {
                    if (payment.getStatus() == PaymentStatus.PAID) return;
                    if (payment.getStatus() == PaymentStatus.PENDING && payment.getGatewayOrderId() != null) {
                        rabbitTemplate.convertAndSend(Constants.ORDER_DELAY_EXCHANGE, Constants.ORDER_DELAY_ROUTING_KEY,
                                orderId, message -> {
                                    message.getMessageProperties().setExpiration(String.valueOf(ttlMs));
                                    return message;
                                });
                        return;
                    }
                }
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
