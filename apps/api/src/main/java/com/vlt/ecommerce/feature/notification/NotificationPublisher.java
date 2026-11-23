package com.vlt.ecommerce.feature.notification;

import com.vlt.ecommerce.feature.notification.dto.NotificationMessage;

public interface NotificationPublisher {

    void publish(NotificationMessage message);
}
