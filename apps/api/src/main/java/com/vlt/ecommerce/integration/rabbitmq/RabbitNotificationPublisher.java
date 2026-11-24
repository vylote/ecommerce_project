package com.vlt.ecommerce.integration.rabbitmq;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.vlt.ecommerce.config.Constants;
import com.vlt.ecommerce.integration.rabbitmq.dto.NotificationMessage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RabbitNotificationPublisher implements NotificationPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void publish(NotificationMessage message) {
        log.info("=> Bắn thông báo qua RabbitMQ Fanout Exchange (Web, Email, SMS): {}", Constants.NOTIFICATION_FANOUT_EXCHANGE);
        rabbitTemplate.convertAndSend(
                Constants.NOTIFICATION_FANOUT_EXCHANGE,
                "",
                message
        );
        log.info("=> Đã phát tán thông báo tới tất cả các kênh (Fanout) thành công!");
    }
}
