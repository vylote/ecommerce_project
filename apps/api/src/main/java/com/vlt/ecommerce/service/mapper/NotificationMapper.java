package com.vlt.ecommerce.service.mapper;

import com.vlt.ecommerce.domain.Notification;
import com.vlt.ecommerce.service.dto.response.NotificationResponse;
import java.util.List;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationResponse toNotificationResponse(Notification notification);
    List<NotificationResponse> toNotificationResponses(List<Notification> notifications);
}
