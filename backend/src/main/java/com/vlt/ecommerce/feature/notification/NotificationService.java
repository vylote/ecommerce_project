package com.vlt.ecommerce.feature.notification;

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
public class NotificationService {
    NotificationRepository notificationRepository;
    NotificationClient notificationClient;
    NotificationMapper notificationMapper;
    UserRepository userRepository;

    public void createAndPushNotification(Long userId, String type, String title, String message, Long refId) {
        log.info("--- [NOTIFICATION] BẮT ĐẦU XỬ LÝ THÔNG BÁO CHO USER {} ---", userId);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Notification notification = Notification.builder()
            .user(user)
            .type(type)
            .title(title)
            .message(message)
            .refId(refId)
            .build();

        Notification savedNotification = notificationRepository.save(notification);
        
        // --- TỪ DÒNG NÀY TRỞ ĐI, DỮ LIỆU ĐÃ NẰM AN TOÀN 100% TRONG MYSQL ---

        try {
            log.info("=> Bắt đầu gọi API sang Node.js...");
            notificationClient.pushNotification(userId, savedNotification);
            log.info("=> Gọi API Node.js hoàn tất!");
        } catch (Exception e) {
            log.error("!!! BẮT ĐƯỢC LỖI GỌI NODE.JS (NHƯNG DB VẪN AN TOÀN): ", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getMyNotifications(int page, int size) {
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        
        Page<Notification> notificationPage = notificationRepository.findByUserId(user.getId(), pageable);
        List<NotificationResponse> content = notificationMapper.toNotificationResponses(notificationPage.getContent());
        
        return PageResponse.of(notificationPage, content);
    }

    @Transactional
    public void markAsRead(Long id) {
        User user = getCurrentUser();
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        notification.setRead(true);
    }

    @Transactional
    public void markAllAsRead() {
        User user = getCurrentUser();
        notificationRepository.markAllAsReadByUserId(user.getId());
    }

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
