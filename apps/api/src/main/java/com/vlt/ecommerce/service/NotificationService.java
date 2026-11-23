package com.vlt.ecommerce.service;

import com.vlt.ecommerce.service.dto.response.NotificationResponse;
import com.vlt.ecommerce.service.dto.response.PageResponse;

public interface NotificationService {

    void createAndPushNotification(Long userId, String type, String title, String message, Long refId);

    PageResponse<NotificationResponse> getMyNotifications(int page, int size);

    void markAsRead(Long id);

    void markAllAsRead();

    long countUnread();
}
