package com.vlt.ecommerce.feature.notification.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.vlt.ecommerce.common.mail.EmailService;
import com.vlt.ecommerce.config.RabbitMQConfig;
import com.vlt.ecommerce.feature.notification.dto.NotificationMessage;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailNotificationConsumer {

    EmailService emailService;
    UserRepository userRepository;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_EMAIL_QUEUE)
    public void consumeEmailNotification(NotificationMessage message) {
        log.info("[RABBITMQ FANOUT -> EMAIL QUEUE] Nhan thong bao ID #{} cho User ID {}", 
                message.getId(), message.getUserId());

        if (message.getUserId() == null) {
            log.warn("[EMAIL CONSUMER] Bo qua vi khong co userId trong message");
            return;
        }

        try {
            User user = userRepository.findById(message.getUserId()).orElse(null);
            if (user == null) {
                log.warn("[EMAIL CONSUMER] Khong tim thay user voi id: {}", message.getUserId());
                return;
            }

            String email = user.getEmail();
            if (email == null || email.isBlank()) {
                log.warn("[EMAIL CONSUMER] User {} khong co email hop le", user.getId());
                return;
            }

            emailService.sendNotificationEmail(
                    email,
                    user.getFullName(),
                    message.getTitle(),
                    message.getMessage(),
                    message.getRefId()
            );
        } catch (Exception e) {
            log.error("[EMAIL CONSUMER] Loi xu ly gui email cho thong bao #{}: {}", message.getId(), e.getMessage(), e);
        }
    }
}
