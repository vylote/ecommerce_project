package com.vlt.ecommerce.integration.rabbitmq;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.vlt.ecommerce.config.Constants;
import com.vlt.ecommerce.integration.mail.EmailService;
import com.vlt.ecommerce.integration.mail.NotificationEmail;
import com.vlt.ecommerce.integration.rabbitmq.dto.NotificationMessage;
import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.repository.UserRepository;

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

    @RabbitListener(queues = Constants.NOTIFICATION_EMAIL_QUEUE)
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

            NotificationEmail notification = NotificationEmail.builder()
                    .recipientEmail(email)
                    .recipientName(user.getFullName())
                    .title(message.getTitle())
                    .content(message.getMessage())
                    .refId(message.getRefId())
                    .build();
            emailService.sendNotificationEmail(notification);
        } catch (Exception e) {
            log.error("[EMAIL CONSUMER] Loi xu ly gui email cho thong bao #{}: {}", message.getId(), e.getMessage(), e);
        }
    }
}
