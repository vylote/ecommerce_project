package com.vlt.ecommerce.integration.rabbitmq;

import com.vlt.ecommerce.integration.rabbitmq.dto.NotificationMessage;

public interface NotificationPublisher {

    void publish(NotificationMessage message);
}
