package com.vlt.ecommerce.feature.notification;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

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
    @JsonProperty("isRead")
    Boolean isRead;
    Long refId;
    LocalDateTime readAt;
    LocalDateTime createdAt;
}
