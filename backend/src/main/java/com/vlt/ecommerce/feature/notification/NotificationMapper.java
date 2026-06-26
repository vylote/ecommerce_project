package com.vlt.ecommerce.feature.notification;

import java.util.List;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationResponse toNotificationResponse(Notification notification);
    List<NotificationResponse> toNotificationResponses(List<Notification> notifications);
}
