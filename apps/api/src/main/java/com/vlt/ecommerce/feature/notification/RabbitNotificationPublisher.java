package com.vlt.ecommerce.feature.notification;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.vlt.ecommerce.config.RabbitMQConfig;
import com.vlt.ecommerce.feature.notification.dto.NotificationMessage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RabbitNotificationPublisher implements NotificationPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void publish(NotificationMessage message) {
        log.info("=> Bắn thông báo qua RabbitMQ Fanout Exchange (Web, Email, SMS): {}", RabbitMQConfig.NOTIFICATION_FANOUT_EXCHANGE);
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_FANOUT_EXCHANGE,
                "",
                message
        );
        log.info("=> Đã phát tán thông báo tới tất cả các kênh (Fanout) thành công!");
    }
}
