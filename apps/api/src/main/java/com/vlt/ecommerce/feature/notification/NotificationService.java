package com.vlt.ecommerce.feature.notification;

import com.vlt.ecommerce.common.dto.PageResponse;

public interface NotificationService {

    void createAndPushNotification(Long userId, String type, String title, String message, Long refId);

    PageResponse<NotificationResponse> getMyNotifications(int page, int size);

    void markAsRead(Long id);

    void markAllAsRead();

    long countUnread();
}
