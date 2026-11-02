package com.vlt.ecommerce.feature.notification.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.vlt.ecommerce.common.sms.SmsService;
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
public class SmsNotificationConsumer {

    SmsService smsService;
    UserRepository userRepository;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_SMS_QUEUE)
    public void consumeSmsNotification(NotificationMessage message) {
        log.info("📥 [RABBITMQ FANOUT -> SMS QUEUE] Nhận thông báo ID #{} cho User ID {}", 
                message.getId(), message.getUserId());

        if (message.getUserId() == null) {
            log.warn("⚠️ [SMS CONSUMER] Bỏ qua vì không có userId trong message");
            return;
        }

        try {
            User user = userRepository.findById(message.getUserId()).orElse(null);
            if (user == null) {
                log.warn("⚠️ [SMS CONSUMER] Không tìm thấy user với id: {}", message.getUserId());
                return;
            }

            String phone = user.getPhone();
            if (phone == null || phone.isBlank()) {
                // Nếu tài khoản chưa cập nhật số điện thoại trong hồ sơ, sử dụng số demo của user để mô phỏng nhận SMS
                phone = "09" + String.format("%08d", user.getId());
                log.info("ℹ️ [SMS CONSUMER] User #{} ({}) chưa cập nhật số điện thoại, mô phỏng gửi tới SĐT: {}", 
                        user.getId(), user.getFullName(), phone);
            }

            smsService.sendNotificationSms(
                    phone,
                    message.getTitle(),
                    message.getMessage(),
                    message.getRefId()
            );
        } catch (Exception e) {
            log.error("❌ [SMS CONSUMER] Lỗi xử lý gửi SMS cho thông báo #{}: {}", message.getId(), e.getMessage(), e);
        }
    }
}
