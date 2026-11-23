package com.vlt.ecommerce.feature.notification;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.common.dto.PageResponse;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.notification.dto.NotificationMessage;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationServiceImpl implements NotificationService {
    NotificationRepository notificationRepository;
    NotificationClient notificationClient;
    NotificationMapper notificationMapper;
    UserRepository userRepository;
    NotificationPublisher notificationPublisher;

    @Override
    public void createAndPushNotification(Long userId, String type, String title, String message, Long refId) {
        log.info("--- [NOTIFICATION] BẮT ĐẦU XỬ LÝ THÔNG BÁO CHO USER {} ---", userId);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Notification notification = Notification.builder()
            .user(user)
            .type(type)
            .title(title)
            .message(message)
            .isRead(false)
            .readAt(null)
            .refId(refId)
            .build();

        Notification savedNotification = notificationRepository.save(notification);

        NotificationMessage messagePayload = NotificationMessage.builder()
                .id(savedNotification.getId())
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .isRead(false)
                .readAt(null)
                .refId(refId)
                .createdAt(savedNotification.getCreatedAt())
                .sentTimestamp(System.currentTimeMillis())
                .build();

        try {
            notificationPublisher.publish(messagePayload);
        } catch (Exception e) {
            log.error("!!! BẮT ĐƯỢC LỖI GỬI RABBITMQ (KÍCH HOẠT FALLBACK HTTP SANG NODE.JS): {}", e.getMessage());
            try {
                notificationClient.pushNotification(userId, savedNotification);
            } catch (Exception ex) {
                log.error("Fallback HTTP cũng thất bại: {}", ex.getMessage());
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getMyNotifications(int page, int size) {
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());

        Page<Notification> notificationPage = notificationRepository.findByUserId(user.getId(), pageable);
        List<NotificationResponse> content = notificationMapper.toNotificationResponses(notificationPage.getContent());

        return PageResponse.of(notificationPage, content);
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        User user = getCurrentUser();
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        User user = getCurrentUser();
        notificationRepository.markAllAsReadByUserId(user.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread() {
        User user = getCurrentUser();
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }
}
