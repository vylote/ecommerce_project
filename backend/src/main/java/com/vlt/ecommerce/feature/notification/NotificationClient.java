package com.vlt.ecommerce.feature.notification;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationClient {

    final RestTemplate restTemplate;

    @Value("${notification.service-url}")
    String nodeServerUrl;

    public void pushNotification(Long userId, Notification notification) {
        try {
            // Đóng gói payload động bằng Map, tuân thủ nghiêm ngặt tài liệu không tạo file DTO rác
            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("type", notification.getType());
            payload.put("title", notification.getTitle());
            payload.put("message", notification.getMessage());
            payload.put("refId", notification.getRefId());

            // Giao tiếp ngoại vi: Bắn tín hiệu sang Node.js
            restTemplate.postForObject(nodeServerUrl + "/notify", payload, Void.class);
            log.info("Successfully pushed notification to Node.js for user {}", userId);
        } catch (Exception e) {
            log.error("Failed to push notification to Node.js for user {}", userId, e);
        }
    }
}
