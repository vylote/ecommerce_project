package com.vlt.ecommerce.feature.notification;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    Long id;
    String type;
    String title;
    String message;
    boolean isRead;
    Long refId;
    LocalDateTime createdAt;
}
